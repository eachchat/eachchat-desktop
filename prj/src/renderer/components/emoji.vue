<template>
    <div>
      <span class="emoji" v-for="(item, ind) in getItems()" :key="ind" :style="{fontSize: ind % 2 ? fontSize : null,
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
    data: {
      fontSize: "18px",
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
          '\ud83d[\ude80-\udeff]'
          ];
        let codedText = this.text.replace(new RegExp(ranges.join('|'), 'g'), function(emoji){
            return `%-special-code-%${emoji}%-special-code-%`
          });
        return codedText.split('%-special-code-%')
      },
    }
}
</script>

<style lang="scss" scoped>
</style>