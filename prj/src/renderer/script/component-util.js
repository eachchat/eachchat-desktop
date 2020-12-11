
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
        let department = {display_name:""};
        if(userInfo)
        {
            department = await Department.GetDepartmentInfoByUserID(userInfo.user_id);
            tempUserInfo.id = userInfo.user_id
        }
        else
            department.display_name = user.company
        tempUserInfo.avatar_url = user.avatar_url;
        tempUserInfo.department = department;
        tempUserInfo.matrix_id = matrix_id;
        tempUserInfo.displayName = ComponentUtil.GetDisplayName(user.display_name, matrix_id);
        tempUserInfo.title = ComponentUtil.ShowInfoContent(user.title);
        tempUserInfo.statusDescription = ComponentUtil.ShowInfoContent(user.status_description);
        tempUserInfo.workDescription = ComponentUtil.ShowInfoContent(user.work_description);
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
        tempUserInfo.id = user.user_id;
        tempUserInfo.matrix_id = user.matrix_id;
        tempUserInfo.avatarTUrl = user.avatar_t_url;
        tempUserInfo.displayName = user.user_display_name;
        tempUserInfo.title = user.user_title;
        tempUserInfo.statusDescription = user.status_description;
        tempUserInfo.workDescription = user.work_description;
        tempUserInfo.managerId = user.manager_id;
        tempUserInfo.departmentId = user.belong_to_department_id;
        
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
        let company = await Department.GetDepartmentInfoByUserID(userinfo.user_id);
        if(company)
            contactInfo.company = company.display_name
        contactInfo.title = userinfo.user_title;
        return contactInfo
        
    },
}

export{
    ComponentUtil
}
