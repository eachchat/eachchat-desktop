<template>
    <div class="emojiDiv">
      <span class="emoji" v-for="(item, ind) in getItems()" :key="ind" >
        <span class="emoji" v-if = "hasFaceCode(item)" >
          <span class="emoji" :style="{fontSize: fontSize, 'vertical-align': 'middle', width: '24px', height: '24px'}" >{{item}}</span>
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
      hasFaceCode(facecode){
        return faceUtils.hasFaceCode(facecode);
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