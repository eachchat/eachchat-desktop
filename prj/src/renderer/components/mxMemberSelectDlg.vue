<template>
    <div class="wrap-layer" @click.self.stop="close">
        <div class="mx-create-room-dialog" v-if="matrixSync">
            <div class="mxCreaterHeader">
                <div class="mxCreaterHeaderTitle">邀请联系人</div>
                <img ondragstart="return false" class="mxCreaterClose" src="../../../static/Img/Chat/delete-20px@2x.png" @click.stop="close">
            </div>
            <div class="member-field">
                <div class="member-field-left"> <!--left-->
                    <div class="search-field">
                        <div class="search-logo">
                            <i class="el-icon-search"></i>
                        </div>
                        <input @input="searchMember" v-model="memberText" class="search-input" type="text" placeholder="搜索">
                    </div> <!--search input-->
                    <div class="crumbs" v-show="crumbs.length > 1 && !isSearch">
                        <div 
                            :class="{crumbsItem:(idx !== crumbs.length-1), crumbsItemActive:(idx === crumbs.length-1)}" 
                            v-for="(item, idx) in crumbs"
                            :key="item.department_id"
                            @click.stop="changeLayerByCrumb(item)"
                        >
                            <span v-show="idx!==0" style="margin-left:4px; margin-right:4px;">/</span>
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                    <div class="member-list" v-if="!isSearch">
                        <div v-for="(item, idx) in totalList" :key="idx">
                            <div 
                                v-if="item.type === 'dep'"
                                class="room-item room-item-dep"
                                @click.stop="changeLayer(item)"
                            >   
                                <div style="display:flex; align-items:center;">
                                    <img class="room-img" src="../../../static/Img/Main/zzjg.png"/> <!-- src="../../../static/Img/Main/yjt.png" -->
                                    <div class="user-info">
                                        <span class="room-info">{{item.display_name}}</span>
                                    </div>
                                </div>
                                <img style="height:20px; width:20px;" src="../../../static/Img/Main/yjt.png">
                            </div>
                            <div v-else-if="item.dvd" class="dvd">{{item.txt}}</div>
                            <div v-else class="member-item">
                                <input type="checkbox" v-model="item.checked" @change="chooseMemberT(item)" style="margin:4px">
                                <img :src="item.avatar_url" >
                                <div class="member-info">
                                    <div>{{item.display_name}}</div>
                                    <div>{{item.matrix_id || item.user_id}}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="member-list" v-else>
                        <div v-for="(item, idx) in searchResult" :key="idx">
                            <div v-if="item.dvd" class="dvd">{{item.txt}}</div>
                            <div v-else class="member-item">
                                <input type="checkbox" v-model="item.checked" @change="chooseMember(item)" style="margin:4px">
                                <img :src="item.avatar_url" >
                                <div class="member-info">
                                    <div>{{item.display_name}}</div>
                                    <div>{{item.matrix_id || item.user_id}}</div>
                                </div>
                            </div>
                        </div>
                    </div> <!--member list-->
                </div>
                <div class="member-field-right"> <!--right-->
                    <div class="choosen-count">
                        <span>已选择</span>
                        <span v-show="choosenMember.length">{{choosenMember.length}}人</span>
                    </div>
                    <div class="member-list2">
                        <div v-for="item in choosenMember" :key="item.user_id" class="member-item">
                            <img :src="item.avatar_url" >
                            <div class="member-info" style="width: 152px;">
                                <div>{{item.display_name}}</div>
                                <div>{{item.matrix_id || item.user_id}}</div>
                            </div>
                            <img style="height:20px; width:20px;" @click.stop="removeMember(item)" src="../../../static/Img/Chat/delete-20px@2x.png">
                        </div>
                    </div> <!--member list-->
                    <div class="confirm-button" @click.stop="invite">确认</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const E2EE_WK_KEY = "io.element.e2ee";
