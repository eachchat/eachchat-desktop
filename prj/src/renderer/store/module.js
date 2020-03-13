export class InvitationUserInfo {
    constructor() {
        this.userName = "";
        this.userid = "";
    }
}

export class Chat {
    constructor(groupId, groupName, unreadCount, lastMsg, sequenceId) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.unreadCount = unreadCount;
        this.lastMsg = lastMsg;
        this.sequenceId = sequenceId
    }
}

export class ChatGroupItemMessageId {
    constructor() {
        this.couter = 0;
        this.date = 0;
        this.machineIdentifier = 0;
        this.processIdentifier = 0;
        this.time = 0;
        this.timeSecond = 0;
        this.timestamp = 0;
    }
}

export class ChatGroupItemMessageContent {
    constructor() {
        this.text = "";
        this.type = "";
        this.mentions = [];
        this.ext = "";
        this.fileName = "";
        this.fileSize = 0;
        this.imgHeight = 0;
        this.imgWidth = 0;
        this.middleImage = "";
        this.thumbnailImage = "";
        this.url = "";
        this.fromId = "";
        this.groupId = "";
        this.userName = "";
        this.userId = "";
        this.userInfos = [];
        this.length = 0;
        this.title = "";
        this.msgIds = [];
    }
}

export class ChatGroupItem {
    constructor() {
        this.group = {
            avatarflag: 0,
            avatarUserIds: [],
            forbidden: 0,
            groupAvatar: '',
            groupId: '',
            groupName: '',
            groupNotice: '',
            groupType: 0,
            id: '',
            noticeTime: 0,
            noticeUserId: '',
            notifications: '',
            owner: '',
            sortValud: '',
            status: '',
            statusIntValue: 0,
            updateTime: 0,
            userIds: [],
        };
        this.message = {
            content: ChatGroupItemMessageContent,
            fromId: "",
            groupId: '',
            id: ChatGroupItemMessageId,
            msgContentType: 0,
            msgId: '',
            readerFlag: 0,
            sequenceId: 0,
            timelineId: '',
            timestamp:0,
            userId: 0,
        };
        this.noReaderCount = 0;
    }
}