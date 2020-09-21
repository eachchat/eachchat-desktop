require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  console.log('start request');
  console.log(`${appOutDir}/${appName}.app`);
  return await notarize({
    appBundleId: 'com.worklyai.eachchat.desktop.testing',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: '812214689@qq.com',
    appleIdPassword: 'avwq-cpyp-ensw-uhid',
  });
};

