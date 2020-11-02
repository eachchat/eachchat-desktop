<template>
    <div class="mx-setting-dialog" id="tip_alertModal">
        <div class="inner-wrap">
            <div class="title">{{title}}</div>
            <div class="close" @click.stop="close">x</div>
            <div>{{content}}</div>
             <div class="submit-field">
                <div class="button" @click.stop="confirm">确定</div>
                <div class="button" @click.stop="cancel">取消</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'warningDlg',
    data () {
        return {
            show: true, // 通过这个属性，控制是否移除dom元素
            title:'', //顶部标题
            content:'', // 内容
            cancelBtn: false // 取消按钮

        }
    },
    props: ['roomId'],
    puborprtTimer: null,
    methods: {
        close() {
            // 右上角关闭
            this.a_close && this.a_close();
            this.show = false;
            // 删除判断增加的window属性
            delete window.alertIsShow;
        },
        confirm() {
            // 确定
            this.a_confirm && this.a_confirm();
            this.show = false;
            // 删除判断增加的window属性
            delete window.alertIsShow;
        },
        cancel() {
            // 取消
            this.a_cancel && this.a_cancel();
            this.show = false;
            // 删除判断增加的window属性
            delete window.alertIsShow;
        }
    },
    watch: {
        show(cur, old) {
            // 通过监控data里的show属性  弹框有三个事件（右上角取消  确定按钮  取消按钮）
            // 每个事件写了 this.show = false
            // 当弹框出现的时候 点击任何一个事件  都会触发这里的监控事件  将页面上的弹框Dom移除
            if (cur === false) {
            let tip_alert = document.getElementById('tip_alertModal');
            tip_alert.parentNode.removeChild(tip_alert);
            }
        }
    },
    components: {
    },
    created: function () {     
    },
    mounted: function() {
    }
}
</script>

<style lang="scss" scoped>
    .mx-setting-dialog {
        position: fixed;
        left: 50%;
        top: 20px;
        margin-left: -200px;
        background-color: #f2f2f2;
        padding: 24px;
        border-radius: 16px;
        width: 400px;
        height: 240px;
        z-index: 99999;
        .inner-wrap {
            height: 100%;
            overflow-y: scroll;
            .title {
                font-size: 16px;
                font-weight: bolder;
                margin-bottom: 20px;
            }
            .close {
                position: absolute;
                top: 24px;
                right: 24px;
            }
            .setting-field {
                margin-bottom: 20px;
                font-size: 12px;
                .filed-title {
                    font-size: 16px;
                    margin-bottom: 12px;
                }
                .title-input {
                    height: 40px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .desc-text {
                    height: 120px;
                    width: 100%;
                    box-sizing: border-box;
                    resize: none;
                }
                .input-tip {
                    color:rgb(118, 118, 118);
                    font-size: 14px;
                }
            }
            .submit-field {
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                position: absolute;
                bottom: 44px;
                right: 24px;
                .button {
                    width: 100px;
                    height: 28px;
                    box-sizing: border-box;
                    border: .5px solid #000;
                    background-color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    margin-left: 28px;
                    border-radius: 4px;
                }
            }
        }
    }
</style>