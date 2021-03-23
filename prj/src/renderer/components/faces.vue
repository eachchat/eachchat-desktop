<template>
    <div>
        <ul class="faces">
            <li v-for="item in faceList">
                <!-- <img :src="faceMap[item]" :alt="item" :title="item" @click="insertFace(item)"/> -->
                <div v-html="item" :title="item" @click="insertFace(item)"></div>
            </li>
        </ul>
    </div>
</template>
<script>
import {faceUtils} from '../../packages/core/Utils.js'
// const faceUtils = require('../server/Utils.js');

export default {
  name: 'faces',
  components: {},
  data() {
    return {
      faceList: faceUtils.alt,
      faceMap: faceUtils.faces()
    };
  },
  methods: {
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
  padding: 0 0 0 12px;
  & > li {
    width: 18px !important;
    height: 18px !important;
    display: inline-block;
    padding: 9px;
    font-size: 18px;
    cursor: pointer;
    & > img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
