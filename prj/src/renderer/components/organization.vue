<template>
    <el-container>
        <el-aside width="280px">
            <div class="list-header">
                <div class="searchDiv">
                    <div class="SearchInput">
                        <eSearch @toSearch="search"/>
                    </div>
                    <div class='chat-tool-invite-div'>
                        <img class="img-disable-drag" src="../../../static/Img/Organization/Image/addContact-24px@2x.png" height="30px" @click='AddContact()'>
                    </div>
                </div>
            </div>
            <div class="search-view" v-show="showSearchView">
                <ul class="managers-list">
                    <div v-if="searchContacts.length" class='grid-content'>{{$t("organization.managersListConatctName")}}</div>
                    <li class="manager"
                        v-for="contact in searchContacts"
                        @click="SearchContactItemClicked(contact.matrix_id)" 
                        :key="contact.matrix_id">
                        <img ondragstart="return false" class="manager-icon" :id="getSearchUserIconId(contact.matrix_id)" src="../../../static/Img/User/user-40px@2x.png" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                        <div class="contact-list-info">
                        <p v-html="msgContentHightLight(contact.display_name)" class="contact-list-name">{{ contact.display_name }}</p>
                        <p  class="contact-list-titile">{{ GetContactTitle(contact) }}</p>
                        </div>
                    </li>
                    <div v-if="searchUsers.length" class='grid-content'>{{$t("organization.departmentsListOrganizationName")}}</div>
                    <li class="manager"
                        v-for="manager in searchUsers"
                        @click="searchUserMenuItemClicked(manager.user_id)" 
                        :key="manager.user_id">
                        <img ondragstart="return false" class="manager-icon" :id="getSearchUserIconId(manager.user_id)" src="../../../static/Img/User/user-40px@2x.png">
                        <div class="contact-list-info">
                        <p v-html="msgContentHightLight(manager.user_display_name)" class="contact-list-name">{{ manager.user_display_name }}</p>
                        <p class="contact-list-titile">{{ manager.user_title }}</p>
                        </div>
                    </li>
                    <div v-if="searchDeparements.length" class='grid-content'>部门</div>
                    <li class="manager"
                        v-for="department in searchDeparements"
                        @click="searchDeparmentItemClicked(department.department_id)" 
                        :key="department.department_id">
                        <img ondragstart="return false" class="department-icon" :id="getSearchUserIconId(department.department_id)" src="../../../static/Img/Organization/Image/department@2x.png">
                        <div class="department-info">
                        <p v-html="msgContentHightLight(department.display_name)" class="department-name">{{ department.display_name }}</p>
                        </div>
                    </li>
                    <div v-if="searchRooms.length" class='grid-content'>群聊</div>
                    <li class="manager"
                        v-for="room in searchRooms"
                        @click="searchRoomItemClicked(room.room_id)" 
                        :key="room.room_id">
                        <img ondragstart="return false" class="department-icon" :src="room.avatar_url">
                        <div class="department-info">
                        <p v-html="msgContentHightLight(room.name)" class="department-name">{{ room.name }}</p>
                        </div>
                    </li> 
                </ul>
            </div>
            <div v-show="!showSearchView" class = 'departmentsdiv'>
                <ul class="departments-list">
                    <li :class='["department", {"active-tab": this.activeTab == "invite"}]'
                        @click="inviteRoomItemClick()">
                        <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Image/inviteRoomsIcon-40px@2x.png">
                        <p v-show = 'getInviteNum() != 0' :class="getInviteNumClass()">{{getInviteNum()}}</p>
                        <div :class="getInviteRoomClass()">
                            <p class="department-name">{{$t("organization.departmentsListInvite")}}</p>
                        </div>
                        <div align="center" class="item-arrow">
                            <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </li>
                    <li :class='["department", {"active-tab": this.activeTab == "groupchat"}]'
                        @click="roomItemClick()">
                        <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Image/groupicon-40px@2x.png"><div class="department-info">
                            <p class="department-name">{{$t("organization.departmentsListGroupChat")}}</p>
                        </div>
                        <div align="center" class="item-arrow">
                            <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </li>
                    <li :class='["department", {"active-tab": this.activeTab == "department"}]'
                        @click="departmentMenuItemClicked(departmentMenu)">
                        <img ondragstart="return false" class="department-icon" src="../../../static/Img/Organization/Image/organization-40px@2x.png"><div class="department-info">
                            <p class="department-name">{{ departmentMenu.display_name }}</p>
                        </div>
                        <div align="center" class="item-arrow">
                            <img ondragstart="return false" class="right-arrow"  src="../../../static/Img/Organization/Common/right_arrow@2x.png">
                        </div>
                    </li>
                    <li class="contact"
                        v-for="contact in contactList"
                        @click="SearchContactItemClicked(contact.matrix_id)" 
                        @contextmenu="rightClick($event, contact)"
                        :key="contact.matrix_id">
                        <img ondragstart="return false" class="contact-icon" :id="getSearchUserIconId(contact.matrix_id)" src="../../../static/Img/User/user-40px@2x.png" onerror = "this.src = './static/Img/User/user-40px@2x.png'">
                        <div class="contact-list-info">
                        <p v-html="msgContentHightLight(contact.display_name)" class="contact-list-name">{{ contact.display_name }}</p>
                        <p class="contact-list-titile">{{ GetContactTitle(contact) }}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </el-aside>
        <el-container class="right-container">
            <organizationList  v-show='bOrganizeShow' :parentInfo="rootDepartment" :currentDepartment="currentDepartment" ></organizationList>
            <!-- <contactList v-if='bContactShow' :parentInfo="currentDepartment" :key = 'contactListKey'></contactList> -->
            <contactRoomList v-if='bContactRoomShow' :parentInfo="currentDepartment" :key = 'contactListKey'>
            </contactRoomList>
            <inviteRoomList v-show = 'bInviteRoomShow' :key = 'inviteRoomKey'></inviteRoomList>
        </el-container>
        <userInfoContent :userInfo="searchUserInfo" :isOwn="isOwn" :originPosition="searchUserInfoPosition" v-if="showSearchUserInfoTips" :key="searchUserInfoKey" :userType="contactType"></userInfoContent> 
        <div class="win-header">
            <winHeaderBar @Close="Close" @Min="Min" @Max="Max"></winHeaderBar>
        </div>
        <AlertDlg :AlertContnts="alertContents" v-show="showAlertDlg" @closeAlertDlg="CloseAlertDlg" @clearCache="ClearCache"/>
        <addContact v-if="showChatContactDlg" @closeAddContactDlg='closeAddContactDlg' @showInputContact="HandleInputContact"></addContact>
        <InputContactInfo v-if='showInputContactDlg' @closeInputContact="CloseInputContactDlg">
        </InputContactInfo>
    </el-container>
