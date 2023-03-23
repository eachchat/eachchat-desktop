/*
Copyright 2016-2021 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { dialog } from "electron";
import { autoUpdater } from "electron-updater";



export const checkUpdate = (checkUpdateUrl: string)=>{
  if(!checkUpdateUrl) return;

  if(process.platform == 'darwin'){  
    //我们使用koa-static将静态目录设置成了static文件夹，
    autoUpdater.setFeedURL(`${checkUpdateUrl}/darwin`)  //设置要检测更新的路径
  }else{
    autoUpdater.setFeedURL(`${checkUpdateUrl}/win32`)
  }

  //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false

  //检测更新
  autoUpdater.checkForUpdates();

  // 监听 'checking-for-update' 事件
  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...');
  });

  // 监听 'update-available' 事件
  autoUpdater.on('update-available', (info) => {
    console.log(`发现新版本 ${info.version}，正在下载...`);
  });

  // 监听 'update-not-available' 事件
  autoUpdater.on('update-not-available', () => {
    console.log('当前已经是最新版本');
  });
  
  // 监听 'error' 事件
  autoUpdater.on('error', (err) => {
    console.error('自动更新错误', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log('download-progress')
  });

  //监听'update-downloaded'事件，新版本下载完成时触发
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: '发现新版本，是否更新？',
      buttons: ['是', '否']
    }).then((buttonIndex) => {
      if(buttonIndex.response == 0) {  //选择是，则退出程序，安装新版本
        autoUpdater.quitAndInstall() 
        // app.quit()
      }
    })
  })
}
