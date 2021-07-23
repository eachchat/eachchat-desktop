const assert = require('chai').assert
const homepage = require('./homepage')


const delay = 2000;

describe('dirchat test', function () {
  this.timeout(80000)
  before(function () {
    console.log("platform is:",process.platform)
    this.app = homepage.app;
  })

  it("click plus", async function() {
    let that = this;
    let plusBtn = await that.app.client.$('#new-chat-button-id');
    // console.log('???plusBtn???', plusBtn)
    // plusBtn.click();
    setTimeout(async ()=> {
      console.log('???plusBtn???', plusBtn)
      plusBtn.click();
    }, delay)
  })

  it("click direct chat entrance", async function() {
    let that = this;
    let dirChatEnt = await that.app.client.$('.normal-chat');
    // console.log('???dirChatEnt???', dirChatEnt)
    // dirChatEnt.click();
    setTimeout(async () => {
      console.log('???dirChatEnt???', dirChatEnt)
      dirChatEnt.click();
    }, delay)
  })

  it("choose a member", async function() {
    let that = this;
    let member = await that.app.client.$$('.room-item');
    // console.log('???member???', member[last])
    // member[last].click();
    let last = member.length - 1;
    console.log('----last---', last)
    setTimeout(async () => {
      console.log('???member???', member)
      member.click();
    }, delay)
  })

  it("confirm", async function() {
    let that = this;
    let confirm= await that.app.client.$('.submit-button');
    // console.log('???confirm???', confirm)
    // confirm.click();
    setTimeout(async () => {
      console.log('???confirm???', confirm)
      confirm.click();
    }, delay)
  })

 
})