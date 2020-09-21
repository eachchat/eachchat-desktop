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
import JSEncrypt from 'jsencrypt'
import CryptoJS from "crypto-js"
import {Base64} from "js-base64"

class SqliteEncrypt{
    constructor(path){
        this.path = path;
        this.privateKey = "-----BEGIN PRIVATE KEY-----\
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
        -----END PRIVATE KEY-----";

        this.pubkeyOriginal = "-----BEGIN PUBLIC KEY-----\
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAomby5gSaZwgu15g34Kge\
        pRUz1TJtlHpzGT9M+UgF76n6m/jMlwivEFV+UAV6efMbvcarx8U0nTXDfv1ZsmeQ\
        YjMJ1wWAcFP281Aze+hs33qJkoPPrAxbqF5c8z9dY5n2YnbmoS/X4WzLbPwkG9ey\
        7haigXBcDr8R5r2h9Yu5sin7mOHvAHKuWzYMyc5DgvXMQFyAw6fQ1BUpKB7rHLWl\
        eACWQTVGLnzONEWL/h7+z+7YawrsnThQUaF7HP1zRQ3YbiqATlZSEgJ7gtzOZWGw\
        ww1NozZDspZY7s8hGxNbS0DM3n4eA7EggVVmKDRiHWRk9hybbv1kkqUIR1vCVcEY\
        MQIDAQAB\
        -----END PUBLIC KEY-----";
        this.decryption = new JSEncrypt(); 
        //this.rsaPrivate = new NodeRSA();
        //this.rsaPublic = new NodeRSA();
        //this.rsaPrivate.importKey(this.privateKey, "pkcs8-private");
        //this.rsaPublic.importKey(this.pubkeyOriginal, "pkcs8-public");
    }

    decrypt(crypted){
        this.decryption.setPrivateKey(this.privateKey);
        var value = this.decryption.decrypt(crypted);
        return value;
    }

    encrypt(data){        
        this.decryption.setPublicKey(this.pubkeyOriginal);
        return this.decryption.encrypt(data);
    }

    sign(plainText){
        let shaValue = CryptoJS.SHA1(plainText);
        this.decryption.setPrivateKey(this.privateKey);
        return this.decryption.sign(shaValue, CryptoJS.SHA256, "sha256");
    }

    verify(plainText, signature){
        let shaValue = CryptoJS.SHA1(plainText);
        this.decryption.setPublicKey(this.pubkeyOriginal);
        return this.decryption.verify(shaValue, signature, CryptoJS.SHA256);
    }

    decryptAes(crypted){
        crypted = "hauW3QAJ2aH9FRLyIucm9i7J4t/2WneiP1p+U175qtpWpaeDpSFMDnVlB40rj8P9RIbwH325JdGR18JMOHyp1Be+bw2c9GEViKpMFnp2AcvbDCqlNbaY+JzrfuZzpFNPccbxQ45WzJDycoCrUqx8Sq55pDCf1wZ+YNpM+5b0WOowOvlKCS4g38FO3uwdbkXSW5KUHAUSJ/3s4dEDKCUp0wH/RckMGRw0FHOXtsNhi7iMf5tpTxbTOMCHjCsIs5cMJdBV+Kc16/IQYWeN9XIRT6+N+vOc/q06+hZXJiBlCH71gExnQn3f9Z+GviZP8OyU9aIpBLwuD26Xu3zY0KPc6g==";
        let tt = this.rsaPublic.encrypt("secret", "utf8");
        //crypted = Base64.decode(crypted);
        let utf8data =  this.rsaPrivate.decrypt(crypted, "utf8");
        let base64Data = this.rsaPrivate.decrypt(crypted, "base64");
        let bufferData =this.rsaPrivate.decrypt(crypted, "buffer");
        let binData =this.rsaPrivate.decrypt(crypted, "binary");
        console.log(binData)
    }

    

    getDAesString(){//解密
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

class AESEncrypt{
    encrypt(data,key,iv){
        //let keyValue  = CryptoJS.enc.Utf8.parse(key);
        //let ivValue   = CryptoJS.enc.Utf8.parse(iv);
        
        var encrypted = CryptoJS.AES.encrypt(data, key,
            {
                iv: iv,
                mode:CryptoJS.mode.CBC,
                padding:CryptoJS.pad.Pkcs7
            });
        return encrypted.toString();    //返回的是base64格式的密文
        //return encrypted.ciphertext.toString();
    }

    decrypt(encrypted,key,iv)
    {
        var decrypted = CryptoJS.AES.decrypt(encrypted,
            key,
            {
                iv: iv,
                mode:CryptoJS.mode.CBC,
                padding:CryptoJS.pad.Pkcs7
            });
        return decrypted.toString(CryptoJS.enc.Utf8).toString();
    }

    decryptMesage(cryptMessage, key, IV){
        let arrayKey = CryptoJS.enc.Base64.parse(key); 
        let arrayIV = CryptoJS.enc.Utf8.parse(IV);
        let decryptMsg;
        try{
            decryptMsg = this.decrypt(cryptMessage, arrayKey, arrayIV);
        }
        catch(e){
            console.log(e);
            console.log("cryptMessage:" + cryptMessage);
            console.log("key:" + key);
            console.log("IV:" + IV);
        }
        return decryptMsg;
    }

    encryptMessage(message, key, iv){
        let arrayKey = CryptoJS.enc.Base64.parse(key); 
        let arrayIV = CryptoJS.enc.Utf8.parse(iv);
        return this.encrypt(message, arrayKey, arrayIV);
    }
}

export{
    SqliteEncrypt,
    AESEncrypt
}