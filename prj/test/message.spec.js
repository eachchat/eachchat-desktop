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
  this.timeout(30000)
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

  it("select chat", async function(){
    let self = this;
    async function loadingFinishCheck() {
      return new Promise(async (resolve, reject)=>{
        // let chatWindow = await self.app.client.$('.chat-wind');
        // console.log("===== chatwindow attribute is ", await chatWindow);
        // resolve();
        // function checking() {

        // }
        setTimeout(() => {
          resolve();
        }, 10000);
      })
    }

    async function selectUser (item) {
      return new Promise(async (resolve, reject)=>{
        console.log('-------select move-----', item)
          setTimeout(() => {
            item.click()
            resolve(item);
          }, 1000);
      })
    }
    async function selectCheck (item) {
      return new Promise(async (resolve, reject)=>{
          setTimeout(async () => {
            let bgColor = await item.getCSSProperty('background-color');
            if(bgColor.parsed.hex == '#dddddd'){
              resolve(true);
            }
            else {
              reject(false);
            }
            console.log('-------select bgColor-----', bgColor.parsed.hex);
          }, 1000);
      })
    }
    
    await loadingFinishCheck();
    let group = await self.app.client.$('.group-list');
    let gitems = await group.$$('li');
    let gitem0 = gitems[0];
    let chatSelect = await selectUser(gitem0);
    let checkRet = await selectCheck(chatSelect);
    assert.equal(checkRet, true)
  });

  it('send message', async function(){
    let self = this;

    async function sendMsg () {
      return new Promise(async (resolve, reject)=>{
        setTimeout(async () => {
          let sendBtnElement = await self.app.client.$('.chat-send');
          sendBtnElement.click();
          console.log("=====clickbtn ");
          resolve();
        }, 2000)
      })
    }
    async function setText () {
      return new Promise(async (resolve, reject)=>{
        setTimeout(async () => {
          let inputElement = await self.app.client.$('.ql-editor');
          inputElement.setValue("1234556");
          resolve();
        }, 2000)
      })
    }
    await setText();
    await sendMsg();
  })

  it("favourite chat", async function(done){
    let self = this;
    let group = await self.app.client.$('.group-list');
    let gitems = await group.$$('li');
    let gitem0 = gitems[0];
    gitem0.click({button: 'right'})
    
    const electron = self.app.electron;
    // console.log("======= electron is ", electron);
    const remote = electron.remote;
    // console.log("======= electron is ", electron);
    const menu = await remote.Menu;
    const menuItem = await menu.getApplicationMenu();
    // let menuItem = menu.getItemByNames('置顶聊天')
    console.log("======= menuItem is ", menuItem);
  });

})