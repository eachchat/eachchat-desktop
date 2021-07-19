const Application = require('spectron').Application
const assert = require('chai').assert
const expect = require('chai').expect
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
//const CLoginUtil = require('./login')

let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//..//build//linux-unpacked//EachChat')
else exePath = path.join(__dirname, '..//..//build//mac//Eachchat.app//Contents//MacOS//Eachchat')

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
    return this.app.start()
  })

  after(function () {
    if (this.app && this.app.isRunning()) {
      //return this.app.stop()
    }
  })

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 3)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

  
  it('login window testcase', async function () {
    let windowCount = await this.app.client.getWindowCount();
    await this.app.client.windowByIndex(windowCount - 1);
    let orgID = '#organizationInput';
    let orgInput = await this.app.client.$(orgID);
    if(!await orgInput.isExisting()) return false;
    await orgInput.setValue("亿洽staging");    
        
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
    console.log(await menuitem.getAttribute('class'))
    
    let els = await menuitem.$$('li');
    let orgitem = els[1];
    setTimeout(() => {
      orgitem.click()
    }, 5000);
  })

  it("to favourite", async function(){
    let elMenuItemsClass = ".nav-menu";
    let menuitem = await this.app.client.$(elMenuItemsClass);
    console.log(await menuitem.getAttribute('class'))
    
    let els = await menuitem.$$('li');
    let orgitem = els[2];
    setTimeout(() => {
      orgitem.click()
    }, 5000);
  })
})