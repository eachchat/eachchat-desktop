const homepage = require("./homepage")

describe('Application stop', function () {
  it('Application stop', async function () {
    await homepage.stop();
  })

  it("quite process", function(){
    process.exit(0);
  })
}) 