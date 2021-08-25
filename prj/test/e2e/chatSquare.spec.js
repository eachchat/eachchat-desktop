const assert = require('chai').assert
const homepage = require('./homepage')

const delay = 2000;

describe('chatsquare test', function () {
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

  it("click square", async function() {
    let that = this;
    let squareEntrance = await that.app.client.$('.secret-chat');
    // console.log('???squareEntrance???', squareEntrance)
    // squareEntrance.click();
    setTimeout(async () => {
      console.log('???squareEntrance???', squareEntrance)
      squareEntrance.click();
    }, delay)
  })

  it("enter room", async function() {
    let that = this;
    let enterRoom = await that.app.client.$('.room-join');
    // console.log('???enterRoom???', enterRoom)
    // enterRoom.click();
    setTimeout(async ()=> {
      console.log('???enterRoom???', enterRoom)
      enterRoom.click();
    }, delay)
  })
})