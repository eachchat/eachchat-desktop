//document.write('<script src="db.js" type="text/javascript" charset="utf-8"></script>');

const axios = require('axios');
//var DBApi = require('D:/code/YiQiLiao-Desktop/src/renderer/database/dbapi');
var DBApi = require('../database/dbapi').DBApi;
//var DBApi = require('./../database/dbapi');

var refreshtoken;
var accesstoken;

export function InitServerAPI(protocal, ip, host)
{
    console.log("initserverapi")
    var url = protocal + '://' + ip + ':' + host 
    axios.defaults.baseURL = url
    // axios.defaults.headers = {
    //     "Accept" : "application/json",
    //     "Content-type" : "application/json",
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Method":"POST,GET"}
    //var tmp1 = new db
    //tmp1.test()
}

export async function Login(username, password)
{
    console.log("login")
    var state = ""
    await axios.post('/api/v1/client/login', {
        'account': username,
        'password': password
    }).then(function (response) 
    {
        console.log(response)
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
        accesstoken = tmpheader['access-token']
        refreshtoken = tmpheader['refresh-token']
    
        if(accesstoken.length == 0)
        {
            console.log("accesstoken.length == 0")
            resolve("accesstoken.length == 0")
            return
        }
    })
    return state
};

function Logout()
{
    console.log("logout") 
    //axios.defaults.headers.common['Authorization'] = "Bearer " + refreshtoken;
    axios.post('/api/v1/client/logout',
    {},//parameter
    {
        headers:{Authorization:"Bearer " + refreshtoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        else
            return true
    })
};

function GetUserinfo(email)
{
    axios.post('/api/v1/client/users',
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
        headers:{Authorization : "Bearer " + accesstoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        
        return true
    })
}

function RefreshToken()
{
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
}

function GetDepartmentInfo(username)
{
    console.log("GetDepartmentInfo") 
    axios.post('/api/v1/client/departments',
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
        headers:{Authorization:"Bearer " + refreshtoken}
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        return true
    })
}

function GetEnterpriseInfo()
{
    console.log("GetEnterpriseInfo") 
    axios.get('/api/v1/client/setting/enterprise',
    {
        headers:{Authorization:"Bearer " + refreshtoken}
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

function CreateDatabase()
{
    let db = new DBApi();
    db.testfunc();
}

