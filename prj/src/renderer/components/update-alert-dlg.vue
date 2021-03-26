<template>
    <div class="UpgradeLayers" id="UpgradeLayersId">
        <UpgradeDlgStep1 v-show="step1" :step1 = "step1" @continueUpgradeDlg="closeUpgradeDlg" :upgradeInfo="upgradeInfo"></UpgradeDlgStep1>
        <UpgradeDlgStep2 v-show="step2" :step2 = "step2" @continueUpgradeDlg="closeUpgradeDlg" :upgradeInfo="upgradeInfo" @toStep3 = 'toStep3'></UpgradeDlgStep2>
        <UpgradeDlgStep3 v-show="step3" :step3 = "step3" @continueUpgradeDlg="closeUpgradeDlg" :upgradeFilePath = 'upgradeFilePath'></UpgradeDlgStep3>
    </div>
</template>

<script>
import UpgradeDlgStep1 from './update-alert-dlg-step1'
import UpgradeDlgStep2 from './update-alert-dlg-step2'
import UpgradeDlgStep3 from './update-alert-dlg-step3'
import {ipcRenderer} from 'electron'
export default {
    name: 'UpgradeDlg',
    props: {
        upgradeInfo: {
            type: Object,
            default: {
            }
        },
        canCancel: {
            type: Boolean,
            default: true
        },
        showUpgradeAlertDlg:{
            types: Boolean,
            default: true
        }
    },
    data () {
        return {
            step1: false,
            step2: false,
            step3: false,
            upgradeFilePath: ''
        }   
    },
    methods: {
        closeUpgradeDlg: function(ret) {
            if(ret) {
                this.step2 = true;
            }
            else{
                this.$emit("closeUpgradeDlg", '');
            }
            this.step1 = false;
        },
        toStep3(path){
            console.log("toStep3", path);
            this.upgradeFilePath = path;
            this.step2 = false;
            this.step3 = true;
        }
    },
    components: {
        UpgradeDlgStep1,
        UpgradeDlgStep2,
        UpgradeDlgStep3
    },
    created: function () {
  
    },
    mounted: function() {

    },
    watch: {
        showUpgradeAlertDlg: function(){
            if(this.showUpgradeAlertDlg){
                this.step1 = true;
                this.step2 = false;
                this.step3 = false;
            }
        }
    }

}
</script>

<style lang="scss" scoped>
    .UpgradeLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 3;
    }

 
 
</style>
