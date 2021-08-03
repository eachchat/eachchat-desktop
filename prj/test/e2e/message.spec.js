const assert = require('chai').assert;
const expect = require('chai').expect;
const dotenv = require('dotenv');
const homepage = require('./homepage')

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

describe('message test', function () {
  this.timeout(30000);
  before(function () {
    console.log("platform is:",process.platform)
    this.app = homepage.app;
  });

  it('send message', async function(){
    let self = this;

    async function sendMsgCheck (sendText) {
      return new Promise(async (resolve, reject)=>{
          setTimeout(async () => {
            // need to check if there is message show in chat page.
            let msgListEl = await self.app.client.$('.msg-list');
            let msgLists = await msgListEl.$$('li');
            let checkFunc = async function(arg) {
              let msgListDom = arg[0];
              let distText = arg[1];
              let checkDom = msgListDom[msgListDom.length - 1];
              let checkText = await checkDom.getText();
              console.log("sendMsgCheck checkDom checkText is ", checkText, " and dist text is ", distText);
              if(checkText.indexOf(distText) >= 0) return true;
              else return false;
            }
            let checkResult = await waitingCheck(30000, checkFunc, "send text ", msgLists, sendText);
            if(checkResult) resolve(true);
            else reject(false);
          }, 2000);
      });
    }
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
          let curTime = new Date().getTime();
          inputElement.setValue(curTime);
          resolve(curTime);
        }, 2000)
      })
    }
    let sendText = await setText();
    await sendMsg();
    await sendMsgCheck(sendText);
  })

  // it('send file', async function(){
  //   let self = this;

  //   async function sendMsg () {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         let sendBtnElement = await self.app.client.$('.chat-send');
  //         sendBtnElement.click();
  //         console.log("=====clickbtn ");
  //         resolve();
  //       }, 2000);
  //     });
  //   }

  //   async function selectFile() {
  //     return new Promise(async (resolve, reject)=>{
  //       setTimeout(async () => {
  //         console.log("--------self.app ", self.app.electron);
  //         self.app.electron.ipcMain.on("open-directory-dialog", (e, arg) => {
  //           console.log("==============arg is ", arg);
  //         });
  //         let files = {
  //           filePaths: "C:/Users/wangx/Desktop/eachchat 2.0.3.pptx"
  //         }
  //         // console.log("=======webcontents ", webcontents);
  //         // console.log("======toggleDevTools: ",await webcontents.toggleDevTools())
  //         try {
  //           self.app.electron.browserWindow.send('selectedItem', files);
  //         }
  //         catch(e) {
  //           console.log("self.app.electron.browserWindow ", e);
  //         }
  //         try {
  //           self.app.electron.webContents.send('selectedItem', files);
  //         }
  //         catch(e) {
  //           console.log("self.app.electron.webContents ", e);
  //         }
  //         try {
  //           self.app.electron.webContents.sendToAll('selectedItem', files);
  //         }
  //         catch(e) {
  //           console.log("self.app.electron.webContents.sendToAll ", e);
  //         }
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
  //       }, 2000);
  //     });
  //   }
  //   //await setText();
  //   await selectFile();
  //   // await sendMsg();
  // });
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

})