import * as services from "../../../src/packages/data/services.js"
const expect = require('chai').expect



describe('ServiceTest', function () {
  it("gmsConfiguration testcase", async function(){
    let ret = await services.common.newGmsConfiguration("亿洽staging", "https://gms.each.chat");
    assert.isNotNaN(ret);
    assert.isNotFalse(ret);

    ret = await services.common.newGmsConfiguration("亿洽staging1", "https://gms.each.chat");
    assert.isNotNaN(ret);
    assert.isFalse(ret);
  })
  it("login testcase", async function(){
    let config = {
      hostname: "staging.eachchat.net",
      apiPort: 443,
      hostTls: 1,
      mx_user_id: "@eachchatdesktop:staging.eachchat.net",
      mx_access_token: "MDAyMmxvY2F0aW9uIHN0YWdpbmcuZWFjaGNoYXQubmV0CjAwMTNpZGVudGlmaWVyIGtleQowMDEwY2lkIGdlbiA9IDEKMDAzOGNpZCB1c2VyX2lkID0gQGVhY2hjaGF0ZGVza3RvcDpzdGFnaW5nLmVhY2hjaGF0Lm5ldAowMDE2Y2lkIHR5cGUgPSBhY2Nlc3MKMDAyMWNpZCBub25jZSA9IE1CT1FIWjRTQFhAMkROVEIKMDAyZnNpZ25hdHVyZSAsw4C-gc0PLlMP36wASb8QAkIcanFG9TnJF5kS50OL_go" 
    }
 
    await services.common.loginWithoutLocalstorage(config);
  })
  it("add contact testcase", async function(){
    let contactInfo = {
      matrix_id: "12345",
      display_name: "apitestname",
      email: "123@123.123",
      mobile: "1234455",
      telephone: "1234",
      company: "123",
      title: "1234"
    };
    let ret = await services.common.AddContact(contactInfo);
    expect(ret).to.equal(true);
  })

  it("delete contact TestCase", async function(){
    let ret = await services.common.DeleteContact("12345");
    expect(ret).to.equal(true);
  })

  it("favourite message TestCase", async function(){
    let ret = await services.common.CollectMessage("favouritemessageEventId", "favurite message");
    expect(ret).to.equal(true);
  })  

  it("delete favourite message TestCase", async function(){
    let ret = await services.common.DeleteCollectionMessage("favouritemessageEventId");
    expect(ret).to.equal(true);
  })
})
