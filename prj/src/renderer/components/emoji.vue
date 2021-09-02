<template>
    <div class="emojiDiv">
      <span class="emoji" v-for="(item, ind) in getItems()" :key="ind" >
        <span class="emoji" v-if = "ind % 2 && item !== '。' && hasFaceImg(item)" >
          <img class="emoji" :style="{fontSize: 1, paddingLeft: '1px', paddingRight: '1px', 'vertical-align': 'middle', width: '24px', height: '24px'}" :src = "getFaceImg(item)"></img>
        </span>
        <span class="emoji" v-else>{{item}}</span>
      </span>
      
    </div>
</template>

<script>
import {environment} from '../../packages/data/index.js'
import {faceUtils, emojiUnicodeRanges} from '../../packages/core/Utils.js'

export default {
    name: 'emoji',
    props: {
        text: {
          type: String,
          default: ''
        }
    },
    data() {
      return{
        fontSize: "18px",
      }
    },
    methods: {
      hasFaceImg(item){
        faceUtils.GetPointFaces();
        return faceUtils.hasFaceCode(item);
      },

      getFaceImg(item){
        faceUtils.GetPointFaceMap();
        return faceUtils.getFaceImg(item);
      },

      isWindows() {
        return environment.os.isWindows;
      },
      isLinux() {
        return environment.os.isLinux;
      },
      getItems() {
        if(this.isWindows()) {
          this.fontSize = "18px";
        }
        else if(this.isLinux()) {
          this.fontSize = "18px";
        }
        else {
          this.fontSize = "22px";
        }
      
        let codedText = this.text.replace(new RegExp(emojiUnicodeRanges.join('|'), 'g'), function(emoji){
            return `%-special-code-%${emoji}%-special-code-%`
          });
        return codedText.split('%-special-code-%');
      },
    }
}
</script>

<style lang="scss" scoped>
</style>