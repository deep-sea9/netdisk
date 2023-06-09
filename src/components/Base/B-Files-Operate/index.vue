<template>
    <div class="files-operate-header">
        <b-button v-if="layout.indexOf('getShare')>-1" style="margin-right:20px" type="getShare" color="primary" @click="handleGetShareLink"/>

        <el-button-group id="operations" style="margin-right:20px" type="primary" v-show="selection.length <1">
            <b-button v-if="layout.indexOf('upload')>-1" type="upload" color="primary" @click="bigFileShow = true"/>
            <b-button v-if="layout.indexOf('create')>-1" type="create" color="primary" @click="handleCreate"/>
            <el-dropdown v-if="layout.indexOf('createDoc')>-1" trigger="click" @command="handleCreateDoc">
                <b-button type="createDoc" color="primary"/>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="txt">新建Txt文档</el-dropdown-item>
                    <el-dropdown-item command="word">新建Word文档</el-dropdown-item>
                    <el-dropdown-item command="excel">新建Excel文档</el-dropdown-item>
                    <el-dropdown-item command="ppt">新建PPT文档</el-dropdown-item>
                    <el-dropdown-item v-if="userName === '曾维煌' || userName === '吴秋悦'" command="mind">新建MindMap文档</el-dropdown-item>
                    <el-dropdown-item v-if="userName === '曾维煌' || userName === '吴秋悦'" command="flow">新建Flow文档</el-dropdown-item>
                    <el-dropdown-item v-if="userName === '曾维煌' || userName === '吴秋悦'" command="image">新建画图</el-dropdown-item>
                    <el-dropdown-item v-if="userName === '曾维煌' || userName === '吴秋悦'" command="bpmn">新建流程图</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>

        </el-button-group>

        <el-button v-show="selection.length <1" v-if="layout.indexOf('mount')>-1 && ftpFlag === '1'" size="small" type="primary" @click="handleFTPMount" icon="el-icon-folder-checked">FTP挂载</el-button>
        <el-button v-show="selection.length <1" v-if="layout.indexOf('mount')>-1 && ftpFlag === '1'" style="margin-right:20px" size="small" type="primary" @click="handleFTPUnmount" icon="el-icon-folder-delete">FTP卸载</el-button>

<!--        <el-button id="big-file-upload" v-if="layout.indexOf('big-file-upload') > -1" type="primary" size="small" @click="uploadVisible = true">大附件上传</el-button>-->
        <el-button-group type="primary" v-show="selection.length > 0">
            <b-button v-if="layout.indexOf('download')>-1" type="download" @click="handleDownload"/>
            <b-button v-if="layout.indexOf('share')>-1" type="share" @click="handleShare"/>
            <b-button v-if="layout.indexOf('fav')>-1 && showFav" type="collection" @click="handleFav"/>
            <b-button v-if="layout.indexOf('unfav')>-1 && showUnfav" type="unfav" @click="handleUnfav"/>
            <b-button v-if="selection.length === 1 && layout.indexOf('rename')>-1" type="rename" @click="handleRename"/>
            <b-button v-if="layout.indexOf('delete')>-1" type="delete" @click="handleDelete"/>
            <b-button v-if="layout.indexOf('move')>-1" type="move" @click="handleMove(null)"/>
            <b-button v-if="layout.indexOf('copy')>-1" type="copy" @click="handleCopy(null)"/>
            <b-button v-if="layout.indexOf('restore')>-1 && showRestore" type="restore" @click="$emit('restore')"/>
            <b-button v-if="layout.indexOf('cancel')>-1" type="cancel" @click="$emit('cancel')"/>
            <b-button v-if="layout.indexOf('recall')>-1" type="recall" @click="$emit('recall')"/>
            <b-button type="sync" @click="handleSyncFile"/>
        </el-button-group>
        <el-input
                size="small"
                class="header-search"
                placeholder="请输入关键字搜索"
                :maxlength="50"
                clearables
                v-model="keyword"
                @keyup.enter.native="$emit('search', keyword)"
                @clear="$emit('search', keyword)"
        >
            <el-button slot="append" icon="el-icon-search" @click="$emit('search', keyword)" />
        </el-input>
<!--        <b-upload :visible.sync="uploadVisible" :fold-id="currentFold" :disk-id="diskId" :disk-type="diskType" @upload-success="uploadSuccess"></b-upload>-->
        <!--todo 禁用当前文件夹id-->
        <b-move @confirm="handleConfirm" :visible.sync="moveVisible" :disk-id="diskId" :current-folder-id="currentFold"></b-move>
        <b-move @confirm="handleConfirm" :visible.sync="copyVisible" :move="false" :disk-id="diskId" :current-folder-id="currentFold"></b-move>
        <el-dialog title="文件上传" :visible.sync="bigFileShow" width="800px" :close-on-click-modal="false" :before-close="clearFiles">
            <web-uploader ref="uploader" :disk-id="diskId" :folder-id="currentFold" :disk-type="diskType" @upload-success="uploadSuccess" />
        </el-dialog>
        <b-sync-file :visible.sync="syncVisible" :disk-type="diskType" @confirm="syncFileConfirm" />
    </div>
