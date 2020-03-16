<template>
    <div class="ChatHeadBar">
        <div class="Buttons">
            <button class="header-btn-close" @click="Close()">
                <i class="el-icon-close"></i>
            </button>
            <button class="header-btn-mini" @click="Min()">
                <i class="el-icon-minus"></i>
            </button>
        </div>
    </div>
</template>


<script>
export default {
    name: 'chatHeadbar',
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
    .ChatHeadBar {
        height: 20px;
        width: 100%;
        -webkit-app-region: drag;
    }
    * {
        
        -webkit-app-region: no-drag;
    }

    .Buttons {
        display: block;
        margin:0;
        float: right;
        height: 100%;
        width: 130px;
    }

    .header-btn-mini {
        display: inline-block;
        float: right;
        width: 30px;
        height: 20px;
        line-height: 20px;
        margin: 0px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }

    .el-icon-minus {
        width: 20px;
        height: 20px;
    }

    .header-btn-close {
        display: inline-block;
        float: right;
        width: 30px;
        height: 20px;
        line-height: 20px;
        margin: 0px;
        background-color: rgb(255, 255, 255);
        border: 0px;
    }
    
    .el-icon-close {
        width: 20px;
        height: 20px;
    }

</style>
