import * as fs from 'fs-extra';
import * as path from 'path';
import {environment} from './environment.js';
import {Appendzero} from '../core/Utils.js';

class ConfService {
    // 放弃，梁杰有替代方案
    // 配置和数据库放在%localappdata%/Workly/EachChat
    // 缓存参照微信，放在用户文档中的EachChatFiles中，目录结构：
        // 用户ID命名的文件夹：
        //     Files：聊天中的文档，按月分文件夹
        //     General：头像和高清头像
                    // HeadImage为头像缩略图
                    // HDHeadImage为头像原图
        //     Image：聊天中的图片，按月分文件夹，参照teams和飞书，不支持聊天内图片的同时预览
                    // Thumb放置缩略图
                    // MImage放置M Size图片
                    // OImage放置原图

    constructor() {
        this.appName = 'EachChat';
        this.companyName = 'Workly';
        this.productName = 'EachChat';
        this.localAnyBoxDirName = 'AnyBoxSpaces';
        this.filesDirName = 'EachChatFiles';
        this.filesFilesDirName = 'Files';
        this.headImageDirName = 'General';
        this.headThumbDirName = 'HeadImage';
        this.voiceFileDirName = 'voice';
        this.headHDDirName = 'HDHeadImage';
        this.imagesDirName = 'Image';
        this.imageThumbDirName = 'Thumb';
        this.imageMDirName = 'MImage';
        this.imageODirName = 'OImage';
        this.base = environment.path.base;
        // this.init();
    }
    init(uid="") {
        this.documentsPath = this.getDocumentsPath();
        this.appdataPath = this.getAppDataPath();
        // For Conf No Mac
        this.companyPath = path.join(this.appdataPath, this.companyName);
        if(!fs.existsSync(this.companyPath)) {
            fs.ensureDir(this.companyPath);
        }
        this.productPath = path.join(this.companyPath, this.productName);
        if(!fs.existsSync(this.productPath)){
            fs.ensureDirSync(this.productPath);
        }

        // For Files
        this.filesPath = path.join(this.base, this.filesDirName);
        if(!fs.existsSync(this.filesPath)){
            fs.ensureDirSync(this.filesPath);
        }
        this.uid = uid;
    }
    getCurFilesDir() {
        var userFilesPath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userFilesPath)){
            fs.ensureDirSync(userFilesPath);
        }
        return userFilesPath;
    }
    getEachChatFilesDir() {
        this.filesPath = path.join(this.base, this.filesDirName);
        if(!fs.existsSync(this.filesPath)){
            fs.ensureDirSync(this.filesPath);
        }
        return this.filesPath;
    }
    getDocumentsPath() {
        var documentsPath = '';
        let { app } = require('electron').remote;
        documentsPath = path.join(app.getPath('documents'));
        return documentsPath
    }
    getAppDataPath() {
        var appDatePath = '';
        let { app } = require('electron').remote;
        appDatePath = path.join(app.getPath('appData'));
        return appDatePath;
    }
    getConfPath(){
        var userPath = path.join(this.productPath, this.uid);
        if(!fs.existsSync(userPath)){
            fs.ensureDirSync(userPath);
        }
        return userPath;
    }
    getFilePath(fileTime=0) {
        var curDate = new Date();
        var curYeat = curDate.getFullYear();
        var curMonth = curDate.getMonth() + 1;
        if(fileTime != 0) {
            var secondsTime = Number(fileTime);
            var distdate = new Date(secondsTime);
            curYeat = distdate.getFullYear();
            curMonth = distdate.getMonth() + 1;
        }
        var YearMonth = curYeat + '-' + Appendzero(curMonth);
        console.log("YearMonth is ", YearMonth);
        var userFilesPath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userFilesPath)){
            fs.ensureDirSync(userFilesPath);
        }
        var userCurFilesPath = path.join(userFilesPath, this.filesFilesDirName, YearMonth);
        if(!fs.existsSync(userCurFilesPath)){
            fs.ensureDirSync(userCurFilesPath);
        }
        return userCurFilesPath;
    }
    getVoiceFilePath() {
        var userFilesPath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userFilesPath)){
            fs.ensureDirSync(userFilesPath);
        }
        var userVoiceFilePath = path.join(userFilesPath, this.filesFilesDirName, this.voiceFileDirName);
        if(!fs.existsSync(userVoiceFilePath)){
            fs.ensureDirSync(userVoiceFilePath);
        }
        return userVoiceFilePath;
    }
    getUserThumbHeadPath() {
        var userFilesPath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userFilesPath)){
            fs.ensureDirSync(userFilesPath);
        }
        var userCurHeadPath = path.join(userFilesPath, this.headImageDirName, this.headThumbDirName);
        if(!fs.existsSync(userCurHeadPath)){
            fs.ensureDirSync(userCurHeadPath);
        }
        return userCurHeadPath;
    }
    getUserThumbHeadLocalPath(uid) {
        var userFilesPath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userFilesPath)){
            fs.ensureDirSync(userFilesPath);
        }
        var userCurHeadPath = path.join(userFilesPath, this.headImageDirName, this.headThumbDirName);
        if(!fs.existsSync(userCurHeadPath)){
            fs.ensureDirSync(userCurHeadPath);
        }
        return path.join(userCurHeadPath, uid + ".png");
    }
    getUserHDHeadPath() {
        var userFilesPath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userFilesPath)){
            fs.ensureDirSync(userFilesPath);
        }
        var userCurHeadPath = path.join(userFilesPath, this.headImageDirName, this.headHDDirName);
        if(!fs.existsSync(userCurHeadPath)){
            fs.ensureDirSync(userCurHeadPath);
        }
        return userCurHeadPath;
    }
    getImagePath() {
        let curDate = new Date();
        let curYeat = curDate.getFullYear();
        let curMonth = curDate.getMonth();
        var YearMonth = curYeat + '-' + Appendzero(curMonth);
        var userImagePath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userImagePath)){
            fs.ensureDirSync(userImagePath);
        }
        var userCurFilesPath = path.join(userImagePath, this.imagesDirName, YearMonth, this.imageODirName);
        if(!fs.existsSync(userCurFilesPath)){
            fs.ensureDirSync(userCurFilesPath);
        }
        return userCurFilesPath;
    }
    getThumbImagePath(fileTime=0) {
        let curDate = new Date();
        let curYeat = curDate.getFullYear();
        let curMonth = curDate.getMonth();
        if(fileTime == 0) {
            var secondsTime = Number(fileTime);
            var distdate = new Date(secondsTime);
            curYeat = distdate.getFullYear();
            curMonth = distdate.getMonth() + 1;
        }
        var YearMonth = curYeat + '-' + Appendzero(curMonth);
        var userImagePath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userImagePath)){
            fs.ensureDirSync(userImagePath);
        }
        var userCurFilesPath = path.join(userImagePath, this.imagesDirName, YearMonth, this.imageThumbDirName);
        if(!fs.existsSync(userCurFilesPath)){
            fs.ensureDirSync(userCurFilesPath);
        }
        return userCurFilesPath;
    }
    getMImagePath(fileTime=0) {
        let curDate = new Date();
        let curYeat = curDate.getFullYear();
        let curMonth = curDate.getMonth();
        if(fileTime == 0) {
            var secondsTime = Number(fileTime);
            var distdate = new Date(secondsTime);
            curYeat = distdate.getFullYear();
            curMonth = distdate.getMonth() + 1;
        }
        var YearMonth = curYeat + '-' + Appendzero(curMonth);
        var userImagePath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userImagePath)){
            fs.ensureDirSync(userImagePath);
        }
        var userCurFilesPath = path.join(userImagePath, this.imagesDirName, YearMonth, this.imageMDirName);
        if(!fs.existsSync(userCurFilesPath)){
            fs.ensureDirSync(userCurFilesPath);
        }
        return userCurFilesPath;
    }
    getOImagePath(fileTime=0) {
        let curDate = new Date();
        let curYeat = curDate.getFullYear();
        let curMonth = curDate.getMonth();
        if(fileTime == 0) {
            var secondsTime = Number(fileTime);
            var distdate = new Date(secondsTime);
            curYeat = distdate.getFullYear();
            curMonth = distdate.getMonth() + 1;
        }
        var YearMonth = curYeat + '-' + Appendzero(curMonth);
        var userImagePath = path.join(this.filesPath, this.uid);
        if(!fs.existsSync(userImagePath)){
            fs.ensureDirSync(userImagePath);
        }
        var userCurFilesPath = path.join(userImagePath, this.imagesDirName, YearMonth, this.imageODirName);
        if(!fs.existsSync(userCurFilesPath)){
            fs.ensureDirSync(userCurFilesPath);
        }
        return userCurFilesPath;
    }
}
export default new ConfService();