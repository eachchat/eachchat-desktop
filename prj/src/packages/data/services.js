import { APITransaction } from './transaction.js';
import { servicemodels } from './servicemodels.js';
import { models } from './models.js';
import { mqttrouter } from './mqttrouter.js';
import { clientIncrementRouter } from './clientincrementrouter.js';
import { sqliteutil } from './sqliteutil.js'

const mqtt = require('mqtt')

const commonConfig = {
  hostname: undefined,
  apiPort: undefined,
  username: undefined,
  password: undefined
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

    this.api = new APITransaction(this.config.hostname, this.config.apiPort);
    models.init();
  },

  async login() {
    var api = this.api;
    var config = this.config;
    var data = this.data;

    let result = await this.api.login(config.username, config.password);

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
  },

  async InitServiceData(){
    await this.AllUserinfo();
    await this.listAllGroup();
    await this.ReveiveNewMessage(0, 0);
  },

  async InitDbData()
  {
    await this.GetLoginModel();
    await this.GetSelfUserModel();
    await this.UpdateGroups();
    await this.UpdateUserinfo();
    //await this.UpdateMessages();
  },

  async UpdateUserinfo(){

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
        return undefined;
      }

      if (!("obj" in result.data)) {
        return undefined;
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
      return;
    }
    foundUsers[0].user_max_updatetime = updateTime;
    foundUsers[0].save();
  },

  async Userinfo(filters, perPage, sortOrder, sequenceId){
    
    return await this.api.getUserinfo(this.data.login.access_token, filters, perPage, sortOrder, sequenceId);
  },

  async refreshToken() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    let result = await this.api.refreshToken(this.data.login.refresh_token)
    if (!result.ok || !result.success) {
      return undefined;
    }

    this.data.login.access_token = result.headers["access-token"];
    this.data.login.save()
  },

  async AllDepartmentInfo(){
    let index = 0;
    let result;
    let departmentitem;
    let departmentmodel;
    this.data.department = []
    await(await models.Department).truncate()
    do{
      result = await this.getDepartmentInfo(undefined, undefined, 1, index)
      if (!result.ok || !result.success) {
        return undefined;
      }

      if (!("obj" in result.data)) {
        return undefined;
      }
      for(var item in result.data.results)
      {
        index++;
        departmentitem = result.data.results[item]
        departmentmodel = await servicemodels.DepartmentsModel(departmentitem)
        this.data.department.push(departmentmodel)
        departmentmodel.save();        
      }
    }while(result.data.total > index);  
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
      return undefined;
    }

    if (!("obj" in result.data)) {
      return undefined;
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
      groupmodel.save()
      this.data.group.push(groupmodel)
    }
    sqliteutil.UpdateGroupMaxUpdatetime(this.data.selfuser.id, updateTime)
    this.data.selfuser.group_max_updatetime = updateTime;
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

  async tokenValid(accessToken) {
    return await this.api.tokenValid(this.data.login.access_token)
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

  async groupIncrement(updateTime, notification){
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
    }
    sqliteutil.UpdateGroupMaxUpdatetime(this.data.selfuser.id, updateTime)
    this.data.selfuser.group_max_updatetime = updateTime;
  },

  async historyMessage(groupId, sequenceId, count) { 
    let result;
    let resultvalues;
    let next = false;
    let message;
    let messagemodel;
    this.data.historymessage = []
    let totalcount = 0;

    let condition;
    if(sequenceId){
      condition = {
      group_id: groupId,
      sequence_id: "<"+sequenceId,
      $order: {
        by: 'sequence_id',
        reverse: true
      },
      $size: count
      };
    }
    else{
      condition = {
        group_id: groupId,
        $order: {
          by: 'sequence_id',
          reverse: true
        },
        $size: count
        };
    }

    let items = await (await models.Message).find(condition)
    //sort items by sequenceId
    if(items.length != 0 && items.length == count)
    {
      console.log(items)
      return items;
    }

    if(items.length != 0)
    {
      sequenceId = items[items.length - 1].sequence_id
      for(let index in items)
      {
        this.data.historymessage.push(items[index]);
      }
    }
    /*
    result = await this.api.historyMessage(this.data.login.access_token, groupId, sequenceId)
    if (!result.ok || !result.success) {
      return this.data.historymessage;
    }

    if (!("results" in result.data)) {
      return this.data.historymessage;
    }
    resultvalues = result.data.results

    for(let item in resultvalues)
    {
      message = resultvalues[item]
      messagemodel = await servicemodels.MessageModel(message)
      messagemodel.save()
      if(totalcount++ < count)
      {
        this.data.historymessage.push(messagemodel)
      }
    }
    */
    return this.data.historymessage;
  },

  async sendNewMessage(messageID, 
                        messageContentType,
                        formID,
                        groupID,
                        userID,
                        timestamp,
                        content) {
    let result = await this.api.sendNewMessage(this.data.login.access_token,
                                  messageID, 
                                  messageContentType,
                                  formID,
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
    msgmodel.save()
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
        sequenceId = result.data.obj.maxSequenceId;
        if (result.data.hasNext == true) {
          hasNext = true;
        }
        else{
          hasNext = false;
          var foundUsers = await(await models.User).find({
            id: this.data.login.user_id
          });
          if(foundUsers.length != 0){
            this.data.selfuser.msg_max_sequenceid = sequenceId;
            foundUsers[0].msg_max_sequenceid = sequenceId;
            foundUsers[0].save();
          }
        }
      }
    }
    return msg_models;
  },

  async uploadFile(filepath) {
    return await this.api.uploadFile(this.data.login.access_token, filepath);
  },

  async downloadFile(sequenceId) {
    return await this.api.downloadFile(this.data.login.access_token, sequenceId)
  },

  async downloadTumbnail(type, sequenceId) {
    return await this.api.downloadTumbnail(this.data.login.access_token, type, sequenceId)
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
  }

};

export {
  common
}
