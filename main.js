// require('update-electron-app')({
//     logger: require('electron-log')
// })

const path = require('path')
const electron = require('electron')
const {app, BrowserWindow, ipcMain} = require('electron')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('·')

let mainWindow = null

ipcMain.on('app', (event, arg) => {
    switch (arg) {
        case 'quit':
            mainWindow.close();
            break;
        case 'max':
            if(mainWindow.isMaximized()){
                mainWindow.restore();
            }else{
                mainWindow.maximize();
            }
            break;
        case 'min':
            mainWindow.minimize();
            break;
    }
})

function initialize () {
    makeSingleInstance()

    function createWindow () {
		let size = electron.screen.getPrimaryDisplay().workAreaSize
		let width = parseInt(size.width * 0.71)
		let height = parseInt(width / (1920/1080))

        const windowOptions = {
            width: width,
            minWidth: width,
            height: height,
            minHeight: height,
            title: app.getName(),
            webPreferences: {
                nodeIntegration: true
            },
			titleBarStyle: 'hidden',
			autoHideMenuBar:true,
            frame:false,
			resizable: false
        }
        if (process.platform === 'linux') {
            windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
        } else {
            windowOptions.icon = path.join(__dirname, './logo.png')
        }

        mainWindow = new BrowserWindow(windowOptions)
        mainWindow.loadURL(path.join(__dirname, 'www/index.html'))

        // Launch fullscreen with DevTools open, usage: npm run debug
        if (debug) {
            mainWindow.webContents.openDevTools()
            mainWindow.maximize()
            require('devtron').install()
        }

        mainWindow.on('closed', () => {
            mainWindow = null
        })
    }

    app.on('ready', () => {
        createWindow()
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow()
        }
    })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
    if (process.mas) return

    app.requestSingleInstanceLock()

    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}


initialize()