const E2EE_WK_KEY_DEPRECATED = "im.vector.riot.e2ee";
import {getAddressType} from "../../utils/UserAddress";
import { mapState, mapActions } from 'vuex';
import {Contact, Department, UserInfo} from '../../packages/data/sqliteutil.js';
export default {
    name: 'mxMemberSelectDlg',
    props: ['roomId', 'isDm'],
    data () {
        return {
            name:'',
            isPublic:false,
            commu: false,
            isEncrypted: false,
            alias: '',
            memberText: '',
            searchResult: [],
            choosenMember: [],
            busy: false,
            crumbs: [],
            totalList: [],
            isSearch: false
        }
    },
    timer: null,
    methods: {
        inviteConduct: async function(roomId, addr, ignoreProfile) {
            console.log('---get addr----', addr);
            const addrType = getAddressType(addr);
            const client = window.mxMatrixClientPeg.matrixClient;
            if (addrType === 'email') {
                return client.inviteByEmail(roomId, addr);
            } else if (addrType === 'mx-user-id') {
                const room = client.getRoom(roomId);
                if (!room) throw new Error("Room not found");

                const member = room.getMember(addr);
                if (member && ['join', 'invite'].includes(member.membership)) {
                    throw {errcode: "RIOT.ALREADY_IN_ROOM", error: "Member already invited"};
                }


                //todo  更精确的权限控制
                // if (!ignoreProfile && SettingsStore.getValue("promptBeforeInviteUnknownUsers", this.roomId)) {
                //     try {
                //         const profile = await MatrixClientPeg.get().getProfileInfo(addr);
                //         if (!profile) {
                //             // noinspection ExceptionCaughtLocallyJS
                //             throw new Error("User has no profile");
                //         }
                //     } catch (e) {
                //         throw {
                //             errcode: "RIOT.USER_NOT_FOUND",
                //             error: "User does not have a profile or does not exist."
                //         };
                //     }
                // }  

                return client.invite(roomId, addr);
            } else {
                throw new Error('Unsupported address');
            }

        },
        invite: function() {
            if (this.busy) return;
            this.busy = true;
            const vtx = this;
            const targetIds = this.choosenMember.map(t => t.matrix_id || t.user_id );
            const client = window.mxMatrixClientPeg.matrixClient;
            const roomId = this.roomId;
            // const room = client.getRoom(this.roomId);
            // if (!room) {
            //     console.error('no room')
            //     return alert('无此房间');
            // }
            let promises = [];
            targetIds.forEach(id => {
                promises.push(vtx.inviteConduct(roomId, id));
            })
            Promise.all(promises).then(() => {
                vtx.busy = false;
                const obj = {};
                obj.data = {room_id: roomId};
                obj.handler = 'viewRoom';
                vtx.close(obj);
            });
        },
        close: function() {
            const obj = {};
            obj.data = {room_id: this.roomId};
            obj.handler = 'viewRoom';
            this.$emit('close', obj);
        },
        confirm: function() {
        },
        searchMember: function() {
            const term = this.memberText;
            const vtx = this;
            const client = window.mxMatrixClientPeg.matrixClient;
            if (this.timer) clearTimeout(this.timer);
            if (!term) {
                this.searchResult = [];
                this.isSearch = false;
                return
            }
            this.timer = setTimeout(async ()=>{
                const choosenMember = this.choosenMember;
                const searchUsers = await UserInfo.SearchByNameKey(term).catch(e => console.log('组织人员搜索异常', e));
                const searchContacts = await Contact.SearchByNameKey(term).catch(e => console.log('联系人搜索异常', e));
                const res = await client.searchUserDirectory({term}).catch(e => console.log('域用户搜索失败', e));
                console.log('----searchUsers----', searchUsers);
                console.log('----searchContacts----', searchContacts);
                console.log('----res----', res);
                let sus = [];
                sus.push({dvd:true, txt:'组织人员'})
                searchUsers.forEach(c => {
                    //avatar_url
                    //display_name
                    //user_id
                    let u = {}
                    u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    u.display_name =  c.user_display_name || c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    u.checked = false; //todo
                    choosenMember.forEach( m => {
                        if (m.user_id == u.user_id) u.checked = true;
                    })
                    sus.push(u);
                })
                let scs = [];
                scs.push({dvd:true, txt:'我的联系人'})
                searchContacts.forEach(c => {
                    let u = {}
                    u.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                    u.display_name =  c.display_name || c.user_name || '';
                    u.user_id = c.matrix_id || '';
                    u.checked = false;
                    choosenMember.forEach( m => {
                        if (m.user_id == u.user_id) u.checked = true;
                    })
                    scs.push(u);
                })
                let mxs = [];
                mxs.push({dvd:true, txt:'其他联系人'})
                let results = res.results || [];
                results.forEach(c => {
                    c.checked = false;
                    choosenMember.forEach( m => {
                        if (m.user_id == c.user_id) c.checked = true;
                    })
                    c.avatar_url = client.mxcUrlToHttp(res.avatar_url) || '../../../static/Img/User/user-40px@2x.png';
                    mxs.push(c);
                })
                const totalArray = [...sus, ...scs, ...mxs];
                console.log('----totalArray----', totalArray);
                vtx.isSearch = true;
                vtx.searchResult = [...totalArray];
            },320)
        },
        chooseMemberT(item) {
            let choosenMember = this.choosenMember;
            let totalList = this.totalList;
            if (item.checked) {
                choosenMember.push(item);
                totalList.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = true;
                })
            } else {
                choosenMember = choosenMember.filter(c => c.user_id != item.user_id)
                totalList.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = false;
                })
            }
            this.choosenMember = [...choosenMember];
            this.totalList = [...totalList];
        },
        chooseMember: function(item) {
            console.log('check checkbox', item)
            let choosenMember = this.choosenMember;
            let searchResult = this.searchResult;
            if (item.checked) {
                choosenMember.push(item);
                searchResult.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = true;
                })
            } else {
                choosenMember = choosenMember.filter(c => c.user_id != item.user_id)
                searchResult.forEach(s => {
                    if (s.user_id == item.user_id) s.checked = false;
                })
            }
            this.choosenMember = [...choosenMember];
            this.searchResult = [...searchResult];
        },
        removeMember: function(item) {
            let id = item.user_id;
            let searchResult = this.searchResult;
            let choosenMember = this.choosenMember;
            let totalList = this.totalList;
            choosenMember = choosenMember.filter(c => c.user_id != id)
            searchResult.forEach(s => {
                if (s.user_id == id) s.checked = false;
            })
            totalList.forEach(s => {
                if (s.user_id == id) s.checked = false;
            })
            this.searchResult = [...searchResult];
            this.choosenMember = [...choosenMember];
            this.totalList = [...totalList];
        },
        async changeLayerByCrumb(obj) {
            console.log('caonimao', this.crumbs)
            const choosenMember = this.choosenMember;
            const client = window.mxMatrixClientPeg.matrixClient;
            let department_id = obj.department_id;
            if (department_id === this.crumbs[0].department_id) {
                const rootDep = await Department.GetRoot();
                const dvd = {dvd:true, txt:'我的联系人'};
                const contactUsers = await Contact.GetAllContact();
                contactUsers.forEach(c => {
                    c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                })
                rootDep.type = 'dep';
                let totalArray = [rootDep, dvd, ...contactUsers];
                totalArray.forEach(t => {
                    t.checked = false;
                    choosenMember.forEach(c => {
                        if (t.user_id == c.user_id) t.checked = true;
                    })
                });
                this.totalList = [...totalArray];
                this.crumbs[0].choosen = true;
                this.crumbs = [this.crumbs[0]];
            } else {
                this.changeLayer(obj);
            }
        },
        async changeLayer(obj) {
            const choosenMember = this.choosenMember;
            const client = window.mxMatrixClientPeg.matrixClient;
            let department_id = obj.department_id;
            let crumbs = this.crumbs;
            const len = crumbs.length;
            let newCrumbs = []
            for(let i=0; i<len; i++) {
                newCrumbs.push(crumbs[i]);
                if (crumbs[i].department_id === department_id) {
                    break;
                }
                if (i === len-1) {
                    let layer = {name:obj.display_name, department_id:obj.department_id}
                    newCrumbs.push(layer);
                }
            }
            newCrumbs[newCrumbs.length-1].choosen = true;
            console.log('>>>>>', newCrumbs)
            newCrumbs[1].name = '组织';
            this.crumbs = [...newCrumbs];
            const subDep = await Department.GetSubDepartment(department_id);
            const subUsers = await UserInfo.GetSubUserinfo(department_id);
            subDep.forEach(s=>s.type = 'dep')
            subUsers.forEach(c=>{
                c.display_name = c.user_display_name || c.user_name;
                c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
                
            })
            let totalArray = [...subDep, ...subUsers];
            totalArray.forEach(t => {
                t.checked = false;
                choosenMember.forEach(c => {
                    if (t.user_id == c.user_id) t.checked = true;
                })
            });
            this.totalList = [...totalArray];   
        },
    },
    components: {
    },
    async created() {
        const client = window.mxMatrixClientPeg.matrixClient;
        const rootDep = await Department.GetRoot();
        console.log('---rootDep---', rootDep);
        rootDep.type = 'dep';
        rootDep.display_name = '组织';        
        const contactUsers = await Contact.GetAllContact();
        console.log('contactUsers', contactUsers);
        contactUsers.forEach(c => {
            c.avatar_url = (client.getUser(c.matrix_id) ? client.mxcUrlToHttp(client.getUser(c.matrix_id).avatarUrl || client.getUser(c.matrix_id).avatar_url) : '') || './static/Img/User/user-40px@2x.png';
        })
        const dvd = {dvd:true, txt:'我的联系人'};
        const layer = {name:'联系人', department_id:'lxr', checked: true}
        let totalArray = [rootDep, dvd, ...contactUsers];
        totalArray.forEach(t => t.checked = false)
        this.totalList = [...totalArray];
        this.crumbs = [layer];



        console.log('contactUsers', contactUsers);
        const subDep = await Department.GetSubDepartment("0a59d5bd13cb476698fee9d58599e37e");
        const subUsers = await UserInfo.GetSubUserinfo("0a59d5bd13cb476698fee9d58599e37e");
        console.log('subDep', subDep);
        console.log('subUsers', subUsers);
    },
    mounted() {
    },
    watch: {
        matrixSync: {
            handler: function(val, oldVal) {
                const vtx = this;
                if (val) {
                    const client = window.mxMatrixClientPeg.matrixClient;
                }
            },
            immediate: true
        }
    },
    computed: {
        ...mapState({
            matrixSync: state => state.common.matrixSync
        }),
    }
}
</script>

