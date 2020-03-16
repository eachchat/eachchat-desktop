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
                    <el-dropdown-item class="create-new-group" icon="el-icon-connection">
                    创建群聊
                    </el-dropdown-item>
                    <el-dropdown-item class="create-new-secret" icon="el-icon-lock">
                    进入密聊
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
    </div>
</template>


<script>
export default {
    name: 'listHeadbar',
    data () {
        return {
        }
    },
    methods: {
    },
    components: {
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
