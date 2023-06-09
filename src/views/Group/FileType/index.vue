<template>
    <div class="page">
        <b-files-operate ref="operate"
                         :layout="layoutOfOperation"
                         :selection="selection"
                         :disk-id="diskId"
                         :disk-type="diskType"
                         :current-fold="foldId"
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
        <b-public-files-node
                ref="fileNode"
                :index-list="indexList"
                :files="files"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                :disk-id="diskId"
                :disk-type="diskType"
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
                @drag-move-success="handleDragMoveSuccess"
        />
        <b-image-preview :visible.sync="imagePreview" :slides="imgList" :initial-slide="defaultImgIndex" />
        <b-audio-preview :visible.sync="audioPreview" :url="audioURL" :audio-id="audioId" :title="currentClickFile.fileName + '.' + currentClickFile.fileType" />
        <b-video-preview
                :visible.sync="videoPreview"
                :video-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                :video-resource-id="currentClickFile.id" />
        <b-pdf-preview :visible.sync="pdfPreview"
                       :show-history="false"
                       :can-edit="currentClickFile.allowKeep"
                       :pdf-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                       :file-id="currentClickFile.id"
                       :type="currentClickFile.fileType"
                       :file="currentClickFile"/>

        <b-unzip-preview :visible.sync="unzipShow" :current-file="currentClickFile" />

    </div>
