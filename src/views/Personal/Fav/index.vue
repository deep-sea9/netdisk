<template>
    <div class="page">
        <div class="files-operate-header">
            <el-button-group type="primary" v-show="selection.length > 0">
                <el-button type="primary" size="small" plain @click="handleDownload">
                    <i class="fa fa-arrow-alt-from-top" style="margin-right: 5px"></i>
                    <span>下载</span>
                </el-button>
                <el-button type="primary" size="small" plain @click="handleUnFav">
                    <i class="fa fa-file-times" style="margin-right: 5px"></i>
                    <span>取消收藏</span>
                </el-button>
            </el-button-group>
        </div>
        <b-files-node
                type="fav"
                :files="files"
                :index-list="indexList"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                @current-change="changeCurrent"
                @size-change="sizeChange"
                @click-file="handleClickFile"
                @download="handleRightClickDown"
                @unfav="handleUnFav"
                @update-data="fetchFiles"
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
        <b-unzip-preview :visible.sync="unzipShow" :current-file="currentClickFile" />
    </div>
</template>
<script>
    import {downloadFiles, previewImg} from "@/api/common.js"
    import {getFavList, cancelFav} from "@/api/personal/fav.js"

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
                    folderName: '收藏夹',
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
                unzipShow: false
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
        methods: {
            fetchFiles() {
                getFavList({pageNo: this.currentPage, pageSize: this.pageSize}).then(res => {
                    this.files = res.data.records
                    this.fileTotal = res.data.total

                })
            },

            changeCurrent(current) {
                this.currentPage = current
                this.fetchFiles()
            },
            sizeChange(size) {
                this.pageSize = size
                this.fetchFiles()
            },
            handleUnFav(file) {
                let fileId = (this.selection.length < 1 && file) ? file.fileId : this.selection.map(file => file.fileId).join()
                cancelFav({ids: fileId}).then(res => {
                    this.$message.success(res.message || '取消收藏成功！')
                    this.fetchFiles()
                })
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
                    if(file.fileSize > 1024*1024*100) {
                        this.$message.warning('文件大于100M，请下载后查看！')
                        return
                    }
                    if(file.fileType === 'zip' || file.fileType === 'rar') {
                        this.unzipShow = true
                    }else {
                        this.$message.warning('暂不支持在线解压缩文件，请下载后查看！')
                    }
                    // this.$message.warning('暂不支持在线解压缩文件，请下载后查看！')
                }else if(file.fileKind === '文档')  {
                    this.pdfPreview = true
                }else {
                    this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                }
            },
            handleRightClickDown(file) {
                if(this.selection.length>0) {
                    this.handleDownload()
                }else {
                    downloadFiles({
                        fileId: file.id,
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
            }
        },
        watch: {
            type: {
                immediate: true,
                handler() {
                    this.fetchFiles()
                },
            },
        },
    }
</script>
<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;

        .files-operate-header {
            height: 40px;
            /*display: flex;*/
            /*justify-content: space-between;*/
            position: relative;
            align-items: flex-end;
            border-bottom: 1px solid #dedede;
            padding: 10px 20px 0px;
            box-sizing: content-box;
        }
    }
</style>
