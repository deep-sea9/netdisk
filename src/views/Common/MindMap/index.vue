<template>
    <div class="editor-container">
        <div class="top-operation">
            <el-input v-if="!fileId" style="width: 30%" size="small" v-model="fileName" placeholder="可以在这里输入要保存的文档名称噢" />
            <div v-else class="word-title">{{ fileName }}</div>
            <div class="personal-info">
                {{ userName }}
                <el-button size="small" @click="saveAndUpload">保存至网盘</el-button>
                <el-dropdown @command="downloadFile" trigger="click">
                    <el-button size="small">下载到本地</el-button>

                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="doc">下载为xmind</el-dropdown-item>
                        <el-dropdown-item command="png">下载为图片</el-dropdown-item>
                        <el-dropdown-item command="svg">下载为svg</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>

            </div>
        </div>
        <div class="mind-editor">
            <div id="mind-map" style="margin: 0;padding: 0;width: 100%;height: 100%;"></div>
        </div>
    </div>
</template>

<script>
    import MindElixir, { E } from 'mind-elixir'
    import exportXMind from '@mind-elixir/export-xmind'
    import exportImage from '@mind-elixir/export-image'

    import qs from 'qs'

    import {checkFiles, downloadFiles, uploadFiles} from "@/api/common";
    import { uploadFileForUpdateHistory } from "@/api/file";

    import {getFileSHA} from "@/utils/file-read";
    import SparkMd5 from "spark-md5";

    const chunkSize = 10 * 1024 * 1024

    export default {
        name: "mind-edit",
        data() {
            return {
                fileName: '',
                hasSaved: false,
                fileId: '',
                MM: null
            }
        },
        computed: {
            userId() {
                return this.$store.state.user.userId
            },
            userName() {
                return this.$store.state.user.userName
            }
        },
        mounted() {
            // console.log(this.$route.params);
            const queryStringMap = qs.parse(window.location.search.split('?')[1])
            if(queryStringMap.fileId) {
                this.fileId = queryStringMap.fileId
                this.fileName = queryStringMap.fileName
                this.suffixArray = this.fileName.split('.')
                this.suffix = this.suffixArray[this.suffixArray.length - 1]
                this.handleDownload()
            }else {
                this.foldId = queryStringMap.foldId
                this.diskId = queryStringMap.diskId
                this.initMindElixir()

            }

        },
        methods: {
            initMindElixir(mindContent) {
                this.MM = new MindElixir({
                    el: '#mind-map',
                    direction: MindElixir.LEFT,
                    locale: 'zh_CN'
                })

                this.MM.install(exportXMind)
                this.MM.install(exportImage)

                mindContent? this.MM.init(mindContent) : this.MM.init(MindElixir.new("new topic"))
            },
            handleDownload() {
                if(this.suffix !== 'mind') {
                    this.$message.warning('非mind格式文档，无法解析，请打开本地编辑器编辑')
                    return
                }
                const loadingOption = { lock: true, text: '正在加载文档，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)

                downloadFiles({fileId: this.fileId}).then(res => {

                    const fileReader = new FileReader()

                    fileReader.onload = (result) => {

                        const mindStr = result.target.result.slice(10)

                        this.initMindElixir(JSON.parse(mindStr))
                    }

                    fileReader.readAsText(res.data)

                    this.loading.close()
                }).catch(() => {
                    this.loading.close()
                    this.$message.error('文件获取失败，请重试...')
                })
            },
            saveAndUpload() {

                if(!this.fileId) {
                    if(!this.fileName) {
                        this.$prompt('文件名称', '保存文件', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            inputPattern: /\S/,
                            inputErrorMessage: '请输入文件名称',
                        }).then(({value}) => {
                            this.fileName = value
                            const file = new File(['mind' + 'leadal' + this.MM.getAllDataString()], value + '.mind', {type: 'application/json;charset=utf-8'})
                            this.checkFile(file).then(_ => {
                                this.uploadFile(file)
                            })

                        }).catch(() => {})
                    }else {
                        const file = new File(['mind' + 'leadal' + this.MM.getAllDataString()], this.fileName + '.mind', {type: 'application/json;charset=utf-8'})
                        this.checkFile(file).then(_ => {
                            this.uploadFile(file)
                        })
                    }
                }else {
                    this.uploadFileForHistory()
                }

            },

            checkFile(file) {
                this.chunks = Math.ceil(file.size / chunkSize)
                return new Promise((resolve, reject) => {
                    getFileSHA(file.slice(0, chunkSize)).then(val => {
                        file.sha = val;
                        console.log("beforeSendFile , the sha256 is " + val);
                        const sparkMD5 = new SparkMd5.ArrayBuffer()
                        const fileReader = new FileReader()

                        fileReader.onload = (e) => {
                            sparkMD5.append(e.target.result)

                            file.md5 = sparkMD5.end()

                            // 进行md5判断
                            checkFiles({
                                diskId: this.diskId,
                                md5: file.md5,
                                sha: file.sha,
                                size: file.size,
                                fileName: file.name
                            }).then(res => {
                                if (res.data === null || res.data.status == 1) {
                                    // 文件不存在，那就正常流程
                                    resolve(res.data);
                                    console.log("文件不存在");
                                } else if (res.data.status === '2') { // 秒传
                                    // 忽略上传过程，直接标识上传成功；
                                }
                            }).catch(_ => reject(_))
                        }

                        fileReader.onerror = (e) => {
                            console.log('read file error', e);
                        }

                        fileReader.readAsArrayBuffer(file.slice(0, chunkSize))
                    })
                })
            },
            uploadFile(file) {

                const formData = new FormData()
                formData.append('chunk', 0)
                formData.append('chunks', this.chunks)
                formData.append('diskId', this.diskId)
                formData.append('userId', this.userId)
                formData.append('folderId', this.foldId)
                formData.append('fileName', file.name)
                formData.append('md5', file.md5)
                formData.append('sha', file.sha)
                formData.append('size', file.size)

                formData.append('file', file)
                uploadFiles(formData).then(res => {
                    this.fileId = res.data.fileId
                    this.hasSaved = true
                    this.fileName = this.fileName + '.mind'
                    this.$message.success(res.message || '上传成功！')
                })
            },
            uploadFileForHistory() {
                const file = new File(['mind' + 'leadal' + this.MM.getAllDataString()], this.fileName, {type: 'application/json;charset=utf-8'})
                const formData = new FormData()
                formData.append('fileId', this.fileId)
                formData.append('userId', this.userId)
                formData.append('uploadFile', file)
                uploadFileForUpdateHistory(formData).then(res => {
                    this.$message.success(res.message || '文档更新成功！')
                })
            },
            downloadFile(type = 'doc') {
                if(!this.fileName) {
                    this.$prompt('文件名称', '保存文件', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '请输入文件名称',
                    }).then(({value}) => {
                        console.log('mind data', this.MM.getAllData());
                        if(type === 'doc') {
                            this.MM.exportXmindFile(value)
                        }else if(type === 'png') {
                            this.MM.exportPng(value)
                        }else {
                            this.MM.exportSvg(value)
                        }

                    }).catch(() => {})
                }else {
                    if(type === 'doc') {
                        this.MM.exportXmindFile(this.fileName)
                    }else if(type === 'png') {
                        this.MM.exportPng(this.fileName.includes('.mind')? this.fileName.split('.')[0]: this.fileName)
                    }else {
                        this.MM.exportSvg(this.fileName)
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .editor-container {
        width: 100%;
        height: 100vh;
        padding: 0;

        .top-operation {
            width: 100%;
            height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e6e6e6;
            padding: 0 10px;

            .word-title {
                width: 30%;
                min-width: 200px;
            }

            .personal-info {
                flex: 1;
                text-align: right;
            }
        }

        .mind-editor {
            height: calc(100% - 50px);
            width: 100%;
        }
    }
</style>

<style lang="scss">
    .lt {
        width: 40px !important;
    }
</style>
