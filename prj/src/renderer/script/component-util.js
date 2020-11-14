const ComponentUtil = {
    GetDisplayName(displayName, userid){
        if(displayName == '')
        {
            let beginPos = userid.indexOf("@");
            if(beginPos == -1)
                beginPos = 0;
            else
                beginPos++;
            let endPos = userid.indexOf(":")
            if(endPos == -1)
                endPos = userid.length;
  
            return userid.slice(beginPos, endPos)
        }
        return displayName;
    },

    ShowInfoContent(content){
        if(content == undefined)
            return '';
        return content;
    }
}

export{
    ComponentUtil
}
