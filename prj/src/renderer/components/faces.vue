<template>
    <div>
        <ul class="faces">
            <li v-for="item in faceList" :style="{
              fontSize: isMac() ? '22px' : '18px'
            }">
                <img style = "width:24px; height:24px;" :src="getFaceImg(item)" @click="insertFace(item)"/>
                <!-- <div v-html="item" :title="item" @click="insertFace(item)"></div> -->
            </li>
        </ul>
    </div>
</template>
<script>
import {faceUtils} from '../../packages/core/Utils.js'
import {environment} from '../../packages/data/index.js'

export default {
  name: 'faces',
  components: {},
  data() {
    return {
      faceList: faceUtils.GetPointFaces(),
      faceMap: faceUtils.GetPointFaceMap()
    };
  },
  methods: {
    getFaceImg(item){
      return this.faceMap.get(item);
    },

    isMac() {
      return environment.os.isOSX;
    },
    insertFace: function(item) {
      this.$emit('insertFace', item);
    }
  }
};
</script>

<style scoped lang="scss">
.faces {
  width: 310px;
  list-style: none;
  background-color: white;
  display: block;
  padding: 0 14px 0 14px;
  & > li {
    width: 20px !important;
    height: 20px !important;
    display: inline-block;
    padding: 9px;
    cursor: pointer;
    & > div {
      width: 100%;
      height: 100%;
      line-height: 100%;
    }
  }
}
</style>
