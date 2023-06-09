<template>
    <div class="page">
        <b-files-operate ref="operate" :selection="selection"
                         :layout="['download', 'fav', 'unfav', 'share']"
                         @download="handleDownload"
                         @favorite="handleFav"
                         @share="handleShare"
                         @move="handleMove"
                         @copy="handleCopy"
                         @delete="handleDelete"
                         @search="handleSearch"
                         @rename="handleRename"/>
        <b-files-node
                type="recent"
                :files="files"
                :index-list="indexList"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                @current-change="changeCurrent"
                @favorite="handleFav"
                @size-change="sizeChange"
                @click-file="handleClickFile"
                @open="handleClickFile"
                @download="handleRightClickDown"
                @delete="handleDelete"
                @share="handleRightClickShare"
        />
        <b-image-preview :visible.sync="imagePreview" :slides="imgList" @close="imgList = []"/>
        <b-audio-preview :visible.sync="audioPreview" :url="audioURL" :audio-id="audioId"
                         :title="currentClickFile.fileName + '.' + currentClickFile.fileType"/>
        <b-video-preview
                :visible.sync="videoPreview"
                :video-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                :video-resource-id="currentClickFile.fileId"/>
        <b-pdf-preview :visible.sync="pdfPreview"
                       :pdf-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                       :file-id="currentClickFile.fileId"
                       :type="currentClickFile.fileType"
                       :file="{ ...currentClickFile, id: currentClickFile.fileId }"/>
        <b-share :visible.sync="shareVisible" :ids="shareFileIds"></b-share>
    </div>
</template>
<script>
    // import BFilesOperate from '@/components/Base/B-Files/b-files-operate.vue'
    import {deleteFiles, downloadFiles, moveFiles, copyFiles, renameFold, previewImg} from "@/api/common.js"
    import {favFile} from "@/api/personal/fav.js"
    import {getRecentlyList} from "@/api/personal/recently.js"
    import {PERSON_DISK_ID} from "@/utils/constants.js"

    import downloadTask from '../mixins/download-task'
    import fetchFileByWatch from "../mixins/fetchFileByWatch";

    const baseURL = process.env.VUE_APP_BASE_URL
    // const previewURL = process.env.NODE_ENV === 'development'? 'http://192.168.60.62/ndk_apis': baseURL
    const previewURL = baseURL

    export default {
        name: 'fileType',
        mixins: [downloadTask, fetchFileByWatch],
        data() {
            return {
                files: [],
                indexList: [{
                    folderName: '最近访问',
                    id: undefined
                }],
                selection: [],
                fileTotal: 0,
                currentPage: 1,
                // pageSize: 10,
                currentClickFile: {},
                imagePreview: false,
                imgList: [],
                audioPreview: false,
                audioURL: '',
                videoPreview: false,
                pdfPreview: false,
                filePreviewSrc: '',
                searchKeyword: '',
                txtVisible: false,
                txtString: '',
                shareVisible: false,
                shareFileIds: []
            }
        },
        computed: {
            type() {
                return this.$route.meta.type
            },
            audioId() {
                return this.currentClickFile.fileKind? (this.currentClickFile.fileKind === '音频' ? this.currentClickFile.fileId : undefined) : undefined
            },
            downloadingList() {
                return this.$store.state.translate.downloadingList
            },
        },
        components: {
            // BFilesOperate,
        },
        mounted() {
            this.fetchFiles()
        },
        methods: {
            handleSearch(keyword) {
                getRecentlyList({pageNo: this.currentPage, pageSize: this.pageSize, fileName: keyword}).then(res => {
                    this.pageNo = 1;
                    this.searchKeyword = keyword
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            fetchFiles() {
                getRecentlyList({pageNo: this.currentPage, pageSize: this.pageSize, fileName: this.searchKeyword}).then(res => {
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
            handleClickFile(file) {
                this.currentClickFile = file
                if (file.fileKind === '图片') {
                    const loadingInstance = this.$loading({ lock: true, text: '正在加载图片请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
                    previewImg(file.fileId).then(res => {
                        let blob = new Blob([res], {
                            type: "image/PNG",
                        });
                        this.imgList.push({ objUrl: URL.createObjectURL(blob), ...file })
                        loadingInstance.close()
                        this.imagePreview = true
                    })

                } else if (file.fileKind === '音频') {
                    this.audioPreview = true
                    this.audioURL = `${previewURL}/preview/music?fileId=${file.fileId}`
                } else if (file.fileKind === '视频') {
                    this.videoPreview = true
                }else if(file.fileKind === '压缩文件') {
                    this.$message.warning('暂不支持在线解压缩文件，请下载后查看！')
                }else if(file.fileKind === '文档') {
                    this.pdfPreview = true
                }else {
                    this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                }
            },
            handleFav(file) {
                const fileId = file ? file.fileId : this.selection[0].fileId
                favFile({fileIds: fileId, formType: '1'}).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                })
            },
            openMove(file) {
                this.$refs['operate'].handleMove(file)
            },
            openCopy(file) {
                this.$refs['operate'].handleCopy(file)
            },
            handleMove(folds, rightClickFile, closeDialog) {

                const fileIds = (this.selection.length < 1 && rightClickFile != null) ? [rightClickFile.fileId] : this.selection.map(file => file.fileId)
                moveFiles({fileIds, folderId: folds[0].id, diskId: PERSON_DISK_ID}).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles()
                })

            },
            handleCopy(folds, rightClickFile, closeDialog) {

                const fileIds = (this.selection.length < 1 && rightClickFile != null) ? [rightClickFile.fileId] : this.selection.map(file => file.fileId)
                copyFiles({fileIds, folderId: folds[0].id, diskId: PERSON_DISK_ID}).then(res => {
                    this.$message.success(res.message)
                    closeDialog()
                    this.fetchFiles()
                })
            },
            handleRename(value, file) {
                const current = file || this.selection[0]
                let {fileType, id} = current
                if (!fileType) {
                    renameFold({folderName: value, id}).then(() => {
                        this.fetchFiles()
                    }).catch(err => {
                        this.$message({
                            type: 'error',
                            message: err.message || '重命名失败，请重试',
                        })
                    })
                }
            },
            handleRightClickDown(file) {
                if(this.selection.length>0) {
                    this.handleDownload()
                }else {
                    downloadFiles({
                        // resouseId: file.resourceId,
                        fileId: file.fileId,
                        realFileName: file.fileName + '.' + file.fileType
                    }, this.handleDownloadProgress).then(res => {
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
            handleDelete(file) {
                const fileIds = this.selection.length< 1 && file ? [file.id] : this.selection.map(file => file.id)
                deleteFiles({fileIds, diskId: PERSON_DISK_ID}).then(res => {
                    this.$message.success(res.message)
                    this.fetchFiles()
                })

            },
            handleShare() {
                this.shareVisible = true
                this.shareFileIds = this.selection.map(file => file.fileId)
            },
            handleRightClickShare(file) {
                if(this.selection.length > 1) {
                    this.handleShare()
                    return
                }
                if(file.tableKind === '文件') {
                    this.shareVisible = true
                    this.shareFileIds = [file.fileId]
                }else {
                    this.$message.warning('暂不支持分享文件夹，请选择要分享的文件')
                }

            },
        }
    }
</script>
<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
    }
</style>
