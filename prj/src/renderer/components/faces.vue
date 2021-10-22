<template>
    <div>
        <ul class="faces">
            <li v-for="item in faceList" :style="{
              fontSize: isMac() ? '22px' : '18px'
            }">
                <div v-html="item" :title="item" @click="insertFace(item)"></div>
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
    };
  },
  methods: {
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
::-webkit-scrollbar-track-piece {
        background-color: #F1F1F1;
        border-radius: 10px;
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-thumb {
        height: 50px;
        background-color: #C1C1C1;
        border-radius: 10px;
        outline: none;
    }

    ::-webkit-scrollbar-thumb:hover {
        height: 50px;
        background-color: #A8A8A8;
        border-radius: 10px;
    }
.faces {
  overflow-x: hidden;
  width: 315px;
  height: 350px;
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
