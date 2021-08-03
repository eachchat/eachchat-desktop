<template>
    <div class="contextMenu" id="contextMenuId" v-show="show">
        <ul class="menuList">
            <li class="menuItem"
                v-for="menuItem in menuItemList"
                @click="callback(menuItem)">
                {{menuItem.name}}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'ContextMenu',
    props: {
    },
    data () {
        return {
            show: false,
            menuItemList: undefined,
            distItem: undefined,
        }
    },
    methods: {
        callback: function(item) {
            console.log("====item ", item);
            console.log("====distItem ", this.distItem);
            item.func(this.distItem);
        }
    },
    components: {
    },
    created: async function () {
        console.log(this.menuItemList)
    },
    mounted: function() {
        console.log(this.menuItemList)
    },
    watch: {
    }
}
</script>

<style lang="scss" scoped>
    .contextMenu {
        position: absolute;
        background-color: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 12px 0px rgba(103, 103, 103, 0.14);
        border-radius: 4px;
        border: 1px solid rgba(103, 103, 103, 0.14);
        z-index: 4;
    }

    ul {
        display: block;
        list-style-type: disc;
        margin-block-start: 0;
        margin-block-end: 0;
        margin-inline-start: 0;
        margin-inline-end: 0;
        padding-inline-start: 0px;
    }

    .menuItem {
        margin: 0;
        padding: 7px 27px 7px 27px;
        height: 18px;
        list-style-type: none;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
        line-height: 18px;
        letter-spacing: 1px;
    }
    
    .menuItem:hover {
        margin: 0;
        padding: 7px 27px 7px 27px;
        height: 18px;
        list-style-type: none;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
        line-height: 18px;
        letter-spacing: 1px;
        background-color: #f7f8fa;
        cursor: pointer;
    }
</style>
