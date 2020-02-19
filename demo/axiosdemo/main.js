const {app, BrowserWindow} = require("electron")
const path = require("path")

var window

function CreateWindow()
{
    window = new BrowserWindow(
        {
            width: 800,
            height: 600,
            webPreferences :{
                nodeIntegration: true
            }
        }
    )

    window.loadFile("index.html")
}

app.on("ready", CreateWindow)

app.on("window-all-closed", function(){
    app.quit()
})


