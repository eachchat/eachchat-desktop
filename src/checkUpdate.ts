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

export const checkUpdate = async (checkUpdateUrl: string) => {
  if (!checkUpdateUrl) return;
  
  const feedUrl = process.platform === "darwin"
    ? `${checkUpdateUrl}/darwin`
    : `${checkUpdateUrl}/win32`;

  autoUpdater.setFeedURL(feedUrl);
  autoUpdater.checkForUpdates();

  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`发现新版本 ${info.version}，正在下载...`);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('当前已经是最新版本');
  });
  
  autoUpdater.on('error', (err) => {
    console.error('自动更新错误', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log('download-progress');
  });

  await new Promise<void>((resolve) => {
    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type: 'info',
        title: '应用更新',
        message: '发现新版本，是否更新？',
        buttons: ['是', '否'],
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(); 
        }
      }).finally(() => {
        resolve();
      });
    });
  });
};



