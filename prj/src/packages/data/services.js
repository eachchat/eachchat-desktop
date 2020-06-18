import { APITransaction } from './transaction.js';
import { servicemodels } from './servicemodels.js';
import { models } from './models.js';
import { mqttrouter } from './mqttrouter.js';
import { clientIncrementRouter } from './clientincrementrouter.js';
import { sqliteutil, Group } from './sqliteutil.js'
import { FileStorage } from '../core/index.js';
import {ipcRenderer} from 'electron';
import confservice from './conf_service.js'
import * as path from 'path'
import * as fs from 'fs-extra'
import { makeFlieNameForConflict } from '../core/Utils.js'

const mqtt = require('mqtt')

const commonConfig = {
  hostname:       undefined,
  apiPort:        undefined,
  username:       undefined,
  password:       undefined,
  identityType:   undefined,
  identityValue:  undefined
}; // config info

const commonData = {
  login: undefined,
  selfuser: undefined,
  department: [],
  userinfo: [],
  useremail: [],
  useraddress: [],
  userphone: [],
  userim: [],
  group: [],
  historymessage: []
}; // model in here

const common = {
  config: commonConfig,

  data: commonData,

  api: undefined,

  mqttclient: undefined,

  async GetLoginModel(){
    let foundlogin = await(await models.Login).find(
      {
        $size: 1,
        $reverse: true
      });
    if(foundlogin.length == 0){
      return;
    }
    this.data.login = foundlogin[0];

    
    if(!await this.tokenValid())
    {
      await this.refreshToken();
    }
    
    return this.data.login;
  },

  async GetSelfUserModel(){
    var foundUsers = await(await models.User).find({
      id: this.data.login.user_id
    });
    if(foundUsers.length == 0){
      return;
    }
    this.data.selfuser = foundUsers[0];
    return this.data.selfuser;
  },

  async GetDistUserinfo(uid){
    let distItem = await(await models.UserInfo).find({
      user_id: uid
    });
    return distItem;
  },

  async GetAllDepartmentsModel()
  {
    let allDepartments = await(await models.Department).find({
      $reverse: true
    })
    return this.data.department = allDepartments;
  },

  async GetDistDepartmentsModel(departmentId)
  {
    let distDepartments = await(await models.Department).find({
      department_id: departmentId
    })
    return distDepartments;
  },

  async GetAllUserinfo(){
    let allItems = await(await models.UserInfo).find({
      $reverse: true
    });
    return this.data.userinfo = allItems;
  },

  async GetAllUserEmail(){
    let allItems = await(await models.UserEmail).find({
      $reverse: true
    });
    return this.data.useremail = allItems;
  },

  async GetDistUserEmail(uid){
    let distItem = await(await models.UserEmail).find({
      owner_user_id: uid
    });
    return distItem[0];
  },

  async GetAllUserAddress(){
    let allItems = await(await models.UserAddress).find({
      $reverse: true
    });
    return this.data.useraddress = allItems;
  },

  async GetAllUserPhone(){
    let allItems = await(await models.UserPhone).find({
      $reverse: true
    });
    return this.data.userphone = allItems;
  },

  async GetDistUserPhone(uid){
    let distItem = await(await models.UserPhone).find({
      owner_user_id: uid
    });
    return distItem[0];
  },

  async GetAllUserIm(){
    let allItems = await(await models.UserIm).find({
      $reverse: true
    });
    return this.data.userim = allItems;
  },

  async GetAllGroups(){
    let allItems = await(await models.Groups).find({
      $reverse: true
    });
    return this.data.group = allItems;
  },

  async GetRecentUsers(){
    let recentGroups = [];
    let recentUsers = [];
    let sortkey = "last_message_time";
    let tmpitem;
    let grouptype;
    if(await this.GetAllGroups() == 0)
    {
      return;
    }

    if(await this.GetAllUserinfo() == 0)
    {
      return;
    }
    
    for(let groupkey in this.data.group)
    {
      tmpitem = this.data.group[groupkey]
      grouptype = this.data.group[groupkey]["group_type"]
      if(!servicemodels.ItemInvalid(grouptype))
      {
        continue;
      }
      if(grouptype == "102")
      {
        recentGroups.push(this.data.group[groupkey])
      }
    }
    
    function cmp(a,b){
          var value1 = a[sortkey];
          var value2 = b[sortkey];
          return value2 - value1;
       }
    
    recentGroups.sort(cmp)
    let containUsers;
    let tmpUserId;
    let findusers;
    for(let groupkey in recentGroups)
    {
      tmpitem = recentGroups[groupkey];
      containUsers = tmpitem.contain_user_ids.split(",");
      if(containUsers.length != 2)
      {
        continue;
      }
      for(let itemUserIdindex in containUsers)
      {
        tmpUserId = containUsers[itemUserIdindex]
        if(tmpUserId != this.data.selfuser.id)
        {
          findusers = await(await models.UserInfo).find({
                  user_id:tmpUserId
                })

          if(findusers.length !=0 )
          {
            recentUsers.push(findusers[0]);
          }
          break;
        }
      }
    }
    return recentUsers;
  },

  async GetGroupByName(name){
    return await(await models.Groups).find({
      group_name: name,
      group_type: 102 
    });
  },

  init(config) {
    if (typeof config != "object") {
      config = {};
    }

    if ("hostname" in config) {
      this.config.hostname = config.hostname;
    }

    if ("apiPort" in config) {
      this.config.apiPort = config.apiPort;
    }

    if ("username" in config) {
      this.config.username = config.username;
    }

    if ("password" in config) {
      this.config.password = config.password;
    }

    if("identityType" in config){
      this.config.identityType = config.identityType;
    }

    if("identityValue" in config){
      this.config.identityValue = config.identityValue;
    }

    this.api = new APITransaction(this.config.hostname, this.config.apiPort);
    models.init();
  },

  async login() {
    var api = this.api;
    var config = this.config;
    var data = this.data;

    let result = await this.api.login(config.username, config.password, config.identityType, config.identityValue);

    if (!result.ok || !result.success) {
      return result.data;
    }

    
    var retmodels = await servicemodels.LoginModel(result)
    let login = retmodels[0]
    let selfuser = retmodels[1]


    var foundUsers = await(await models.User).find({
      id: selfuser.id
    });

    if (foundUsers instanceof Array
      && foundUsers.length > 0) {
      var foundUser = foundUsers[0];
      foundUser.values = selfuser.values;
      foundUser.save();
      this.data.selfuser = foundUser;
      console.log('Your profile has been update!');
    } else {
      selfuser.save();
      this.data.selfuser = selfuser;
      console.log('New account login ok!');
    }

    await (await models.Login).truncate()
    let foundlogin = await(await models.Login).find({
      user_id: selfuser.id
    })

    if(foundlogin.length == 0){
      login.user_id = selfuser.id;
      login.save();  
      this.data.login = login;
    }
    else{
      var currentlogin = foundlogin[0]
      currentlogin.access_token = login.access_token
      currentlogin.refresh_token = login.refresh_token
      currentlogin.save();
      this.data.login = currentlogin;
    }
    return true;
  },

  async InitServiceData(){
    await this.AllUserinfo();
    await this.AllDepartmentInfo();
    await this.listAllGroup();
    //await this.ReveiveNewMessage(0, 0);
    
  },

  async dumpEncryptDB(){
    await models.dumpEncryptDB();
  },

  async InitDbData()
  {
    await this.GetLoginModel();
    await this.GetSelfUserModel();
    await this.UpdateGroups();
    await this.UpdateUserinfo();
    await this.UpdateDepartment();
    await this.UpdateMessages();
    //await this.ListAllCollections();
  },

  async UpdateDepartment(){
    let updateTime = await sqliteutil.GetMaxDepartmentUpdatetime(this.data.selfuser.id);
    await this.clientIncrement("updateDepartment", updateTime, 0, 0);
  },

  async UpdateUserinfo(){
    let updateTime = await sqliteutil.GetMaxUserUpdatetime(this.data.selfuser.id);
    await this.clientIncrement("updateUser", updateTime, 0, 0);
  },

  async UpdateGroups()
  {
    let updatetime = await sqliteutil.GetMaxGroupUpdatetime(this.data.selfuser.id);
    await this.groupIncrement(updatetime, 0);
  },

  async UpdateMessages(){
    let maxSequenceIdFromGroup = await sqliteutil.GetMaxMsgSequenceID(this.data.selfuser.id);
    await this.ReveiveNewMessage(maxSequenceIdFromGroup, 0)
  },

  initmqtt(){
    if(this.mqttclient != undefined) {
      return;
    }
    this.mqttclient = mqtt.connect('http://'+ this.config.hostname + ':' + 1883,
                                      {username: 'client', 
                                      password: 'yiqiliao',
                                      clientId: this.data.selfuser.id + '|1111111111111111111'});
      
    let mqttclient = this.mqttclient;
    let userid = this.data.selfuser.id;
    mqttclient.on('connect', function(){
        console.log("mqtt connect success")
        console.log(userid)
        mqttclient.subscribe(userid, function (err) {
            if (err) {
                console.log("subscribe failed")
            }
            else{
                console.log("subscribe success")
            }
          })
    })
    
  },

  closemqtt(){
    this.mqttclient.close()
  },

  async handlemessage(callback){
    let userid = this.data.selfuser.id;
    let services = this;
    await this.mqttclient.on('message', async function(topic, message){
      console.log("handle message get topic ", topic)
      console.log("handle message get sth ", JSON.parse(message.toString()))
      if(topic != userid)
      {
        return;
      }
      await mqttrouter(JSON.parse(message.toString()), callback, services);
    })
    
  },
  async logout() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    let foundlogin = await(await models.Login).find({
      user_id: this.data.selfuser.id
    })
    foundlogin[0].destroy();
    return await this.api.logout(this.data.login.access_token)
  },

  async AllUserinfo(){
    let index = 0;
    let result;
    let useritem;
    let usermodel;
    let userInfoModel;
    let userEmailModel;
    let userAddressModel;
    let userPhoneModel;
    let userImModel;
    this.data.userinfo = [];
    this.data.useremail = [];
    this.data.useraddress = [];
    this.data.userphone = [];
    this.data.userim = [];
    let updateTime;
    await (await models.UserInfo).truncate()
    await (await models.UserEmail).truncate()
    await (await models.UserAddress).truncate()
    await (await models.UserPhone).truncate()
    await (await models.UserIm).truncate()
    do{
      result = await this.Userinfo(undefined, undefined, 1, index)
      if (!result.ok || !result.success) {
        return result;
      }

      if (!("obj" in result.data)) {
        return result;
      }

      updateTime = result.data.obj.updateTime;

      for(var item in result.data.results)
      {
        index++;
        useritem = result.data.results[item]
        usermodel = await servicemodels.UsersModel(useritem)
        if(usermodel == undefined)
        {
          continue;
        }
        userInfoModel = usermodel[0];
        userInfoModel.save();
        this.data.userinfo.push(userInfoModel);

        userEmailModel = usermodel[1];
        userEmailModel.save();
        this.data.useremail.push(userEmailModel);
        userAddressModel = usermodel[2];
        userAddressModel.save();
        this.data.useraddress.push(userAddressModel);
        
        userPhoneModel = usermodel[3];
        userPhoneModel.save();
        this.data.userphone.push(userPhoneModel);

        userImModel = usermodel[4];
        userImModel.save();
        this.data.userim.push(userImModel);
      }
    }while(result.data.total > index);
    var foundUsers = await(await models.User).find({
      id: this.data.login.user_id
    });
    if(foundUsers.length == 0){
      return true;
    }
    foundUsers[0].user_max_updatetime = updateTime;
    foundUsers[0].save();
    return true;
  },

  async Userinfo(filters, perPage, sortOrder, sequenceId){
    
    return await this.api.getUserinfo(this.data.login.access_token, filters, perPage, sortOrder, sequenceId);
  },

  async refreshToken() {
    var ret = {
      "state": true,
      "msg": ""
    };
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      ret.state = false;
      ret.msg = "noLoginModel";
      return ret;
    }

    let result = await this.api.refreshToken(this.data.login.refresh_token)
    if (!result.ok || !result.success) {
      ret.state = false;
      ret.msg = "tokenExpired";
      return ret;
    }

    this.data.login.access_token = result.headers["access-token"];
    this.data.login.save()

    return ret;
  },

  async AllDepartmentInfo(){
    let index = 0;
    let result;
    let departmentitem;
    let departmentmodel;
    let maxUpdatetime = 0;
    let tmpUpdatetime = 0;

    this.data.department = []
    await(await models.Department).truncate()
    do{
      result = await this.getDepartmentInfo(undefined, undefined, 1, index)
      if (result == undefined || !result.success || !result.ok) {
        return result;
      }

      if (!("obj" in result.data)) {
        return result;
      }
      for(var item in result.data.results)
      {
        index++;
        departmentitem = result.data.results[item]
        departmentmodel = await servicemodels.DepartmentsModel(departmentitem)
        this.data.department.push(departmentmodel)
        departmentmodel.save();   
        tmpUpdatetime = departmentmodel.updatetime;
        if(maxUpdatetime < tmpUpdatetime)
          maxUpdatetime = tmpUpdatetime;
      }
    }while(result.data.total > index);  
    sqliteutil.UpdateMaxDepartmentUpdatetime(this.data.selfuser.id, maxUpdatetime);
    return true;
  },

  async getDepartmentInfo(filters,
                          perPage,
                          sortOrder,
                          sequenceId)
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.getDepartmentInfo(this.data.login.access_token,
                                      filters,
                                      perPage,
                                      sortOrder,
                                      sequenceId)
  },

  async getEnterpriseInfo()
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    return await this.api.getEnterpriseInfo(this.data.login.access_token)
  },

  async listGroup(updateTime, perPage) 
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    return await this.api.listGroup(this.data.login.access_token, updateTime, perPage)
  },

  async listAllGroup()
  {
    let next = false;
    let index = 0
    let result;
    let groupvalue;
    let groupmodel;
    this.data.group = []
    let updateTime = 0;
    await (await models.Groups).truncate()

    result = await this.api.listAllGroup(this.data.login.access_token, undefined)
    if (!result.ok || !result.success) {
      return result;
    }

    if (!("obj" in result.data)) {
      return result;
    }

    updateTime = result.data.obj.updateTime;

    next = result.data.hasNext
    for(let item in result.data.results)
    {
      groupvalue = result.data.results[item]
      groupmodel = await servicemodels.GroupsModel(groupvalue)
      if(groupmodel == undefined)
      {
        continue
      }
      if(groupmodel.status[5] != 1){
        groupmodel.save()
        this.data.group.push(groupmodel)
      }
      
    }
    await sqliteutil.UpdateGroupMaxUpdatetime(this.data.selfuser.id, updateTime)
    let maxSequenceId = await sqliteutil.FindMaxSequenceIDFromGroup();
    await await sqliteutil.UpdateMaxMsgSequenceID(this.data.selfuser.id, maxSequenceId);
    this.data.selfuser.group_max_updatetime = updateTime;
    return true;
  },

  async updateUserWorkDescription(workDescription) 
  {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.updateUserWorkDescription(this.data.login.access_token, workDescription)
  },

  async updateUserStatusDescription(statusDescription) {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.updateUserStatusDescription(this.data.login.access_token, statusDescription)
  },


  async updateUserPassword(password) {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.updateUserPassword(this.data.login.access_token, password)
  },

  async getNewVersion() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.getNewVersion(this.data.login.access_token)
  },

  async tokenValid() {
    let result = await this.api.tokenValid(this.data.login.access_token)
    if (!result.ok || !result.success) {
      return false;
    }
    return true;
  },

  async clientIncrement(name,
    updateTime,
    sequenceId,
    countperpageValue) 
  {
    let next = true;
    let result;
    let totalIndex = 0;
    while(next){
      result = await this.api.clientIncrement(this.data.login.access_token,
        name,
        updateTime,
        totalIndex,
        countperpageValue)
      if (!result.ok || !result.success) {
        return undefined;
      }
      next = result.data.hasNext;

      let item;
      for(let index in result.data.results){
        totalIndex++;
        item = result.data.results[index];
        await clientIncrementRouter(name, item, this)
      }
       
    }
  },

  async groupIncrement(updateTime, notification, callback = undefined){
    let result = await this.api.groupIncrement(this.data.login.access_token, updateTime, notification);

    if (!result.ok || !result.success) {
      return undefined;
    }

    let groupItem;
    let groupModel;
    let findGroups;
    let groupId;
    for(let index in result.data.results){
      groupItem = result.data.results[index];
      groupId = groupItem.groupId;
      findGroups = await (await models.Groups).find({
        group_id: groupId
      })
      if(findGroups.length != 0){
        groupModel = servicemodels.UpdateGroupGroup(findGroups[0], groupItem);
      }
      else{
        groupModel = await servicemodels.IncrementGroupModel(groupItem);
      }
      groupModel.save();
      if(callback != undefined){
        callback(groupModel);
      }
      if(groupModel.status[5] == 1){
        await sqliteutil.DeleteGroupByGroupID(groupModel.group_id);
      }
    }
    sqliteutil.UpdateGroupMaxUpdatetime(this.data.selfuser.id, groupModel.updatetime)
    this.data.selfuser.group_max_updatetime = groupModel.updatetime;
  },

  async historyMessage(groupId, sequenceId, count) { 
    let result;
    let resultvalues;
    let next = true;
    let message;
    let messagemodel;
    this.data.historymessage = []
    let totalcount = 0;

    let condition;
    condition = {
      group_id: groupId,
      sequence_id:{
        lte: sequenceId
      },
      $order: {
        by: 'sequence_id',
        reverse: true
      },
      $size: count
      };

    let items = await (await models.Message).find(condition)
    //sort items by sequenceId
    if(items.length != 0 && items.length == count)
    {
      return items;
    }

    if(items.length != 0)
    {
      sequenceId = items[items.length - 1].sequence_id
      for(let index in items)
      {
        totalcount++;
        this.data.historymessage.push(items[index]);
      }
    }

    while(next){
      result = await this.api.historyMessage(this.data.login.access_token, groupId, sequenceId)
      if (!result.ok || !result.success) {
        return this.data.historymessage;
      }
  
      if (!("results" in result.data)) {
        return this.data.historymessage;
      }
      resultvalues = result.data.results;
      next = result.data.hasNext;
      for(let item in resultvalues)
      {
        message = resultvalues[item]
        if(await sqliteutil.ExistMsg(message.msgId)){
          next = false;
          console.log("historyMessage exist message");
          break;
        }
        else{
          messagemodel = await servicemodels.MessageModel(message)
          messagemodel.save()
          sequenceId = messagemodel.sequence_id;
        }
        
        if(totalcount++ < count)
        {
          this.data.historymessage.push(messagemodel)
        }
      }
    }
    return this.data.historymessage;
  },

  async sendNewMessage(messageID, 
                        messageContentType,
                        fromID,
                        groupID,
                        userID,
                        timestamp,
                        content) {
    let result = await this.api.sendNewMessage(this.data.login.access_token,
                                  messageID, 
                                  messageContentType,
                                  fromID,
                                  groupID,
                                  userID,
                                  timestamp,
                                  content)
    if (!result.ok || !result.success) 
    {
      return undefined;
    }
    if (!("obj" in result.data)) 
    {
      return undefined;
    }
    let msg = result.data.obj.message;
    let msgmodel = await servicemodels.MessageModel(msg)
    msgmodel.save();
    await sqliteutil.UpdateMaxMsgSequenceID(this.data.selfuser.id, msgmodel.sequence_id)
    this.data.selfuser.msg_max_sequenceid = msgmodel.sequence_id

    let group = await sqliteutil.FindItemFromGroupByGroupID(msgmodel.group_id);
    if(group == undefined)
    {
      group = await servicemodels.MessageGroup(msg);
      let userarray = [];
      userarray.push(fromID);
      userarray.push(userID);
      group.contain_user_ids = userarray.toString();
    }
    else
    {
      group = await servicemodels.UpdateGroupMessage(group, msg);
    }
    group.save();
    return msgmodel;
  },

  async ReveiveNewMessage(sequenceId, notificationId, callback = undefined)
  {
    let result;
    let hasNext = true;
    let group_key;
    let group_item;
    let message_key;
    let message_item;
    let group_id;
    let group_msgs;
    let msg_models = [];
    let tmpmodel;
    let findmsgs;
    let array_message;
    let bFirstLogin = false;

    if(sequenceId == 0)
    {
      bFirstLogin = true;
    }

    while(hasNext)
    {
      result = await this.api.ReceiveNewMessage(this.data.login.access_token, sequenceId, notificationId);
      if (!result.ok || !result.success) {
        return undefined;
      }
      if (!("results" in result.data)) {
        return undefined;
      }
  
      if (!("obj" in result.data)) {
        return undefined;
      }
      
      array_message = result.data.results;
      for(group_key in array_message)
      {
        group_item = array_message[group_key]
        if(!group_item.groupId)
        {
          continue;
        }
        group_id = group_item.groupId;
        group_msgs = group_item.messages;
        for(message_key in group_msgs)
        {
          message_item = group_msgs[message_key];
          //if(message_item.msgContentType)//101 104
          //{
            
          //}
          tmpmodel = await servicemodels.MessageModel(message_item)
          findmsgs = await(await models.Message).find(
            {
              message_id: tmpmodel.message_id
            });
          if(findmsgs.length != 0){
            findmsgs[0].value = tmpmodel.value;
            findmsgs[0].save();
            msg_models.push(findmsgs[0])
          }    
          else{
            tmpmodel.save()
            msg_models.push(tmpmodel)
          } 
          if(callback != undefined)
          {
            callback(tmpmodel);   
          }
        }
        let group = await sqliteutil.FindItemFromGroupByGroupID(tmpmodel.group_id);
        if(group == undefined)
        {
          group = await servicemodels.MessageGroup(message_item);
        }
        else
        {
          group = await servicemodels.UpdateGroupMessage(group, message_item);
        }
        group.un_read_count = group_item.noReaderCount;
        group.save();
      }
      sequenceId = result.data.obj.maxSequenceId;
      if (result.data.hasNext == true) {
        hasNext = true;
      }
      else{
        hasNext = false;
      }
      await sqliteutil.UpdateMaxMsgSequenceID(this.data.login.user_id, sequenceId);
      this.data.selfuser.msg_max_sequenceid = sequenceId;

    }
    return msg_models;
  },

  async uploadFile(filepath) {
    return await this.api.uploadFile(this.data.login.access_token, filepath);
  },

  async downloadFile(timelineId, message_time, fileName, needOpen) {
    var ret = "FILE_DOWNLOADING";
    var targetDir = confservice.getFilePath(message_time);
    var targetPath = path.join(targetDir, fileName);
    console.log("targetPath is ", targetPath);
    if(fs.existsSync(targetPath)) {
      return targetPath;
    }
    else {
      targetPath = await makeFlieNameForConflict(targetPath);
      ipcRenderer.send('download-file', [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath, needOpen]);
      return ret;
    }
  },

  async downloadMsgTTumbnail(timelineId, message_time, fileName, needOpen) {
    var ret = "FILE_DOWNLOADING";
    var targetDir = confservice.getThumbImagePath(message_time);
    var targetPath = path.join(targetDir, fileName);
    console.log("targetPath is ", targetPath);
    if(fs.existsSync(targetPath)) {
      console.log("return targetPath ", targetPath)
      return targetPath;
    }
    else {
      targetPath = await makeFlieNameForConflict(targetPath);
      ipcRenderer.send('download-image', [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath, "T", needOpen]);
      return ret;
    }
  },
  
  async downloadMsgOTumbnail(timelineId, message_time, fileName, needOpen) {
    console.log("downloadMsgOTumbnail")
    var ret = "FILE_DOWNLOADING";
    var targetDir = confservice.getOImagePath(message_time);
    var targetPath = path.join(targetDir, fileName);
    if(fs.existsSync(targetPath)) {
      return targetPath;
    }
    else {
      targetPath = await makeFlieNameForConflict(targetPath);
      console.log("downloadMsgOTumbnail targetPath is ", targetPath);
      ipcRenderer.send('download-mgs-oimage', [timelineId, this.data.login.access_token, this.config.hostname, this.config.apiPort, targetPath, "M", needOpen]);
      return ret;
    }
  },
  
  async downloadUserTAvatar(url, userId, targetPath="") {
    var ret = "FILE_DOWNLOADING";
    if(targetPath.length == 0) {
      var targetDir = confservice.getUserThumbHeadPath();
      targetPath = path.join(targetDir, userId + '.png');
      // console.log("downloadUserTAvatar targetPath is ", targetPath);
    }
    if(fs.existsSync(targetPath)) {
      return targetPath;
    }
    else {
      ipcRenderer.send('download-user-avarar', [url, userId, this.data.login.access_token, targetPath]);
      return ret;
    }
  },
  
  async downloadUserOAvatar(url, userId) {
    var ret = "FILE_DOWNLOADING";
    var targetDir = confservice.getUserThumbHeadPath();
    var targetPath = path.join(targetDir, userId + '.png');
    if(fs.existsSync(targetPath)) {
      return targetPath;
    }
    else {
      ipcRenderer.send('download-user-avarar', [url, userId, this.data.login.access_token, targetPath]);
      return ret;
    }
  },
  
  async downloadGroupAvatar(url, groupId) {
    var ret = "FILE_DOWNLOADING";
    var targetDir = confservice.getUserThumbHeadPath();
    var targetPath = path.join(targetDir, groupId + '.png');
    if(fs.existsSync(targetPath)) {
      return targetPath;
    }
    else {
      ipcRenderer.send('download-avarar', [url, groupId, this.data.login.access_token, targetPath]);
      return ret;
    }
  },
  
  async getGroupAvatar(url) {
    return await this.api.downloadGroupAvatar(url, this.data.login.access_token);
  },
  
  async CreateGroup(groupNameValue, groupUsersArray){
    let result = await this.api.createGroup(this.data.login.access_token, groupNameValue, groupUsersArray)
    console.log(result)
    
    if (!result.ok || !result.success) {
      return undefined;
    }

    if (!("obj" in result.data)) {
      return undefined;
    }

    let groupValue = result.data.obj;
    let groupModel = await servicemodels.IncrementGroupModel(groupValue);
    groupModel.group_name = groupNameValue;
    groupModel.save();

    return groupModel;
  },

  async MessageRead(groupid, sequenceid){
    let result = await this.api.MessageRead(this.data.login.access_token, groupid, sequenceid);
    if (!result.ok || !result.success) {
      return false;
    }
    await sqliteutil.SetGroupMessageRead(groupid);
    return true;
  },

  async ListAllCollections(){
    await this.ListMessageCollections();
    await this.ListPictureCollections();
    await this.ListFileCollections();
    await this.ListGroupCollections();
    await this.ListTopicCollections();
  },

  async ListMessageCollections(){
    return await this.ListCollectionByType([101]);
  },

  async ListPictureCollections(){
    return await this.ListCollectionByType([102]);
  },
  
  async ListFileCollections(){
    return await this.ListCollectionByType([103]);
  },

  async ListGroupCollections(){
    return await this.ListCollectionByType([104]);

  },

  async ListTopicCollections(){
    return await this.ListCollectionByType([106]);
  },
  
  async ListCollectionByType(type){
    let result;
    let bNext = true;
    let item;
    let collectionModel;
    let collections = [];
    let bFirst = true;
    let sequenceID = 0;

    while(bNext){
      result = await this.api.ListAllCollections(this.data.login.access_token,
                                                  type,
                                                  sequenceID,
                                                  10,
                                                  1);
      if (!result.ok || !result.success) {
        break;
      }
      if(bFirst)
      {
        await sqliteutil.ClearCollectionByType(type[0]);
        bFirst = false;
      }
      bNext = result.data.hasNext;

      for(let index in result.data.results){
        item = result.data.results[index];
        collectionModel = await servicemodels.CollectionModel(item);

        let find = await sqliteutil.FindItemByFavouriteID(item.favoriteId)
        if(find == undefined){
          collectionModel.save();
        }
        else{
          find.values = collectionModel.values;
          find.save();
        } 
      }
      sequenceID = await sqliteutil.FindMaxCollectionSequenceID(type[0])
    }
    collections = await sqliteutil.FindCollectionByType(type[0])
    return collections;
  },

  async CollectMessage(timelineIDs){
    let result = await this.api.CollectMessage(this.data.login.access_token, timelineIDs);
    if (!result.ok || !result.success) {
      return false;
    }
    let item;
    let model;
    item = result.data.obj[index];
    model = await servicemodels.CollectionModel(item);
    let findmodel = await sqliteutil.FindItemByCollectionID(item.collectionId)
    if(findmodel == undefined){
      model.save();
    }
    else{
      findmodel.values = model.values;
      findmodel.save();
    }
    return true;
  },

  async CollectGroup(grouID){
    let result = await this.api.CollectGroup(this.data.login.access_token, grouID);
    if (!result.ok || !result.success) {
      return false;
    }
    let item;
    let model;
    item = result.data.obj;
    model = await servicemodels.CollectionModel(item);
    let findmodel = await sqliteutil.FindItemByCollectionID(item.collectionId)
    if(findmodel == undefined){
      model.save();
    }
    else{
      findmodel.values = model.values;
      findmodel.save();
    }
    await Group.UpdateGroupStatus(item.groupId, item.status);
  },

  async DeleteCollectionMessage(favoriteID){
    let result = await this.api.DeleteCollectionMessage(this.data.login.access_token, favoriteID);
    if (!result.ok || !result.success) {
      return false;
    }
    await sqliteutil.DeleteItemFromCollectionByFavouriteID(favoriteID)
  },

  async DeleteCollectionGroup(gorupID){
    let result = await this.api.DeleteCollectionGroup(this.data.login.access_token, gorupID);
    if (!result.ok || !result.success) {
      return false;
    }
    await sqliteutil.DeleteItemFromCollectionByCollectionIdID(gorupID)
  },

  async UpdateGroupName(groupID, groupName){
    let result = await this.api.UpdateGroupName(this.data.login.access_token, groupID, groupName);
    if (!result.ok || !result.success) {
      return false;
    }
    //let groupModel = await servicemodels.IncrementGroupModel(result.data.obj);
    //await sqliteutil.UpdateGroupName(groupID, groupName)
  },

  async DeleteGroupUsers(groupID, userIDs){
    let result = await this.api.DeleteGroupUsers(this.data.login.access_token, groupID, userIDs);
    if (!result.ok || !result.success) {
      return false;
    }
    return true;
  },

  async AddGroupUsers(groupID, userIDs){
    let result = await this.api.AddGroupUsers(this.data.login.access_token, groupID, userIDs);
    if (!result.ok || !result.success) {
      return false;
    }
  },

  async DeleteHistoryMessage(groupID, sequenceID){
    let result = await this.api.DeleteHistoryMessage(this.data.login.access_token, groupID, sequenceID);
    if (!result.ok || !result.success) {
      return false;
    }
    await sqliteutil.ClearMessageByGroupID(groupID)
  },

  async DeleteGroup(groupID){
    let result = await this.api.DeleteGroup(this.data.login.access_token, groupID);
    if (!result.ok || !result.success) {
      return result;
    }
    await sqliteutil.DeleteGroupByGroupID(groupID)
  },

  async UpdateGroupNotice(groupID, notice){
    let result = await this.api.UpdateGroupNotice(this.data.login.access_token, groupID, notice);
    if (!result.ok || !result.success) {
      return result;
    }
    return result;
  },

  async UpdateGroupAvatar(groupID, filePath, url){
    let result = await this.api.UpdateGroupAvatar(this.data.login.access_token, groupID, filePath);
    if (!result.ok || !result.success) {
      return result;
    }
    return result;
  },

  async GroupStatus(groupID, stickFlag, disturbFlag){
    let result = await this.api.GroupStatus(this.data.login.access_token, groupID, this.data.selfuser.user_id, stickFlag, disturbFlag);
    if (!result.ok || !result.success) {
      return result;
    }
    let status = result.data.obj.status;
    await sqliteutil.UpdateGroupStatus(groupID, status)
    return status
  },

  async SetFilePath(msgID, filePath){
    let msgs = await (await models.Message).find({
      message_id: msgID
    });
    if(msgs.length == 1)
    {
      msgs[0].file_local_path = filePath;
      msgs[0].save();
      return true;
    }
    return false;
  },

  async GetFilePath(msgID){
    console.log("getfilepath the msgID ls ", msgID)
    let msgs = await (await models.Message).find({
      message_id: msgID
    });
    console.log("getfilepath the return ls ", msgs)
    if(msgs.length == 1){
      return msgs[0].file_local_path; 
    }
  },

  async QuitGroup(groupID){
    let result = await this.api.QuitGroup(this.data.login.access_token, groupID);
    if (!result.ok || !result.success) {
      return result;
    }
  },

  async TransferGroup(groupID, toUserID){
    let result = await this.api.TransferGroup(this.data.login.access_token, groupID, toUserID);
    if (!result.ok || !result.success) {
      return result;
    }
  }
};

const cache = {
  files: null,

  async download(params, method, target) {
    if (this.files == null) {
      return null;
    }

    var description = method.name;
    description += JSON.stringify(params);
    console.log("download files is ", this.files)

    var recent = this.files.get('cache', {
      description: escape(description)
    });

    if (recent) {
      recent = recent[0];

      var currentTime = (new Date()).getTime();
      // var duration = currentTime - recent.update_time;
      var duration = 0;

      if (duration < (60 * 60)) {
        return recent;

      }

      // Update after 1 hour
      this.files.delete(recent);
    }

    var result = method.call(
      target,
      params[0],
      params[1],
      params[2],
      params[3],
      params[4],
      params[5]
    );

    return await this.files.post('cache', {
      raw: result.data,
      description: escape(description)
    });
  }
};

// Cache Initialize
((cacheObject) => {
  cacheObject.files = new FileStorage();
})(cache);

export {
  common,
  cache
}
