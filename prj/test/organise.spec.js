const Application = require('spectron').Application
const assert = require('chai').assert
const expect = require('chai').expect
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
//const CLoginUtil = require('./login')

let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//build//linux-unpacked//EachChat')
else exePath = path.join(__dirname, '..//build//mac//Eachchat.app//Contents//MacOS//Eachchat')

async function login(app, orgname, username, pwd){
  let windowCount = await this.app.client.getWindowCount();
  await this.app.client.windowByIndex(windowCount - 1);
  let orgID = '#organizationInput';
  let orgInput = await this.app.client.$(orgID);
  if(!await orgInput.isExisting()) return false;
  await orgInput.setValue(orgname);    
      
  let confirBtnClass = '.organizationConfirm';
  let corfireBtn = await this.app.client.$(confirBtnClass);        
  corfireBtn.click();
  orgInput = await this.app.client.$(orgID);
  if(!await orgInput.isExisting()) return false;
  
  let usernameInputID = "#accountInputId";
  let usernameInput = await this.app.client.$(usernameInputID);
  await usernameInput.setValue(username)

  let userpwdInputID = "#passwordInputId";
  let userpwdInput = await this.app.client.$(userpwdInputID);
  if(!await userpwdInput.isExisting()) return false;
  await usernameInput.setValue(pwd)

  let confirBtnID = "#loginButton";
  let confireBtn = await this.app.client.$(confirBtnID);
  await confireBtn.click();
  return true;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

let app;

describe('Application launch', function () {
  this.timeout(50000)
  before(function () {
    console.log("platform is:",process.platform)
    this.app = new Application({
      // Your electron path can be any binary
      // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
      // But for the sake of the example we fetch it from our node_modules.
      //path: electronPath,
        path: exePath,
      // Assuming you have the following directory structure

      //  |__ my project
      //     |__ ...
      //     |__ main.js
      //     |__ package.json
      //     |__ index.html
      //     |__ ...
      //     |__ test
      //        |__ spec.js  <- You are here! ~ Well you should be.

      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '..')]
    })
    app = this.app;
    return this.app.start()
  })

  after(function () {
    if (app && app.isRunning()) {
      //return app.stop()
    }
  })
  
  it('login window testcase', async function () {
    let windowCount = await this.app.client.getWindowCount();
    await this.app.client.windowByIndex(windowCount - 1);
    let orgID = '#organizationInput';
    let orgInput = await this.app.client.$(orgID);
    if(!await orgInput.isExisting()) return false;
    await orgInput.setValue("HTTP测试租户");    
        
    let confirBtnClass = '.organizationConfirm';
    let corfireBtn = await this.app.client.$(confirBtnClass);        
    corfireBtn.click();
    orgInput = await this.app.client.$(orgID);
    if(!await orgInput.isExisting()) return false;
    
    let usernameInputID = "#accountInputId";
    let usernameInput = await this.app.client.$(usernameInputID);
    await usernameInput.setValue("chengfang.ai")

    let userpwdInputID = "#passwordInputId";
    let userpwdInput = await this.app.client.$(userpwdInputID);
    if(!await userpwdInput.isExisting()) return false;
    await userpwdInput.setValue("Dev1234!@#$QWER")

    let confirBtnID = "#loginButton";
    let confireBtn = await this.app.client.$(confirBtnID);
    await confireBtn.click();
  });

  it("is in MainWindow", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);
    assert.isTrue(await userHead.isExisting());
  })

  it("to orgnization", async function(){
    let elMenuItemsClass = ".nav-menu";
    let menuitem = await this.app.client.$(elMenuItemsClass);
    
    let els = await menuitem.$$('li');
    let orgitem = els[1];

    await sleep(20000);
    orgitem.click();
  })

  it("search department", async function(){
    let searchInputClass = ".echat-search-input";
    let searchInputItem = await app.client.$(searchInputClass);
    searchInputItem.setValue("爱工作");
  
    let searchViewElm = await app.client.$(".search-view");
    let departmentItem = await searchViewElm.$(".department-info");
    assert.isTrue(await departmentItem.isExisting());
    let text = await departmentItem.getText();
    let newStr = text.replace(/[\r\n]/g,"");
    expect(newStr).to.equal("北京爱工作科技有限公司");
    departmentItem.click();
  })

  it("click department", async function(){
    let list = await app.client.$(".departments-view");
    assert.isTrue(await list.isExisting());
    let viewElm1 = await list.$("p=北京爱工作科技有限公司");
    expect(await viewElm1.isDisplayed()).to.equal(true);
    let viewElm2 = await list.$("p=北京青云科技股份有限公司");
    expect(await viewElm2.isDisplayed()).to.equal(true);
  })


  it("search organiseUser", async function(){
    let searchInputClass = ".echat-search-input";
    let searchInputItem = await app.client.$(searchInputClass);
    searchInputItem.setValue("王鑫");
  
    let searchViewElm = await app.client.$(".search-view");
    let nameItem = await searchViewElm.$(".contact-list-name");
    assert.isTrue(await nameItem.isExisting());
    let text = await nameItem.getText();
    let newStr = text.replace(/[\r\n]/g,"");
    expect(newStr).to.equal("王鑫");

    let titleItem = await searchViewElm.$(".contact-list-titile");
    assert.isTrue(await titleItem.isExisting());
    text = await titleItem.getText();
    newStr = text.replace(/[\r\n]/g,"");
    expect(newStr).to.equal("高级软件工程师");
    titleItem.click();
  })

  it("click organiseUser", async function(){
    let searchViewElm = await app.client.$(".userInfo-name");
    expect(await searchViewElm.isExisting()).to.true;
    let clickElm = await app.client.$("div=成员");
    await clickElm.click();
  })

  it("search contact", async function(){
    let searchInputClass = ".echat-search-input";
    let searchInputItem = await app.client.$(searchInputClass);
    searchInputItem.setValue("程旺workly.ai");
    await sleep(1000);
    let searchViewElm = await app.client.$(".search-view");
    let nameItem = await searchViewElm.$(".contact-list-name");
    assert.isTrue(await nameItem.isExisting());
    let text = await nameItem.getText();
    let newStr = text.replace(/[\r\n]/g,"");
    expect(newStr).to.equal("程旺workly.ai");
    await nameItem.click();
  })

  it("click contact", async function(){
    let searchViewElm = await app.client.$(".userInfo-name");
    expect(await searchViewElm.isExisting()).to.true;
    await sleep(1000);
    let clickElm = await app.client.$("div=成员");
    await clickElm.click();
    await sleep(1000);
  })

})
