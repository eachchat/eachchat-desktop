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
        
        //let privateKey = fs.readFileSync(this.path + "/private", "utf-8");;
        let privateKey = "-----BEGIN PRIVATE KEY-----\
        MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCiZvLmBJpnCC7X\
        mDfgqB6lFTPVMm2UenMZP0z5SAXvqfqb+MyXCK8QVX5QBXp58xu9xqvHxTSdNcN+\
        /VmyZ5BiMwnXBYBwU/bzUDN76GzfeomSg8+sDFuoXlzzP11jmfZiduahL9fhbMts\
        /CQb17LuFqKBcFwOvxHmvaH1i7myKfuY4e8Acq5bNgzJzkOC9cxAXIDDp9DUFSko\
        HusctaV4AJZBNUYufM40RYv+Hv7P7thrCuydOFBRoXsc/XNFDdhuKoBOVlISAnuC\
        3M5lYbDDDU2jNkOylljuzyEbE1tLQMzefh4DsSCBVWYoNGIdZGT2HJtu/WSSpQhH\
        W8JVwRgxAgMBAAECggEBAIpA+ie3Y3qzDK2deHRYqz3+ftHQzFjKpZGowe610dfl\
        7OM7O3CYg/Bz18Rn5YxL2iIFL9gxmkj7rCI/rEykvdXbfVT/6ge2c1VPwYSKqaTW\
        vKduby0YmC8NpjOujeJs/8NzVYODJ1VRORzeyh6p0jm+KznmXXhwUN0OMwLGoJ96\
        ovmizq8rz6HnN1BtMJNyhUFk3DyOkhwDNZpzrQDoTsDi1WtRZ6Jv0mQaIu+cu316\
        3EGvfXAomxP6XSitb08bWaaISSSGeaGZoKU210MOrPZyfo3tV341tyErwl8R65zV\
        u2++uFld0utLwdUEJd9vxtanw7uUgUD9xUJjkLEJoAECgYEAzRxCF3ZWA79qQhi5\
        4ggwWLvXOHwEESg6mgXqyqyUzel9rTu/jMLh8qBgPyC3AUGSWWwZRz4DZ2pu30qY\
        Pi3oWVANrHjW3kltY52PK/FM6PhfhAAmZ8hBTkT2Lii2tdV5Fnx0vdW8tO45922e\
        PcvrgOHcJK33LptIoLLEmTUH6FECgYEAyrILW4gU489NZrzzx5kBGSAKsHMy6kb0\
        1Z+OBsuBmvJZZspnBxOLo3hhfK/j3W04xX2a8j1Vmf9Axc01KC9l6kux3M4odpwT\
        3yab1ptCARsSRURNItrtgFEl8hbnNLMTcHdanAyrULxyOQ78p0ZvGQ489zdCR3zC\
        7/xcDAi+GeECgYEAyi5Vs7zxEqanflnTOUxrI7ydbM9KTwNBqLu2cmvmDodfW9iu\
        e3lKshiGZxO/cRyKv1zAGiq1vkX63l4wbfJgu1Ee+WjwHJNyoaQZEe68qlTSClL/\
        iIOsZBO0O1HksJ6pypGJnerHJe5B83T5a97L2PJKR1m4cxecYtN02bSdg9ECgYBM\
        aWZCsUA+yS2Cp4S3IAT79cpRznvJOcqepbGi+iD3ypjNWUwRrNqdW4pUuPILzVrz\
        iHBbFagpj8JZTwzVA1lGRBbfCJDUde4/14w0EP+G7y+qER+LHkEeeHj3lI7AnSmc\
        4kG0Rkpm+0OMIww3+yNyrJ1rDNfdnzjVw6rnlnwjwQKBgGbcofR80KuaVRBHcfcy\
        4UJZh39ANpQU/PA8WSfOC8bOCogSwo/8Ao0RpXqMTmTXyCRc/0dYUHiXxOwaEsXK\
        51W1bUnZl3Jg9KvDO0/bES0qiYjcbAsdXi8osTVL1cdL81UY/x6xCXP2At2MgpJX\
        BA9p2MGJh+b+En2LhSPlASVg\
        -----END PRIVATE KEY-----"
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