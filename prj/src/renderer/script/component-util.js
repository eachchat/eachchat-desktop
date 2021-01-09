
import {UserInfo, Contact, Department} from '../../packages/data/sqliteutil.js'; 

const ComponentUtil = {
    GetDisplayName(displayName, userid){
        if(displayName == '' && userid)
        {
            let beginPos = userid.indexOf("@");
            if(beginPos == -1)
                beginPos = 0;
            else
                beginPos++;
            let endPos = userid.indexOf(":")
            if(endPos == -1)
                endPos = userid.length;
  
            return userid.slice(beginPos, endPos)
        }
        return displayName;
    },

    async GetDisplayNameByMatrixID(matrix_id){
        var user = await Contact.GetContactInfo(matrix_id);
        if(user && user.display_name.length != 0)
            return user.display_name;
        let userInfo = await UserInfo.GetUserInfoByMatrixID(matrix_id);
        if(userInfo && userInfo.user_display_name.length != 0)
            return userInfo.user_display_name;
        return this.GetDisplayName("", matrix_id);
    },

    ShowInfoContent(content){
        if(content == undefined)
            return '';
        return content;
    },

    async ShowContactInfo(matrix_id){
        var tempUserInfo = {};
        //get userinfo
        var user = await Contact.GetContactInfo(matrix_id);
        let userInfo = await UserInfo.GetUserInfoByMatrixID(user.matrix_id)
        if(userInfo)
        {
            tempUserInfo.id = userInfo.user_id
        }

        tempUserInfo.avatar_url = user.avatar_url;
        tempUserInfo.company = user.company;
        tempUserInfo.matrix_id = matrix_id;
        tempUserInfo.displayName = ComponentUtil.GetDisplayName(user.display_name, matrix_id);
        tempUserInfo.title = ComponentUtil.ShowInfoContent(user.title);
        tempUserInfo.statusDescription = ComponentUtil.ShowInfoContent(user.status_description);
        tempUserInfo.workDescription = ComponentUtil.ShowInfoContent(user.work_description);
        tempUserInfo.userName = this.GetDisplayName("", matrix_id);

        tempUserInfo.email = [];
        tempUserInfo.email.push({
            email_value: ComponentUtil.ShowInfoContent(user.email)
        })
        tempUserInfo.phone = {
            mobile: ComponentUtil.ShowInfoContent(user.mobile),
            work: ComponentUtil.ShowInfoContent(user.telephone)
        };
        return tempUserInfo;
    },

    async ShowOrgInfoByUserID(user_id){
        var tempUserInfo = {};
        var user = await UserInfo.GetUserInfo(user_id);
        tempUserInfo.user_id = user.user_id;
        tempUserInfo.matrix_id = user.matrix_id;
        tempUserInfo.avatarTUrl = user.avatar_t_url;
        tempUserInfo.displayName = user.user_display_name;
        tempUserInfo.title = user.user_title;
        tempUserInfo.statusDescription = user.status_description;
        tempUserInfo.workDescription = user.work_description;
        tempUserInfo.managerId = user.manager_id;
        tempUserInfo.departmentId = user.belong_to_department_id;
        tempUserInfo.userName = this.GetDisplayName("", user.matrix_id);
        
        //get department
        var department = await Department.GetDepartmentInfoByUserID(user_id);
        tempUserInfo.department = department;
        //get email
        var email = await UserInfo.GetUserEmailByUserID(user_id);
        tempUserInfo.email = email;
        //get phone
        var phone = await UserInfo.GetUserPhoneByUserID(user_id);
        var tempPhone = {};
        for (var i = 0; i < phone.length; i ++){
            var temp = phone[i];
            if(temp.phone_type == 'mobile'){
                tempPhone.mobile = temp.phone_value;
            }else{
                tempPhone.work = temp.phone_value;
            }
        }
        tempUserInfo.phone = tempPhone;

        var leaders = await UserInfo.GetLeaders(user_id);
        tempUserInfo.leaders = leaders;
        return tempUserInfo;
    },

    async ShowOrgInfoByMatrixID(matrix_id){
        let userInfo = await UserInfo.GetUserInfoByMatrixID(matrix_id);
        if(!userInfo)
            return;
        return await this.ShowOrgInfoByUserID(userInfo.user_id);
    },

    async OrgUserInfoToContact(userinfo){
        let contactInfo = {
            matrix_id : userinfo.matrix_id,
            display_name: userinfo.user_display_name,
        }
        if(!userinfo.user_id)
            return contactInfo;
        let email = await UserInfo.GetUserEmailByUserID(userinfo.user_id);
        if(email.length != 0)
            contactInfo.email = email[0].email_value;
        let phone = await UserInfo.GetUserPhoneByUserID(userinfo.user_id);
        for (var i = 0; i < phone.length; i ++){
            var temp = phone[i];
            if(temp.phone_type == 'mobile'){
                contactInfo.mobile = temp.phone_value;
            }else{
                contactInfo.telephone = temp.phone_value;
            }
        }
        let company = await Department.GetBelongDepartmentsByMatrixID(userinfo.matrix_id);
        if(company.length == 0)
            contactInfo.company = '';
        else if(company.company == 1)
            contactInfo.company = company[0].display_name;
        else
            contactInfo.company = company[1].display_name;
        contactInfo.display_name = userinfo.displayName;
        contactInfo.title = userinfo.title;
        return contactInfo
        
    },
}

export{
    ComponentUtil
}
