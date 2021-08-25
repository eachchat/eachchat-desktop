const homepage = require("./homepage")
const assert = require('chai').assert


describe('Application run', function () {
    this.timeout(10000)

    it('start login window', async function () {
      await homepage.run();
    })

    it('shows an initial window', function () {
      return homepage.app.client.getWindowCount().then(function (count) {
        assert.equal(count, 3)
      })
    })
  
})