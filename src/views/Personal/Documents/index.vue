<template>
    <div class="page">
        <b-files-operate
                ref="operate"
                :selection="selection"
                :layout="['upload', 'download', 'share', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']"
                @share="handleShare"
                @upload-success="handleUploadSuccess"
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
                :files="files"
                :index-list="indexList"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                @current-change="changeCurrent"
                @size-change="sizeChange"
                @click-file="handleOpen"
                @open="handleOpen"
                @open-in="handleOpenIn"
                @download="handleRightClickDown"
                @favorite="handleFav"
                @update-data="fetchFiles"
                @move="openMove"
                @copy="openCopy"
                @rename="handleRename"
                @share="handleRightClickShare"
                @delete="handleDelete"/>
        <b-pdf-preview :visible.sync="pdfPreview"
                       :pdf-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                       :file-id="currentClickFile.id"
                       :type="currentClickFile.fileType"
                       :file="currentClickFile"/>
        <b-share :visible.sync="shareVisible" :ids="shareFileIds"></b-share>

    </div>
</template>
<script>
    import BFilesOperate from "@/components/Base/B-Files-Operate";
    import {fileListAll} from "@/api/personal";
    import { deleteFiles, downloadFiles, moveFiles, copyFiles } from "@/api/common.js"
    import {renameFileName} from "@/api/file/"
    import {favFile} from "@/api/personal/fav.js"
    import {PERSON_DISK_ID} from "@/utils/constants.js"
    import fileType from '../../mixins/fileType'

    import {cancelFav} from "@/api/personal/fav";

    import downloadTask from '../mixins/download-task'
    import fetchFileByWatch from "../mixins/fetchFileByWatch";
    import {secondFile} from "@/api/common";

    export default {
        name: "fileType",
        mixins: [fileType, downloadTask, fetchFileByWatch],
        data() {
            return {
                files: [],
                indexList: [{
                    folderName: '文档',
                    id: undefined
                }],
                selection: [],
                fileTotal: 0,
                currentPage: 1,
                // pageSize: 10,
                percentage: 0,
                downloadVisible: false,
                pdfPreview: false,
                filePreviewSrc: '',
                searchKeyword: '',
                shareVisible: false,
                shareFileIds: [],
                currentClickFile: {},
                txtVisible: false,
                txtString: ''
            };
        },
        computed: {
            code() {
                return this.$route.meta.type
            },
            downloadingList() {
                return this.$store.state.translate.downloadingList
            },

        },
        components: {
            BFilesOperate,
        },
        methods: {
            fetchFiles() {
                const {code} = this;
                fileListAll(code, this.currentPage, this.pageSize, this.searchKeyword, this.sortName, this.isAsc).then(res => {
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
                // this.pageSize = size
                this.fetchFiles()
            },
            handleUploadSuccess() {
                this.fetchFiles()
            },
            handleOpen(file) {
                this.currentClickFile = file
                if(file.fileSize >= 1024*1024*100) {
                    this.$message.warning('该文件大小超过100M，暂不支持在线预览，请下载后查看')
                    return
                }
                this.pdfPreview = true
            },
            handleFav(file) {
                const fileId = (this.selection.length< 1 && file) ? file.id : this.selection.map(file => file.id).join()
                favFile({ fileIds: fileId, formType: PERSON_DISK_ID }).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                })
            },
            handleUnFav() {
                const ids = this.selection.map(file => file.id).join()
                const loading = this.$loading({ lock: true, text: '正在取消，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                cancelFav({ ids }).then(res => {
                    this.$message.success(res.message || '取消成功')
                    loading.close()
                    this.fetchFiles()
                }).catch(() => {
                    loading.close()
                })
            },

            handleSearch(keyword) {
                fileListAll(this.code, 1, this.pageSize, keyword).then(res => {
                    this.pageNo = 1;
                    this.searchKeyword = keyword
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            handleRename(value, file) {
                const current = file || this.selection[0]
                let { id } = current
                const formData = new FormData()
                formData.append('fileName', value)
                formData.append('id', id)
                renameFileName(formData).then(() => {
                    this.fetchFiles()
                })
            },
            handleDelete(file) {
                const fileIds = this.selection.length<1 ? [file.id] : this.selection.map(file => file.id)
                deleteFiles({fileIds}).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                })
            },
            handleMove(folds, rightClickFile, closeDialog) {
                const fileIds = (rightClickFile != null && this.selection.length < 1)? [rightClickFile.id] : this.selection.map(file => file.id)
                moveFiles({ fileIds, folderId: folds[0].id }).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles()
                })

            },
            handleCopy(folds, rightClickFile, closeDialog) {
                const fileIds =  (rightClickFile != null && this.selection.length < 1)? [rightClickFile.id] : this.selection.map(file => file.id)
                copyFiles({ fileIds, folderId: folds[0].id }).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles(this.diskId, this.foldId)
                })
            },
            handleRightClickDown(file) {
                if(this.selection.length>0) {
                    this.handleDownload()
                }else {
                    this.$message.success('已添加至下载队列')
                    downloadFiles({
                        // resouseId: file.resourceId,
                        // realFileName: file.fileName + '.' + file.fileType
                        fileId: file.id
                    }, (e) => {this.handleDownloadProgress(e, this.downloadingList, file.id)}).then(res => {
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
            openMove(file) {
                this.$refs['operate'].handleMove(file)
            },
            openCopy(file) {
                this.$refs['operate'].handleCopy(file)
            },
            handleShare() {
                this.shareVisible = true
                this.shareFileIds = this.selection.map(file => file.id)
            },
            handleRightClickShare(file) {
                this.shareVisible = true
                this.shareFileIds = [file.id]
            },
            handleSyncFile(folders, diskType) {
                const folder = folders[0]
                const files = this.selection.filter
                if(files.length < 1) {
                    this.$message.warning('请选择一个文件同步！')
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
        mounted() {
            this.fetchFiles();
        },
    };
</script>
<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
    }
</style>
