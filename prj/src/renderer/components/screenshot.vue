<template>
    <div class = "ScreenShotLayers">
        <canvas id="desktop-canvas" width="250" height="300" style="border:1px solid #d3d3d3;"></canvas>
    </div>
</template>

<script>
const {desktopCapturer, ipcRenderer, Cookies} = require('electron')
const {screen} = require('electron').remote

export default {
    name:'screenShotDlg',
    data(){
        return{
            screenSize:{}
        }
    },

    methods:{
        determineScreenShotSize () {
            const screenSize = screen.getPrimaryDisplay().workAreaSize
            const maxDimension = Math.max(screenSize.width, screenSize.height);
            this.screenSize.width = screenSize.width;
            this.screenSize.height = screenSize.height;

            return {
                width: maxDimension * window.devicePixelRatio,
                height: maxDimension * window.devicePixelRatio
            }
        },

        drowCanvas(imgData){
            let canvas = document.getElementById('desktop-canvas')
            canvas.width = this.screenSize.width
            canvas.height = this.screenSize.height
            canvas.style.width = this.screenSize.width+'px'
            canvas.style.height = this.screenSize.height+'px'
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let img = new Image();
            img.src = imgData;
            img.onload = () =>{
                ctx.drawImage(img, 0, 0);
            }
        },

        screenShot(){
            console.log("screenshot func")
            const thumbSize = this.determineScreenShotSize()
            let options = { types: ['screen'], thumbnailSize: thumbSize }

            desktopCapturer.getSources(options).then((sources) => {
                sources.forEach((source) => {
                    if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
                        let tmpbmp = source.thumbnail.toBitmap();
                        this.drowCanvas(tmpbmp);
                    }
                })
            })
        }
    },

    mounted(){
        console.log("screenshot mount")
        ipcRenderer.on("screenshot", this.screenShot)
        this.screenShot();
    },

    created(){

    }
}
</script>
<style>
    .ScreenShotLayers {
        height: 100%;
        width: 100%;
        position: fixed;
        top:0px;
        left:0px;
        background: rgba(0, 0, 0, 0.6);
        z-index:3;
    }
</style>