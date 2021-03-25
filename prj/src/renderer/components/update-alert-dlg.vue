<template>
    <div class="UpgradeLayers" id="UpgradeLayersId">
        <UpgradeDlgStep1 v-if="step1" @continueUpgradeDlg="closeUpgradeDlg" :upgradeInfo="upgradeInfo"></UpgradeDlgStep1>
        <UpgradeDlgStep2 v-if="step2" :upgradeInfo="upgradeInfo"></UpgradeDlgStep2>
        <UpgradeDlgStep3 v-if="step3"></UpgradeDlgStep3>
    </div>
</template>

<script>
import UpgradeDlgStep1 from './update-alert-dlg-step1'
import UpgradeDlgStep2 from './update-alert-dlg-step2'
import UpgradeDlgStep3 from './update-alert-dlg-step3'

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
    },
    data () {
        return {
            step1: true,
            step2: false,
            step3: false
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
    watch: {}

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
