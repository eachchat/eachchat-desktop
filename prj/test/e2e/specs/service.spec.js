import utils from '../utils'
import {services} from "../../../src/packages/data/index.js"
import { Group, Message, Collection, UserInfo } from '../../../src/packages/data/sqliteutil.js'
import {generalGuid} from "../../../src/packages/core/Utils.js"


describe('ServiceTest', function () {
  let resCreateGroup;
  let selfUser;
  let resSendMessage;
  let sendNewMessageResponse;

  it("LoginTestCase", async function(){
    this.timeout(50000);
    
    let config = {
      username: "chengfang.ai@yunify.com",
      password: "12345678"
    };
    
    await services.common.gmsConfiguration("dev.eachchat.net");
    await services.common.init();
    let loginResult = await services.common.login(config);
    expect(loginResult).to.equal(true);
    this.selfUser = await services.common.GetSelfUserModel();
  })

  it("AllUserinfoTestCase", async function (){
    return;
    this.timeout(300000);
    let result = await services.common.AllUserinfo();
    console.log(result)
    expect(result).to.equal(true);
  })

  it("AllDepartmentInfoTestCase", async function(){
    return;
    this.timeout(30000);
    let result = await services.common.AllDepartmentInfo();
    expect(result).to.equal(true);
  })

  it("listAllGroupTestCase", async function(){
    return;
    this.timeout(500000);
    let result = await services.common.listAllGroup();
    expect(result).to.equal(true);
  })

  it("ListMessageCollectionTestCase", async function(){
    return;
    let netRes = await services.common.ListMessageCollections();
    let dbRes = await Collection.FindCollectionByType(101);
    expect(netRes.length).to.equal(dbRes.length);
  })

  it("ListPictrueCollectionTestCase", async function(){
    return;
    let netRes = await services.common.ListPictureCollections();
    let dbRes = await Collection.FindCollectionByType(102);
    expect(netRes.length).to.equal(dbRes.length);
  })

  it("ListFileCollectionsTestCase", async function(){
    return;
    let netRes = await services.common.ListFileCollections();
    let dbRes = await Collection.FindCollectionByType(103);
    expect(netRes.length).to.equal(dbRes.length);
  })

  it("ListGroupCollectionsTestCase", async function(){
    return;
    let netRes = await services.common.ListGroupCollections();
    let dbRes = await Collection.FindCollectionByType(104);
    expect(netRes.length).to.equal(dbRes.length);
  })

  it("ListTopicCollectionsTestCase", async function(){
    return;
    let netRes = await services.common.ListTopicCollections();
    let dbRes = await Collection.FindCollectionByType(106);
    expect(netRes.length).to.equal(dbRes.length);
  })

  it("updateUserWorkDescriptionTestCase", async function(){
    return;
    let workDescription = generalGuid();
    let result = await services.common.updateUserWorkDescription(workDescription);
    expect(result.ok).to.equal(true);
    
    let userInfo = await UserInfo.GetUserInfo(this.selfUser.id);
    expect(userInfo.user_id).to.equal(this.selfUser.id);
    expect(userInfo.work_description).to.equal(workDescription);
  })

  it("updateUserStatusDescriptionTestCase", async function(){
    return;
    let statusDescription = generalGuid();
    let result = await services.common.updateUserStatusDescription(statusDescription);
    expect(result.ok).to.equal(true);
    
    let userInfo = await UserInfo.GetUserInfo(this.selfUser.id);
    expect(userInfo.user_id).to.equal(this.selfUser.id);
    expect(userInfo.status_description).to.equal(statusDescription);
  })

  it("CreateGroupTestCase", async function(){
    //this.resCreateGroup.group_id = "5ec4fda7cc101002783bcb77";
    this.resCreateGroup = await services.common.CreateGroup("test group", ["eb69c200e11801906322203ad59ff885", "8a93c2debb75bc4204f03c88c9dc11b1", "381c86d8e2aca3e992224d5b3061c442", "e3b18ba88b23296d6bb28fb23baab034", "516fec24899afddbe0b9f51378da6372",
    "509c86d45a7e6a1afe7e931425cf428f"]);
    expect(this.resCreateGroup).to.not.equal(undefined);
    console.log(this.resCreateGroup)
  })

  it("AddGroupUserTestCase", async function(){
    //let res = await services.common.AddGroupUsers('5f06c25bcc10105b06aff96b', ["157668e1fc2c0a054af0244116a09e36"]);
    let res = await services.common.AddGroupUsers(this.resCreateGroup.group_id, ["157668e1fc2c0a054af0244116a09e36"]);

    
    expect(res).to.equal(true);
  })

  it("DeleteGroupUserTestCase", async function(){
    //let res = await services.common.DeleteGroupUsers("5f06c25bcc10105b06aff96b",["157668e1fc2c0a054af0244116a09e36"]);
    let res = await services.common.DeleteGroupUsers(this.resCreateGroup.group_id,["157668e1fc2c0a054af0244116a09e36"]);
    expect(res).to.equal(true);
  })

  it("DeleteGrupTestCase", async function(){
    let res = await services.common.DeleteGroup(this.resCreateGroup.group_id);
    expect(res).to.equal(true);
  })

  it("sendNewMessageTestCase", async function(){
    return;
    let msgID = generalGuid();
    let curTimeSeconds = new Date().getTime();
    let response = await services.common.sendNewMessage(msgID, 101, "25d4cb78d54840dfa70df0dfa847c024", "5e815b92cc101019c46c2eea", "eb69c200e11801906322203ad59ff885", curTimeSeconds, {text:"test message"});
    expect(response).to.not.equal(undefined);
    this.sendNewMessageResponse = response;
    let sequenceID = response.sequence_id;
    let ret = await Message.ExistMessageBySequenceID(sequenceID);
    expect(ret).to.equal(true);
  })

  it("UploadFileTestCase", async function(){
    return;
    let filepath = __dirname + "\\..\\..\\uploadfile\\1.txt";
    let result = await services.common.uploadFile(filepath);
    console.log(result);
  })

  //sendfile
  //sendphoto
  //deletemessage

  //collectionmessage
  it("CollectMessageTestCase", async function(){
    return;
    let array = [];
    array.push(this.sendNewMessageResponse.time_line_id);
    let result = await services.common.CollectMessage(array);
    expect(result).to.equal(true);
  })

  it("CollectGroupTestCase", async function(){
    return;
      let result = await services.common.CollectGroup("5e9ea897cc10101597c8959f", this.selfUser.id);
      expect(result).to.equal(true);
  })
  //collectoinfile
  //collectionphoto

  it("SearchUserTestCase", async function(){
    return;
    this.timeout(30000);
    let result = await services.common.SearchUser("测试员");
    expect(result).to.not.equal(false);
  })

  it("SearchFilesTestCase", async function(){
    return;
    this.timeout(30000);
    let result = await services.common.SearchFiles("pdf", 0, 10, undefined, ["5eb8067ecc101030003a41a4", "5eba49dccc10107d8ba6c3aa", "5ee7607bcc1010262607a20f", "5e06f4ad0a50417215194beb","5e1156960a50411e50d0cf4b"], 0)
    //console.log(result)
    expect(result).to.not.equal(false);

    //expect(result).to.not.equal(false);
  })
  
  it("GetRecentDeviceTestCase", async function(){
//response = await services.common.GetRecentDevice();

  })


})

