<template>
    <div class="page">
        <b-files-operate ref="operate" :selection="selection"
                         :layout="operationLayout"
                         :current-fold="foldId"
                         @ftp-mount="ftpVisible = true"
                         @ftp-unmount="handleFTPUnmount"
                         @share="handleShare"
                         @upload-success="handleUploadSuccess"
                         @confirm-create="createFold"
                         @download="handleDownload"
                         @favorite="handleFav"
                         @unfav="handleUnFav"
                         @search="handleSearch"
                         @move="handleMove"
                         @copy="handleCopy"
                         @delete="handleDelete"
                         @sync-file="handleSyncFile"
                         @rename="handleRename"/>
        <b-files-node
                ref="fileNode"
                :index-list="indexList"
                :files="files"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                :folder-id.sync="foldId"
                @update-data="fetchFiles"
                @current-change="changeCurrent"
                @size-change="sizeChange"
                @to-pre="handleToPre"
                @to-previous="handleToPrevious"
                @to-next-fold="handleNextFold"
                @change-folder="handleChangeFolder"
                @click-file="handleClickFile"
                @open="handleOpen"
                @download="handleRightClickDown"
                @favorite="handleFav"
                @move="openMove"
                @copy="openCopy"
                @rename="handleRename"
                @delete="handleDelete"
                @share="handleShare"
                @drag-move-success="handleDragMoveSuccess"
        />
        <b-image-preview :visible.sync="imagePreview" :slides="imgList" :initial-slide="defaultImgIndex" />
        <b-audio-preview :visible.sync="audioPreview" :url="audioURL" :audio-id="audioId" :title="currentClickFile.fileName + '.' + currentClickFile.fileType" />
        <b-video-preview
                :visible.sync="videoPreview"
                :video-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                :video-resource-id="currentClickFile.id" />
        <b-pdf-preview :visible.sync="pdfPreview"
                       :pdf-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                       :file-id="currentClickFile.id"
                       :type="currentClickFile.fileType"
                       :file="currentClickFile"/>
        <b-share :visible.sync="shareVisible" :ids="shareFileIds"></b-share>
        <el-dialog :visible.sync="ftpVisible" title="创建挂载">
            <div style="padding: 20px;">
                <el-form ref="mountForm" :model="mountModel" label-width="100px">
                    <el-form-item v-if="platform === 'win32'" label="盘符" prop="disk" :rules="diskRules">
                        <el-select size="small" v-model="mountModel.disk" placeholder="请选择盘符" clearable>
                            <el-option v-for="disk in diskList" :label="disk" :value="disk" :key="disk" />
                        </el-select> 盘
                    </el-form-item>
                    <el-form-item v-if="platform === 'win32'" label="本地盘名称">
                        <el-input size="small" :disabled="platform === 'win32'" v-model="diskName" style="width: 200px" />
                    </el-form-item>
                    <el-form-item v-else label="本地盘名称">
                        <el-input size="small" disabled v-model="diskName" style="width: 200px" />
                    </el-form-item>
                    <el-form-item label="用户名">
                        <el-input size="small" disabled :value="userName" style="width: 200px" />
                    </el-form-item>
                    <el-form-item label="登录密码" prop="userPwd" :rules="userPwdRules">
                        <el-input type="password" size="small" v-model="mountModel.userPwd" style="width: 200px" />
                    </el-form-item>
                </el-form>

            </div>
            <div slot="footer">
                <el-button :loading="mountLoading" size="small" type="primary" @click="sendFTPMountMsg">确定</el-button>
            </div>
        </el-dialog>
        <el-dialog :visible.sync="unmountVisible" title="卸载ftp盘">
            <div style="padding: 20px;">
                将要卸载的盘名称：<el-input size="small" placeholder="请输入要卸载的盘文件夹名称" disabled v-model="diskName" style="width: 200px" />

            </div>
            <div slot="footer">
                <el-button size="small" type="primary" @click="confirmUnmountOnLinux">确定</el-button>
            </div>
        </el-dialog>
        <b-unzip-preview :visible.sync="unzipShow" :current-file="currentClickFile" />
    </div>
