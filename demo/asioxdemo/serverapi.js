const axios = require('axios');

function initserverapi(protocal, ip, host)
{
    var url = protocal + '://' + ip + ':' + host 
    axios.defaults.baseURL = url
}

function login(username, password){
    console.log("登陆")
    axios.post('/api/v1/client/login', {
        'account': username,
        'password': password
    }).then(function (response) {
        console.log(response.headers);
        var obj = JSON.parse(response.headers);
        var accecctoken = obj['access-token']
        var refreshtoken = obj['refresh-token']
        if(accecctoken.length > 0)
            return true
        else
            return false
      });
};

