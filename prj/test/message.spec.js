const Application = require('spectron').Application
const assert = require('chai').assert
const expect = require('chai').expect
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const dotenv = require('dotenv');
const { ecPwd, ecAccount, ecOrg } = dotenv.config().parsed;
console.log('pb==>', ecAccount, ecOrg)
//const CLoginUtil = require('./login')

let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//build//linux-unpacked//EachChat')
else exePath = path.join(__dirname, '..//build//mac//Eachchat.app//Contents//MacOS//Eachchat')


describe('Application launch', function () {
  this.timeout(50000)
  before(function () {
    console.log("platform is:",process.platform)
    this.app = new Application({
        path: exePath,
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  })

  after(function () {
    if (this.app && this.app.isRunning()) {
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
    await orgInput.setValue(ecOrg);    
        
    let confirBtnClass = '.organizationConfirm';
    let corfireBtn = await this.app.client.$(confirBtnClass);        
    corfireBtn.click();
    orgInput = await this.app.client.$(orgID);
    if(!await orgInput.isExisting()) return false;
    
    let usernameInputID = "#accountInputId";
    let usernameInput = await this.app.client.$(usernameInputID);
    await usernameInput.setValue(ecAccount)

    let userpwdInputID = "#passwordInputId";
    let userpwdInput = await this.app.client.$(userpwdInputID);
    if(!await userpwdInput.isExisting()) return false;
    await userpwdInput.setValue(ecPwd)

    let confirBtnID = "#loginButton";
    let confireBtn = await this.app.client.$(confirBtnID);
    await confireBtn.click();
  });

  it("send massage", async function(done){
    async function selectUser () {
      return new Promise(async (resolve, reject)=>{
        setTimeout(async () => {
          let group = await this.app.client.$('.group-name');  
          console.log('gggg==>', group)
          let gitem = group[1];
          console.log('gggg==>',gitem)
          setTimeout(() => {
            gitem.click()
            resolve('ok')
          }, 5000);
        }, 15000)
      })
    }
    await selectUser()
  })

  // it("to orgnization", async function(){
  //   let elMenuItemsClass = ".nav-menu";
  //   let menuitem = await this.app.client.$(elMenuItemsClass);
  //   console.log(await menuitem.getAttribute('class'))
    
  //   let els = await menuitem.$$('li');
  //   let orgitem = els[1];
  //   setTimeout(() => {
  //     orgitem.click()
  //   }, 5000);
  // })

  // it("to favourite", async function(){
  //   let elMenuItemsClass = ".nav-menu";
  //   let menuitem = await this.app.client.$(elMenuItemsClass);
  //   console.log(await menuitem.getAttribute('class'))
    
  //   let els = await menuitem.$$('li');
  //   let orgitem = els[2];
  //   setTimeout(() => {
  //     orgitem.click()
  //   }, 5000);
  // })
})