</template>
<script>
    import {fileListAll, renameFileName} from "@/api/file"
    import {favFile, cancelFav} from "@/api/personal/fav.js"
    import { createFold, renameFold, deleteFiles, downloadFiles, moveFiles, copyFiles, previewImg, getFilesByKeyword, batchDownloadFiles, secondFile } from "@/api/common.js"
    import { getFormatFileSize, getCurrentTime, setRandomId } from '@/utils/index'

    const baseURL = process.env.VUE_APP_BASE_URL
    const previewURL = baseURL

    export default {
        name: "fileType",
        data() {
            return {
                operationLayout: ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy', 'mount'],
                files: [],
                indexList: [{
                    folderName: '根目录',
                    id: undefined
                }],
                selection: [],
                searchKeyword: '',
                currentClickFile: {},
                diskId: undefined,
                foldId: '0',
                cacheFoldId: undefined,
                parentFoldId: '',
                percentage: 0,
                fileTotal: 0,
                currentPage: 1,
                imagePreview: false,
                imgList: [],
                defaultImgIndex: 0,
                audioPreview: false,
                audioURL: '',
                videoPreview: false,
                pdfPreview: false,
                shareVisible: false,
                shareFileIds: [],
                ftpVisible: false,
                mountModel: {
                    disk: '',
                    userPwd: '',
                    diskName: undefined
                },
                diskRules: [{required: true, message: '请选择要挂载的盘符', trigger: 'blur'}],
                userPwdRules: [{required: true, message: '请输入登录密码', trigger: 'blur'}],
                platform: navigator.platform.toLowerCase(),
                mountLoading: false,
                mountFailed: false,
                unmountVisible: false,
                unzipShow: false,
            };
        },
        computed: {
            userId() {
                return this.$store.state.user.userId
            },
            type() {
                return this.$route.meta.type;
            },
            audioId() {
                return this.currentClickFile.fileKind? (this.currentClickFile.fileKind === '音频' ? this.currentClickFile.id : undefined) : undefined
            },
            downloadingList() {
                return this.$store.state.translate.downloadingList
            },
            diskList() {
                const allDisk = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
                    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

                const lastIndex = allDisk.indexOf(this.lastDisk)
                return allDisk.slice(lastIndex + 1)
            },
            ftpHost() {
                return this.$store.state.system.ftpHost
            },
            ftpPort() {
                return this.$store.state.system.ftpPort
            },
            ftpFlag() {
                return this.$store.state.system.ftpFlag
            },
            diskName: {
                get() {
                    return this.mountModel.diskName === undefined ? this.$store.state.user.userInfo.enAccount : this.mountModel.diskName
                },
                set(v) {
                    this.mountModel.diskName = v
                }
            },
            userName() {
                return this.$store.state.user.userInfo.enAccount
            },
            WSFTP() {
                return this.$store.state.app.WSFTP
            },
            wsFTPConnectionCount() {
                return this.$store.state.app.wsFTPConnectionCount
            },
            lastDisk() {
                return this.$store.state.app.lastDisk
            },
            ws() {
                return this.$store.state.app.ws
            },
            fileDefaultSort() {
                return this.$store.state.app.fileDefaultSort
            },
            pageSize() {
                return this.$store.state.app.globalPageSize
            },
            isAsc() {
                return this.fileDefaultSort.order === 'ascending'
            },
            sortName() {
                return this.fileDefaultSort.prop
            }
        },

        methods: {
            openMove(file) {
                this.$refs['operate'].handleMove(file)
            },
            openCopy(file) {
                this.$refs['operate'].handleCopy(file)
            },
            async fetchFiles() {
                await fileListAll(this.diskId, this.foldId === '0' ? undefined: this.foldId, this.currentPage, this.pageSize, this.searchKeyword, this.sortName, this.isAsc).then(res => {
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                    this.selection = []
                })
            },
            changeCurrent(current) {
                this.currentPage = current
                this.fetchFiles()
            },
            sizeChange(size) {
                this.fetchFiles()
            },
            handleUploadSuccess() {
                this.fetchFiles()
            },
            handleRightClickDown() {
                this.handleDownload()
            },
            handleFav(file) {
                const foldInd = this.selection.findIndex(file => file.tableKind === '文件夹')
                if(foldInd > -1) {
                    this.$message.warning('暂不能收藏文件夹，请选择文件')
                    return
                }
                const fileId = (this.selection.length < 1 && file) ? file.id : this.selection.map(file => file.id).join()
                favFile({ fileIds: fileId, formType: '1' }).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                })
            },
            handleUnFav() {
                const ids = this.selection.map(file => file.id).join()
                cancelFav({ ids }).then(res => {
                    this.$message.success(res.message || '取消成功')
                    this.fetchFiles()
                })
            },
            setTableBtn(list, fileId, showMsg, status) {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].fileId === fileId) {
                        list[i].progress = showMsg
                        list[i].status = status
                    }
                }
            },
            handleLinkDownload(file) {
                let a = document.createElement("a");
                a.href = `${previewURL}/files/download?fileId=${file.id}`
                if(file.fileType) {
                    a.download = file.fileName + '.' + file.fileType;
                } else {
                    a.download = file.folderName + '.zip';
                }

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            handleBatchLinkDownload(fileIds) {
                let fileName = getCurrentTime()
                let a = document.createElement("a");
                a.href = `${previewURL}/files/batchDownload?fileIds=${fileIds}`
                a.download = fileName + '.zip';

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            downloadFile(file, downloadingList = []) {
                let id = file.id
                downloadingList.push({
                    fileId: id,
                    fileName: file.fileName || file.folderName,
                    fileSize : 0,
                    fileType: file.fileType || '.zip',
                    progress: '等待下载',
                    status: 'waiting',
                    uid: id + new Date().getTime()
                })
                this.$message.success('已添加至下载队列')
                downloadFiles({fileId: id}, (e) => {
                    this.handleDownloadProgress(e, downloadingList, id, e.total)
                }).then(res => {
                    let blob = new Blob([res.data], {
                        type: "application/vnd.ms-excel",
                    });

                    let objectUrl = URL.createObjectURL(blob);
                    let a = document.createElement("a");
                    a.href = objectUrl;
                    if(file.fileType) {
                        a.download = file.fileName + '.' + file.fileType;
                    } else {
                        a.download = file.folderName + '.zip';
                    }

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    this.setTableBtn(downloadingList, id, '下载完成', 'success')
                    this.$store.dispatch('translate/setDownloadingList', downloadingList)
                    this.percentage = 0
                }).catch(() => {
                    this.setTableBtn(downloadingList, id, '下载失败', 'error')
                    this.$store.dispatch('translate/setDownloadingList', downloadingList)
                })
            },
            handleDownload() {
                let downloadingList = this.downloadingList || []
                let id = ""

                // 单个文件
                if(this.selection.length === 1) {
                    const fileInfo = this.selection[0]

                    if(!this.selection[0].fileType || this.selection[0].fileSize >= 1024 * 1024 * 100) {
                        const h = this.$createElement
                        this.$msgbox({
                            title: '提示',
                            message: h('p', null, [
                                h('span', null, '该文件大小超过100MB，为避免下载过程中应用程序崩溃，将采用浏览器默认下载方式，或'),
                                h('a', {attrs: {href: `leadal-net-disk://${fileInfo.id}/${fileInfo.fileSize}/${fileInfo.fileName || fileInfo.folderName}/${fileInfo.fileType}`}, style: {'color': '#409eff'}}, '打开网络云盘客户端下载'),
                                h('span', null, '，如要继续选择应用内下载方式下载，请点击应用内下载，如要取消下载请点击右上角X')
                            ]),
                            showCancelButton: true,
                            cancelButtonText: '应用内下载',
                            confirmButtonText: '浏览器下载',
                            distinguishCancelAndClose: true
                        }).then(action => {
                            this.handleLinkDownload(this.selection[0])
                        }).catch(action => {
                            if(action === 'cancel') {
                                this.downloadFile(this.selection[0], downloadingList)
                            }
                        })
                    }else {
                        this.downloadFile(this.selection[0], downloadingList)
                    }

                } else {
                    let fileIds = this.selection.map(file => file.id).join(",")
                    const h = this.$createElement
                    this.$msgbox({
                        title: '提示',
                        message: h('p', null, [
                            h('span', null, '多文件下载任务为避免下载过程中应用程序崩溃，将采用浏览器默认下载方式，或'),
                            h('a', {attrs: {target: '_blank', href: 'leadal://open.netdisk'}, style: {'color': '#409eff'}}, '打开网络云盘客户端下载'),
                            h('span', null, '，如要继续选择应用内下载方式下载，请点击应用内下载，如要取消下载请点击右上角X'),
                        ]),
                        showCancelButton: true,
                        cancelButtonText: '应用内下载',
                        confirmButtonText: '浏览器下载',
                        distinguishCancelAndClose: true
                    }).then(action => {
                        console.log(action);
                        this.handleBatchLinkDownload(fileIds)
                    }).catch((action) => {
                        if(action === 'cancel') {
                            this.$message.success('已添加至下载队列')
                            id = setRandomId()
                            let fileName = getCurrentTime()
                            downloadingList.push({
                                fileId: id,
                                fileName: fileName,
                                fileSize : 0,
                                fileType: 'zip',
                                progress: '等待下载',
                                status: 'waiting',
                                uid: id + new Date().getTime()
                            })
                            // todo 未返回一个total
                            batchDownloadFiles({fileIds: fileIds}, (e) => {
                                let size = this.selection.reduce((sum, item) => sum + Number(item.fileSize), 0)
                                this.handleDownloadProgress(e, downloadingList, id, size)
                            }).then(res => {
                                let blob = new Blob([res.data], {
                                    type: "application/vnd.ms-excel",
                                });
                                let objectUrl = URL.createObjectURL(blob);
                                let a = document.createElement("a");
                                a.href = objectUrl;
                                a.download = fileName + '.zip';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                this.setTableBtn(downloadingList, id, '下载完成', 'success')
                                this.$store.dispatch('translate/setDownloadingList', downloadingList)
                                this.percentage = 0
                            }).catch(() => {
                                this.setTableBtn(downloadingList, id, '下载失败', 'error')
                                this.$store.dispatch('translate/setDownloadingList', downloadingList)
                            })
                        }
                    })
                }
            },
            handleDownloadProgress(e, list, fileId, size) {
                if(size) {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].fileId === fileId) {
                            list[i].fileSize = getFormatFileSize(size)
                        }
                    }
                } else {
                    size = e.total
                }
                this.setTableBtn(list, fileId, Math.floor((e.loaded / size) * 100) + '%', 'pending')
                this.$store.dispatch('translate/setDownloadingList', list)
            },
            handleSearch(keyword) {
                fileListAll(this.diskId, this.foldId === '0'? undefined: this.foldId, 1, this.pageSize, keyword, this.sortName, this.isAsc).then(res => {
                    this.downloadTask = 1;
                    this.searchKeyword = keyword
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            async handleToPre(current) {
                this.parentFoldId = current.folderParentId
                this.currentPage = 1;
                this.foldId = current.id;
                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                await this.fetchFiles()
                this.indexList.pop()
                loading.close()
            },
            async handleToPrevious(current, index) {

                this.parentFoldId = current.folderParentId
                this.currentPage = 1;
                this.foldId = current.id;
                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                await this.fetchFiles()
                // this.indexList.length = index + 1
                this.indexList = this.indexList.splice(0, index + 1)
                loading.close()
            },
            async handleNextFold(row) {
                this.parentFoldId = row.folderParentId

                this.currentPage = 1;
                this.foldId = row.id;
                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                await this.fetchFiles()
                this.indexList.push({ folderName: row.folderName, id: row.id })
                loading.close()
            },
            async handleChangeFolder(folders) {
                const currentFolder = folders[folders.length - 1]
                this.parentFoldId = currentFolder.folderParentId
                // this.indexList.push({ folderName: folder.folderName, id: folder.id })
                this.currentPage = 1;
                this.foldId = currentFolder.id;
                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                await this.fetchFiles()
                this.indexList = folders
                loading.close()
            },
            createFold(value) {
                createFold({folderName: value, id: this.foldId === '0'? undefined : this.foldId}).then(() => {
                    this.fetchFiles()
                    this.$refs['fileNode'].updateFolderTree(this.foldId)
                }).catch(err => {
                    this.$message({
                        type: 'error',
                        message: err.message || '创建失败，请重试',
                    })
                })
            },
            handleRename(value, file) {
                const current = file || this.selection[0]
                let { fileType, id } = current
                if(!fileType) {
                    renameFold({folderName: value, id}).then(() => {
                        this.fetchFiles()
                        this.$refs['fileNode'].updateFolderTree(this.foldId)
                    }).catch(err => {
                        this.$message({
                            type: 'error',
                            message: err.message || '重命名失败，请重试',
                        })
                    })
                }else {
                    const formData = new FormData()
                    formData.append('fileName', value)
                    formData.append('id', id)
                    renameFileName(formData).then(() => {
                        this.fetchFiles()
                    })
                }
            },
            handleDelete(file) {
                const fileIds = this.selection.length<1 ? [file.id] : this.selection.map(file => file.id)
                const includeFolder = this.selection.filter(f => !f.fileType).length > 0
                deleteFiles({fileIds}).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                    if(includeFolder) {
                        this.$refs['fileNode'].updateFolderTree(this.foldId)
                    }
                })
            },
            handleOpen(rightClickFile) {
                if(!rightClickFile.fileKind) {
                    this.handleNextFold(rightClickFile)
                }else {
                    this.handleClickFile(rightClickFile)
                }
            },
            handleMove(folds, rightClickFile, closeDialog) {

                const fileIds = (this.selection.length< 1 && rightClickFile != null)? [rightClickFile.id] : this.selection.map(file => file.id)
                if(fileIds.some(fileId => fileId === folds[0].id)) {
                    this.$message.warning('无法将包含自身的文件夹拖拽入自身，请取消选择要移入的文件夹后重试...')
                    return
                }
                moveFiles({ fileIds, folderId: folds[0].id }).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles()
                })

            },
            handleCopy(folds, rightClickFile, closeDialog) {

                const fileIds =  (this.selection.length< 1 && rightClickFile != null)? [rightClickFile.id] : this.selection.map(file => file.id)
                copyFiles({ fileIds, folderId: folds[0].id }).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles()
                })
            },
            handleClickFile(file) {
                this.currentClickFile = file
                if(file.fileKind === '图片') {

                    if(this.imgList.length > 0 && file.folderParentId === this.cacheFoldId) {
                        this.imagePreview = true
                        this.defaultImgIndex = this.imgList.findIndex(imgInfo => imgInfo.id === file.id)
                    }else {
                        this.cacheFoldId = file.folderParentId
                        const loadingInstance = this.$loading({ lock: true, text: '正在加载图片请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })

                        getFilesByKeyword({ diskId: this.diskId, id: file.folderParentId, pageNo: 1, pageSize: 100, code: 1, sortName: this.sortName, isAsc: this.isAsc }).then(res => {
                            const imgInfoList = res.data.records

                            this.defaultImgIndex = imgInfoList.findIndex(imgInfo => imgInfo.id === file.id)

                            Promise.allSettled(imgInfoList.map(imgInfo => previewImg(imgInfo.id))).then(res => {
                                console.log(res);
                                this.imgList = res.map((p, index) => {
                                    if(p.status === 'fulfilled') {
                                        let blob = new Blob([p.value], {
                                            type: "image/PNG",
                                        });
                                        return { objUrl: URL.createObjectURL(blob), ...imgInfoList[index] };
                                    }else {
                                        return { objUrl: undefined, ...imgInfoList[index] }
                                    }

                                })
                                loadingInstance.close()
                                this.imagePreview = true
                            })
                        })
                    }

                }else if(file.fileKind === '音频') {
                    this.audioPreview = true
                    this.audioURL = `${previewURL}/preview/music?fileId=${file.id}`
                }else if(file.fileKind === '视频') {
                    this.videoPreview = true
                }else if(file.fileKind === '压缩文件') {
                    if(file.fileSize > 1024*1024*100) {
                        this.$message.warning('文件大于100M，请下载后查看！')
                        return
                    }
                    if(file.fileType === 'zip' || file.fileType === 'rar') {
                        this.unzipShow = true
                    }else {
                        this.$message.warning('暂不支持在线解压缩文件，请下载后查看！')
                    }
                }else if(file.fileKind === '文档') {
                    if(file.fileSize >= 1024*1024*100) {
                        this.$message.warning('该文件大小超过100M，暂不支持在线预览，请下载后查看')
                        return
                    }
                    this.pdfPreview = true
                }else {
                    if(this.userName === 'zengweihuang' || this.userName === 'wuqiuyue') {
                        const {origin, pathname, search} = window.location
                        if(file.fileType === 'mind') {
                            window.open(`${origin}${pathname}${search ? search + '&' : '?'}fileId=${file.id}&fileName=${file.fileName + '.' + file.fileType}#/mind-edit`)
                        } else if(file.fileType === 'flow') {
                            window.open(`${origin}${pathname}${search ? search + '&' : '?'}fileId=${file.id}&fileName=${file.fileName + '.' + file.fileType}#/flow-edit`)
                        } else if(file.fileType === 'bpmn') {
                            window.open(`${origin}${pathname}${search ? search + '&' : '?'}fileId=${file.id}&fileName=${file.fileName + '.' + file.fileType}#/bpmn-designer`)
                        }else {
                            this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                        }
                    }else {
                        this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                    }
                }

            },
            handleShare() {
                this.shareVisible = true
                this.shareFileIds = this.selection.map(file => file.id)
            },
            sendFTPMountMsg() {
                this.$refs['mountForm'].validate(val => {
                    if(val) {
                        if(this.ws) {
                            this.mountLoading = true
                            this.mountFailed = false
                            this.ws.send(JSON.stringify({
                                cmd: 'mount',
                                ftpHost: this.ftpHost,
                                ftpPort: this.ftpPort,
                                ...this.mountModel,
                                diskName: this.diskName,
                                userName: this.userName
                            }))
                            if(this.platform === 'win32' || this.platform === 'windows') {
                                const timer = setTimeout(() => {
                                    if(!this.mountFailed) {
                                        this.mountLoading = false
                                        this.ftpVisible = false
                                        this.$message.success('挂载成功！')
                                    }

                                    clearTimeout(timer)
                                }, 5000)
                            }
                        }else {
                            this.$message.warning('连接本地服务失败，请确保FTP挂载本地插件已启动...')
                        }
                    }
                })
            },
            handleFTPUnmount() {
                if(this.ws) {
                    if(this.platform === 'win32') {
                        this.$confirm('确认要卸载该盘符吗？').then(res => {
                            if(res) {
                                this.ws.send(JSON.stringify({
                                    cmd: 'unmount'
                                }))
                            }
                        })
                    }else {
                        this.unmountVisible = true

                    }
                }
            },
            confirmUnmountOnLinux() {
                this.ws.send(JSON.stringify({
                    cmd: 'unmount',
                    diskName: this.diskName
                }))
            },
            handleDragMoveSuccess() {
                this.fetchFiles()
            },
            handleSyncFile(folders, diskType) {
                const folder = folders[0]
                const files = this.selection.filter(f => f.fileName)
                if(files.length < 1) {
                    if(this.selection.length > 0) {
                        this.$message.warning('暂不支持同步文件夹，请选择一个文件同步！')
                    }else {
                        this.$message.warning('请选择一个文件同步！')
                    }
                    return
                }
                Promise.allSettled(files.map(f => secondFile({
                    diskId: folder.diskAuth? folder.id: folder.diskId,
                    fileName: f.fileName + '.' + f.fileType,
                    folderId: folder.diskAuth? undefined: folder.id,
                    resourceId: f.resourceId
                }))).then(res => {
                    let failedIndex = []
                    res.forEach((p, index) => {
                        if(p.status !== 'fulfilled') {
                            failedIndex.push(index)
                        }
                    })
                    if(failedIndex.length > 0) {
                        let failedFileName = ''
                        failedIndex.forEach(i => {
                            failedFileName += files[i].fileName + '，'
                        })
                        this.$message.warning(failedFileName + '同步失败，请重试')
                    }else {
                        this.$message.success('同步成功！')
                    }

                })

            }

        },
        watch: {
            ftpFlag(v) {
                if(v === '1' && this.WSFTP) {
                    this.operationLayout = ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy', 'mount']
                }else {
                    this.operationLayout = ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                }
            },
            fileDefaultSort() {
                this.fetchFiles()
            }
        },
        mounted() {

            if(!this.WSFTP && this.wsFTPConnectionCount === 0) {

                const ws = new WebSocket('ws://localhost:20997')

                ws.onopen = () => {
                    console.log('ws has open');
                    this.$store.commit('app/SET_WS_INSTANCE', ws)
                    this.$store.commit('app/SET_WSFTP', true)
                    this.$store.commit('app/SET_WS_FTP_CONNECTION_COUNT', this.wsFTPConnectionCount + 1)

                    if(this.ftpFlag === '1') {
                        this.operationLayout = ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'rename', 'delete', 'move', 'copy', 'mount']
                    }
                }

                ws.onmessage = (e) => {
                    console.log('recieve msg', e);
                    const data = JSON.parse(e.data)
                    const msgType = data.type
                    switch (msgType) {
                        case 'disk-info':
                            this.$store.commit('app/SET_LAST_DISK', data.data[data.data.length - 1]._mounted[0])
                            break;

                        case 'mkdir':
                            if(data.code === 0) {
                                this.$message.error(data.msg)
                                console.log(data.msg);
                                this.mountFailed = true
                                this.mountLoading = false
                            }
                            break;

                        case 'rClone-config':
                            if(data.code === 0) {
                                this.$message.error(data.msg)
                                console.log(data.msg);
                                this.mountFailed = true
                                this.mountLoading = false
                            }
                            break;

                        case 'mount':
                            if(data.code === 0) {
                                this.mountFailed = true
                                this.$message.error(data.msg);
                            }else {
                                this.$message.success(data.msg || '挂载成功');
                            }
                            this.mountLoading = false
                            break;

                        case 'unmount':
                            if(data.code === 0) {
                                this.$message.error(data.msg)
                                console.log(data.msg);
                            }else {
                                this.$message.success(data.msg)
                                console.log(data.msg);
                            }
                            break;

                        case 'edit':
                            if(data.code === 0) {
                                this.$message.error(data.msg)
                                console.log(data.msg);
                            }else if(data.code === 1) {
                                this.$message({
                                    showClose: true,
                                    duration: 2000,
                                    message: '文档更新成功，请点击查看最新版本查看或重新打开查看',
                                    type: 'success'
                                })
                            }else {
                                this.$_EB.$emit('open-edit', data)
                            }
                    }
                }

                ws.onclose = () => {
                    console.log('close ws server');
                    this.$store.commit('app/SET_WS_INSTANCE', null)
                    this.operationLayout = ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                }

                ws.onerror = (error) => {
                    console.log('has error of ws server: ', error);
                    if(this.ftpFlag === '1') {
                        this.$message.warning('连接本地服务失败，请确保FTP挂载本地插件已启动或刷新重试...')
                    }

                    this.$store.commit('app/SET_WS_INSTANCE', ws)
                    this.operationLayout = ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                    this.$store.commit('app/SET_WS_FTP_CONNECTION_COUNT', this.wsFTPConnectionCount + 1)
                }
            }

            if(!this.WSFTP && this.wsFTPConnectionCount > 0) {
                this.operationLayout = ['upload', 'create', 'createDoc', 'big-file-upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
            }

            const routeParams = this.$route.params

            if(routeParams.folderId) {

                if(routeParams.folderName === '根目录') {
                    fileListAll(this.diskId, undefined, this.currentPage, this.pageSize, routeParams.fileName, this.sortName, this.isAsc).then(res => {
                        this.files = res.data.records
                        this.fileTotal = res.data.total
                        this.selection = []
                    })
                }else {
                    this.targetFolder = { id: routeParams.folderId, folderName: routeParams.folderName }
                    if(this.targetFolder.id) {
                        this.handleNextFold(this.targetFolder)
                    }
                }
            }else {
                this.fetchFiles()
            }
        },
    };
</script>
<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
    }
</style>
