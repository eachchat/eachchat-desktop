const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')


let exePath = undefined;
if(process.platform == "win32") exePath = path.join(__dirname, '..//build//win-unpacked//EachChat.exe');
else if(process.platform == "linux") exePath = path.join(__dirname, '..//build//linux-unpacked//EachChat')
else exePath = path.join(__dirname, '..//build//mac//EachChat.App')

describe('Application launch', function () {
  this.timeout(50000)
  
  before(function () {
      console.log("before each")
      console.log(process.platform)
      console.log(__dirname)
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
    console.log('aftereach')
    if (this.app && this.app.isRunning()) {
      //return this.app.stop()
    }
  })

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 2)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

  
  it('login test', async function () {
    await this.app.client.windowByIndex(1);
    //const elem = await this.app.client.$('body');
    //const text = await elem.getText();
    //console.log(text)
    let elem = await this.app.client.$('#organizationInput');
    const text = await elem.getText();
    console.log("text", text)
    await elem.setValue("12345667")
  })

})