<template>
    <div class="uploader-container" id="uploader-container">
        <div class="handle-box">
            <div v-show="!uploadFolder" id="extend-upload-chooseFile">
                <i class="el-icon-plus"/> {{ uploaderBtnText }}
            </div>
            <el-upload ref="el-uploader" multiple action=""
                       :show-file-list="false"
                       :auto-upload="false"
                       :disabled="uploadFolder || uploading"
                       webkitdirectory
                       @change.native="handleChange">
                <el-button size="small" :disabled="uploadFolder || uploading" type="primary" icon="el-icon-plus">上传文件夹</el-button>
            </el-upload>
            <div style="margin-left: 20px">
<!--                <el-button size="small" type="primary" :icon="uploadStatus" class="handle-del mr10"-->
<!--                           @click="uploadToServer()" :disabled="uploadBtnDisabled">-->
<!--                    {{ uploadStatus === 'el-icon-upload' ? '开始上传' : '正在上传' }}-->
<!--                </el-button>-->
                <el-button size="small" type="danger" icon="el-icon-close" class="handle-del mr10" @click="clearFiles"
                           :disabled="uploadBtnDisabled">清空文件
                </el-button>
            </div>
        </div>

        <!--        <div class="showMsg">支持上传的文件后缀：{{ options.fileType }}</div>-->
        <el-table :data="fileListData" style="width: 100%" size="small">
            <el-table-column prop="fileName" label="文件名称" align="center" width="180" show-overflow-tooltip/>
            <el-table-column prop="fileSize" label="文件大小" align="center" width="140"/>
            <el-table-column prop="progress" label="进度" align="center" >
                <template slot-scope="scope">
                    <el-progress
                            :percentage="scope.row.progress.indexOf('%')> -1?parseInt(scope.row.progress): 100"
                            :format="percentFormat" />
                </template>
            </el-table-column>
            <el-table-column prop="ope" label="操作" align="center" fixed="right" width="140px" :key="statusKey">
                <template slot-scope="scope">
                    <el-button type="text" icon="el-icon-close" class="red" @click="removeRow(scope.$index, scope.row)">
                        移除
                    </el-button>
                    <el-button v-if="scope.row.status === 'stop' || scope.row.status === 'pending'"
                               type="text"
                               :icon="scope.row.status === 'stop'? 'el-icon-video-play': 'el-icon-video-pause'"
                               @click="stopUpload(scope.$index, scope.row)">
                        {{ scope.row.status === 'stop'? '继续' : '暂停' }}
                    </el-button>
                    <!--                    <el-button type="text" icon="el-icon-search" class="red" @click="seeFile(scope.$index, scope.row)">查看</el-button>-->
                    <el-button v-if="scope.row.status === 'error'" type="text" icon="el-icon-refresh" class="red"
                               @click="retry(scope.$index, scope.row)">重试
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>

    import $ from 'jquery'
    import WebUploader from 'webuploader'
    import 'webuploader/dist/webuploader.css'
    // import {FileSha} from '../../../assets/js/webupload/filesha'
    import {checkFiles, secondFile, createFold} from '@/api/common.js'

    const baseURL = process.env["VUE_APP_BASE_URL"]
    const realBaseURL = process.env["NODE_ENV"] === 'development'? '/api' : baseURL
    // import _ from 'lodash'
    // const realBaseURL = '/ndk_apis'

    export default {
        name: 'web-uploader',
        props: {
            headers: {type: String, default: ''},
            diskId: {type: String, default: ''},
            diskType: {type: String, default: ''},
            folderId: {type: String, default: ''},
            fileNumLimit: {type: Number, default: 100},
            fileSize: {type: Number, default: undefined},
            chunkSize: {type: Number, default: 20 * 1024 * 1024},
            maxFileSize: {type: Number, default: 1024 * 1024 * 1024 * 1024}, // 1T
            options: {
                type: Object,
                default: () => new Object({
                    fileType: '',
                    fileUploadUrl: '/files/upload', // 上传文件接口
                    fileCheckUrl: '/files/check', // 校验文件接口
                    secondUploadUrl: '/files/pass', // 秒传接口
                })
            },
            // fileListData: { type: Array, default: () => [] }
        },
        data() {
            return {
                uploadBtnDisabled: false,
                // uploader: {},
                uploadStatus: 'el-icon-upload',
                uploaderBtnText: '选择文件',
                // fileListData: [],
                fList: [{
                    numbers: 1,
                    fileName: '',
                    fileSize: '120',
                    progress: '20%',
                    oper: ''
                }],
                createFoldId: null,
                uploadFolder: false,
                currentUploadFolderObj: null,
                uploading: false,
                statusKey: 'pending' // 用于更新行视图
            }
        },
        computed: {
            uploader: {
                get() {
                    return this.$store.state.translate.uploader
                },
                set(v) {
                    this.$store.commit('translate/SET_UPLOADER', v)
                }
            },
            fileListData: {
                get() {
                    return this.$store.state.translate.uploadingList
                },
                set(v) {
                    this.$store.commit('translate/SET_UPLOADING_LIST', v)
                }
            }
        },
        mounted() {
            // if(!this.uploader) {
            //     this.register()
            //     this.createUploader()
            //     this.events()
            // }else {
            //     this.register()
            //     this.uploader.addButton({
            //         id: '#extend-upload-chooseFile',
            //         multiple: true,
            //     })
            //     this.events()
            //
            // }

            this.register()
            this.createUploader()
            this.events()


            this.$refs['el-uploader'].$children[0].$refs.input.webkitdirectory = true
        },
        beforeDestroy() {
            // this.clearFiles()
            if(this.uploader) {
                // this.offUploaderEvents()
                this.unRegister()
                // this.uploader.destroy()
            }
        },
        methods: {
            percentFormat(percent) {
                return percent === 100? '已上传': `${'    ' + percent+ '    '}%`
            },
            recursiveCreateFolder(folderObj, folderId, folderName) {
                createFold({
                    folderName,
                    diskType: this.diskType,
                    diskId: this.diskId,
                    id: folderId
                }).then(res => {
                    // this.$message.success(`${folderName}文件夹上传成功，正在上传该文件夹中文件，该过程可能需要较长时间，请稍等...`)
                    try {
                        this.createFoldId = res.data
                        folderObj.folderId = res.data
                        folderObj.value.forEach(file => {
                            file.folderId = folderObj.folderId
                        })
                        if(folderObj.children) {
                            const childFoldersName = Object.keys(folderObj.children)
                            childFoldersName.forEach(folderName => {
                                this.recursiveCreateFolder(folderObj.children[folderName], folderObj.folderId, folderName)
                            })
                            // this.recursiveCreateFolder(folderObj.children)
                        }else {
                            // if(!this.actionUpload) {
                            //     this.actionUpload = true
                            //
                            // }

                            this.$message.success('准备上传文件，该过程可能花费较长时间请耐心等待...')
                            this.allFilesForArray = Array.from(this.allFiles)
                            this.recursiveUploaderFileOfFolders(this.allFilesForArray[0])
                        }
                    }catch (e) {
                        console.log(e);
                        this.uploadFolder = false
                    }
                })
            },
            recursiveUploaderFileOfFolders(file) {
                this.uploader.addFiles(file)
                // 存入File对象的属性不能直接通过file.访问，JSON格式化能把不属于File的属性格式化出来
                this.currentUploadFolderObj = JSON.parse(JSON.stringify(file))
                this.createFoldId = file.folderId
                this.uploader.upload()

            },
            handleChange(e){
                this.uploadFolder = true
                const allFiles = e.target.files
                console.log(allFiles);
                this.allFiles = allFiles
                let sortByFolderNameOfFile = {}
                allFiles.forEach(file => {
                    const folderRoute = file.webkitRelativePath.split('/')
                    let stringLever = folderRoute.slice(0, folderRoute.length - 1).join('/')
                    if(!sortByFolderNameOfFile[stringLever]) {
                        sortByFolderNameOfFile[stringLever] = [file]
                    }else {
                        sortByFolderNameOfFile[stringLever].push(file)
                    }
                })

                console.log(sortByFolderNameOfFile);

                const result = { children: {} }

                const beginUpload = () => {
                    Object.keys(sortByFolderNameOfFile).forEach(key => {
                        const keys = key.split('/')
                        const value = sortByFolderNameOfFile[key]
                        const length = keys.length - 1
                        keys.reduce((prev, cur, index) => {
                            prev.children = prev.children?? {};
                            prev.children[cur] = prev.children[cur] ?? {};
                            if(index === length) {
                                prev.children[cur].value = value
                            }
                            return prev.children[cur]
                        }, result)
                    })

                    this.sortByFolderNameOfFile = result.children

                    this.rootFolderName = Object.keys(this.sortByFolderNameOfFile)[0]

                    const rootObj = this.sortByFolderNameOfFile[this.rootFolderName]

                    // 避免首层目录没有文件报错
                    if(!rootObj.value) {
                        rootObj.value = []
                    }

                    this.recursiveSetValue2EmptyArray(rootObj)

                    this.recursiveCreateFolder(rootObj, this.folderId === '0'? undefined: this.folderId, this.rootFolderName)
                }

                if(this.allFiles.length > 10 && Object.keys(sortByFolderNameOfFile).length > 5) {
                    this.$confirm('当前文件夹所包含文件夹数量大于5个，且文件数量大于10个，未避免应用程序崩溃建议拆分后分次上传。（点击确定取消上传，点击取消继续上传）', '提示', 'warning').then((res) => {
                        if (res) {
                            console.log('用户取消上传');
                            this.uploadFolder = false
                        }else {

                            beginUpload()
                        }
                    })
                }else {
                    beginUpload()
                }
            },
            recursiveSetValue2EmptyArray(obj) {
                if(!obj.value) {
                    obj.value = []
                }

                if(obj.children) {
                    Object.keys(obj.children).forEach(c => {
                        this.recursiveSetValue2EmptyArray(obj.children[c])
                    })
                }
            },
            confirmUpload() {

            },
            uploadToServer() {
                if (this.fileListData.length <= 0) {
                    this.$message.error({
                        showClose: true,
                        message: '没有要上传的文件'
                    })
                    return
                }
                this.uploadBtnDisabled = true
                this.uploadStatus = 'el-icon-loading'
                this.uploaderBtnText = '正在上传，请稍后...'
                this.uploader.upload()
                this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)
                this.$store.commit('translate/SET_UPLOADER', this.uploader)
            },
            clearFiles() {
                this.uploadBtnDisabled = false
                this.uploadStatus = 'el-icon-upload'
                // this.uploader.reset()
                this.fileListData.forEach(row => {
                    this.uploader.removeFile(row.fileId, true)
                })
                this.fileListData = []
            },
            destroyUploader() {
                this.fileListData = []
                this.uploader = null
            },
            removeRow(index, row) {
                this.uploader.removeFile(row.fileId, true)
                this.fileListData.splice(index, 1)
                this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)
            },
            removeFileOnList(file) {

                const fileIndex = this.fileListData.findIndex(_file => _file.fileId === file.id)
                fileIndex > -1 && this.fileListData.splice(fileIndex, 1)
                this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)
                this.uploader.removeFile(file.id, true)
            },
            stopUpload(index, row) {
                if (row.status === 'stop') {
                    row.status = 'pending'
                    this.statusKey = 'pending'
                    this.uploader.upload(row.file)
                } else if (row.status === 'pending') {
                    // this.$set(row, 'status', 'stop')
                    row.status = 'stop'
                    this.statusKey = 'stop'
                    this.uploader.stop(row.file)
                }

                this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)

            },
            seeFile(index, row) {
                console.log(index, row);
            },
            retry(index, row) {
                this.uploader.retry(row.file)
            },
            register() {
                WebUploader.Uploader.register({
                    name: 'beforeUpload',
                    beforeSendFile: (file) => {
                        if(file.name.length > 300) {
                            this.removeFileOnList(file)
                            return
                        }
                        var task = new $.Deferred();
                        // eslint-disable-next-line
                        FileSha.Methods.sha256(file, 10 * 1024 * 1024, (val) => {
                            file.sha = val.toString();
                            console.log("beforeSendFile , the sha256 is " + val);
                            // Deferred对象在钩子回调函数中经常要用到，用来处理需要等待的异步操作。

                            // 根据文件内容来查询MD5
                            this.uploader.md5File(file, 0, 10 * 1024 * 1024).progress((percentage) => {
                                console.log('计算md5进度:', percentage * 100 + '%');

                                if (percentage == 1) {
                                    var endTime = new Date().getTime();
                                    console.log("计算 MD5 结束时间：" + endTime)
                                }
                            }).then((val) => { // 完成
                                console.log('md5 result:', val);
                                file.md5 = val;
                                // 模拟用户id
                                file.uid = WebUploader.Base.guid();
                                // 进行md5判断
                                checkFiles({
                                    diskId: this.diskId,
                                    md5: val,
                                    sha: file.sha,
                                    size: file.size,
                                    fileName: file.name
                                }).then(res => {
                                    if (res.data === null) {
                                        // 文件不存在，那就正常流程
                                        task.resolve();
                                        // this.$store.commit('translate/SET_UPLOADER', this.uploader)
                                        console.log("文件不存在");
                                    } else if (res.data.status === '2') { // 秒传
                                        // 忽略上传过程，直接标识上传成功；
                                        console.log("文件已存在", this.currentUploadFolderObj);
                                        secondFile({
                                            diskId: this.diskId,
                                            fileName: file.name,
                                            folderId: this.uploadFolder ?
                                                (this.currentUploadFolderObj.folderId === '0'? undefined: this.currentUploadFolderObj.folderId) :
                                                (this.folderId === '0'? undefined: this.folderId),
                                            resourceId: res.data.resourceId
                                        }).then(res => {
                                            // this.$message.success(res.data.msg || '文件秒传成功！')
                                            this.fList.push(res.data)
                                            file.missChunks = null;
                                            file.pass = true;
                                            this.setTableBtn(file.id, '文件秒传成功', 'success')
                                            this.uploadBtnDisabled = false
                                            this.uploadStatus = 'el-icon-upload'
                                            this.uploader.skipFile(file);
                                            task.resolve();
                                            file.resourceId = res.data.id
                                        }).catch(() => {
                                            this.removeFileOnList(file)
                                            task.reject()
                                        })
                                    } else { // status === 1
                                        if (res.data.chunk) {
                                            file.missChunks = res.data.chunk + 1
                                        } else { // 一片都没上传过
                                            file.missChunks = 0
                                        }
                                        // this.$store.commit('translate/SET_UPLOADER', this.uploader)
                                        task.resolve();
                                    }
                                }).catch(err => {

                                    this.removeFileOnList(file)
                                    // this.uploading = false
                                    task.reject()
                                })
                            });
                        });

                        return $.when(task);
                    },
                    beforeSend: function (block) {
                        let task = new $.Deferred();
                        let file = block.file;
                        let missChunks = file.missChunks;
                        let blockChunk = block.chunk;
                        console.log("当前分块：" + blockChunk);
                        console.log("missChunks:" + missChunks);
                        // 没上传过或者有上传记录但未完成
                        if (typeof missChunks !== 'number' || (missChunks >= 0 && blockChunk >= missChunks)) {
                            task.resolve();
                        } else {
                            task.reject()
                        }
                        return $.when(task);
                    }
                })
            },
            unRegister() {
                WebUploader.Uploader.unRegister('beforeUpload')
            },
            // offUploaderEvents() {
            //     this.uploader.off('fileQueued')
            //     this.uploader.off('uploadProgress')
            //     this.uploader.off('uploadBeforeSend')
            //     this.uploader.off('error')
            //     this.uploader.off('uploadError')
            //     this.uploader.off('fileDequeued')
            //     this.uploader.off('uploadSuccess')
            //     this.uploader.off('uploadComplete')
            //     this.uploader.off('uploadFinished')
            // },
            createUploader() {
                this.uploader = WebUploader.create({
                    pick: {
                        id: '#extend-upload-chooseFile',
                        multiple: true
                    },

                    dnd: '#uploader-container',
                    //paste: '#uploader',
                    // swf: '../../../assets/others/Uploader.swf',
                    chunked: true,
                    chunkSize: this.chunkSize, // 分块大小（字节）
                    threads: 1,
                    //文件接收服务端
                    server: `${realBaseURL}/files/upload`,
                    fileSingleSizeLimit: this.$store.state.system.fileMax || 1024 * 1024 * 1024 * 10,
                    auto: true,
                    prepareNextFile: false,
                    compress: {
                        quality: 100,
                        allowMagnify: false,
                        crop: false,
                        preserveHeaders: true,
                        noCompressIfLarger: true,
                        compressSize: 1024 * 100
                    }
                })

            },
            events() {
                let uploader = this.uploader

                uploader.on('fileQueued', (file) => {
                    const ext = file.name.split('.').pop()
                    if(file.name.length >= 300 || ext.length >= 20) {
                        uploader.removeFile(file.id, true)
                        this.$message.error('文件名超出预期长度：300或后缀超出：20，禁止上传！')
                        return
                    }
                    this.uploading = true
                    let fileSize = this.formatFileSize(file.size)
                    let row = {
                        fileId: file.id,
                        fileName: file.name,
                        fileSize,
                        validateMd5: '0%',
                        progress: '0%',
                        state: 'waiting',
                        file
                    }
                    this.fileListData.push(row)
                })

                uploader.on('uploadProgress', (file, percentage) => {
                    console.log('uploadProgress', percentage);
                    this.setTableBtn(file.id, (percentage * 100).toFixed(2) + '%', 'pending')
                    this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)
                })

                uploader.on('uploadBeforeSend', (block, data, headers) => {

                    data.fileMd5 = block.file.md5
                    data.md5 = block.file.md5
                    data.sha = block.file.sha
                    data.fileName = block.file.name
                    data.contentType = block.file.type
                    data.chunk = block.chunk
                    data.chunks = block.chunks
                    data.diskId = this.diskId
                    data.folderId = this.uploadFolder ?
                        (this.currentUploadFolderObj.folderId === '0'? undefined: this.currentUploadFolderObj.folderId) :
                        (this.folderId === '0'? undefined: this.folderId)
                    data.size = block.file.size
                    // data.zoneMd5 = block.zoneMd5
                    data.zoneNowIndex = block.chunk
                    data.zoneTotalSize = block.total
                    data.zoneStartSize = block.start
                    data.zoneEndSize = block.end
                    delete data.id
                    headers.Authorization = this.headers.Authorization
                })

                uploader.on('error', (handler) => {
                    console.log(handler);
                    if (handler === 'F_EXCEED_SIZE') {
                        this.$message.error({
                            showClose: true,
                            message: `最大支持${this.formatFileSize(this.$store.state.system.fileMax || 1024 * 1024 * 1024 * 10)}`
                        })
                    } else if (handler === 'Q_TYPE_DENIED') {
                        this.$message.error({
                            showClose: true,
                            message: '不允许上传此类型文件'
                        })
                    }
                })

                uploader.on('uploadError', (file) => {
                    console.log(file);
                    this.setTableBtn(file.id, '上传失败', 'error')
                    this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)
                })

                uploader.on('fileDequeued', (file) => {
                    console.log(file);
                })

                uploader.on('uploadSuccess', (file, response) => {
                    if(file.pass && !response) {
                        this.$message.success('秒传成功')
                        this.$emit('upload-success')
                        this.removeFileOnList(file)
                    }else {
                        if (response.code !== 200) {
                            // this.$message.error({message: response.message})
                            this.setTableBtn(file.id, response.message, 'error')
                        } else {
                            // this.$message.success({message: response.message || '上传成功'})
                            this.setTableBtn(file.id, '文件上传成功', 'success')
                            this.$emit('upload-success')
                            this.removeFileOnList(file)

                        }
                    }
                    this.$store.commit('translate/SET_UPLOADING_LIST', this.fileListData)
                })

                uploader.on('uploadComplete', (file) => {
                    // this.uploadBtnDisabled = false
                    // this.uploadStatus = 'el-icon-upload'
                    console.log(file);
                })

                uploader.on('uploadFinished', () => {
                    this.uploadBtnDisabled = false
                    this.uploadStatus = 'el-icon-upload'
                    this.uploading = false
                    if(this.uploadFolder) {
                        this.createFoldId = null
                        this.allFilesForArray.shift()
                        if(this.allFilesForArray.length > 0) {
                            this.recursiveUploaderFileOfFolders(this.allFilesForArray[0])
                        }else {
                            this.uploadFolder = false
                        }
                    }
                })
            },
            formatFileSize(fileSize) {
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
            setTableBtn(fileId, showMsg, status) {

                let fileList = this.fileListData
                for (let i = 0; i < fileList.length; i++) {
                    if (fileList[i].fileId === fileId) {
                        // this.$set(this.fileListData[i], 'progress', showMsg)
                        this.fileListData[i].progress = showMsg
                        this.fileListData[i].status = status
                    }
                }
            }
        }
    }
</script>

<style lang="scss">
    .uploader-container {
        padding: 30px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        max-height: 520px;
        overflow: auto;

        .handle-box {
            margin-bottom: 20px;
            display: flex;
            /*justify-content: space-between;*/
            align-items: center;
            width: 100%;

            #extend-upload-chooseFile {
                margin-right: 20px;
                font-size: 12px;
                .webuploader-pick {
                    padding: 9px 15px !important;
                    background-color: var(--main-color, $main_color) !important;
                }
            }
        }

        .showMsg {
            margin: 5px;
            background: radial-gradient(#d2b8b8, transparent);
        }
    }
</style>