</template>
<script>

import {environment} from '../../packages/data/index.js';
import {Contact, ContactRoom, Department, UserInfo} from '../../packages/data/sqliteutil.js';
import organizationList from './organization-list';
import contactList from './contact-list'
import contactRoomList from './contact-room'
import inviteRoomList from './invite-room'
import userInfoContent from './user-info';
import winHeaderBar from './win-header-login.vue';
import {ComponentUtil} from '../script/component-util.js'
import '../style/organise.css'
import {ipcRenderer, remote} from 'electron'
const {Menu, MenuItem} = remote;
import AlertDlg from './alert-dlg.vue'
import addContact from './add-contact';
import InputContactInfo from './input-contact-info';
import eSearch from './searchbar.vue'

export default {
    name: 'organization',
    props: {
        receiveSearchKey: {
            type: String,
            default: ''
        },
        organizationClick:{
            type: Number,
            default: 0
        }
    },
    watch: {
        organizationClick: function(){
            global.services.common.GetAllContact().then(async() => {
                this.UpdateContact();
            }) 
            this.contactListKey++;
            this.inviteRoomKey++;
        },

        receiveSearchKey: function() {
            console.log("can search is ", this.canSearch);
            if(this.canSearch) {
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.searchKey = this.receiveSearchKey;
                        this.search();
                        console.log("searchKey ", this.searchKey)
                    }, 1000)
                })
            }
        }
    },
    data() {
        return {
            organizeMenuName : '',
            contactMenuName: '',
            bOrganizeShow: false,
            bContactRoomShow: false,
            canSearch: false,
            departments: [],
            isOwn: false,
            dialogVisible: false,
            usersSelected: [],
            rootDepartment:{},
            currentDepartment: {},
            organizationListTimer: '',

            searchKey:'',
            searchUsers: [],
            searchContacts:[],
            searchDeparements: [],
            searchRooms: [],
            showSearchView: false,
            showSearchUserInfoTips: false,
            searchUserInfo:{},
            searchUserInfoKey: 0,
            searchUserInfoPosition:{},
            contactType:"organise",
            contactListKey: 0,
            inviteRoomKey: 0,
            bInviteRoomShow: false,
            contactList: [],
            departmentMenu:{
                display_name: this.$t("organizeMenuName")
            },
            contactMenu:{
                display_name: this.$t("contactMenuName")
            },
            rootDepartmentID: '',
            myMatrixId: '',
            myDoman:'',
            showAlertDlg: false,
            alertContents: {},
            showChatContactDlg: false,
            showInputContactDlg: false,
            cleanSearchKey: false,
            activeTab: ''
        }
    },
    methods: {  
        getInviteRoomClass: function(){
            if(this.getInviteNum() == 0)
                return 'inviteroom-info-zeroinvite';
            return 'inviteroom-info';
        },

        UpdateContact: async function(){
            this.contactList = await Contact.GetAllContact();
            this.$nextTick(function(){
                    this.contactList.forEach(item => {
                        this.getUserImg(item, 'contact')
                    })
            });
        },

        getInviteNumClass() {
            let count = this.getInviteNum();
            if(count > 99) {
                return "group-unread-99";
            }
            else {
                return "group-unread";
            }
        },

        getInviteNum(){
            return this.$store.getters.getInviteRoomsNum();
        },
        
        CloseInputContactDlg: async function(){
            this.showInputContactDlg = false;
            this.contactList = await Contact.GetAllContact();
            this.$nextTick(function(){
                this.contactList.forEach(item => {
                    this.getUserImg(item, 'contact')
                })
            });
        },

        HandleInputContact: async function(){
            this.showChatContactDlg = false;
            this.showInputContactDlg = true;
            this.UpdateContact();
        },

        AddContact(){
            this.showChatContactDlg = true;
            this.showInputContactDlg = false;
        },

        closeAddContactDlg: async function(){
            this.showChatContactDlg = false;
            this.showInputContactDlg = false;
            this.UpdateContact();
        }, 

        rightClick(e, contact) {
            this.menu = new Menu();
            this.menu.append(new MenuItem({
                    label: "删除",
                    click: () => {
                        this.DeleteContact(contact);
                    }
                })); 
            this.menu.popup(remote.getCurrentWindow());
        },
        CloseAlertDlg: function(){
            this.showAlertDlg = false;
        },

        ClearCache: async function(){
            this.showAlertDlg = false;
            let ret = await global.services.common.DeleteContact(this.deleteContact.matrix_id)
            if(ret){
                for(let index in this.contactList){
                    if(this.contactList[index].matrix_id == this.deleteContact.matrix_id){
                        this.contactList.splice(index, 1);
                        return;
                    }
                }
            }
        },

        DeleteContact(contact){
            this.deleteContact = contact;
            this.showAlertDlg = true;
            this.alertContents = {
                "Details": this.$t("DeleteContactAlertTitle") + ' ' + contact.display_name + ' ?',
                "Abstrace": this.$t("DeleteContactAlertDetail")
            }
        },

        GetContactTitle: function(user){
            let userDoman = ComponentUtil.GetDomanName(user.matrix_id);
            if(userDoman == this.myDoman)
                return user.title;
            let usertitle = '';
            if(user.company && user.company.length != 0)
                usertitle = user.company + " ";
            usertitle += user.title;
            return usertitle;
        },

        Close: function() {
            ipcRenderer.send("win-close");
        },
        Min: function() {
            ipcRenderer.send("win-min");
        },
        Max: function() {
            ipcRenderer.send("win-max");
        },
        isWindows() {
            return environment.os.isWindows;
        },

        search:async function (searchKey) {
            this.searchKey = searchKey;
            console.log("this.searchKey ", this.searchKey)
            if (this.searchKey == ''){
                this.showSearchView = false;
                return;
            }
            this.searchDeparements = await Department.SearchByNameKey(this.searchKey);
            this.searchUsers = await UserInfo.SearchByNameKey(this.searchKey);
            this.searchContacts = await Contact.SearchByNameKey(this.searchKey);
            let allContactRooms = await ContactRoom.GetAllRooms();
            this.searchRooms = [];
            allContactRooms.forEach(item => {
                let room = this.matrixClient.getRoom(item.room_id);
                if(!room)
                    return;
                item.name = room.name;
                if(room.name.indexOf(this.searchKey) == -1)
                    return;
                var RoomAvatar = room.getAvatarUrl(this.matrixClient.getHomeserverUrl(), null, null, undefined, false);
                
                if(RoomAvatar)
                    item.avatar_url = RoomAvatar;
                else
                    item.avatar_url = './static/Img/User/group-40px@2x.png';
                this.searchRooms.push(item);
            })
            
            this.showSearchView = true;
            this.$nextTick(function(){
                this.searchContacts.forEach(item => {
                    this.getUserImg(item, 'contact')
                })

                this.searchUsers.forEach(item => {
                    this.getUserImg(item, 'organise')
                })

                this.searchDeparements.forEach(item => {
                    this.getDepartmentImage(item);
                })
            });
        },
        getSearchUserIconId(id){
            return 'search' + id;
        },

        getContactIconId(id){
            return 'contact' + id;
        },

        getDepartmentImage: async function(department){
            if(department.parent_id != this.rootDepartmentID) return;

            let element = document.getElementById(this.getSearchUserIconId(department.department_id));
            element.setAttribute('src', './static/Img/Organization/Image/department-40px@2x.png')
        },

        getUserImg: async function (userInfo, type){
            //console.log("userinfo-tip getuserimg this.userInfo ", this.userInfo);
            if(userInfo == null || userInfo.matrix_id == undefined) {
                return "";
            }
            global.mxMatrixClientPeg.matrixClient.getProfileInfo(userInfo.matrix_id).then(profileInfo => {
                if(!profileInfo.avatar_url) return;
                let userIconElement;
                if(type == 'contact'){
                    userIconElement = document.getElementById(this.getSearchUserIconId(userInfo.matrix_id));
                    if(userInfo.display_name.length == 0)
                        userInfo.display_name = ComponentUtil.GetDisplayName(profileInfo.displayname, userInfo.matrix_id);
                }
                else 
                    userIconElement = document.getElementById(this.getSearchUserIconId(userInfo.user_id));
                let validUrl = global.mxMatrixClientPeg.matrixClient.mxcUrlToHttp(profileInfo.avatar_url);
                if(userIconElement)
                    userIconElement.setAttribute("src", validUrl);
                    
                if(this.$store.getters.getAvater(userInfo.user_id) == validUrl) {
                    return;
                }
                var userToAvaterInfo = [userInfo.user_id, validUrl];
                this.$store.commit("setAvater", userToAvaterInfo);
            }).catch(e => {
                console.log("error: ",userInfo)
                console.log(e)
            });
        },

        searchRoomItemClicked: function(room_id){
            this.$router.push(
            {
                name: 'ChatContent', 
                params: {
                    group_id: room_id
                }
            })
        },

        searchDeparmentItemClicked: async function(id){
            let department = await Department.GetDepartmentInfoByDepartmentID(id);
            if(!department)
                return;
            this.showSearchView = false;
            this.showSearchUserInfoTips = false;
            this.bOrganizeShow = true;
            this.bContactRoomShow = false;
            this.rootDepartment = this.departments[0];
            this.currentDepartment = department;
        },

        GetUserinfo: async function(id, userType){
            if (this.showSearchUserInfoTips && (this.searchUserInfo.matrix_id == id)){
                    this.showSearchUserInfoTips = false;
                    return;
            }
            
            var iconElement = document.getElementById(this.getSearchUserIconId(id));
            this.searchUserInfoPosition.left = iconElement.getBoundingClientRect().left;
            this.searchUserInfoPosition.top = iconElement.getBoundingClientRect().top;
            console.log(iconElement.getBoundingClientRect());
            var tempUserInfo = {};
            //get userinfo
            var selfUser = await global.services.common.GetSelfUserModel();
            console.log("is owner is ", this.isOwn);
            if(selfUser && id == selfUser.id) {
                this.isOwn = true;
            }
            var user;
            if(userType == 'contact')
            {
                tempUserInfo = await ComponentUtil.ShowContactInfo(id);
            }
            else
            {
                tempUserInfo = await ComponentUtil.ShowOrgInfoByUserID(id);
            }
            this.searchUserInfo = tempUserInfo;
            this.searchUserInfoKey ++;
            this.showSearchUserInfoTips = true;
            this.contactType = userType;
        },

        SearchContactItemClicked: async function(id){
            await this.GetUserinfo(id, 'contact')
        },

        searchUserMenuItemClicked:async function(id) {
            await this.GetUserinfo(id, 'organise');
        },
        getOrganizationBaseData:async function() {
            var departments = [];
            departments.push({
                display_name: this.$t("organizeMenuName"),
            });
            departments.push({
                display_name: this.$t("contactMenuName")
            })
            this.departments = departments;
            this.currentDepartment = this.departments[0];
            this.organizationListTimer = new Date().getTime();
            let root = await Department.GetRoot();
            this.rootDepartmentID = root.department_id;
        },
        
        roomItemClick(){
            this.activeTab = "groupchat"
            this.bOrganizeShow = false;
            this.bContactRoomShow = true;
            this.bInviteRoomShow = false;
            this.contactListKey++;
        },

        inviteRoomItemClick(){
            this.activeTab = 'invite'
            this.bOrganizeShow = false;
            this.bContactRoomShow = false;
            this.bInviteRoomShow = true;
            this.inviteRoomKey++;
        },

        departmentMenuItemClicked(department) {
            this.activeTab = 'department'
            if(department.display_name == this.organizeMenuName){
                //组织架构模板
                this.bOrganizeShow = true;
                this.bContactRoomShow = false;
                this.bInviteRoomShow = false;
            }
            else if(department.display_name == this.contactMenuName){
                //联系人模板
                this.bOrganizeShow = false;
                this.bContactRoomShow = false;
                this.bInviteRoomShow = false;
                this.contactListKey++;
             }
            this.currentDepartment = department;
            this.organizationListTimer = new Date().getTime();
        },

        recentUsersMenuItemClicked:async function() {
            this.dialogVisible = true;
        },
        msgContentHightLight: function(curMsg) {
            var showContent = curMsg;
            // showContent = showContent + ' ';
            if(this.searchKey.length == 0) {
                return showContent
            }
            if(showContent.indexOf(this.searchKey) != -1) {
                let splitValue = showContent.split(this.searchKey);
                let newInnerHtml = splitValue.join('<span style="color:rgba(36, 179, 107, 1);">' + this.searchKey + "</span>");
                return newInnerHtml;
            }else{
                let splitValue = showContent.split('');
                let newInnerHtml = splitValue.join('<span style="color:red;">' + '' + "</span>");
                return newInnerHtml;
            }
        },
        compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        }
    },
    components: {
        organizationList,
        eSearch,
        userInfoContent,
        winHeaderBar,
        contactList,
        contactRoomList,
        AlertDlg,
        addContact,
        InputContactInfo,
        inviteRoomList
    },

    created:async function() {
        this.matrixClient = global.mxMatrixClientPeg.matrixClient;
        this.organizeMenuName = this.$t("organizeMenuName"),
        this.contactMenuName = this.$t("contactMenuName"),
        this.myMatrixId = localStorage.getItem("mx_user_id");
        this.myDoman = ComponentUtil.GetDomanName(this.myMatrixId);
        console.log("to get organization");
        await this.getOrganizationBaseData();
        await this.UpdateContact();

        document.addEventListener('click',(e) => {
            if(e.target.className.indexOf('userInfo') == -1){
                this.showSearchUserInfoTips = false;
                this.UpdateContact();
            }
            
        });
        console.log("can search now");
        this.canSearch = true;
        if(this.receiveSearchKey.length != 0 ) {
            this.$nextTick(() => {
                setTimeout(() => {
                    this.searchKey = this.receiveSearchKey;
                    this.search();
                    console.log("searchKey ", this.searchKey)
                }, 1000)
            })
        }
    }
}
</script>