</template>
<script>
    import WebUploader from '@/components/Custom/WebUploader'

    import {mapGetters} from "vuex";
    import {folderNameReg, folderRegTip} from '@/utils/constants'

    export default {
        name: 'b-files-operate',
        props: {
            selection: Array,
            currentFold: { type: String, default: '' },
            layout: {
                type: Array,
                default: () => ['upload', 'create', 'big-file-upload', 'download', 'share', 'fav', 'rename', 'delete', 'move', 'copy']
            },
            diskId: { type: String },
            diskType: { type: String, default: '1' } // 1: 个人；2：公共；4：群组
        },
        components: { WebUploader },
        data() {
            return {
                keyword: '',
                uploadVisible: false,
                createFoldVisible: false,
                moveVisible: false,
                copyVisible: false,
                bigFileShow: false,
                moveOrCopy: 'move',
                syncVisible: false
            }
        },
        computed: {
            ftpFlag() {
                return this.$store.state.system.ftpFlag
            },
            showFav() {
                return this.selection.findIndex(file => file.collectFlag === '1' || file.isCollect === true) < 0
            },
            showUnfav() {
                return this.selection.findIndex(file => file.collectFlag === '0' || file.isCollect === false) < 0
            },
            showRestore() {
                return this.selection.findIndex(file => !file.allowStore) < 0
            },
            ...mapGetters(['userName'])
        },
        methods: {
            confirmUpload() {
                this.bigFileShow = false
                // this.getData()
            },
            clearFiles(done) {
                // this.$refs['uploader'].destroyUploader()
                done()
            },
            uploadSuccess() {
                this.$emit('upload-success')
                this.$_EB.$emit('update-space')
                // this.uploadVisible = false
                // this.bigFileShow = false
            },
            handleFTPMount() {
                this.$emit('ftp-mount')
            },
            handleFTPUnmount() {
                this.$emit('ftp-unmount')
            },
            handleCreate() {
                this.$prompt('文件夹名称:', '新建文件夹', {
                    closeOnClickModal: false,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: folderNameReg,
                    inputErrorMessage: folderRegTip,
                    // inputPattern: /^[0-9a-zA-Z-_\u4e00-\u9fa5 ]+$/,
                    // inputErrorMessage: '无法使用非法字符@ . / \\ 等，请重新输入',
                }).then(({value}) => {
                    this.$emit('confirm-create', value)
                }).catch(() => {})
            },
            handleCreateDoc(command) {
                console.log(command);
                const {origin, pathname, search} = window.location
                if(command === 'txt') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/txt-edit`)
                }else if(command === 'excel') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/xlsx-edit`)
                } else if(command === 'word') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/word-edit`)
                }else if(command === 'mind') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/mind-edit`)
                } else if(command === 'flow') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/flow-edit`)
                } else if(command === 'image') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/draw-board`)
                } else if(command === 'bpmn') {
                    window.open(`${origin}${pathname}${search ? search + '&' : '?'}foldId=${this.currentFold == '0' ? '': this.currentFold}&diskId=${this.diskId === undefined? '': this.diskId}#/bpmn-designer`)
                }else {
                    this.$message.warning('暂未实现，敬请期待...')
                }
            },
            handleGetShareLink() {
                this.$emit('get-share')
            },
            handleShare() {
                // this.shareVisible = true
                this.$emit('share')
            },
            handleFav() {
                this.$emit('favorite')
            },
            handleUnfav() {
                this.$emit('unfav')
            },
            handleDownload() {
                if(this.selection.findIndex(file => file.downNum === 0) > -1) {
                    this.$message.warning('存在剩余下载次数为0的文件无法下载，请重新勾选')
                    return
                }
                this.$emit('download')
            },
            handleDelete() {
                this.$confirm('确定要删除所选择记录吗？', '提示', 'error').then((res) => {
                    if(res) {
                        this.$emit('delete')
                    }
                })

            },
            handleRename() {
                this.$prompt('请输入新的名称:', '重命名', {
                    closeOnClickModal: false,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: folderNameReg,
                    inputErrorMessage: folderRegTip,
                    // inputPattern: /^[0-9a-zA-Z-_\u4e00-\u9fa5 ]+$/,
                    // inputErrorMessage: '无法使用非法字符@ . / \\ 等，请重新输入',
                    inputPlaceholder: this.selection[0].fileName || this.selection[0].folderName,
                    inputValue: this.selection[0].fileName || this.selection[0].folderName,
                }).then(({value}) => {
                    if(value === this.selection[0].fileName || value === this.selection[0].folderName) {
                        return
                    }
                    this.$emit('rename', value)
                }).catch(() => {})
            },
            handleMove(rightClickFile = null) {
                this.moveVisible = true
                this.moveOrCopy = 'move'
                this.rightClickFile = rightClickFile
            },
            handleCopy(rightClickFile = null) {
                this.copyVisible = true
                this.moveOrCopy = 'copy'
                this.rightClickFile = rightClickFile
            },
            // handleUnfav() {
            //     this.$emit('unfav', this.rightClickFile)
            // },
            handleSyncFile() {
                this.syncVisible = true
            },
            handleConfirm(selection) {
                if(this.moveOrCopy === 'move') {
                    this.$emit('move', selection, this.rightClickFile, () => {
                        this.moveVisible = false
                        this.rightClickFile = null
                    })
                }else {
                    this.$emit('copy', selection, this.rightClickFile, () => {
                        this.copyVisible = false
                        this.rightClickFile = null
                    })
                }
            },
            syncFileConfirm(selections, diskType) {
                this.$emit('sync-file', selections, diskType)
                this.syncVisible = false
            }
        },
    }
</script>
<style lang="scss" scoped>
    .files-operate-header {
        height: 40px;
        display: flex;
        justify-content: flex-start;
        position: relative;
        align-items: flex-end;
        border-bottom: 1px solid #dedede;
        padding: 0 20px 10px;
        box-sizing: content-box;

        .header-search {
            width: 30%;
            max-width: 400px;
            min-width: 300px;
            position: absolute;
            bottom: 10px;
            right: 20px;
        }
    }
</style>
