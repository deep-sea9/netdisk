<template>
    <div class="editor-container">
        <div class="top-operation">
            <el-input v-if="!fileId" style="width: 30%" size="small" v-model="fileName" placeholder="可以在这里输入要保存的文档名称噢" />
            <div v-else class="word-title">{{ fileName }}</div>
            <div class="personal-info">
                {{ userName }}
                <el-button size="small" @click="saveAndUpload">保存至网盘</el-button>
                <el-dropdown trigger="click" @command="downloadFile">
                    <el-button size="small">下载到本地</el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="pic" @click="downloadFile">下载为图片</el-dropdown-item>
                        <el-dropdown-item command="json">下载为Json数据</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div class="flow-editor">
            <z-flow ref="zFlow" :default-render-data="defaultRenderData" />
        </div>
    </div>
</template>

<script>

    import ZFlow from './components/z-flow/panel'
    import './components/z-flow/index.css'

    import qs from 'qs'
    import FileSaver from 'file-saver'

    import {checkFiles, downloadFiles, uploadFiles} from "@/api/common";
    import { uploadFileForUpdateHistory } from "@/api/file";

    import {getFileSHA} from "@/utils/file-read";
    import SparkMd5 from "spark-md5";
    import html2canvas from 'html2canvas'


    const chunkSize = 10 * 1024 * 1024

    export default {
        name: "flow-edit",
        components: { ZFlow },
        data() {
            return {
                fileName: '',
                hasSaved: false,
                fileId: '',
                bpmnViewer: null,
                spacing_x: 40,
                spacing_y: 100,
                defaultRenderData: undefined
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
            }

        },
        methods: {

            handleDownload() {
                if(this.suffix !== 'flow') {
                    this.$message.warning('非flow格式文档，无法解析，请打开本地编辑器编辑')
                    return
                }
                const loadingOption = { lock: true, text: '正在加载文档，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)

                downloadFiles({fileId: this.fileId}).then(res => {

                    const fileReader = new FileReader()

                    fileReader.onload = (result) => {

                        const mindStr = result.target.result.split('leadal')[1]

                        console.log(mindStr);

                        this.defaultRenderData = JSON.parse(mindStr)
                        this.$refs['zFlow'].dataReload(this.defaultRenderData)

                        // this.initMindElixir()
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
                            const file = new File(['mind' + 'leadal' + this.$refs['zFlow'].getRenderData()], value + '.flow', {type: 'application/json;charset=utf-8'})
                            this.checkFile(file).then(_ => {
                                this.uploadFile(file)
                            })

                        }).catch(() => {})
                    }else {
                        const file = new File(['mind' + 'leadal' + this.$refs['zFlow'].getRenderData()], this.fileName + '.flow', {type: 'application/json;charset=utf-8'})
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
                    this.fileName = this.fileName + '.flow'
                    this.$message.success(res.message || '上传成功！')
                })
            },
            uploadFileForHistory() {
                const file = new File(['mind' + 'leadal' + this.$refs['zFlow'].getRenderData()], this.fileName, {type: 'application/json;charset=utf-8'})
                const formData = new FormData()
                formData.append('fileId', this.fileId)
                formData.append('userId', this.userId)
                formData.append('uploadFile', file)
                uploadFileForUpdateHistory(formData).then(res => {
                    this.$message.success(res.message || '文档更新成功！')
                })
            },
            exportJsonFile(fileName) {
                const blob = new Blob([JSON.stringify(this.$refs['zFlow'].getRenderData(), null, 2)], { type: 'text/plain;charset=utf-8' })
                FileSaver.saveAs(blob, fileName, { autoBom: false })
            },
            export2Img(fileName) {
                const loadingOption = { lock: true, text: '正在保存为png图片，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)
                const image = document.getElementById('efContainer')

                html2canvas(image).then(canvas => {
                    let imgUrl = canvas.toDataURL('image/png')
                    // let coverImgFile = dataURL2File(imgUrl)

                    FileSaver.saveAs(imgUrl, fileName + '.png')
                    this.loading.close()
                }).catch(_ => {
                    this.loading.close()
                })

            },
            downloadFile(command) {
                if(!this.fileName) {
                    this.$prompt('文件名称', '保存文件', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '请输入文件名称',
                    }).then(({value}) => {
                        console.log('mind data', this.$refs['zFlow'].getRenderData());
                        if(command === 'pic') {
                            this.export2Img(value)
                        }else {
                            this.exportJsonFile(value + '.json')
                        }
                    }).catch(() => {})
                }else {
                    if(command === 'pic') {
                        this.export2Img(this.fileName)
                    }else {
                        this.exportJsonFile(this.fileName + '.json')
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

        .flow-editor {
            height: calc(100% - 50px);
            width: 100%;
        }
    }
</style>
