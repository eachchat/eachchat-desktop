<template>
    <div class = "ScreenShotLayers">
        <canvas id="desktop-canvas" style="border:1px solid #d3d3d3;"></canvas>
    </div>
</template>

<script>
const {desktopCapturer, ipcRenderer, shell} = require('electron')
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
            const screenSize = screen.getPrimaryDisplay().size
            this.screenSize.width = screenSize.width;
            this.screenSize.height = screenSize.height;
            return {
                width: screenSize.width * window.devicePixelRatio,
                height: screenSize.height * window.devicePixelRatio
            }
        },

        drowCanvas(imgData){
            let canvas = document.getElementById('desktop-canvas')
            canvas.width = this.screenSize.width * window.devicePixelRatio;
            canvas.height = this.screenSize.height * window.devicePixelRatio;
            canvas.style.width = this.screenSize.width+'px'
            canvas.style.height = this.screenSize.height+'px'
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let img = new Image();
            img.src = imgData;
            img.onload = () =>{
                ctx.drawImage(img, 0, 0, this.screenSize.width * window.devicePixelRatio, this.screenSize.height * window.devicePixelRatio);
            }
            img.onerror = (e) =>{
                console.log(e)
            }
        },

        screenShot(){
            console.log("screenshot func")
            const thumbSize = this.determineScreenShotSize()
            let options = { types: ['screen'], thumbnailSize: thumbSize }

            desktopCapturer.getSources(options).then((sources) => {
                sources.forEach((source) => {
                    if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
                        let tmpbmp = source.thumbnail.toDataURL();
                        ipcRenderer.send("fullScreenMainWindow");
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
        z-index:3;
    }
</style>