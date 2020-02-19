const axios = require('axios');
var refreshtoken
var accesstoken

function InitServerAPI(protocal, ip, host)
{
    console.log("initserverapi")
    var url = protocal + '://' + ip + ':' + host 
    axios.defaults.baseURL = url
    //axios.defaults.headers = {
    //    "Accept" : "application/json",
    //    "Content-type" : "application/json"}
}

function Login(username, password)
{
    console.log("login")
    axios.post('/api/v1/client/login', {
        'account': username,
        'password': password
    }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        var tmpheader = response.headers
        accesstoken = tmpheader['access-token']
        refreshtoken = tmpheader['refresh-token']
         
        if(accesstoken.length == 0)
            return false
        
        return false
      });
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

function GetUserinfo()
{
    /*
    axios.get('/api/v1/client/user',{
        params:{id:'25d4cb78d54840dfa70df0dfa847c024'},
        headers:{Authorization : "Bearer " + accesstoken}
      }).then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        else
            return true
    })
    */
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

