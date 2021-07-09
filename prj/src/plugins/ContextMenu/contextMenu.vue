<template>
    <div class="contextMenu" id="contextMenuId">
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
        height: 48px;
        background-color: rgba(255, 255, 255, 1);
        box-shadow: 0px 0px 12px 0px rgba(103, 103, 103, 0.14);
        border-radius: 4px;
        border: 1px solid rgba(103, 103, 103, 0.14);
    }

    .menuItem {
        padding: 7px 27px 7px 27px;
        height: 24px;
    }
</style>
