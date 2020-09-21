//const {FileUtil} = require("./build/server/Utils")
const {FileUtil, generalGuid} = require("../../prj/src/renderer/server/Utils.js")
const {ServerApi} = require("../../prj/src/renderer/server/serverapi.js")

let fu;
let api;
function MainLogin()
{
    fu = new FileUtil('D:\\git\\YiQiLiao-Desktop\\demo\\axiosdemo\\package.json');
    buf = fu.ReadfileSync();

    api = new ServerApi('http', '139.198.15.253');
    api.Login('chengfang.ai@yunify.com', '12345678');
    //api.Uploadfile(buf, 'text/plain')
}