<template>
    <div class="drawer" v-if="display">
        <div v-if="mask" class="mask"></div>
        <div :class="maskClass" @click="closeByMask()"></div>
        <div :class="mainClass" :style="mainStyle" class="main" >
            <div class="close-button" v-show="closable">
                <img class = "close-icon" src="../../../static/Img/Organization/Common/close_icon@2x.png"
                    @click="closeByButton()">
            </div>
            <slot/>
            
        </div>
    </div>
</template>

<script>
export default {
    name:'yi-drawer',
    props: {
    // 是否打开
        display: {
            type: Boolean
        },
        showTitle: {
            type: Boolean,
            default: false
        },
    // 标题
        title: {
            type: String,
            default: '标题'
        },

    // 是否显示关闭按钮
        closable: {
        type: Boolean,
            default: true
        },

    // 是否显示遮罩
        mask: {
            type: Boolean,
            default: true
        },

    // 是否点击遮罩关闭
        maskClosable: {
            type: Boolean,
            default: true
        },

    // 宽度
        width: {
            type: String,
            default: '336px'
        },

    // 是否在父级元素中打开
        inner: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        maskClass: function () {
            return {
                'mask-show': (this.mask && this.display),
                'mask-hide': !(this.mask && this.display),
                'inner': this.inner
            }
        },
        mainClass: function () {
            return {
                'main-show': this.display,
                'main-hide': !this.display,
                'inner': this.inner
            }
        },
        mainStyle: function () {
            return {
                width: this.width,
                right: this.display ? '0' : `-${this.width}`,
                borderLeft: this.mask ? 'none' : '1px solid #eee'
            }
        }
    },
    mounted () {
        if (this.inner) {
            let box = this.$el.parentNode
            box.style.position = 'relative'
        }
    },
    methods: {
        closeByMask () {
            this.maskClosable && this.$emit('update:display', false)
        },
        closeByButton () {
            this.$emit('update:display', false)
        }
    }
}
</script>

<style lang="scss" scoped>

.drawer {
    height: 100%;
    border-left: 1px solid rgb(221, 221, 221);
  /* 遮罩 */
.mask-show {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: rgba(221,0,0,.5);
    opacity: 1;
    transition: opacity .5s;
}
.mask-hide {
    opacity: 0;
    transition: opacity .5s;
}

  /* 滑块 */
.main {
    position: fixed;
    z-index: 10;
    top: 0;
    height: 100%;
    background: #fff;
    transition: all 0.5s;
}
.main-show {
    opacity: 1;
}
.main-hide {
    opacity: 0;
}

  /* 某个元素内部显示 */
.inner {
    position: absolute;
}

  /* 其他样式 */

}
.close-button {
    width: 20px;
    height: 20px;
    margin-top: 0px;
    margin-left: 300px;
}
.close-icon {
    width: 10px;
    height: 10px;
    text-align: center;
    vertical-align: middle;
}
</style>