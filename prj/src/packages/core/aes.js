const CryptoJS = require('crypto-js');
const Base64 = require('js-base64').Base64;

class SqliteEncrypt{
    constructor(){
        this.iv = "qlwk291j4h58903u";
        this.key = "ququwiqiqmwnmsewkdueekrenrbtkcofditm";
    }

    decrypt(crypted){
        let realKey = Base64.encode(this.key);
        if(!realKey){
            alert("未知错误");
            return;
        }
        let strCrypted = this.uint8ToString(crypted);
        var decryptedStr = this.getDAesString(strCrypted, realKey, this.iv);
        return decryptedStr;
        
        /*
        crypted = new Buffer(crypted, 'base64').toString('binary');
        var decipher = crypto.createDecipheriv('aes-128-cbc', privatekey, iv);
        var decoded = decipher.update(crypted, 'binary', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
        */
    }

    encrypt(data){
        let realKey = Base64.encode(this.key);
        let strData = this.uint8ToString(data);

        var encrypted = this.getAesString(strData, realKey, this.iv); //密文
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