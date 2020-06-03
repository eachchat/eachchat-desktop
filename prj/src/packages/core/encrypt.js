/*
const {JSDOM} = require("jsdom")
const jsdom = JSDOM('<!doctype html><html><body></body></html>')
const window = jsdom;
global.window = window;
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
}
*/
//const JSEncrypt = require('jsencrypt');
import JSEncrypt from 'jsencrypt'
const fs = require('fs');
class SqliteEncrypt{
    constructor(path){
        this.path = path;
    }

    decrypt(crypted){
        var decrypt = new JSEncrypt();
        
        let privateKey = fs.readFileSync(this.path + "/private", "utf-8");;

        decrypt.setPrivateKey(privateKey);
        var encrypted = decrypt.decrypt(crypted);
        return encrypted;
        
        /*
        crypted = new Buffer(crypted, 'base64').toString('binary');
        var decipher = crypto.createDecipheriv('aes-128-cbc', privatekey, iv);
        var decoded = decipher.update(crypted, 'binary', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
        */
    }

    encrypt(data){        
        let pubkeyOriginal = fs.readFileSync(this.path + "/public", "utf-8");
        
        //let pubKey = pubkeyOriginal.replace(/[\r\n]/g,"");

        let jsencrypt = new JSEncrypt();
        //jsencrypt.setPublicKey('-----BEGIN PUBLIC KEY----- ' + pubkeyOriginal + ' -----END PUBLIC KEY-----');
        jsencrypt.setPublicKey(pubkeyOriginal);

        var encrypted = jsencrypt.encrypt(data);
        return encrypted;
        
        /*
        var cipher = crypto.createCipheriv('aes-128-cbc', pubkey, this.iv);
        var crypted = cipher.update(data, 'utf8', 'binary');
        crypted += cipher.final('binary');
        crypted = new Buffer(crypted, 'binary').toString('base64');
        return crypted;
        */
    }

    getAesString(data,key,iv){
        var key  = CryptoJS.enc.Utf8.parse(key);
        var iv   = CryptoJS.enc.Utf8.parse(iv);
        var encrypted =CryptoJS.AES.encrypt(data,key,
            {
                iv:iv,
                mode:CryptoJS.mode.CBC,
                padding:CryptoJS.pad.Pkcs7
            });
        return encrypted.toString();    //返回的是base64格式的密文
    }

    getDAesString(encrypted,key,iv){//解密
        var key  = CryptoJS.enc.Utf8.parse(key);
        var iv   = CryptoJS.enc.Utf8.parse(iv);
        var decrypted =CryptoJS.AES.decrypt(encrypted,key,
            {
                iv:iv,
                mode:CryptoJS.mode.CBC,
                padding:CryptoJS.pad.Pkcs7
            });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    uint8ToString(uint8){
        let str = "";
        for(let index in uint8){
            str += String.fromCharCode(uint8[index]);
        }
        return str;
    }

    stringToUint8(str){
        var arr = [];
        for (var i = 0, j = str.length; i < j; ++i) {
          arr.push(str.charCodeAt(i));
        }
       
        var tmpUint8Array = new Uint8Array(arr);
        return tmpUint8Array;
    }

}

export{
    SqliteEncrypt
}