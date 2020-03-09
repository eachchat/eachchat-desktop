import {Login, InitServerAPI, ListGroup} from "../../prj/src/renderer/server/serverapi.js";

function MainLogin()
{
    InitServerAPI('http', '139.198.15.253')
    Login('chengfang.ai@yunify.com', '12345678')
}