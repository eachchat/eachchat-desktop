const assert = require('chai').assert
const expect = require('chai').expect
const homepage = require('./homepage')

describe('personal center test', function () {
  this.timeout(50000)
  before(function () {
    console.log("platform is:",process.platform)
    this.app = homepage.app;
  })

  afterEach(async function(){
    await sleep(1000);
  })
  it("is in MainWindow", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);
    assert.isTrue(await userHead.isExisting());
  })

  it("get main window user img", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);
    let mainImgSrc = await userHead.getProperty("src");    
    await userHead.click();
    let userIconElement = await this.app.client.$('.personalCenter-icon');
    let personalImgSrc = await userIconElement.getProperty("src");
    expect(mainImgSrc).equal(personalImgSrc)
  })

  it("get user name", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);   
    await userHead.click();
    let usernameElement = await this.app.client.$('#personalCenter-name-id');
    let userName = await usernameElement.getValue();
    expect(userName).equal("eachchatdesktop")
  })

  it("get user organise name", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);   
    await userHead.click();
    let userOrgElement = await this.app.client.$('#personalCenter-userId-id');
    let orgName = await userOrgElement.getText();
    expect(orgName).equal("北京爱工作科技有限公司")
  })
})