// = await services.common.UpdateUserAvatar("C:\\Users\\chengfang\\Desktop\\laofuzi.png");
//response = await services.common.UpdateGroupAvatar("5ec4fda7cc101002783bcb77", "C:\\Users\\chengfang\\Desktop\\laofuzi.png");


//response = await services.common.SearchAll("测试");


//response = await Department.SearchByNameKey("公")
//response = await UserInfo.SearchByNameKey("测试")
//response = await Group.SearchByNameKey("程方")
//response = await services.common.SearchCollection(101, "1")
//response = await services.common.GetRecentDevice();
//response = await services.common.GetNewVersion();

//for(let index in response){
//console.log(response[index].sequenceValue)
//}
//await services.common.ListGroupFiles("5eec82a1cc10105e30d318a5", "0");
//response = await services.common.historyMessage("5e815b92cc101019c46c2eea", "449677749993881600", 20);
//for(let index in response){
//    console.log(response[index].sequence_id)
//}
//response = await services.common.ListAllMessage("5eec82a1cc10105e30d318a5","471405801505308672")
//await services.common.SearchGroupFiles("5eec82a1cc10105e30d318a5", "0", "检测");
//response = await services.common.ListAllMessage("5eec82a1cc10105e30d318a5", "471464492426346496");
//response = await services.common.SearchGroupMessage("5e815b92cc101019c46c2eea", "1", 20)
//console.log(response)

//response = await services.common.SearchMessage("1", 20)

