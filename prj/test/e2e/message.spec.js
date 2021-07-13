const Application = require('spectron').Application;
const assert = require('chai').assert;
const expect = require('chai').expect;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');
const dotenv = require('dotenv');
// const { ecPwd, ecAccount, ecOrg } = dotenv.config().parsed;
// console.log('pb==>', ecAccount, ecOrg)
//const CLoginUtil = require('./login')

let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//..//build//linux-unpacked//EachChat');
else exePath = path.join(__dirname, '..//..//build//mac//Eachchat.app//Contents//MacOS//Eachchat');


async function selectChat (item) {
  return new Promise(async (resolve, reject)=>{
      setTimeout(() => {
        item.click();
        resolve(item);
      }, 1000);
  });
}

async function waitingCheck(checkTimeout, checkFunc, checkName, ...args) {
  return new Promise(async (resolve, reject)=>{
    let loadFailed = false;
    let checkInterval = setInterval(async () => {
      let checkTerm = await checkFunc(args);
      console.log(checkName, " is ", checkTerm);
      if(checkTerm) {
        console.log(checkName, " suc.");
        clearInterval(checkInterval);
        resolve(true);
      }
      else {
        console.log(checkName, " failed.");
        if(loadFailed) {
          clearInterval(checkInterval);
          reject(false);
        }
      }
    }, 500);
    
    setTimeout(() => {
      loadFailed = true;
    }, checkTimeout);
  });
}

