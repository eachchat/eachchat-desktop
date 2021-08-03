const Application = require('spectron').Application
const assert = require('chai').assert
const homepage = require("./homepage")

describe('login test', function () {
  this.timeout(50000)
  before(function () {
    this.app = homepage.app;
  })
  
  it('login window testcase', async function () {
    let loginRet = await homepage.login();
    assert.equal(loginRet, true)
  });

  it("is in MainWindow", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);
    assert.isTrue(await userHead.isExisting());
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