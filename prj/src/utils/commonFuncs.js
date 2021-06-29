import {remote, nativeImage, clipboard} from 'electron'
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const menelabels = {
    copy: '复制',
    cut: '剪切',
    paste: '粘贴'
}
export function openRemoteMenu(...args) {
    const menu = new Menu();
    args.forEach(role => {
        if ( ['copy', 'cut', 'paste'].includes(role) ){
            menu.append(new MenuItem({ label: menelabels[role], role }));
        }
    })
    menu.popup(remote.getCurrentWindow());
}

export function openBaseMenu() {
    openRemoteMenu('copy', 'cut', 'paste')
}

export function getImgUrlByEvent (event) {
    var distUrl = (event.content.info && event.content.info.thumbnail_url && event.content.info.thumbnail_url.length != 0) ? event.content.info.thumbnail_url : event.content.url;
    if(!distUrl) return;
    if(!distUrl.startsWith('blob:')) {
        let iconPath = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(distUrl);
        return iconPath;
    }
    else {
        return distUrl;
    }
}

export function getTextByEvent(event){
    if(event.content && event.content.body) {
        return event.content.body;
    }
    return "";
}

export function copyImgToClipboard(url){
    var canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL('image/png');
        const image = nativeImage.createFromDataURL(dataURL)
        clipboard.writeImage(image)
        canvas = null; 
    };
    img.src = url
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