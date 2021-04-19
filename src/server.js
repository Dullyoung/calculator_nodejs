var KOA = require("koa")
const router = require("koa-router")
const koa = new KOA();
const bodyParser = require('koa-bodyparser')
const statics = require("koa-static")
const path = require('path')
const views = require("koa-views")
const {app, BrowserWindow} = require('electron')
var ipc = require('electron').ipcMain

let work = require("./work")

let rootRouter = new router()

rootRouter.post("/add", async (ctx) => {
    var a = ctx.request.body.a;
    var b = ctx.request.body.b;
    let result = work.add(a, b);
    ctx.body = {
        code: 0,
        data: result
    }
})
//await 需要后面的函数返回个promise对象 值就是 promise对象的处理结果 而不是promise
rootRouter.post("/sub", async (ctx) => {

    let a = ctx.request.body.a;
    let b = ctx.request.body.b;
    let result = work.sub(a, b);
    ctx.body = {
        code: 0,
        data: result
    }
})

rootRouter.post("/multiply", async (ctx) => {
    let a = ctx.request.body.a;
    let b = ctx.request.body.b;
    let result = work.multiply(a, b);
    ctx.body = {
        code: 0,
        data: result
    }
})

rootRouter.post("/divide", async (ctx) => {

    let a = ctx.request.body.a;
    let b = ctx.request.body.b;
    let result = work.divide(a, b);
    ctx.body = {
        code: 0,
        data: result
    }
})

koa.use(views(path.join(__dirname, 'view'), {
    extension: 'html'
}))

//指定开放的文件夹 __dirname表示当前文件夹
koa.use(statics(
    path.join(__dirname)
))

//use koa-bodyparser to resolve post
koa.use(bodyParser())

//使用双层路由是构造路由树形结构，可以不用 但是请求地址就要写全
// let router2 = new router();
// router2.use('/', index.routes(), index.allowedMethods())

koa.use(rootRouter.routes())

koa.listen(3000, () => {
    console.log("start at: http://127.0.0.1:3000")
});


function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        transparent: true,
        backgroundColor: '#ededed',
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('./view/main.html').then(value => {

    }).catch(reason => {
        console.log(reason)
    })
    win.webContents.on("did-finish-load", function () {
        win.webContents.send("send", "my name is title")
        win.webContents.openDevTools()
    })

    ipc.on('msg', (sys, msg) => {
        console.log(msg)//接收窗口传来的消息
        let title
        let send
        switch (msg) {
            case 'index':
                win.loadFile('view/main.html')
                title = 'i am index'
                send = true
                break
            case 'second':
                win.loadFile('view/second.html')
                title = 'i am second'
                send = true
                break
            case 'openDev':
                if (win.webContents.isDevToolsOpened()) {
                    win.webContents.closeDevTools()
                } else {
                    win.webContents.openDevTools()
                }
                break
            default:
                send = false
                break
        }
        if (send) {
            win.webContents.on("did-finish-load", function () {
                win.webContents.send("send", title)
            })
        }

    })
}

app.whenReady().then(value => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})