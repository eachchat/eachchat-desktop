<template>
    <div class="warnWrap" @click.self.stop="close">
        <div class="warnClot" >
            <div class="warnHeader">
                <img class="warnImg" src="../../../static/Img//Main/warn.png">
                <div style="margin-left:16px;">提示</div>
            </div>
            <div class="warnContent">
                是否开启端到端加密, 开启后将无法撤销
            </div>
            <div class="warnFooter">
                <div 
                    class="warnBtn" 
                    :class="{'warnBtnSubmit': !loading, 'warnBtnLoading': loading}"
                    @click.self.stop="submit"                    
                >确定</div>
                <div 
                    class="warnBtn warnBtnCancel"
                    @click.self.stop="close"
                >取消</div>
            </div>
        </div>
    </div>
</template>

<script>
const E2EE_WK_KEY = "io.element.e2ee";
const E2EE_WK_KEY_DEPRECATED = "im.vector.riot.e2ee";
import DMRoomMap from '../../packages/data/DMRoomMap.js'
import { mapState, mapActions } from 'vuex';
import * as Rooms from "../../packages/data/Rooms";
import * as RoomUtil from '../script/room-util';
import {Contact, Department, UserInfo} from '../../packages/data/sqliteutil.js';

const OPTS = {
    limit: 200,
};
export default {
    name: 'encryWarn',
    props: ['room'],
    data () {
        return {
            loading: false
        }
    },
    timer: null,
    methods: {
        close() {
            this.$emit('close')
        },
        submit() {
            if (this.loading) return;
            console.log('encry room++++++', this.room)
            const roomId = this.room.roomId;
            const client = window.mxMatrixClientPeg.matrixClient;
            client.sendStateEvent(roomId,  "m.room.encryption", { algorithm: "m.megolm.v1.aes-sha2" }).then(()=>{
                this.loading = false;
                this.$emit('close', true)
            }).catch((e) => {
                console.error(e);
                alert('失败')
                this.loading = false;
            });
        }
    },
    components: {
    },
    created() {
    },
    mounted() {
    },
    watch: {
        
    },
    computed: {
       
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
    .warnWrap {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }
    .warnClot {
        width: 440px;
        height: 180px;
        box-sizing: border-box;
        padding: 32px;
        padding-bottom: 20px;
        position: absolute;
        top: 60px;
        left: 50%;
        margin-left: -220px;
        background: #fff;
    }
    .warnHeader {
        display: flex;
        align-items: center;
    }
    .warnImg {
        height: 24px;
        width: 24px;
    }
    .warnTitle {
        height: 22px;
        font-size: 16px;
        color: #000;
        margin-left: 16px;
    }
    .warnContent {
        height: 20px;
        font-size: 14px;
        display: flex;
        align-items: center;
        margin-top: 12px;
        margin-left: 36px;
    }
    .warnFooter {
        display: flex;
        flex-direction: row-reverse;
        margin-top: 40px
    }
    .warnBtn {
        width: 100px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 20px;
    }
    .warnBtnCancel {
        background: #FFFFFF;
        border: 1px solid #DDDDDD;
        color: #000;
    }
    .warnBtnSubmit {
        background: #24B36B;
        border: 1px solid #24B36B;
        color: #fff;
    }
    .warnBtnLoading {
        background: #A7E0C4;
        border: 1px solid #A7E0C4;
        color: #fff;
    }
</style>
