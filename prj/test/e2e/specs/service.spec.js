import utils from '../utils'
import {services} from "../../../src/packages/data/index.js"
import { Group, Message, Collection, UserInfo } from '../../../src/packages/data/sqliteutil.js'
import {generalGuid} from "../../../src/packages/core/Utils.js"


describe('ServiceTest', function () {
  let resCreateGroup;
  let selfUser;
  it("LoginTestCase", async function(){
    this.timeout(50000);
    let config = {
      hostname: "139.198.15.253",
      apiPort: 8888,
      username: "chengfang.ai@yunify.com",
      password: "12345678"
    };
    services.common.init(config);
    console.log("begin login");
    let loginResult = await services.common.login();
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
    return;
    //this.resCreateGroup.group_id = "5ec4fda7cc101002783bcb77";
    this.resCreateGroup = await services.common.CreateGroup("test group", ["eb69c200e11801906322203ad59ff885", "8a93c2debb75bc4204f03c88c9dc11b1", "381c86d8e2aca3e992224d5b3061c442", "e3b18ba88b23296d6bb28fb23baab034", "516fec24899afddbe0b9f51378da6372",
    "509c86d45a7e6a1afe7e931425cf428f"]);
    expect(this.resCreateGroup).to.not.equal(undefined);
    console.log(this.resCreateGroup)
  })

  it("AddGroupUserTestCase", async function(){
    let res = await services.common.AddGroupUsers('5f06c25bcc10105b06aff96b', ["157668e1fc2c0a054af0244116a09e36"]);
    expect(res).to.equal(true);
  })

  it("DeleteGroupUserTestCase", async function(){
    let res = await services.common.DeleteGroupUsers('5f06c25bcc10105b06aff96b',["157668e1fc2c0a054af0244116a09e36"]);
    expect(res).to.equal(true);
  })

  it("DeleteGrupTestCase", async function(){
    //let res = await services.common.DeleteGroup(this.resCreateGroup.group_id);
    //expect(res).to.equal(true);
  })

  it("sendNewMessageTestCase", async function(){
    let msgID = generalGuid();
    let curTimeSeconds = new Date().getTime();
    await services.common.sendNewMessage(msgID, 101, "25d4cb78d54840dfa70df0dfa847c024", "5e815b92cc101019c46c2eea", "eb69c200e11801906322203ad59ff885", curTimeSeconds, {text:"test message"});
    
    //await services.common.sendNewMessage(msgID, 101, this.selfUser.id, undefined, "eb69c200e11801906322203ad59ff885", undefined, "test message");
  })

  //sendmessage
  //receivemessage
  //sendfile
  //sendphoto
  //deletemessage

  //collectionmessage
  //collectiongroup
  it("CollectGroupTestCase", async function(){
      let result = await services.common.CollectGroup("5e9ea897cc10101597c8959f", this.selfUser.id);
      console.log(result);
  })
  //collectoinfile
  //collectionphoto

  it("SearchUserTestCase", async function(){
    this.timeout(30000);
    let result = await services.common.SearchUser("测试员");
    expect(result).to.not.equal(false);
  })

  it("SearchFilesTestCase", async function(){
    this.timeout(30000);
    let result = await services.common.SearchFiles("pdf", 0, 10, undefined, ["5eb8067ecc101030003a41a4", "5eba49dccc10107d8ba6c3aa", "5ee7607bcc1010262607a20f", "5e06f4ad0a50417215194beb","5e1156960a50411e50d0cf4b"], 0)
    console.log(result)
    expect(result).to.not.equal(false);

    //expect(result).to.not.equal(false);
  })
})
