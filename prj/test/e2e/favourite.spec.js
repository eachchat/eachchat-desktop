const assert = require('chai').assert
const expect = require('chai').expect
const homepage = require('./homepage')

describe('favourite launch', function () {
  this.timeout(50000)
  before(function () {
    console.log("platform is:",process.platform)
    this.app = homepage.app;
   })
  
 
  it("is in MainWindow", async function(){
    let userHeadID = "#userHead";
    let userHead = await this.app.client.$(userHeadID);
    assert.isTrue(await userHead.isExisting());
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