<style lang="scss" scoped>
// ::-webkit-scrollbar-track-piece {
//     background-color: #F1F1F1;
//     border-radius: 10px;
// }

// ::-webkit-scrollbar {
//     width: 8px;
//     height: 12px;
// }

// ::-webkit-scrollbar-thumb {
//     height: 50px;
//     background-color: #C1C1C1;
//     border-radius: 10px;
//     outline: none;
// }

// ::-webkit-scrollbar-thumb:hover {
//     height: 50px;
//     background-color: #A8A8A8;
//     border-radius: 10px;
// }

.active-tab.active-tab.active-tab{
    background-color: #dddddd;
}

::-webkit-scrollbar {
/*隐藏滚轮*/
display: none;
}
.list-header {
    width: 100%;
    height: 56px;
    //line-height: 56px;
    background-color: rgb(255, 255, 255);
    border: 0px;
    margin: 0px 0px 0px 0px;
    display: block;
    -webkit-app-region: drag;
}
* {
    -webkit-app-region: no-drag;
}

    .SearchInput {
        width: calc(100% - 55px);
        height: 34px;
        line-height: 34px;
        font-size: 14px;
        display: inline-block;
        padding: 0px;
        margin: 0px 0px 0px 0px;
    }

  .group-unread {
    position: relative;
    z-index: 1;
    display:inline-block;
    font-size: 10px;
    font-family: PingFangSC-Medium;
    color: rgb(255, 255, 255);
    top : -40px;
    margin-left: -15px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 14px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
  }

  .group-unread-99 {
    position: absolute;
    z-index: 1;
    display:inline-block;
    font-size: 10px;
    font-family: PingFangSC-Medium;
    color: rgb(255, 255, 255);
    margin-left: -15px;
    text-align: center;
    height: 14px;
    width: 14px;
    line-height: 9px;
    border-radius: 20px;
    background-color: rgba(228, 49, 43, 1);
  }

