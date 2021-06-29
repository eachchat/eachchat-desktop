<template>
    <div class="emojiDiv">
      <span class="emoji" v-for="(item, ind) in getItems()" :key="ind" :style="{fontSize: (ind % 2 && item !== '。') ? fontSize : null,
        paddingLeft: '1px', paddingRight: '1px'}">{{item}}</span>
    </div>
</template>

<script>
import {environment} from '../../packages/data/index.js'

export default {
    name: 'emoji',
    props: {
        text: {
          type: String,
          default: ''
        }
    },
    data() {
      return {
        fontSize: "18px",
      }
    },
    methods: {
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
        var ranges = [
          '\ud83c[\udf00-\udfff]', 
          '\ud83d[\udc00-\ude4f]', 
          '\ud83d[\ude80-\udeff]',
          '\ud83d[\udc00-\udec5]',
          '\ud83c[\udd70-\udf4e]',
          '\ud83d[\udc00-\udec5]|\ud83c[\udd70-\udf4e]', 
          '\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]', 
          '\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|[\u2000-\u2fff]',
          '(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])',
          /([\u{1F300}-\u{1F5FF}][\u{2000}-\u{206F}][\u{2700}-\u{27BF}]|([\u{1F900}-\u{1F9FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F600}-\u{1F64F}])[\u{2000}-\u{206F}][\u{2600}-\u{26FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F000}-\u{1F02F}]|[\u{FE00}-\u{FE0F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{0000}-\u{007F}][\u{20D0}-\u{20FF}]|[\u{0000}-\u{007F}][\u{FE00}-\u{FE0F}][\u{20D0}-\u{20FF}])$/u,
          /[\u{2100}-\u{214F}]|[\u{2000}-\u{206F}]|[\u{2460}-\u{24FF}]|[\u{0080}-\u{00FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]|[\u{2300}-\u{23FF}]|[\u{25A0}-\u{25FF}]|[\u{3000}-\u{303F}]|[\u{3200}-\u{32FF}]|[\u{2900}-\u{297F}]|[\u{2190}-\u{21FF}]/u
          ];

        let codedText = this.text.replace(new RegExp(ranges.join('|'), 'g'), function(emoji){
            return `%-special-code-%${emoji}%-special-code-%`
          });
        // console.log("emoji")
        // console.log(this.text)
        // console.log(codedText)
        return codedText.split('%-special-code-%')
      },
    }
}
</script>

<style lang="scss" scoped>
</style>