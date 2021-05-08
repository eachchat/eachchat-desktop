<template>
    <div class = "ScreenShotLayers" id = "addEventListenerID">
        <canvas id="desktop-canvas" class = "ScreenShotCanvasStyle"></canvas>
        <canvas id="shot-canvas" class = "ShotCanvasStyle"></canvas>
    </div>
</template>

<script>
const {desktopCapturer, ipcRenderer, shell} = require('electron')
const {screen} = require('electron').remote

export default {
    name:'screenShotDlg',
    data(){
        return{
            screenSize:{},
            beginPoint:{},
            endPoint:{},
            shotCanvas: undefined
        }
    },

    methods:{
        mouseDown(e){
            this.beginPoint.x = e.clientX;
            this.beginPoint.y = e.clientY;
            console.log("keydown")
        },

        mouseUp(e){
            this.endPoint.x = e.clientX;
            this.endPoint.y = e.clientY;
            console.log("keyup")
            let ctx = this.shotCanvas.getContext("2d");
            ctx.rect(this.beginPoint.x, this.beginPoint.y, this.endPoint.x, this.endPoint.y);
            ctx.strokeStyle="red";
            ctx.stroke();
        },

        mouseMove(e){
            //console.log("move")

        },

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
        },

        addScreenShotEventListen(){
            //let screenLayer = document.getElementById("desktop-canvas");
            document.addEventListener("mousedown", this.mouseDown);
            document.addEventListener("mouseup", this.mouseUp);
            document.addEventListener("mousemove", this.mouseMove);
        }
    },

    mounted(){
        console.log("screenshot mount")
        this.addScreenShotEventListen();
        this.shotCanvas = document.getElementById('desktop-canvas');
        //return;
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
        z-index:11;
    }

    .ScreenShotCanvasStyle{
        height: 100%;
        width: 100%;
        border:1px solid #d3d3d3;
        z-index: 12
    }
    .ShotCanvasStyle{
        height: 100%;
        width: 100%;
        z-index: 13;
    }
</style>