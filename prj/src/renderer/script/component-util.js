
import {UserInfo, Contact, Department} from '../../packages/data/sqliteutil.js'; 
import {Appendzero} from '../../packages/core/Utils.js'

const linkRegExp = /((?:(http|https|Http|Https|rtsp|Rtsp|ftp|Ftp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?(?:(([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]){0,1}\.)+[a-zA-Z]{2,63}|((25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9]))))(?:\:\d{1,5})?)((?:\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))+[\;\.\=\?\/\+\)][a-zA-Z0-9\%\#\&\-\_\.\~]*)|(?:\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*))?(?:\b|$|(?=[ -퟿豈-﷏ﷰ-￯]))|([\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?)/g

function getWeekDay(day){
    let week = {
        0:"星期日",
        1:"星期一",
        2:"星期二",
        3:"星期三",
        4:"星期四",
        5:"星期五",
        6:"星期六", 
    };
    return week[day];
}

const ComponentUtil = {
    GetDomanName(matrixID){
        if(!matrixID)
            return '';
        let endPos = matrixID.lastIndexOf(":");
        if(endPos == -1)
            return '';
        return matrixID.slice(endPos + 1, matrixID.length);
    },

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
        if(user.display_name == ''){
            try{
                let profile = await global.mxMatrixClientPeg.matrixClient.getProfileInfo(matrix_id);
                user.display_name = profile.displayname;
            }catch(e){
                console.log(e);
            }
        }
        
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
        if(!company || company.length == 0)
            contactInfo.company = '';
        else if(company.company == 1)
            contactInfo.company = company[0].display_name;
        else
            contactInfo.company = company[1].display_name;
        contactInfo.display_name = userinfo.displayName;
        contactInfo.title = userinfo.title;
        return contactInfo
        
    },

    formatTimeFilter(secondsTime) {
        let now = new Date();
        let curDateSecond = now.getTime();
        let cutTime = curDateSecond - secondsTime;
        let curYeat = now.getUTCFullYear();
        let curMonth = now.getUTCMonth() + 1;
        let curDate = now.getDate();
        let curDay = now.getDay();
  
        let distdate = new Date(secondsTime);
        let y = distdate.getUTCFullYear();
        let mon = distdate.getMonth() + 1;
        let d = distdate.getDate();
        let h = distdate.getHours();
        let m = distdate.getMinutes();
        let s = distdate.getSeconds();
        let day = distdate.getDay();
  
        if(cutTime < 8 * 24 * 3600 * 1000)
        {
            let cutDay = curDate - d;
            if(cutDay === 0){
                return Appendzero(h) + ":" + Appendzero(m);
            }
            else if(cutDay === 1){
                return "昨天 " + Appendzero(h) + ":" + Appendzero(m);
            }
            else if(cutDay > 1 && cutDay < 7){
                return getWeekDay(day);
            }
            else {
                return y + '/' + mon + '/' + d;
            }
        }
        else
        {
          return y + '/' + mon + '/' + d;
        }
    },
    
    get hightLightReg(){
        return linkRegExp;
    },

    msgContentShowPhoneAndHightLight: function(curMsg, color){
        // let phoneHight = curMsg.replace(/\d{11}/g, function(num){
        //     return '<span style="color:' + color + ';">' + num + "</span>"
        // })

        let linkHight = curMsg.replace(this.hightLightReg, function(link){
            return '<span style="color:' + color + ';">' + link + "</span>"
        })
        return linkHight;
    },

}

export{
    ComponentUtil
}
