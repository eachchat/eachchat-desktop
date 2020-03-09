//document.write('<script src="db.js" type="text/javascript" charset="utf-8"></script>');

const axios = require('axios');
//var DBApi = require('../database/dbapi').DBApi;

var g_refreshtoken;
var g_accesstoken;
var port8080 = 8080;
var port8081 = 8081;
var g_url;

export function setToken(accToken, refreshToken)
{
    g_accesstoken = accToken;
    g_refreshtoken = refreshToken
}

export function InitServerAPI(protocal, ip)
{
    console.log("initserverapi")
    g_url = protocal + '://' + ip
    axios.defaults.baseURL = g_url + ':' + port8081
}

export async function Login(username, password)
{
    console.log("login")
    var state = ""
    var res
    await axios.post("/api/v1/client/login", {
        "account" : username,
        "password" : password,
        "yqlVerCode" : 6,
        "osType" : "windows"
    }).then(function (response) 
    {
        console.log(response)
        res = response
        var ret_data = response.data
        var msg = ret_data["message"]
        var code = ret_data["code"]
        if(response.status != 200)
        {
            console.log("response.status != 200")
            state = msg
            return
        }
        if(code != 200)
        {
            console.log("code != 200")
            state = msg
            return
        }
        var tmpheader = response.headers
        g_accesstoken = tmpheader['access-token']
        g_refreshtoken = tmpheader['refresh-token']
    
        if(g_accesstoken.length == 0)
        {
            console.log("accesstoken.length == 0")
            return
        }
    })
    return res
}

function Logout()
{
    console.log("logout") 
    //axios.defaults.headers.common['Authorization'] = "Bearer " + refreshtoken;
    axios.post('/api/v1/client/logout',
    {},//parameter
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        else
            return true
    })
};

export function GetUserinfo(email)
{
    return axios.post('/api/v1/client/users',
    {
        filters:[
            {
            'field':'email',
            'operator': 'co',
            'logic': 1,
            'value': email
            }
        ],
        sortOrder: 1,
        sequenceId: 0
    },
    {
        headers:{Authorization : "Bearer " + g_accesstoken}
    })
    // .then(function (response) {
    //     console.log(response)
    //     if(response.status != 200)
    //         return false
        
    //     return true
    // })
}

function RefreshToken()
{
    console.log("RefreshToken") 
    axios.post('/api/v1/token/refresh',
    {},//parameter
    {
        headers:{Authorization:"Bearer " + g_refreshtoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        accesstoken = response.headers['access-token']
        return true
    })
}

export function GetDepartmentInfo(username)
{
    console.log("GetDepartmentInfo") 
    return axios.post('/api/v1/client/departments',
    {
        filters:[
            {
            'field':'userName',
            'operator': 'co',
            'logic': 1,
            'value': username
            }
        ],
        sortOrder: 1,
        sequenceId: 0
    },
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    })
}

function GetEnterpriseInfo()
{
    console.log("GetEnterpriseInfo") 
    axios.get('/api/v1/client/setting/enterprise',
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        return true
    })
}

function RefreshPassword()
{
/*
    console.log("RefreshToken") 
    axios.post('/api/v1/token/refresh',
    {},//parameter
    {
        headers:{Authorization:"Bearer " + refreshtoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        accesstoken = response.headers['access-token']
        return true
    })
*/
}

export function ListGroup(updateTime, perPage)
{
    console.log("ListGroup") 
    axios.defaults.baseURL = g_url + ':' + port8080
    return axios.get("api/v1/group/" + updateTime + "/perPage/" + perPage,
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    })
}

export function ListAllGroup()
{
    console.log("ListAllGroup") 
    axios.defaults.baseURL = g_url + ':' + port8080
    return axios.get("api/v1/group",
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    })
}

function UpdateUserWorkDescription(workDescriptionvalue)
{
    console.log("UpdateUser")
    axios.defaults.baseURL = g_url + ':' + port8081

    axios.patch('/api/v1/client/user/profile',
    {
        path: "/workDescription",
        value: workDescriptionvalue
    },//parameter
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function (response) {
        console.log(response)
        return true
    })
}

function UpdateUserStatusDescription(statusDescriptionvalue)
{
    console.log("UpdateUserStatusDescription") 
    axios.defaults.baseURL = g_url + ':' + port8081

    axios.patch('/api/v1/client/user/profile',
    {
        path: "/statusDescription",
        value: statusDescriptionvalue
    },//parameter
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function (response) {
        console.log(response)
        return true
    })
}

function UpdateUserPassword(passwordvalue)
{
    console.log("UpdateUserPassword") 
    axios.defaults.baseURL = g_url + ':' + port8081

    axios.patch('/api/v1/client/user/profile',
    {
        path: "/password",
        value: passwordvalue
    },//parameter
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function (response) {
        console.log(response)
        return true
    })
}

function GetNewVersion()
{
    console.log("GetNewVersion") 
    axios.defaults.baseURL = g_url + ':' + port8081

    axios.post('/api/v1/client/version/new',
    {
        client: "windows"
    },//parameter
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function (response) {
        console.log(response)
        return true
    })
}

function TokenValid()
{
    console.log(TokenValid)
    axios.default.baseURL = g_url + ":" + port8081

    axios.get("api/v1/internal/token",
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then(function(response)
    {
        console.log(response)
    })
}

function ClientIncrement(name_value, updatetime_value, sequenceId_value, countperpage_value)
{
    console.log("ClientIncrement")
    axios.default.baseURL = g_url + ":" + port8081

    axios.post("api/v1/client/increment",
    {
        name : name_value,
        updatetime : updatetime_value,
        sequenceId : sequenceId_value,
        countperpage_value : countperpage_value
    },
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    }).then((response)=>
    {
        console.log(response)
    })

} 
/*
export async function GetHistoryMessageAsync(groupId, sequenceId)
{
    console.log("GetHistoryMessageAsync")
    axios.defaults.baseURL = g_url + ':' + port8080
    return axios.get("/api/v1/message/group/" + groupId + "/sequence/" + sequenceId,
    {
        headers:{Authorization:"Bearer " + g_accesstoken}
    })
}
*/

