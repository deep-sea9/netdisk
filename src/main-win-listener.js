import {ipcMain} from 'electron'

export const registerEvent = mainWin => {

    ipcMain.on('minimize-main', () => {
        mainWin.minimize()
    })
    ipcMain.on('maximize-main', () => {
        mainWin.maximize()
    })
    ipcMain.on('restore-main', () => {
        mainWin.restore()
    })
    ipcMain.on('close-main', (e) => {
        // mainWin.close()
        mainWin.destroy()
    })
}