.chat-tool-invite-div {
    display: inline-block;
    margin-left: 8px;
}

.departmentsdiv{
    width: 100%;
    height: 90%;
    padding: 0;
    margin: 0;
    overflow: scroll;
}

.departments-list {
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0;
    list-style: none;
}
.department {
    height: 60px;
    //border-bottom: 1px solid rgba(221, 221, 221, 1);
    
}
.department:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
.department-icon {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin-left: 16px;
    margin-top: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
    border-radius: 50%;
}

.inviteroom-info-zeroinvite {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 99px);
    margin-left: -5px;
}

.inviteroom-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 99px);
    margin-left: -8px;
}

.department-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 99px);
}
.department-name {
    text-align: left;
    height: 20px;
    width: 180px;
    margin-top: 20px;
    margin-bottom: 20px;
    margin-left: 12px;
    font-size: 14px;
    line-height: 20px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    display: flex;
    place-items: center;
}
.item-arrow {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 20px;
}
.right-arrow {
    margin-left: 6.5px;
    margin-top: 23.5px;
    margin-right: 0px;
    margin-bottom: 23.5px;
    width: 7px;
    height: 13px;
}

.contact {
    height: 60px;
    //border-bottom: 1px solid rgb(221, 221, 221);
        .contact-icon {
            width: 40px;
            height: 40px;
            display: inline-block;
            margin-left: 16px;
            margin-top: 10px;
            margin-right: 0px;
            margin-bottom: 10px;
            border-radius: 4px;
            border-radius: 50%;
        }
    }
