<template>
    <div class="wrap-layer" >
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
                        <input @input="searchMember" v-model="memberText" class="search-input" type="text" placeholder="搜索备注名，用户名，姓名或者matrix ID">
                    </div> <!--search input-->
                    <div class="member-list">
                        <div v-for="item in searchResult" :key="item.user_id" class="member-item">
                            <input type="checkbox" v-model="item.checked" @change="chooseMember(item)">
                            <img src="item.avatar_url" >
                            <div class="member-info">
                                <div>{{item.display_name}}</div>
                                <div>{{item.user_id}}</div>
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
                            <img src="item.avatar_url" >
                            <div class="member-info" style="width: 152px;">
                                <div>{{item.display_name}}</div>
                                <div>{{item.user_id}}</div>
                            </div>
                            <div class="rm-choosen" @click.stop="removeMember(item)">X</div>
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
import {getAddressType} from "../../utils/UserAddress";
export default {
    name: 'mxMemberSelectDlg',
    props: ['roomId'],
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
            busy: false
        }
    },
    timer: null,
    methods: {
        inviteConduct: async function(roomId, addr, ignoreProfile) {
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
            this.busy = ture;
            const vtx = this;
            const targetIds = choosenMember.map(t => t.user_id);
            const client = window.mxMatrixClientPeg.matrixClient;
            const roomId = this.roomId;
            const room = client.getRoom(this.roomId);
            if (!room) {
                console.error('no room')
                return alert('无此房间');
            }
            let promises = [];
            targetIds.forEach(id => {
                promises.push(vtx.inviteConduct(roomId, id));
            })
            Promise.all(promises);
        },
        removeMember: function(item) {
            let id = item.user_id;
            let searchResult = this.searchResult;
            let choosenMember = this.choosenMember;
            choosenMember = choosenMember.filter(c => c.user_id != id)
            searchResult.forEach(s => {
                if (s.user_id == id) s.checked = false;
            })
            this.searchResult = [...searchResult];
            this.choosenMember = [...choosenMember];
        },
        close: function() {
            this.$emit('close', 'close');
        },
        confirm: function() {
        },
        searchMember: function() {
            const term = this.memberText;
            if (this.timer) clearTimeout(this.timer);
            const vtx = this;
            const client = window.mxMatrixClientPeg.matrixClient;
            this.timer = setTimeout(() => {
                if (!term) return vtx.searchResult = [];
                client.searchUserDirectory({term}).then((res)=>{
                    console.log('----search result----', res)
                    let members = [];
                    if (res.results && res.results.length) {
                        members = res.results.map(r => {
                            r.checked = false;
                            return r;
                        })
                    }
                    console.log('----result members----', members);
                    vtx.searchResult = [...members];
                })
            }, 320);
        },
        chooseMember: function(item) {
            console.log('check checkbox', item)
            let choosenMember = this.choosenMember;
            if (item.checked) {
                choosenMember.push(item);
            } else {
                choosenMember = choosenMember.filter(c => c.user_id != item.user_id)
            }
            this.choosenMember = [...choosenMember];
        }
    },
    components: {
    },
    created() {
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
        font-family: PingFangSC-Regular;
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
    }

    .mxTransmitConfirmButton {
        border-radius:4px;
        font-family: PingFangSC-Regular;
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
        background: green;
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
        padding: 4px 8px;
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
        background-color: #459ad0;
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
</style>
