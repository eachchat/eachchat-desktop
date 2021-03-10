const Application = require('spectron').Application
const assert = require('chai').assert
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')


let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//build//linux-unpacked//EachChat')
else exePath = path.join(__dirname, '..//build//mac//EachChat.App')

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
    let orgInput =  await this.app.client.$(orgID);
    if(!await orgInput.isExisting()) return;

    await orgInput.setValue("12345667");
    let confirBtnClass = '.organizationConfirm';
    let corfireBtn = await this.app.client.$(confirBtnClass);
    corfireBtn.click();
    assert.isTrue(await orgInput.isExisting(), "organizationConfirm is not exist");

    await orgInput.setValue("HTTP测试租户");
    corfireBtn.click();
    orgInput = await this.app.client.$(orgID);
    assert.isFalse(await orgInput.isExisting(), "still in login window");
  })
})