</template>
<script>
    import {fileListAll} from "@/api/group/index.js"
    import {favFile} from "@/api/personal/fav.js"
    import {renameFileName} from "@/api/file/"
    import { getFilesByKeyword, createFold, renameFold, deleteFiles, downloadFiles, moveFiles, copyFiles, previewImg } from "@/api/common.js"
    import { GROUP_DISK_ID } from '@/utils/constants.js'

    import operation from "../mixins/operation";
    import commonFileOperation from '../mixins/common-file-operation'
    import downloadTask from '../mixins/download-task'
    import fetchFileByWatch from "@/views/Personal/mixins/fetchFileByWatch";

    const baseURL = process.env.VUE_APP_BASE_URL

    export default {
        name: "fileType",
        mixins: [operation, downloadTask, fetchFileByWatch, commonFileOperation],
        data() {
            return {
                files: [],
                indexList: [{
                    folderName: '根目录',
                    id: undefined
                }],
                selection: [],
                currentClickFile: {},
                diskType: GROUP_DISK_ID,
                foldId: '0',
                cacheFoldId: undefined,
                foldName: '',
                parentFoldId: '',
                folderParentIds: '',
                createFoldId: '', // 创建文件夹时候要的id
                fileTotal: 0,
                currentPage: 1,
                childPageNo: 1,
                // pageSize: 10,
                imagePreview: false,
                imgList: [],
                defaultImgIndex: 0,
                audioPreview: false,
                audioURL: '',
                videoPreview: false,
                pdfPreview: false,
                filePreviewSrc: '',
                txtVisible: false,
                txtString: '',
                unzipShow: false,
            };
        },
        computed: {
            type() {
                return this.$route.meta.type;
            },
            diskId() {
                return this.$route.meta.diskId
            },
            createByUserId() {
                return this.$route.params.userId
            },
            audioId() {
                return this.currentClickFile.fileKind? (this.currentClickFile.fileKind === '音频' ? this.currentClickFile.id : undefined) : undefined
            },
            downloadingList() {
                return this.$store.state.translate.downloadingList
            },
        },
        mounted() {
            const routeParams = this.$route.params

            if(routeParams.folderId) {

                if(routeParams.folderName === '根目录') {
                    this.handleSearch(routeParams.fileName)
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
        methods: {
            openMove(file) {
                this.$refs['operate'].handleMove(file)
            },
            openCopy(file) {
                this.$refs['operate'].handleCopy(file)
            },
            async fetchFiles() {
                await fileListAll(this.diskId, this.foldId === '0'? undefined: this.foldId, this.currentPage, this.pageSize, this.createByUserId, this.sortName, this.isAsc).then(res => {
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            changeCurrent(current) {
                this.currentPage = current
                this.fetchFiles()
            },
            sizeChange(size) {
                // this.pageSize = size
                this.fetchFiles()
            },
            handleUploadSuccess() {
                this.fetchFiles()
            },
            handleRightClickDown(file) {
                if(this.selection.length>0) {
                    this.handleDownload()
                }else {
                    downloadFiles({
                        resouseId: file.resourceId,
                        realFileName: file.fileName + '.' + file.fileType
                    }).then(res => {
                        let blob = new Blob([res], {
                            type: 'charset=utf-8'
                        });
                        let objectUrl = URL.createObjectURL(blob);
                        let a = document.createElement("a");
                        a.href = objectUrl;
                        a.download = file.fileName + '.' + file.fileType;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    })
                }
            },
            handleFav(file) {
                const fileId = (this.selection.length< 1 && file) ? file.id : this.selection.map(file => file.id).join()
                favFile({ fileIds: fileId, formType: GROUP_DISK_ID }).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                })
            },
            handleSearch(keyword) {
                getFilesByKeyword({keyword, pageNo: 1, pageSize: this.pageSize, diskId: this.diskId, sortName: this.sortName, isAsc: this.isAsc}).then(res => {
                    this.currentPage = 1;
                    this.searchKeyword = keyword
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            handleToPre(current) {
                this.foldId = current.id;
                this.parentFoldId = current.folderParentId
                this.currentPage = 1;

                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                this.fetchFiles()
                this.indexList.pop()
                loading.close()
            },
            handleToPrevious(current, index) {
                this.foldId = current.id;
                this.parentFoldId = current.folderParentId
                this.currentPage = 1;

                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                this.fetchFiles()
                // this.indexList.length = index + 1
                this.indexList = this.indexList.splice(0, index + 1)
                loading.close()
            },
            handleNextFold(row) {
                this.foldId = row.id;
                this.parentFoldId = row.folderParentId

                this.currentPage = 1;
                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                this.fetchFiles()
                this.indexList.push({ folderName: row.folderName, id: row.id })
                loading.close()
            },
            handleChangeFolder(folders) {
                const currentFolder = folders[folders.length - 1]
                this.foldId = currentFolder.id;
                this.parentFoldId = currentFolder.folderParentId

                // this.indexList.push({ folderName: folder.folderName, id: folder.id })
                this.currentPage = 1;
                const loading = this.$loading({ lock: true, text: '正在加载数据，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                this.fetchFiles()
                this.indexList = folders
                loading.close()
            },
            createFold(value) {
                // createFold({folderName: value, folderParentIds: this.folderParentIds, id: this.createFoldId}).then(() => {
                createFold({folderName: value, diskType: GROUP_DISK_ID, diskId: this.diskId, id: this.foldId === '0'? undefined: this.foldId}).then(() => {
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
                deleteFiles({fileIds, diskId: this.diskId}).then(res => {
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
                moveFiles({ fileIds, folderId: folds[0].id, diskId: this.diskId }).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles()
                })

            },
            handleCopy(folds, rightClickFile, closeDialog) {

                const fileIds =  (this.selection.length< 1 && rightClickFile != null)? [rightClickFile.id] : this.selection.map(file => file.id)
                copyFiles({ fileIds, folderId: folds[0].id, diskId: this.diskId }).then(res => {
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
                    this.audioURL = `${baseURL}/perdisk/preview/music?fileId=${file.id}`
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
                    this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                }

            },
            handleDragMoveSuccess() {
                this.fetchFiles(this.diskId, this.foldId, this.currentPage, this.pageSize)
            }
        },
        watch: {
            type: {
                immediate: true,
                handler() {
                    this.fetchFiles();
                },
            },
        },

    };
</script>
<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
    }
</style>
