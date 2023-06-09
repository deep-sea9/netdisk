<template>
    <div class="page">
        <div class="files-operate-header">
            <el-button style="float: left;margin-right: 20px" type="primary" size="small" @click="$router.replace('/')">返回网盘</el-button>

            <el-button-group style="float: left" type="primary" v-show="selection.length > 0">
                <el-button type="primary" size="small" plain @click="handleRestore">
                    <i class="fa fa-window-restore" style="margin-right: 5px"></i>
                    <span>保存到网盘</span>
                </el-button>
                <el-button type="primary" size="small" plain @click="handleDownload">
                    <i class="fa fa-download" style="margin-right: 5px"></i>
                    <span>下载</span>
                </el-button>
            </el-button-group>

            <div style="width: 200px;text-align: right;float: right;height: 30px;line-height: 30px;">{{ userName }}</div>
        </div>
        <div v-if="needPwd" class="input-pwd flex-center">
            <el-input style="width: 240px;margin-right: 20px;" v-model="sharePwd" placeholder="请输入共享口令" type="password" @keydown.enter="checkShareLink" />
            <el-button type="primary" @click="checkShareLink">确定</el-button>
        </div>
        <div v-else>
            <div class="b-files-header">
                <div style="margin-right: 20px">
                    <span class="no-last" @click="toPre" v-if="indexList.length > 1">返回上一级  | </span>
                    <span v-for="(fold, index) in indexList"
                          :key="fold.id"
                          @click="toPrevious(fold, index)" :class="{
                            'no-last': index < indexList.length - 1
                    }">
                        {{ fold.folderName }}
                        <span v-if="index < indexList.length - 1">></span>
                    </span>
                </div>
                <h3 style="margin-right: 20px;">
                    {{ firstFileName }}
                </h3>
                <div style="margin-right: 20px;">
                    <i class="fa fa-clock"/> &nbsp; {{ expireTime }}
                </div>
                <div>
                    过期时间：{{ expireRest }}天后
                </div>
            </div>
            <el-table
                    :data="files"
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    @row-contextmenu="rightClick"
                    @row-dblclick="handleClickFile"
                    ref="table"
            >
                <el-table-column type="selection" width="55" align="center"/>
                <el-table-column prop="fileName" label="文件名" show-tooltip-when-overflow>
                    <div class="table-column"
                         slot-scope="scope"
                         v-contextmenu:contextmenu
                    >
                        <img class="file-icon"
                             @click.stop="() => {}"
                             :src="getPreviewSrc(scope.row)"
                        />
                        <span>{{ scope.row.fileName || scope.row.folderName }}</span>
                    </div>
                </el-table-column>
                <el-table-column prop="shareTime" label="分享日期"/>
                <el-table-column prop="fileSize" label="大小">
                    <div slot-scope="scope">
                        <span>{{ fileSize(scope.row.fileSize) }}</span>
                    </div>
                </el-table-column>
                <el-table-column prop="shareUserName" label="创建者"/>
                <!--			<el-table-column prop="orgName" label="所属部门" />-->
            </el-table>

            <div class="bottom-pagination">
                <el-pagination
                        layout="total,prev,pager,next,jumper"
                        :current-page="pageNo"
                        :page-size="pageSize"
                        :total="fileTotal"
                        @current-change="changeCurrent"/>
            </div>
        </div>
        <b-move title="保存到" :multiple="false" :visible.sync="foldVisible" @confirm="handleConfirmFold"></b-move>

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

        <v-contextmenu ref="contextmenu" v-loading="fileLimitsLoading">
            <v-contextmenu-item
                    v-for="item in fileLimits"
                    :key="item.code"
                    @click.native="handleRightMenu(item.code, menuTarget)"
            >
                <i :class="iconType(item.code)" style="width: 13px;"></i>
                <span>{{ item.name }}</span>
            </v-contextmenu-item>
        </v-contextmenu>
    </div>
