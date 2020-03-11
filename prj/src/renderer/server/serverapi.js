//document.write('<script src="db.js" type="text/javascript" charset="utf-8"></script>');

const axios = require('axios');


class ServerApi
{   
    m_refreshtoken;
    m_accesstoken;
    m_port8080 = 8080;
    m_port8081 = 8081;
    constructor(protocal, ip)
    {
        this.m_url = protocal + '://' + ip;
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
    }

    async Login(username, password)
    {
        console.log("login");
        var state = "";
        var res;
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
        await axios.post("/api/v1/client/login", {
            "account" : username,
            "password" : password,
            "yqlVerCode" : 6,
            "osType" : "windows"
        }).then(function (response) 
        {
            console.log(response);
            res = response;
        });
        var ret_data = res.data;
        var msg = ret_data["message"];
        var code = ret_data["code"];
        if(res.status != 200)
        {
            console.log("response.status != 200");
            state = msg;
            return res;
        }
        if(code != 200)
        {
            console.log("code != 200");
            state = msg;
            return res;
        }
        var tmpheader = res.headers;
        this.m_accesstoken = tmpheader['access-token'];
        this.m_refreshtoken = tmpheader['refresh-token'];
        return res;
    }

    Logout()
    {
        console.log("logout");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
        axios.post('/api/v1/client/logout',
        {},//parameter
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then(function (response) {
            console.log(response);
            if(response.status != 200)
                return false;
            else
                return true;
        });
    }

    GetUserinfo(filters_value, perPage_value, sortOrder_value, sequenceId_value)
    {
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
        return axios.post('/api/v1/client/users',
        {
            filters : filters_value,
            perPage : perPage_value,
            sortOrder : sortOrder_value,
            sequenceId : sequenceId_value
        },
        {
            headers:{Authorization : "Bearer " + this.m_accesstoken}
        });
    }

    RefreshToken()
    {
        console.log("RefreshToken");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
        axios.post('/api/v1/token/refresh',
        {},//parameter
        {
            headers:{Authorization:"Bearer " + this.m_refreshtoken}
        }).then(function (response) {
            console.log(response)
            if(response.status != 200)
                return false;
            this.m_accesstoken = response.headers['access-token']
                return true;
        });
    }

    GetDepartmentInfo(filtersvalue, perpagevalue, sortOrdervalue, sequenceIdvalue)
    {
        console.log("GetDepartmentInfo");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
        return axios.post('/api/v1/client/departments',
        {
            filters : filtersvalue,
            perPage : perpagevalue,
            sortOrder: sortOrdervalue,
            sequenceId: sequenceIdvalue
        },
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        });
    }

    GetEnterpriseInfo()
    {
        console.log("GetEnterpriseInfo"); 
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;
        return axios.get('/api/v1/client/setting/enterprise',
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        });
    }

    ListGroup(updateTime, perPage)
    {
        console.log("ListGroup");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8080;
        return axios.get("api/v1/group/" + updateTime + "/perPage/" + perPage,
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        });
    }

    ListAllGroup()
    {
        console.log("ListAllGroup");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8080;
        return axios.get("api/v1/group",
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        });
    }

    UpdateUserWorkDescription(workDescriptionvalue)
    {
        console.log("UpdateUser");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;

        axios.patch('/api/v1/client/user/profile',
        {
            path: "/workDescription",
            value: workDescriptionvalue
        },//parameter
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then(function (response) {
            console.log(response)
            return true;
        });
    }

    UpdateUserStatusDescription(statusDescriptionvalue)
    {
        console.log("UpdateUserStatusDescription");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;

        axios.patch('/api/v1/client/user/profile',
        {
            path: "/statusDescription",
            value: statusDescriptionvalue
        },//parameter
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then(function (response) {
            console.log(response)
            return true;
        });
    }

    UpdateUserPassword(passwordvalue)
    {
        console.log("UpdateUserPassword"); 
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;

        axios.patch('/api/v1/client/user/profile',
        {
            path: "/password",
            value: passwordvalue
        },//parameter
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then(function (response) {
            console.log(response)
            return true;
        });
    }

    GetNewVersion()
    {
        console.log("GetNewVersion"); 
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8081;

        axios.post('/api/v1/client/version/new',
        {
            client: "windows"
        },//parameter
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then(function (response) {
            console.log(response)
            return true;
        });
    }

    TokenValid()
    {
        console.log("TokenValid");
        axios.default.baseURL = this.m_url + ":" + this.m_port8081;

        axios.get("api/v1/internal/token",
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then(function(response)
        {
            console.log(response);
        });
    }

    ClientIncrement(name_value, updatetime_value, sequenceId_value, countperpage_value)
    {
        console.log("ClientIncrement");
        axios.default.baseURL = this.m_url + ":" + this.m_port8081;

        axios.post("api/v1/client/increment",
        {
            name : name_value,
            updatetime : updatetime_value,
            sequenceId : sequenceId_value,
            countperpage_value : countperpage_value
        },
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        }).then((response)=>
        {
            console.log(response);
        });

    } 

    HistoryMessage(groupId, sequenceId)
    {
        console.log("HistoryMessageAsync");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8080;
        return axios.get("/api/v1/message/group/" + groupId + "/sequence/" + sequenceId,
        {
            headers:{Authorization:"Bearer " + this.m_accesstoken}
        });
    }

    SendNewMessage(msgId_value, 
                    msgContentType_value,
                    fromId_value,
                    groupId_value,
                    userId_value,
                    timestamp_value,
                    text_value,
                    url_value)
    {
        console.log("SendNewMessage");
        axios.defaults.baseURL = this.m_url + ':' + this.m_port8080;
        return axios.post("api/v1/message",
        {
            msgId : msgId_value,
            msgContentType : msgContentType_value,
            fromId : fromId_value,
            groupId : groupId_value,
            userId : userId_value,
            timestamp : timestamp_value,
            content:
            {
                text : text_value,
                url : url_value
            }
        },
        {
            headers : {Authorization : "Bearer " + this.m_accesstoken}
        });
    }
}

export {ServerApi}
 















