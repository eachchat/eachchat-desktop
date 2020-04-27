/**
 * Enviroment
 * @author Jakit
 * @date 2020/04/03
 */

import os from 'os';
import fs from 'fs';

const osType = {
  UNKNOWN: 0,
  WINDOWS: 1,
  LINUX: 2,
  OSX: 3
};

const environment = {
  os: {
    type: undefined,
    description: "unknown",

    get isWindows() {
      return this.type == osType.WINDOWS;
    },

    get isLinux() {
      return this.type == osType.LINUX;
    },

    get isOSX() {
      return this.type == osType.OSX;
    }
  },

  path: {
    base: undefined,
    sqlite: undefined
  }
};

function init(env) {
  var osTypeString = os.type().toLowerCase();
  var result = false;

  env.os.description = osTypeString;

  if (osTypeString.includes("windows")) {
    env.os.type = osType.WINDOWS;
    result = initForWindows(env);

  } else if (osTypeString.includes("linux")) {
    env.os.type = osType.LINUX;

  } else if (osTypeString.includes("darwin")) {
    env.os.type = osType.OSX;
    result = initForOSX(env);
  }

  return result;
}

function initForWindows(env) {
  var appRoamingDir = os.homedir() + "\\AppData\\Roaming";
  var eachChatDir = appRoamingDir + "\\EachChat";

  if (!fs.existsSync(appRoamingDir)) {
    return false;
  }

  if (!fs.existsSync(eachChatDir)) {
    fs.mkdirSync(eachChatDir);
  }

  env.path.base = eachChatDir;
  env.path.sqlite = eachChatDir + "\\eachchat.db";

  return true;
}

function initForOSX(env) {
  var appSupportDir = os.homedir() + "/Library/Application Support";
  var eachChatDir = appSupportDir + "/EachChat";

  if (!fs.existsSync(appSupportDir)) {
    return false;
  }

  if (!fs.existsSync(eachChatDir)) {
    fs.mkdirSync(eachChatDir);
  }

  env.path.base = eachChatDir;
  env.path.sqlite = eachChatDir + "/eachchat.db";

  return true;
}

(function (env) {
  init(env);
})(environment);

export {
  environment
}
