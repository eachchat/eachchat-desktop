<template>
    <div>
        <span v-for="(item, ind) in getItems()" :key="ind" :style="{ 
          color: ind % 2 ? color : null, 
          cursor: ind % 2 ? 'pointer' : null,
          textDecoration: ind % 2 ? textDecoration : null,
        }"  @click="() => {
            if (ind %2) {
              openUrl(item)
            }
          }">
          {{
            item
          }}
        </span>
    </div>
</template>

<script>
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
          let codedText = this.text.replace(/((?:(http|https|Http|Https|rtsp|Rtsp|ftp|Ftp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?(?:(([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]){0,1}\.)+[a-zA-Z]{2,63}|((25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9]))))(?:\:\d{1,5})?)((?:\/(?:(?:[a-zA-Z0-9 -퟿豈-﷏ﷰ-￯\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))+[\;\.\=\?\/\+\)][a-zA-Z0-9\%\#\&\-\_\.\~]*)|(?:\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*))?(?:\b|$|(?=[ -퟿豈-﷏ﷰ-￯]))/g, function(link){
          return `%-special-code-%${link}%-special-code-%` 
          })
          return codedText.split('%-special-code-%')
       },
       openUrl(url) {
         openUrl(url)
       }
    }
}
</script>

<style lang="scss" scoped>

</style>