<template>
    <div class="page">
        <b-files-operate ref="operate" :selection="selection"
                         :layout="['download', 'restore']"
                         @search="handleSearch"
                         @restore="handleRestore"
                         @download="handleDownload"
                         @get-share="getVisible = true"/>
        <b-files-node
                type="otherShare"
                :files="files"
                :index-list="indexList"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                @current-change="changeCurrent"
                @size-change="sizeChange"
                @click-file="handleClickFile"
                @to-pre="handleToPre"
                @to-previous="handleToPrevious"
                @to-next-fold="handleNextFold"
                @restore="handleRestore"
                @download="handleDownload"
        />

        <b-move title="保存到" :multiple="false" :visible.sync="foldVisible" @confirm="handleConfirmFold"></b-move>
        <el-dialog title="提取文档" :visible.sync="getVisible" width="650px">
            <div style="width: 100%;padding: 20px;">
                <el-form style="width: 90%;margin: 20px auto" :model="form" label-width="100px" size="small">
                    <el-form-item label="文档地址：">
                        <el-input placeholder="请输入链接地址" v-model="form.linkAddress" />
                    </el-form-item>
                    <el-form-item label="提取密码：">
                        <el-input placeholder="请输入链接提取密码，未设置密码可忽略" v-model="form.linkPassword" />
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" @click="handleGetShare">提取</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
        <b-image-preview :visible.sync="imagePreview" :slides="imgList" @close="imgList = []"/>
        <b-audio-preview :visible.sync="audioPreview" :url="audioURL" :audio-id="audioId" :share-id="currentClickFile.id"
                         :title="currentClickFile.fileName + '.' + currentClickFile.fileType"/>
        <b-video-preview
                :visible.sync="videoPreview"
                :share-id="currentClickFile.id"
                :video-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                :video-resource-id="currentClickFile.fileId"/>
        <b-pdf-preview :visible.sync="pdfPreview"
                       :pdf-title="currentClickFile.fileName + '.' + currentClickFile.fileType"
                       :file-id="currentClickFile.fileId"
                       :share-id="currentClickFile.id"
                       :type="currentClickFile.fileType"
                       :file="{ ...currentClickFile, id: currentClickFile.fileId }"/>
    </div>
</template>
<script>
    import {getLinkShareList, restoreToPerson} from '../../../api/personal/share'
    import {getOthersShareList} from "@/api/personal/share.js"
    import { downloadFiles, previewImg } from "@/api/common.js"

    import downloadTask from '../mixins/download-task'
    import fetchFileByWatch from "../mixins/fetchFileByWatch";

    export default {
        name: 'fileType',
        mixins: [downloadTask, fetchFileByWatch],
        data() {
            return {
                files: [],
                indexList: [{
                    folderName: '他人共享',
                    id: undefined
                }],
                selection: [],
                fileTotal: 0,
                currentPage: 1,
                // pageSize: 10,
                searchKeyword: '',
                getVisible: false,
                form: {
                    linkAddress: '',
                    linkPassword: ''
                },
                foldVisible: false,
                currentRightClickFile: {},
                currentClickFile: {},
                imagePreview: false,
                imgList: [],
                audioPreview: false,
                audioURL: '',
                videoPreview: false,
                pdfPreview: false,
                filePreviewSrc: '',
                txtVisible: false,
                txtString: ''
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
                getOthersShareList({
                    pageNo: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchKeyword,
                    folderId: this.currentShareFolderId,
                    shareId: this.currentShareId
                }).then(res => {
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            handleSearch(keyword) {
                getOthersShareList({pageNo: this.currentPage, pageSize: this.pageSize, name: keyword}).then(res => {
                    this.pageNo = 1;
                    this.searchKeyword = keyword
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
                    previewImg(file.fileId, file.id).then(res => {
                        let blob = new Blob([res], {
                            type: "image/PNG",
                        });
                        this.imgList.push({ objUrl: URL.createObjectURL(blob), ...file })
                        loadingInstance.close()
                        this.imagePreview = true
                    })
                } else if (file.fileKind === '音频') {
                    this.audioPreview = true
                } else if (file.fileKind === '视频') {
                    this.videoPreview = true
                }else if(file.fileKind === '压缩文件') {
                    this.$message.warning('暂不支持在线解压缩文件，请下载后查看！')
                }else if(file.fileKind === '文档'){
                    if(file.fileSize >= 1024*1024*100) {
                        this.$message.warning('该文件大小超过100M，暂不支持在线预览，请下载后查看')
                        return
                    }
                    this.pdfPreview = true
                }else {
                    this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                }
            },
            handleToPre(current) {

                this.currentPage = 1;
                this.indexList.pop()
                this.currentShareFolderId = current.id;
                if(!current.id) {
                    this.currentShareId = ''
                }
                this.fetchFiles()
            },
            handleToPrevious(current, index) {

                this.currentPage = 1;
                this.indexList.length = index + 1
                this.currentShareFolderId = current.id;
                if(!current.id) {
                    this.currentShareId = ''
                }
                this.fetchFiles()
            },
            handleNextFold(row) {
                console.log(row);
                if(row.fileId) {
                    this.currentShareId = row.id
                }
                this.indexList.push({ folderName: row.folderName, id: row.fileId })
                this.currentPage = 1;
                this.currentShareFolderId = row.fileId;
                this.fetchFiles()
            },
            handleRestore() {
                this.foldVisible = true
            },
            handleConfirmFold(folds) {
                let fileIds = this.selection.map(file => file.fileId)

                restoreToPerson({fileIds, folderId: folds[0].id, shareId: this.selection[0].id }).then(res => {
                    this.$message.success(res.message || '转存成功')
                    this.foldVisible = false
                })
            },

            handleGetShare() {

                if(this.form.linkAddress) {
                    getLinkShareList({ linkAddress: this.form.linkAddress, linkPassword: this.form.linkPassword, pageNo: 1, pageSize: 1 }).then(res => {
                        if(res.data) {
                            this.$router.push({
                                path: '/personal/other-link-share',
                                query: { linkAddress: this.form.linkAddress, linkPassword: this.form.linkPassword }
                            })
                        }
                    })
                }else {
                    this.$message.warning('请输入链接地址')
                }

            },
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
    }
</style>