</template>
<script>
    import {getLinkShareList, restoreToPerson, checkShareLink} from '@/api/personal/share'
    import {downloadFiles, previewImg} from "@/api/common.js"
    import fetchFileIcon from "@/utils/fetchFileIcon.js";

    import {RIGHT_CONTEXT_OTHER_SHARE} from "@/utils/constants.js";

    import {getFormatFileSize} from "@/utils/index.js"
    import {getCurrentTime, setRandomId} from "@/utils/index";
    import {batchDownloadFiles} from "@/api/common";

    import { getThumnUrlOfImg } from "@/api/file";

    import fetchFileByWatch from "../mixins/fetchFileByWatch";

    export default {
        name: "OtherLinkShare",
        mixins: [fetchFileByWatch],
        data() {
            return {
                files: [],
                selection: [],
                pageNo: 1,
                // pageSize: 10,
                fileTotal: 0,
                foldVisible: false,
                menuTarget: null,
                fileLimits: [],
                fileLimitsLoading: false,
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
                checked: false,
                currentShareFolderId: undefined,
                needPwd: false,
                sharePwd: '',
                indexList: [{
                    folderName: '共享文件',
                    id: undefined
                }]
            };
        },
        computed: {
            type() {
                return this.$route.meta.type;
            },
            firstFileName() {
                return this.files.length > 0 ? (this.files.length > 1? this.files[0].fileName + '等' : this.files[0].fileName) : ''
            },
            expireTime() {
                return this.files.length > 0 ? this.files[0].expireTime : ''
            },
            expireRest() {
                const file = this.files.length > 0 ? this.files[0] : {}
                const now = new Date().getTime()
                const expireTime = new Date(file.expireTime).getTime()
                const oneDayTime = 1000 * 60 * 60 * 24
                const deltaTime = expireTime - now

                if (deltaTime > 0) {
                    return Math.ceil(deltaTime / oneDayTime)
                } else {
                    return 0
                }

            },
            iconType() {
                return (type) => {
                    switch (type) {
                        case 'open':
                            return 'far fa-folder-open'
                        case 'download':
                            return 'fa fa-arrow-alt-from-top'
                        case 'share':
                            return 'fa fa-share-alt'
                        case 'favorite':
                            return 'fa fa-star'
                        case 'copy':
                            return 'fa fa-copy';
                        case 'move':
                            return 'fa fa-file-export'
                        case 'rename':
                            return 'fa fa-eraser';
                        case 'delete':
                            return 'fa fa-trash'
                        case 'modify':
                            return 'fa fa-eraser';
                        case 'cancel':
                            return 'fa fa-reply';
                        case 'recall':
                            return 'fa fa-retweet';
                        case 'restore':
                            return 'fa fa-window-restore';
                    }
                }
            },
            audioId() {
                return this.currentClickFile.fileKind? (this.currentClickFile.fileKind === '音频' ? this.currentClickFile.fileId : undefined) : undefined
            },
            downloadingList() {
                return this.$store.state.translate.downloadingList
            },
            userName() {
                return this.$store.state.user.userName
            }
        },
        components: {
            // BFilesOperate,
        },
        methods: {
            fetchFileIcon,
            getPreviewSrc(row) {
                if(row.fileKind === '图片') {
                    return getThumnUrlOfImg(row.fileId || row.id)
                }else {
                    return this.fetchFileIcon(row.fileType, row.fileName || row.folderName, row.tableKind)
                }
            },
            rightClick(row, column, event) {
                this.menuTarget = row;
                event.preventDefault();

                this.fileLimitsLoading = true;

                this.$refs['table'].clearSelection()
                this.$refs['table'].toggleRowSelection(row)

                this.fileLimits = RIGHT_CONTEXT_OTHER_SHARE;

                this.fileLimitsLoading = false;

            },
            handleRightMenu(code, row) {
                switch (code) {
                    case 'download':
                        this.handleDownload(row)
                        break;

                    case 'restore':
                        this.handleRestore()
                        break
                }
            },
            fetchFiles() {
                getLinkShareList({
                    pageNo: this.pageNo,
                    pageSize: this.pageSize,
                    linkId: this.linkId,
                    folderId: this.currentShareFolderId
                }).then(res => {
                    this.files = res.data.records
                    this.fileTotal = res.data.total
                })
            },
            handleSelectionChange(selection) {
                this.selection = selection
            },
            changeCurrent(current) {
                this.pageNo = current
                this.fetchFiles()
            },
            handleRestore() {
                this.foldVisible = true
            },
            handleConfirmFold(folds) {
                let fileIds = this.selection.map(file => file.fileId)

                restoreToPerson({fileIds, folderId: folds[0].id, shareId: this.selection[0].id}).then(res => {
                    this.$message.success(res.message || '转存成功')
                    this.foldVisible = false
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
            handleDownload() {
                let downloadingList = this.downloadingList || []
                let id = ""
                // this.$message.success('已添加至下载队列')
                // 单个文件
                if(this.selection.length === 1) {
                    id = this.selection[0].fileId
                    downloadingList.push({
                        fileId: id,
                        fileName: this.selection[0].fileName || this.selection[0].folderName,
                        fileSize : 0,
                        fileType: this.selection[0].fileType || '.zip',
                        progress: '等待下载',
                        status: 'waiting',
                        uid: id + new Date().getTime()
                    })
                    downloadFiles({fileId: id}, (e) => {
                        this.handleDownloadProgress(e, downloadingList, id, e.total)
                    }).then(res => {
                        let blob = new Blob([res.data], {
                            type: "application/vnd.ms-excel",
                        });
                        let objectUrl = URL.createObjectURL(blob);
                        let a = document.createElement("a");
                        a.href = objectUrl;
                        if(this.selection[0].fileType) {
                            a.download = this.selection[0].fileName + '.' + this.selection[0].fileType;
                        } else {
                            // a.download = decodeURI(res.headers['download-filename']); // 中文名
                            a.download = this.selection[0].folderName + '.zip';
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
                } else {
                    let fileIds = this.selection.map(file => file.fileId).join(",")
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
                this.percentage = Math.floor(e.loaded / size * 100);
                this.setTableBtn(list, fileId, this.percentage + '%', 'pending')
                this.$store.dispatch('translate/setDownloadingList', list)
            },
            fileSize(fileSize) {
                let size = fileSize ? (fileSize / 1024).toFixed(2) : '-'
                if (size === '-') {
                    return size
                }
                if (size > 1024) {
                    size = (size / 1024).toFixed(2)
                } else {
                    return size + 'KB'
                }
                if (size > 1024) {
                    size = (size / 1024).toFixed(2)
                } else {
                    return size + 'MB'
                }
                return size + 'GB'
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
                }else if(file.tableKind === '文件夹') {
                    this.handleNextFold(file)
                }else {
                    this.$message.warning('暂不支持在线打开该应用，请下载后查看')
                }
            },
            checkShareLink() {
                checkShareLink({ linkId: this.linkId, password: this.sharePwd }).then(res => {
                    if(res.success) {
                        this.fetchFiles()
                        this.needPwd = false
                    }else {
                        this.$message.warning(res.message || '无效链接！')
                    }
                }).catch(e => {
                    console.log(e);
                    if(e.code === 401) {
                        this.needPwd = true
                    }
                })
            },
            toPre() {

                const current = this.indexList[this.indexList.length - 2]

                this.currentPage = 1;
                this.indexList.pop()
                this.currentShareFolderId = current.id;
                if(!current.id) {
                    this.currentShareId = ''
                }
                this.fetchFiles()
            },
            toPrevious(current, index) {

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

        },
        mounted() {
            const {linkAddress} = this.$route.query
            this.linkAddress = linkAddress
            this.linkId = this.$route.params.id

           this.checkShareLink()
        }
    };
</script>
<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;

        .files-operate-header {
            height: 40px;
            position: relative;
            align-items: flex-end;
            border-bottom: 1px solid #dedede;
            padding: 10px 20px 0px;
            box-sizing: content-box;
        }

        .input-pwd {
            width: 100%;
            height: 480px;
            align-items: center;
            display: flex;
            justify-content: center;
        }

        .b-files-header {
            display: flex;
            color: #888;
            font-size: 12px;
            height: 40px;
            align-items: center;
            margin-bottom: 10px;
            padding: 0 10px;

            .no-last {
                cursor: pointer;
                /*color: #008FCC;*/
                color: var(--main-color, $main_color);
            }
        }

        .table-column {
            display: flex;
            align-items: center;
            user-select: none;

            .file-icon {
                width: 20px;
                height: 20px;
                margin-right: 6px;
            }
        }

        .bottom-pagination {
            bottom: 10px;
            position: fixed;
            right: 10px;
        }
    }
</style>