<style lang="scss" scoped>
    ::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
    }
    input:focus{
        outline:none;
    }
    .wrap-layer {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }

    .mx-create-room-dialog {
        position: absolute;
        width: 624px;
        height: 468px;
        display: block;
        background: rgba(255, 255, 255, 1);
        top: 50%;
        left: 50%;
        margin-top: -312px;
        margin-left: -234px;
        border-radius: 8px;
    }

    .mxCreaterHeader {
        box-sizing: border-box;
        border-bottom: 1px solid #d7d7d7;
        height: 56px;
        background: rgba(255, 255, 255, 1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left:28px;
        padding-right:28px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .mxCreaterHeaderTitle {
        font-size: 14px;
    }

    .mxCreaterClose {
        width: 20px;
        height: 20px;
    }

    .mxChatCreaterContent {
        padding: 48px;
        padding-top: 0px;
    }

    .mxTransmitFotter {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        position: absolute;
        bottom: 32px;
        right: 32px;
}

    .mxTransmitCancleButton {
        border-radius:4px;
        width: 100px;
        height: 28px;
        box-sizing: border-box;
        border:1px solid rgba(221,221,221,1);
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        margin-left: 28px;
        border-radius: 4px;
        font-family: PingFangSC-Regular;
    }

    .mxTransmitConfirmButton {
        border-radius:4px;
        width: 100px;
        height: 28px;
        box-sizing: border-box;
        background-color: #459ad0;
        border:1px solid #459ad0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        margin-left: 28px;
        border-radius: 4px;
        color: #fff;
        font-family: PingFangSC-Regular;
    }

    .setting-field {
        margin-top: 28px;
        height: 40px;
        border-bottom:1px solid rgba(221,221,221,1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 80%;
    }

    .groupSettingSlienceSwitch {
        padding-top: 14px;
        padding-bottom: 14px;
        height: 20px;
        width: 32px;
    }

    .field-left {
        height: 100%;
    }

    .setting-title {
        line-height: 16px;
        height: 1px;
    }
    .setting-tip {
        line-height: 58px;
        font-size: 12px;
        height: 1px;
    }
    .room-name {
        height: 80%;
        border: none;
        width: 40%;
    }
    .member-field {
        display: flex;
        width: 100%;
        position: absolute;
        top: 56px;
        bottom: 0px;
        left: 0px;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }
    .member-field-left {
        width: 60%;
        height: 100%;
        border-bottom-left-radius: 8px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border-right: 1px solid #d7d7d7;

    }
    .member-field-right {
        height: 100%;
        border-bottom-right-radius: 8px;
        width: 40%;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    .search-field {
        display: flex;
        height: 32px;
        padding: 2px;
        padding-left:3px;
        background-color: #d7d7d7;
    }
    .search-logo {
        height: 32px;
        width: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
    }
    .search-input {
        flex: 1;
        height: 32px;
        box-sizing: border-box;
        border: none;
    }
    .member-list {
        flex: 1;
        border-bottom-left-radius: 8px;
        background-color: #fff;
        overflow-y: scroll;
    }
    .member-item {
        height: 48px;
        display: flex;
        align-items: center;
        margin-top: 12px;
        margin-bottom: 12px;
        input {
            height: 20px;
            width: 20px;
        }
        img {
            height: 48px;
            width: 48px;
            margin-left: 8px;
            margin-right: 8px;
            border-radius: 50%;
        }
    }
    .member-info {
        height: 100%;
        div {
            height: 50%;
            line-height: 100%;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
    }
    .member-list2 {
        flex: 1;
        border-bottom-right-radius: 8px;
        background-color: #fff;
        overflow-y: scroll;
    }
    .choosen-count {
        height: 32px;
        margin-left: 8px;
        font-size: 14px;

    }
    .confirm-button {
        height: 36px;
        width: 120px;
        border-radius: 20px;
        position: absolute;
        bottom: 12px;
        left: 50%;
        margin-left: -60px;
        background-color: #24B36B;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .rm-choosen {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .dvd {
        font-size: 12px;
        height: 32px;
        color: #666666;
        background-color: #F7F8FA;
        box-sizing: border-box;
        padding: 0 16px;
        padding-left: 4px;
        margin-top: 16px;
        line-height: 32px;
    }






    .room-name {
        height: 80%;
        border: none;
        width: 40%;
    }
    .room-item {
        height: 48px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background-color: #fff;
        // width: 100%;
        box-sizing: border-box;
        margin-left: 16px;
        margin-right: 16px;
        border-bottom: 1px solid #DDD;
        
    }
     .room-item-dep {
         justify-content: space-between;
     }
    .room-img {
        height: 32px;
        width: 32px;
        margin-right: 16px;
        border-radius: 50%;
    }
    .room-info {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        /* width: 80px; */
        font-size: 14px;
        height: 16px;
        line-height: 16px;
    }
    .room-join {
        height: 24px;
        width: 60px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background-color: #459ad0;   
        margin-left: 160px;
        font-size: 12px;
    }
    .user-info {
        display: flex;
        flex-direction: column;
    }
    .submit-field {
        height: 72px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .submit-button {
        box-sizing: border-box;
        width: 100px;
        height: 32px;
        background: #24B36B;
        border-radius: 4px;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .cancel-button {
        box-sizing: border-box;
        width: 100px;
        height: 32px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #DDDDDD;
        color: #000;
        margin-right: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .crumbs {
        display: flex;
        margin-left: 16px;
        font-size: 12px;
        flex-wrap: wrap;
        margin-top: 8px;
    }
    .crumbsItem {
        color: #24B36B;
    }
    .crumbsItemActive {
        color: #000;
    }
</style>
