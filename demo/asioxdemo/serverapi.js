const axios = require('axios');
var refreshtoken

function initserverapi(protocal, ip, host)
{
    console.log("initserverapi")
    var url = protocal + '://' + ip + ':' + host 
    axios.defaults.baseURL = url
    //axios.defaults.headers = {
    //    "Accept" : "application/json",
    //    "Content-type" : "application/json"}
}

function login(username, password)
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
        var accesstoken = tmpheader['access-token']
        refreshtoken = tmpheader['refresh-token']
         
        if(accesstoken.length == 0)
            return false
        
        return false
      });
};

function logout()
{
    console.log("logout") 
    axios.defaults.headers.common['Authorization'] = "Bearer " + refreshtoken;
    axios.post('/api/v1/client/logout').then(function (response) {
        console.log(response)
        if(response.status != 200)
            return false
        else
            return true
    })
};
