<template>
    <div class="page">
        <b-files-operate ref="operate" :selection="selection"
                         :layout="['delete', 'cancel', 'recall']"
                         @search="handleSearch"
                         @cancel="handleCancel"
                         @recall="handleRecall"
                         @delete="handleDelete"/>
        <b-files-node
                type="myShare"
                :files="files"
                :index-list="indexList"
                :selection.sync="selection"
                :file-total="fileTotal"
                :current-page="currentPage"
                :page-size="pageSize"
                @open="handleShareDetail"
                @copy-link="handleCopyLink"
                @recall="handleRecall"
                @cancel="handleCancel"
                @modify="handleModify"
                @current-change="changeCurrent"
                @size-change="sizeChange"
                @click-file="handleClickFile"
                @to-pre="handleToPre"
                @to-previous="handleToPrevious"
                @to-next-fold="handleNextFold"
                @delete="handleDelete"
                @share-detail="handleShareDetail"
        />
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
                       :file="{ ...currentClickFile, shareId: currentClickFile.id, id: currentClickFile.fileId }"/>
        <b-link-share :visible.sync="modifyVisible" :link-obj="currentRowDetail" @success="handleModifySuccess" />
        <b-friend-share :visible.sync="modifyFriendVisible" :link-obj="currentRowDetail" @success="handleModifySuccess" />
        <el-dialog title="查看访问详情" :visible.sync="detailVisible">
            <div style="padding: 20px;">
                <div class="b-files-header">
                    <el-tooltip :content="firstFileName" placement="top">
                        <h3 style="margin-right: 40px;max-width: 40%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">
                            {{ firstFileName }}
                        </h3>
                    </el-tooltip>

                    <div style="margin-right: 20px;">
                        <i class="far fa-clock" /> &nbsp; {{ expireTime }}
                    </div>
                    <div>
                        过期时间：{{ expireRest }}天后
                    </div>
                </div>
                <el-tag>访问成员</el-tag>
                <visited-member :file-id="currentRowDetail.fileId" :share-id="currentRowDetail.id" />
                <el-tag style="margin-top: 15px;">访问日志</el-tag>
                <visited-log :file-id="currentRowDetail.fileId" :share-id="currentRowDetail.id" />
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import {getMyShareList, deleteShare, recallShare, cancelShare} from "@/api/personal/share.js"
    import { previewImg } from '@/api/common.js'
    import { computeRestDays } from "../../../utils";
    import VisitedMember from "./VisitedMember";
    import VisitedLog from "./VisitedLog";
    import copy from "copy-to-clipboard";

    export default {
        name: 'fileType',
        data() {
            return {
                files: [],
                indexList: [{
                    folderName: '我的共享',
                    id: undefined
                }],
                selection: [],
                fileTotal: 0,
                currentPage: 1,
                searchKeyword: '',
                currentRowDetail: {},
                detailVisible: false,
                modifyVisible: false,
                modifyFriendVisible: false,
                currentClickFile: {},
                imagePreview: false,
                imgList: [],
                audioPreview: false,
                audioURL: '',
                videoPreview: false,
                pdfPreview: false,
                filePreviewSrc: '',
                txtVisible: false,
                txtString: '',
                shareRootFolderId: '',
                currentShareFolderId: '',
                currentShareId: ''
            }
        },
        computed: {
            type() {
                return this.$route.meta.type
            },
            firstFileName() {
                return this.currentRowDetail.folderName || this.currentRowDetail.fileName || ''
            },
            expireTime() {
                return this.currentRowDetail.expireTime || ''
            },
            expireRest() {
                if(this.currentRowDetail) {
                    return computeRestDays(new Date(), this.currentRowDetail.expireTime)
                }else {
                    return ''
                }
            },
            pageSize() {
                return this.$store.state.app.globalPageSize
            },
            audioId() {
                return this.currentClickFile.fileKind? (this.currentClickFile.fileKind === '音频' ? this.currentClickFile.fileId : undefined) : undefined
            }
        },
        components: {
            VisitedMember,
            VisitedLog
        },
        methods: {
            fetchFiles() {
                getMyShareList({
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
                getMyShareList({pageNo: this.currentPage, pageSize: this.pageSize, name: keyword}).then(res => {
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
                this.fetchFiles()
            },
            handleCopyLink(row) {
                if(row.linkAddress) {
                    if(copy(row.linkAddress, { format: 'text/plain' })) {
                        this.$message.success('复制成功!')
                    }else {
                        this.$message.warning('复制失败，请重试或尝试其它浏览器重试')
                    }
                }else {
                    this.$message.warning('未找到分享链接，请重新创建分享链接')
                }

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
            handleModify(link) {
                this.currentRowDetail = link
                if(link.shareWay === '2') {
                    this.modifyVisible = true
                }else {
                    this.modifyFriendVisible = true
                }
            },
            handleModifySuccess() {
                this.fetchFiles()
            },
            handleDelete(file) {
                if(file) {
                    this.$confirm('确定要删除该共享链接吗？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'error'
                    }).then((res) => {
                        if (res) {
                            const ids = [file.id]
                            const formData = new FormData()
                            formData.append('ids', ids)
                            deleteShare(formData).then(res => {
                                this.$message.success(res.message)
                                this.fetchFiles()
                            })
                        }
                    })
                }else {
                    const hasValid = this.selection.findIndex(link => {

                        const deltaTime = new Date(link.expireTime).getTime() - new Date().getTime()
                        return ( deltaTime > 0 && link.status !== '已取消' )
                    })

                    if(hasValid > -1) {
                        this.$message.warning('所选择文件中包含未失效链接无法删除，请先撤回该链接或取消选择后删除')
                    }else {
                        this.$confirm('确定要删除该共享链接吗？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'error'
                        }).then((res) => {
                            if (res) {
                                const ids = this.selection.map(file => file.id)
                                const formData = new FormData()
                                formData.append('ids', ids)
                                deleteShare(formData).then(res => {
                                    this.$message.success(res.message)
                                    this.fetchFiles()
                                })
                            }
                        })
                    }
                }
            },
            handleShareDetail(row) {
                this.currentRowDetail = row
                this.detailVisible = true
            },
            handleRecall(link) {
                if(link) {
                    const hasExpire = new Date(link.expireTime).getTime() - new Date().getTime()
                    if(hasExpire < 0 || link.status === '已取消') {
                        this.$message.warning('该分享文件已过期或已取消，无法强制撤回')
                    }else {
                        this.$confirm('确定要撤回该共享链接吗？撤回共享后，其他人将无法访问您共享的文件且已经转存到个人网盘的文档也将撤回', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'error'
                        }).then((res) => {
                            if (res) {
                                const formData = new FormData()
                                formData.append('ids', [link.id])
                                recallShare(formData).then(res => {
                                    this.fetchFiles()
                                    this.$message.success(res.message || '撤回成功')
                                })
                            }
                        })
                    }
                }else {
                    const hasExpire = this.selection.findIndex(link => {
                        const deltaTime = new Date(link.expireTime).getTime() - new Date().getTime()
                        return (deltaTime < 0 || link.status === '已取消')
                    })

                    if(hasExpire > -1) {
                        this.$message.warning('所选择文件中包含已失效链接无法撤回，请重新选择')
                    }else {
                        this.$confirm('确定要撤回该共享链接吗？撤回共享后，其他人将无法访问您共享的文件且已经转存到个人网盘的文档也将撤回', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'error'
                        }).then((res) => {
                            if (res) {
                                const ids = this.selection.map(link => link.id)
                                const formData = new FormData()
                                formData.append('ids', ids)
                                recallShare(formData).then(res => {
                                    this.fetchFiles()
                                    this.$message.success(res.message || '撤回成功')
                                })
                            }
                        })
                    }
                }
            },
            handleCancel(link) {
                if(link) {
                    const hasExpire = new Date(link.expireTime).getTime() - new Date().getTime()
                    if(hasExpire < 0 || link.status === '已取消') {
                        this.$message.warning('该分享文件已过期或已取消，无法取消')
                    }else {
                        this.$confirm('确定要取消该共享链接吗？取消共享后，其他人将无法访问您共享的文件', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'error'
                        }).then((res) => {
                            if (res) {
                                const formData = new FormData()
                                formData.append('ids', [link.id])
                                cancelShare(formData).then(res => {
                                    this.fetchFiles()
                                    this.$message.success(res.message || '取消成功')
                                })
                            }
                        })
                    }
                }else {
                    const hasExpire = this.selection.findIndex(link => {
                        const deltaTime = new Date(link.expireTime).getTime() - new Date().getTime()
                        return (deltaTime < 0 || link.status === '已取消')
                    })

                    if(hasExpire > -1) {
                        this.$message.warning('所选择文件中包含已失效链接无法撤回，请重新选择')
                    }else {
                        this.$confirm('确定要取消该共享链接吗？取消共享后，其他人将无法访问您共享的文件', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'error'
                        }).then((res) => {
                            if (res) {
                                const ids = this.selection.map(link => link.id)
                                const formData = new FormData()
                                formData.append('ids', ids)
                                cancelShare(formData).then(res => {
                                    this.fetchFiles()
                                    this.$message.success(res.message || '取消成功')
                                })
                            }
                        })
                    }
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

        .b-files-header {
            display: flex;
            color: #888;
            font-size: 12px;
            height: 40px;
            align-items: center;
            margin-bottom: 10px;
            padding: 0 10px;
        }
    }
</style>
