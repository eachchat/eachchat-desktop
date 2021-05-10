<template>
    <div>
        <span class="linkify" v-for="(item, ind) in getItems()" :key="ind" :style="{ 
          color: ind % 2 ? color : null, 
          cursor: ind % 2 ? 'pointer' : null,
          textDecoration: ind % 2 ? textDecoration : null,
        }"  @click="() => {
            if (ind %2) {
              openUrl(item)
            }
          }">{{item}}</span>
    </div>
</template>

<script>
import { ComponentUtil } from '../script/component-util'
export default {
    name: 'linkify',
    props: {
        text: {
          type: String,
          default: ''
        },
        color: {
          type: String,
          default: ''
        },
        textDecoration: {
          type: String,
          default: ''
        },
    },
    data: {
    },
    methods: {
       getItems() {
          let codedText = this.text.replace(ComponentUtil.hightLightReg, function(link){
          return `%-special-code-%${link}%-special-code-%` 
          })
          return codedText.split('%-special-code-%')
       },
       openUrl(url) {
         openUrl(url)
       },
    }
}
</script>

<style lang="scss" scoped>

</style>