describe('Application launch', function () {
  this.timeout(30000);
  before(function () {
    console.log("platform is:",process.platform)
    this.app = new Application({
        path: exePath,
      args: [path.join(__dirname, '..')]
    });
    return this.app.start();
  });

  after(function () {
    if (this.app && this.app.isRunning()) {
    }
  });

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 3)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    });
  });

  
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
    await usernameInput.setValue("wangxin")

    let userpwdInputID = "#passwordInputId";
    let userpwdInput = await this.app.client.$(userpwdInputID);
    if(!await userpwdInput.isExisting()) return false;
    await userpwdInput.setValue("123qwe")

    let confirBtnID = "#loginButton";
    let confireBtn = await this.app.client.$(confirBtnID);
    await confireBtn.click();
  });

  it("loading main page and show chat info", async function() {
    let self = this;
    async function loadingFinishCheck() {
      return new Promise(async (resolve, reject)=>{
        let chatWindow = await self.app.client.$('.loadingDiv');
        let checkFunc = async function(arg) {
          let checkDom = arg[0];
          let styleDisplay = await checkDom.getCSSProperty('display');
          if(styleDisplay.value == "none") {
            return true;
          }
          else {
            return false;
          }
        };
        let checkResult = await waitingCheck(10000, checkFunc, "main page loading check ", chatWindow);
        if(checkResult) resolve(true);
        else reject(false);
      });
    }

    let loadSuc = await loadingFinishCheck();
    
    try{
      let testFlagEl = await self.app.client.$('.chat-send');
      this.app.client.execute((distDom) => {
        distDom.style.display = "block";
      }, testFlagEl);
    }
    catch(e) {
      console.log("========e ", e);
    }
    assert.equal(loadSuc, true);
  });

  it("select chat", async function(){
    let self = this;
    async function selectCheck (item) {
      return new Promise(async (resolve, reject)=>{
          setTimeout(async () => {
            // need to check if there is message show in chat page.
            let msgListEl = await self.app.client.$('.msg-list');
            let msgLists = await msgListEl.$$('li');
            let checkFunc = function(arg) {
              let checkDom = arg[0];
              if(checkDom.length > 1) return true;
              else return false;
            }
            let checkResult = await waitingCheck(30000, checkFunc, "select chat ", msgLists);
            if(checkResult) resolve(true);
            else reject(false);
          }, 2000);
      });
    }
    
    let groups = await self.app.client.$$('.group-list');
    // console.log("group is ", group);
    let normalGroups = groups[1];
    let gitems = await normalGroups.$$('li');
    let gitem0 = gitems[0];
    let chatSelect = await selectChat(gitem0);
    let checkRet = await selectCheck(gitem0);
    assert.equal(checkRet, true)
  });

  // it('send message', async function(){
  //   let self = this;

  //   async function sendMsg () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let sendBtnElement = await self.app.client.$('.chat-send');
  //         sendBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function setText () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let inputElement = await self.app.client.$('.ql-editor');
  //         inputElement.setValue("1234556");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   await setText();
  //   await sendMsg();
  // })

  // it('send url message', async function(){
  //   let self = this;

  //   async function sendMsg () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let sendBtnElement = await self.app.client.$('.chat-send');
  //         sendBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function setText () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let inputElement = await self.app.client.$('.ql-editor');
  //         inputElement.setValue("workly.ai");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function checkMessage () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let messagePanel = await self.app.client.$('.msg-list');
  //         let messageList = await messagePanel.$$('li');
  //         let latestMessage = messageList[messageList.length - 1];
  //         let checkMessage = messageList[messageList.length - 2];
  //         let testDecoration = await latestMessage.getCSSProperty('text-decoration');
  //         let checktestDecoration = await checkMessage.getCSSProperty('text-decoration');
  //         // if(testDecoration.parsed.hex == '#dddddd'){
  //         //   resolve(true);
  //         // }
  //         // else {
  //         //   reject(false);
  //         // }
  //         console.log("===================== ", checktestDecoration);
  //         console.log('-------select bgColor-----', testDecoration);
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   async function clickMessage () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let messagePanel = await self.app.client.$('.msg-list');
  //         let messageList = await messagePanel.$$('li');
  //         let latestMessage = messageList[messageList.length - 1];
  //         latestMessage.click();
  //         // if(testDecoration.parsed.hex == '#dddddd'){
  //         //   resolve(true);
  //         // }
  //         // else {
  //         //   reject(false);
  //         // }
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   await setText();
  //   await sendMsg();
  //   await checkMessage();
  //   await clickMessage();
  // })

  // it('send emiji', async function(){
  //   let self = this;

  //   async function sendMsg () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let sendBtnElement = await self.app.client.$('.chat-send');
  //         sendBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function showEmoji () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let emojiElement = await self.app.client.$('.chat-input-expression');
  //         emojiElement.click();
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   await showEmoji();
  //   let emojiPanel = await self.app.client.$('.faces');
  //   let emojiList = await emojiPanel.$$('li');
  //   let emojiSelect = emojiList[0];
  //   emojiSelect.click();
  //   await sendMsg();
  // })

  // it('show history message', async function(){
  //   let self = this;

  //   async function clickMsgMenu () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let msgMenuBtnElement = await self.app.client.$('.chat-input-history');
  //         msgMenuBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function clickHistoryMenu () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyElement = await self.app.client.$('.history-msg');
  //         historyElement.click();
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function checkPageShow () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.mxHistoryPage');
  //         assert(await historyPanel.isDisplayed())
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   async function checkPageContent () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.MxHistoryMsg-list');
  //         let historyList = await historyPanel.$$('li');
  //         if(historyList.length != 0) {
  //           for(let i = 0; i < historyList.length; i++) {
  //             // let isOk = true;
  //             // let txtItem = await historyList[i].$('.MxmessageInfoDetailLabel');
  //             // if(await txtItem.isDisplayed()) {
  //             //   let content = await txtItem.getText();
  //             // }
  //             assert(await historyList[i].getText().length != 0)
  //           }
  //           resolve();
  //         } else {
  //           reject();
  //         }
  //       }, 1000)
  //     })
  //   }
  //   async function SearchPageContent () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyInputElement = await self.app.client.$('.MxHistoryMsgDlgSearchInput');
  //         await historyInputElement.setValue('work');
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   async function checkSearchPageContent () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.MxHistoryMsg-list');
  //         let historyList = await historyPanel.$$('li');
  //         if(historyList.length != 0) {
  //           for(let i = 0; i < historyList.length; i++) {
  //             let showText = await historyList[i].getText();
  //           }
  //           resolve();
  //         } else {
  //           reject();
  //         }
  //       }, 1000)
  //     })
  //   }
  //   async function closeHistory () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.MxTitleGoBackImg');
  //         historyPanel.click();
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   async function checkPageClose () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.mxHistoryPage');
  //         assert(!(await historyPanel.isDisplayed()))
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   await clickMsgMenu();
  //   await clickHistoryMenu();
  //   await checkPageShow();
  //   await checkPageContent();
  //   await SearchPageContent();
  //   await checkSearchPageContent();
  //   await closeHistory();
  //   await checkPageClose();
  // })

  // it('show file message', async function(){
  //   let self = this;

  //   async function clickMsgMenu () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let msgMenuBtnElement = await self.app.client.$('.chat-input-history');
  //         msgMenuBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function clickHistoryMenu () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyElement = await self.app.client.$('.history-file');
  //         historyElement.click();
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   async function checkPageShow () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.mxFilePage');
  //         assert(await historyPanel.isDisplayed())
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   async function closeHistory () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.MxTitleGoBackImg');
  //         historyPanel.click();
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   async function checkPageClose () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let historyPanel = await self.app.client.$('.mxFilePage');
  //         assert(!(await historyPanel.isDisplayed()))
  //         resolve();
  //       }, 1000)
  //     })
  //   }
  //   await clickMsgMenu();
  //   await clickHistoryMenu();
  //   await checkPageShow();
  //   await closeHistory();
  //   await checkPageClose();
  // })

  // it('send file', async function(){
  //   let self = this;

  //   async function sendMsg () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let sendBtnElement = await self.app.client.$('.chat-send');
  //         sendBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000)
  //     })
  //   }

  //   async function selectFile() {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         console.log("--------")
  //         self.app.electron.remote.ipcMain.on("open-directory-dialog", (e, arg) => {
  //           console.log("==============arg is ", arg);
  //         });
  //         let files = {
  //           filePaths: "C:/Users/wangx/Desktop/eachchat 2.0.3.pptx"
  //         }
  //         // console.log("=======webcontents ", webcontents);
  //         // console.log("======toggleDevTools: ",await webcontents.toggleDevTools())
  //         // webcontents.send('selectedItem', files);
  //         // // webcontents.sendToAll('selectedItem', files)
  //         // // webcontents.sendToFrame('selectedItem', files);
  //         // console.log("select send file send testingping");
  //         // self.app.electron.remote.ipcMain.on("ping", (e) => {
  //         //   console.log("=========ipc")
  //         // })
  //         resolve();
  //       }, 2000)
  //     })
  //   }

  //   async function setText () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let fileElement = await self.app.client.$('.chat-input-file');
  //         fileElement.click();
  //         resolve();
  //       }, 2000)
  //     })
  //   }
  //   //await setText();
  //   await selectFile();
  //   await sendMsg();
  // })

  it("favourite chat", async function(){
    let self = this;
    let groups = await self.app.client.$$('.group-list');
    let checkText = "置顶聊天";
    // console.log("group is ", group);
    let normalGroups = groups[1];
    let favoureteGroups = groups[0];
    let normalGroupLists = await normalGroups.$$('li');
    let normalGroup = normalGroupLists[0];
    normalGroup.click({button: 'right'})

    let menuEl = await self.app.client.$('.contextMenu');

    let contextShowCheckFunc = async function(arg) {
      let checkDom = arg[0];
      let styleDisplay = await checkDom.getCSSProperty('display');
      console.log("contextShowcheckFunc styleDisplay ", styleDisplay);
      if(styleDisplay.value == "block") {
        return true;
      }
      else {
        return false;
      }
    };
    let contextShowCheckResult = await waitingCheck(30000, contextShowCheckFunc, "menu show ", menuEl);
    assert.equal(contextShowCheckResult, true)

    let menuList = await self.app.client.$('.menuList');
    let menus = await menuList.$$('li');
    let favoureteShowCheckFunc = async (distDom) => {
      let distText = await distDom.getText();
      if(distText == checkText) return true;
      else return false;
    }
    let favoureteMenu = menus[0];
    let checkRoomId = await normalGroup.getAttribute('id');
    console.log("checkRoomId is ", checkRoomId);
    let favoureteMenuShowCheckResult = await favoureteShowCheckFunc(favoureteMenu);
    assert.equal(favoureteMenuShowCheckResult, true);

    favoureteMenu.click();
    
    let favoureteChatCheckFunc = async function(arg) {
      let favChats = arg[0];
      let checkId = arg[1];
      let favouritesGroupLists = await favChats.$$('li');
      for(let i = 0; i < favouritesGroupLists.length; i++) {
        let curChat = favouritesGroupLists[0];
        let curId = await curChat.getAttribute('id');
        if(curId == checkId) return true;
        else continue;
      }
      return false;
    };
    let favoureteChatCheckResult = await waitingCheck(5000, favoureteChatCheckFunc, "menu favourite result ", favoureteGroups, checkRoomId);
    assert.equal(favoureteChatCheckResult, true);
  });

  it("unfavourite chat", async function(){
    let self = this;
    let groups = await self.app.client.$$('.group-list');
    let checkText = "取消置顶";
    // console.log("group is ", group);
    let normalGroups = groups[1];
    let favoureteGroups = groups[0];
    let favouriteGroupLists = await favoureteGroups.$$('li');
    let favouriteGroup = favouriteGroupLists[0];
    favouriteGroup.click({button: 'right'})

    let menuEl = await self.app.client.$('.contextMenu');

    let contextShowCheckFunc = async function(arg) {
      let checkDom = arg[0];
      let styleDisplay = await checkDom.getCSSProperty('display');
      console.log("contextShowcheckFunc styleDisplay ", styleDisplay);
      if(styleDisplay.value == "block") {
        return true;
      }
      else {
        return false;
      }
    };
    let contextShowCheckResult = await waitingCheck(30000, contextShowCheckFunc, "menu show ", menuEl);
    assert.equal(contextShowCheckResult, true)

    let menuList = await self.app.client.$('.menuList');
    let menus = await menuList.$$('li');
    let favoureteShowCheckFunc = async (distDom) => {
      let distText = await distDom.getText();
      if(distText == checkText) return true;
      else return false;
    }
    let favoureteMenu = menus[0];
    let checkRoomId = await favouriteGroup.getAttribute('id');
    console.log("checkRoomId is ", checkRoomId);
    let favoureteMenuShowCheckResult = await favoureteShowCheckFunc(favoureteMenu);
    assert.equal(favoureteMenuShowCheckResult, true);

    favoureteMenu.click();
    
    let unfavoureteChatCheckFunc = async function(arg) {
      let favChats = arg[0];
      let checkId = arg[1];
      let favouritesGroupLists = await favChats.$$('li');
      for(let i = 0; i < favouritesGroupLists.length; i++) {
        let curChat = favouritesGroupLists[0];
        let curId = await curChat.getAttribute('id');
        if(curId == checkId) return true;
        else continue;
      }
      return false;
    };
    let favoureteChatCheckResult = await waitingCheck(5000, unfavoureteChatCheckFunc, "menu unfavourite result ", normalGroups, checkRoomId);
    assert.equal(favoureteChatCheckResult, true);
  });

})