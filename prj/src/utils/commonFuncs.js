import {remote} from 'electron'
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const menu = new Menu();
menu.append(new MenuItem({ label: '复制', role: 'copy' }));

export function openRemoteMenu() {
    menu.popup(remote.getCurrentWindow());
}

export function UpdateUserAvater(ev){
  const myUserId = global.mxMatrixClientPeg.matrixClient.getUserId()
  if(ev.getType() === 'm.room.member' && ev.getSender() === myUserId){
      if(ev.event && ev.event.content){
          let content = ev.event.content;
          if(content.is_direct)
              return;
          if(content.membership != 'join')
              return;
          global.mxMatrixClientPeg.matrixClient.getProfileInfo(myUserId).then(profile => {
            var avaterUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profile.avatar_url);
            var elementImg = document.getElementById("userHead");
            if(elementImg){
                if(avaterUrl == ''){
                    elementImg.setAttribute('src', './static/Img/User/user-40px@2x.png');
                }
                else
                    elementImg.setAttribute('src', avaterUrl);
            }
          });
          
      }
  }
}