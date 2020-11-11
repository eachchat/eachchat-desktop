/**
 * Data
 * @author Jakit
 * @date 2020/03/30
 */

import * as services from './services.js'
import {environment} from './environment.js'
import * as sqliteutil from "./sqliteutil.js"



if (!window.services) {
  global.services = services;
  global.services.common.ConfigTableInit();
}

export {
  environment,
  sqliteutil
}
