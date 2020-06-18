import utils from '../utils'
import {services} from "../../../src/packages/data/index.js"


describe('ServiceTest', function () {

  it("LoginTestCase", async function(){
    this.timeout(5000)
    let config = {
      hostname: "139.198.15.253",
      apiPort: 8888,
      username: "chengfang.ai@yunify.com",
      password: "12345678"
    };
    services.common.init(config);
    console.log("begin login");
    let loginResult = await services.common.login();
    expect(loginResult).to.equal(true)
  })

  it("AllUserinfoTestCase", async ()=>{
    this.timeout(30000);
    let result = await services.common.AllUserinfo();
    expect(result).to.be(true);
  })
  
})