.contact:hover {
    height: 60px;
    background:rgba(243,244,247,1);
    box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
}
    

.search-view{
    width: 100%;
    height: 90%;
    padding: 0;
    margin: 0;
    overflow: scroll;
    .managers-list {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    //border-top: 1px solid rgb(221, 221, 221);
    .manager {
        height: 60px;
        //border-bottom: 1px solid rgb(221, 221, 221);
            .manager-icon {
                width: 40px;
                height: 40px;
                display: inline-block;
                margin-left: 16px;
                margin-top: 10px;
                margin-right: 0px;
                margin-bottom: 10px;
                border-radius: 4px;
                border-radius: 50%;
                object-fit:cover;
            }
        }
        .manager:hover {
            height: 60px;
            background:rgba(243,244,247,1);
            box-shadow:0px 0px 0px 0px rgba(221,221,221,1);
        }
    }
}
.manager-info {
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: calc(100% - 84px);
}

.el-header {
    height: 24px !important;
    padding: 0px;
    line-height: 24px;
}
.el-container {
    width: auto;
    height: 100%; 
       
    background-color: white; 
    .el-aside {
        width: 150px;
        overflow: hidden;
        border-right: 1px solid rgba(221, 221, 221, 1);
        display: block;
    }
    .right-container {
        width: 100%;
        height: 100%;  
        background-color: white; 
        border: hidden;
    }
}

    .searchDiv {
        margin-top: 12.5px;
        margin-bottom: 7.5px;
        text-align: left;
        width: 280px;
        height: 32px;
        border-right: none;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        display: inline-block;
    }
    .search-action{
        border: 1px solid rgb(221, 221, 221);
        border-left: none;
        margin: 12px 16px 12px 0px;
        text-align: left;
        width: 52px;
        height: 32px;
        display: inline-block;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
    }
    .search-delete{
        display: inline-block;
        height: 20px;
        width: 20px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .search-search{
        display: inline-block;
        height: 20px;
        width: 30px;
        font-size: 0px;
        margin: 6px 0px 6px 0px;
    }
    .icon-delete{
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 2px;
    }
    .icon-search {
        display: inline-block;
        float: right;
        height: 20px;
        line-height: 20px;
        margin-right: 8px;
        color: rgb(51, 51, 51);
    }
    
    .icon-search:hover {
        display: inline-block;
        color: rgb(255,204,102);
    }
    
    .search-input {
        display: inline-block;
        position: absolute;
        width: 208px;
        padding: 0;
        margin: 0px;
        height: 32px;
        outline:none;
        border: 0px;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        
        background-color: rgba(1, 1, 1, 0);

        font-weight:400;
        color:rgba(0,0,0,1);
        line-height:18px;
    }
</style>