const WebSocketServer = require('ws').Server

const { app, Notification } = require('electron')

const exec = require('child_process').exec

const shell = require('electron').shell;

const path = require('path')

const getDiskInfo = require('node-disk-info').getDiskInfo

const fs = require('fs')

const os = require('os')

const FormData = require('form-data')

const { downloadFile } = require('./api/client-api')

// const {serverHost} = require('./utils/constantly')
const serverHost = process.env["VUE_APP_BASE_URL"]


let tempPath = ''

fs.mkdtemp(`${os.tmpdir()}\\leadal-temp-`, (err, temp) => {
    if(err) {
        console.log('create temp folder err', err.toString());
    }else {
        tempPath = temp
        console.log(temp);
    }
})

let fileId, userId, fileName, filePath



const wss = new WebSocketServer({ port: 20997 })

wss.on('connection', (ws) => {
    console.log('client connection');

    const listenerFun = (curr, prev) => {
        console.log('mtime', curr.mtime, prev.mtime);

        if(curr.mtime === prev.mtime) {
            return
        }
        const notification = new Notification({
            title: '提示',
            body: `正在保存于${curr.mtime}时修改的内容并同步更新版本,请稍后...`
        })
        notification.show()

        let streamArray = Buffer.from([])
        const readStream = fs.createReadStream(filePath)

        readStream.on('open', (count) => {
            console.log('stream open - ', count);
        })
        readStream.on('error', (err) => {
            readStream.close()
            console.log('流文件打开失败...', err.toString());
        })

        readStream.on('data', (chunk) => {
            console.log('read chunk data...', chunk);
            streamArray = Buffer.concat([streamArray, chunk])
        })

        readStream.on('end', async () => {
            console.log('read end');
        })

        const formData = new FormData()
        formData.append('fileId', fileId)
        formData.append('userId', userId)
        formData.append('uploadFile', readStream)
        formData.submit(`${serverHost}/snap/upload`, (err,response) => {
            const body = []
            if(err) {
                console.log('error', err);
            }else {
                response.on('data', (chunk) => {
                    console.log('on data', chunk.toString());
                    body.push(chunk)
                })
                response.on('end', () => {
                    let resStr = Buffer.concat(body).toString()
                    // let resObj = JSON.parse(resStr)
                    console.log(resStr);

                    ws.send(JSON.stringify({
                        code: 1,
                        type: 'edit',
                        msg: '文件版本更新成功'
                    }))
                    notification.close()
                })
            }
        })
    }

    function watchFile(filePath) {
        fs.unwatchFile(filePath, listenerFun)
        shell.openPath(filePath).then((r) => {
            ws.send(JSON.stringify({
                code: 2, // 打开文件编辑
                type: 'edit',
                msg: '打开成功'
            }))
            fs.watchFile(filePath, listenerFun)
        })
    }

    if(process.platform === 'win32') {
        getDiskInfo().then(disks => {
            ws.send(JSON.stringify({
                code: 1,
                type: 'disk-info',
                data: disks
            }))
        }).catch(err => {
            ws.send({
                code: 0,
                type: 'disk-info',
                msg: err.toString()
            })
        })
    }

    ws.on('message', data => {

        const recieveData = JSON.parse(data.toString())

        console.log(data.toString());

        const todo = recieveData.cmd
        const disk = recieveData.disk
        const diskName = recieveData.diskName
        const ftpHost = recieveData.ftpHost
        const ftpPort = recieveData.ftpPort
        const userName = recieveData.userName
        const userPwd = recieveData.userPwd

        let mountCmd, unmountCmd, rCloneConfig, createEmptyDir;

        if(process.platform !== 'win32') {
            createEmptyDir = `sudo mkdir /mnt/${diskName}`
            mountCmd = `sudo curlftpfs -o rw,allow_other,uid=1000,gid=1000 ftp://${userName}:${userPwd}@${ftpHost}:${ftpPort} /mnt/${diskName}`
            unmountCmd = `sudo umount /mnt/${diskName}`
        }else {
            rCloneConfig = `rclone config create ${diskName} ftp host ${ftpHost} user ${userName} port ${ftpPort} pass ${userPwd}`
            mountCmd = `rclone mount -vv ${diskName}:/ ${disk}: --cache-dir D:\\cache_dir --allow-other --attr-timeout 5m --vfs-cache-mode full --vfs-cache-max-size 10G --vfs-read-chunk-size-limit 100M --buffer-size 100M --fast-list --checkers 64 --transfers 64 --low-level-retries 3`
            unmountCmd = `taskkill /F /IM rclone.exe`
        }


        // const RclonePath = path.join(__dirname, '../Rclone')
        const RclonePath = 'C:\\Program Files\\LeadalSoft\\plugins\\Rclone'

        switch (todo) {
            case 'quit':
                if(process.platform !== 'darwin') {
                    app.quit()
                }
                break;
            case 'mount':
                if(process.platform === 'linux') {
                    exec(createEmptyDir, (error, stdout, stderr) => {
                        if(error) {
                            console.log('linux platform mkdir error call back', error, stdout, stderr);
                            ws.send(JSON.stringify({
                                code: 0,
                                type: 'mkdir',
                                msg: error.toString()
                            }))
                        }else {
                            ws.send(JSON.stringify({
                                code: 1,
                                type: 'mkdir',
                                msg: stdout.toString()
                            }))
                            exec(mountCmd, (error, stdout, stderr) => {
                                console.log('linux platform mount ftp error call back', error, stdout, stderr);
                                if(error) {
                                    ws.send(JSON.stringify({
                                        code: 0,
                                        type: 'mount',
                                        msg: error.toString()
                                    }))
                                }else {
                                    ws.send(JSON.stringify({
                                        code: 1,
                                        type: 'mount',
                                        msg: stdout.toString()
                                    }))
                                }
                            })
                        }

                    })
                }else {
                    exec(rCloneConfig, { cwd: RclonePath }, (error, stdout, stderr) => {
                        if(error) {
                            console.log('windows platform config error call back', error, stdout, stderr);

                            ws.send(JSON.stringify({
                                code: 0,
                                type: 'rClone-config',
                                msg: error.toString() + "-----" + RclonePath
                            }))
                        }else {
                            exec(mountCmd, { cwd: RclonePath }, (error, stdout, stderr) => {
                                if(error) {
                                    console.log('windows platform mount ftp error call back', error, stdout, stderr);
                                    const errReason = error.toString().split('NewFs:')[1]
                                    ws.send(JSON.stringify({
                                        code: 0,
                                        type: 'mount',
                                        msg: errReason
                                    }))
                                }
                            })
                        }

                    })
                }
                break;
            case 'unmount':

                exec(unmountCmd, (error, stdout, stderr) => {
                    if(error) {
                        console.log('unmount failed call back', error, stdout, stderr);
                        ws.send(JSON.stringify({
                            code: 0,
                            type: 'unmount',
                            msg: error.toString()
                        }))
                    }else {
                        ws.send(JSON.stringify({
                            code: 1,
                            type: 'unmount',
                            msg: '卸载成功'
                        }))
                    }
                })
                break;

            case 'edit':

                if(fileName && fileName !== recieveData.fileName) {
                    fs.unlink(path.join(tempPath, fileName), (err) => {
                        if(err) {
                            console.log(err);
                        }
                    })
                }

                fileId = recieveData.fileId;
                userId = recieveData.userId;
                fileName = recieveData.fileName
                filePath = path.join(tempPath, fileName)

                fs.access(filePath, fs.constants.F_OK, (err) => {
                    if(err) {
                        console.log('access file err', err);
                        downloadFile(fileId, userId).then(res => {

                            const writeString = fs.createWriteStream(filePath)
                            res.pipe(writeString)

                            // 防止写入时发生意外错误导致内存泄漏：写入流发生错误直到Node进程退出前都不会自动关闭
                            writeString.on('error', (err) => {
                                console.log('write failed with error ', err.toString());
                                writeString.close()
                                ws.send(JSON.stringify({
                                    code: -1, // 临时文件写入错误
                                    type: 'edit',
                                    msg: '临时文件写入发送错误'
                                }))
                            })

                            writeString.on('finish', () => {
                                watchFile(filePath)
                            })
                        })
                    }else {
                        watchFile(filePath)
                    }
                })
        }
    })

    ws.on('close', () => {
        console.log('close ws server');
    })

    ws.on('error', (error) => {
        console.log('has error of ws server: ', error);
    })

})

console.log('ws server has ready on 20997 port');
