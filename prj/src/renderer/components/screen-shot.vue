<template>
    <div>

    </div>
</template>

<script>
const {desktopCapturer, shell} = require('electron')
const {screen} = require('electron').remote
const fs = require('fs')
const os = require('os')
const path = require('path')

export default {
    name:'screenShotDlg',
    data(){
        return{

        }
    },

    methods:{
        determineScreenShotSize () {
            const screenSize = screen.getPrimaryDisplay().workAreaSize
            const maxDimension = Math.max(screenSize.width, screenSize.height)
            return {
                width: maxDimension * window.devicePixelRatio,
                height: maxDimension * window.devicePixelRatio
            }
        }
    },

    mounted(){
        const thumbSize = this.determineScreenShotSize()
        let options = { types: ['screen'], thumbnailSize: thumbSize }

        desktopCapturer.getSources(options).then((sources) => {
            sources.forEach((source) => {
                if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
                    const screenshotPath = path.join(os.tmpdir(), 'screenshot.png')
                    let tmpPhoto = source.thumbnail.toPNG();
                    console.log("getfile")
                    //fs.writeFile(screenshotPath, source.thumbnail.toPNG(), (error) => {
                    //if (error) return console.log(error)
                    //shell.openExternal(`file://${screenshotPath}`)
                    //})
                }
            })
        })
    },

    created(){

    }
}
</script>
<style>

</style>