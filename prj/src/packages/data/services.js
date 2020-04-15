import { APITransaction } from './transaction.js';
import { servicemodels } from './servicemodels.js';
import { models } from './models.js';
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

  get GetLoginModel(){
    return this.data.login;
  },

  get GetSelfUserModel(){
     return this.data.selfuser;
  },

  get GetAllDepartmentsModel()
  {
    return this.data.department;
  },

  get GetAllUserinfo(){
    return this.data.userinfo;
  },

  get GetAllUserEmail(){
    return this.data.useremail;
  },

  get GetAllUserAddress(){
    return this.data.useraddress;
  },

  get GetAllUserPhone(){
    return this.data.userphone;
  },

  get GetAllGroups(){
    return this.data.group;
  },

  get GetRecentUsers(){
    let recentusers = []
    let sortkey = "last_message_time"
    let tmpitem
    let grouptype
    for(let groupkey in this.data.group)
    {
      tmpitem = this.data.group[groupkey]
      grouptype = this.data.group[groupkey]["group_type"]
      if(!servicemodels.ItemInvalid(grouptype))
      {
        continue
      }
      if(grouptype == "102")
      {
        recentusers.push(this.data.group[groupkey])
      }
    }
    
    function cmp(a,b){
          var value1 = a[sortkey];
          var value2 = b[sortkey];
          return value2 - value1;
       }
    
    recentusers.sort(cmp)
    return recentusers;
  },

  get GetAllUserIm(){
    return this.data.userim;
  },

  get GetHistoryMessages(){
    return this.data.historymessage;
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

      console.log('Your profile has been update!');
    } else {
      selfuser.save();
      console.log('New account login ok!');
    }

    let foundlogin = await(await models.Login).find({
      account: config.username
    })

    if(foundlogin.length == 0){
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
    
    
    this.data.selfuser = selfuser;
  },

  initmqtt(){
    this.mqttclient = mqtt.connect('http://'+ this.config.hostname + ':' + 1883,
                                      {username: 'client', 
                                      password: 'yiqiliao',
                                      clientId: this.data.selfuser.id + '|1111111111111111111'});
      
    let mqttclient = this.mqttclient;
    let userid = this.data.selfuser.id;
    mqttclient.on('connect', function(){
        console.log("connect success")
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

  handlemessage(callback){
    this.mqttclient.on('message', function(topic, message){
      console.log("mqtt message")
      console.log(topic)
      callback(message.toString())
    })
    
  },

  async logout() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }
    return await this.api.logout(this.data.login.access_token)
  },

  async AllUserinfo(){
    let index = 0;
    let result;
    let useritem;
    let usermodel;
    this.data.userinfo = []
    this.data.useremail = []
    this.data.useraddress = []
    this.data.userphone = []
    this.data.userim = []
    do{
      result = await this.Userinfo(undefined, undefined, 1, index)
      if (!result.ok || !result.success) {
        return undefined;
      }

      if (!("obj" in result.data)) {
        return undefined;
      }
      for(var item in result.data.results)
      {
        index++;
        useritem = result.data.results[item]
        usermodel = servicemodels.UsersModel(useritem)
        if(usermodel == undefined)
        {
          continue;
        }
        this.data.userinfo.push(usermodel[0])
        this.data.useremail.push(usermodel[1])
        this.data.useraddress.push(usermodel[2])
        this.data.userphone.push(usermodel[3])
        this.data.userim.push(usermodel[4])
      }
    }while(result.data.total > index);
  },

  async Userinfo(filters, perPage, sortOrder, sequenceId){
    
    return await this.api.getUserinfo(this.data.login.access_token, filters, perPage, sortOrder, sequenceId);
  },

  async refreshToken() {
    if (typeof this.data.login == "undefined") {
      console.debug("Please login first");
      return undefined;
    }

    return await this.api.refreshToken(this.data.login.refresh_token)
  },

  async AllDepartmentInfo(){
    let index = 0;
    let result;
    let departmentitem;
    let departmentmodel;
    this.data.department = []
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
        departmentmodel.save()
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
    do{
      result = await this.api.listAllGroup(this.data.login.access_token, undefined)
      if (!result.ok || !result.success) {
        return undefined;
      }
  
      if (!("obj" in result.data)) {
        return undefined;
      }
      next = result.data.hasNext
      for(let item in result.data.results)
      {
        groupvalue = result.data.results[item]
        groupmodel = servicemodels.GroupsModel(groupvalue)
        if(groupmodel == undefined)
        {
          continue
        }
        this.data.group.push(groupmodel)
      }
    }while(next)
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
    return await this.api.tokenValid(this.data.login.access_token,
                                name,
                                updateTime,
                                sequenceId,
                                countperpageValue)
    
  },

  async historyMessage(groupId, sequenceId) { 
    let result;
    let resultvalues;
    let next = false;
    let message;
    let messagemodel;
    this.data.historymessage = []
    do{
      result =  await this.api.historyMessage(this.data.login.access_token, groupId, sequenceId)
      if (!result.ok || !result.success) {
        return undefined;
      }
  
      if (!("results" in result.data)) {
        return undefined;
      }
      resultvalues = result.data.results
      next = result.data.hasNext

      for(let item in resultvalues)
      {
        message = resultvalues[item]
        messagemodel = servicemodels.MessageModel(message)
        this.data.historymessage.push(messagemodel)
      }
    }while(next)    
  },

  async sendNewMessage(messageID, 
                        messageContentType,
                        formID,
                        groupID,
                        userID,
                        timestamp,
                        content) {
    return await this.api.sendNewMessage(this.data.login.access_token,
                                  messageID, 
                                  messageContentType,
                                  formID,
                                  groupID,
                                  userID,
                                  timestamp,
                                  content)
  },

  async ReveiveNewMessage(sequenceId, notificationId)
  {
    return await this.api.ReceiveNewMessage(this.data.login.access_token, sequenceId, notificationId)
  },

  async uploadFile(filepath) {
    return await this.api.uploadFile(this.data.login.access_token, filepath);
  },

  async downloadFile(sequenceId) {
    return await this.api.downloadFile(this.data.login.access_token, sequenceId)
  },

  async downloadTumbnail(type, sequenceId) {
    return await this.api.downloadTumbnail(this.data.login.access_token, type, sequenceId)
  }

};

export {
  common
}
