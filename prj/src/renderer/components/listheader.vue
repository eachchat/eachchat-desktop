<template>
    <div class="ListHeadBar">
        <div class="Search">
            <el-input placeholder="搜索..." 
                class="search-input"
                v-model="searchKey"
                size="small">
                <i slot="suffix" class="el-input__icon el-icon-search"></i>
            </el-input>
        </div>
        <el-dropdown class="new-chat-dropdown" trigger="click">
            <i class="el-icon-circle-plus-outline"></i>
            <el-dropdown-menu class="new-chat-content" slot="dropdown">
                <el-dropdown-item class="create-new-group" icon="el-icon-connection" @click.native="createGroup">
                创建群聊
                </el-dropdown-item>
                <!-- <el-dropdown-item class="create-new-secret" icon="el-icon-lock">
                进入密聊
                </el-dropdown-item> -->
            </el-dropdown-menu>
        </el-dropdown>
        <el-dialog title="发起聊天" :visible.sync="dialogVisible" width="70%" @close="handleDialogClose()">
            <div class="el-dialog-content">
                <chatGroupCreater :disable-users="disabledusers" ref="chatGroupCreater" @getCreateGroupUsersSelected="getUsersSelected">
                </chatGroupCreater>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button class="dialog-confirm-button" type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>        
    </div>
</template>


<script>
import chatGroupCreater from './chatgroup-creater';
export default {
    name: 'listHeadbar',
    data () {
        return {
            searchKey: '',
            dialogVisible: false,
            disabledusers: [this.$store.state.userInfo.id],
        }
    },
    methods: {
        createGroup: function(){
            console.log("this disabledusers is ", this.disabledusers)
            this.dialogVisible = true;
        },
        handleDialogClose() {
            this.$refs.chatGroupCreater.initData();
        },
        getUsersSelected(usersSelected) {
            this.usersSelected = usersSelected;
            
            this.$emit('getCreateGroupInfo', "123");
        }
    },
    components: {
        chatGroupCreater,
    },
    created: function () {
    }
}
</script>

<style lang="scss" scoped>
    .ListHeadBar {
        height: 56px;
        width: 280px;
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    } 

  .Search {
    display: inline-block;
    padding: 0px;
    margin: 10px 10px 0px 20px;
  }

  .new-chat-dropdown {
    font-size: 20px;
  }

  .new-chat {
    width: 100%;
    border: 0px;
    background-color: rgb(242, 242, 246);
    font-size: 28px;
    line-height: 44px;
  }

  .el-icon-circle-plus-outline {
    background-color: white;
    line-height: 32px;
    color: rgb(211, 211, 211)
  }

</style>
