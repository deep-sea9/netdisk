<template>
    <div class="editor-container">
        <div class="top-operation">
            <el-input v-if="!fileId" style="width: 30%" size="small" v-model="fileName" placeholder="可以在这里输入要保存的文档名称噢" />
            <div v-else class="word-title">{{ fileName }}</div>
            <div class="personal-info">
                {{ userName }}
                <el-button :loading="saving" size="small" @click="saveAndUpload">保存至网盘</el-button>
                <el-button size="small" @click="downloadFile">下载到本地</el-button>
            </div>
        </div>
        <div class="word-editor">
            <div id="luckySheet" style="margin: 0;padding: 0;width: 100%;height: 100%;"></div>
        </div>
    </div>
</template>

<script>

    import luckysheet from 'luckysheet'

    import LuckyExcel from 'luckyexcel'
    import qs from 'qs'

    import {checkFiles, downloadFiles, uploadFiles} from "@/api/common";
    import { uploadFileForUpdateHistory } from "@/api/file";

    import { exportExcel } from '@/utils/file-transfer'
    import {getFileSHA} from "@/utils/file-read";
    import SparkMd5 from "spark-md5";

    const chunkSize = 10 * 1024 * 1024

    export default {
        name: "xlsx-edit",
        data() {
            return {
                fileName: '',
                hasSaved: false,
                fileId: '',
                saving: false
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
                luckysheet.create({
                    container: 'luckySheet',
                    title: '',
                    lang: 'zh'
                })
            }

            window.onbeforeunload = (e) => {
                console.log(e, this.hasSaved);
                if(this.hasSaved){
                    e.preventDefault()
                }else {
                    e.returnValue = '您有未保存的更改，离开后系统不会保存您的更改，确定离开吗？'
                }
            }

        },
        methods: {
            handleDownload() {
                if(this.suffix !== 'xlsx') {
                    this.$message.warning('非xlsx格式文档，无法解析，请打开本地编辑器编辑')
                    return
                }
                const loadingOption = { lock: true, text: '正在加载文档，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)

                downloadFiles({fileId: this.fileId}, (e) => {
                    console.log(e);
                }).then(res => {
                    let blob = new Blob([res.data], {
                        type: "application/vnd.ms-xls",
                    });

                    loadingOption.text = '正在转换文档，请稍后'

                    const file = new File([blob], this.fileName, { type: 'application/vnd.ms-xls' })

                    LuckyExcel.transformExcelToLucky(
                        file,
                        (exportJson, luckysheetFile) => {
                            console.log(luckysheetFile);
                            if(exportJson.sheets === null || exportJson.sheets.length === 0) {
                                this.$message.warning('解析xlsx文件数据失败，请重试或下载到本地打开编辑...')
                                return
                            }

                            luckysheet.create({
                                container: 'luckySheet',
                                data: exportJson.sheets,
                                title: this.fileName,
                                lang: 'zh'
                            })

                        },
                        (err) => {
                            this.$message.warning('解析xlsx文件数据失败，请重试或下载到本地打开编辑...')
                            console.error(err)
                        }
                    )
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
                            this.saving = true
                            exportExcel(luckysheet.getLuckysheetfile(), value + '.xlsx').then(blob => {
                                const file = new File([blob], value + '.xlsx', { type: 'application/vnd.ms-excel;charset=utf-8' })
                                this.checkFile(file).then(_ => {
                                    console.log(_);
                                    this.uploadFile(file)
                                }).catch(_ => this.saving = false)
                            })

                        }).catch(() => {})
                    }else {
                        this.saving = true
                        exportExcel(luckysheet.getLuckysheetfile(), this.fileName + '.xlsx').then(blob => {
                            const file = new File([blob], this.fileName + '.xlsx', { type: 'application/vnd.ms-excel;charset=utf-8' })
                            this.checkFile(file).then(_ => {
                                console.log(_);
                                this.uploadFile(file)
                            }).catch(_ => this.saving = false)
                        })
                    }
                }else {
                    exportExcel(luckysheet.getLuckysheetfile(), this.fileName, this.uploadFileForHistory)
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
                // const file = new File([blob], this.fileName + '.xlsx', { type: 'application/vnd.ms-excel;charset=utf-8' })
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
                    this.saving = false
                    this.fileId = res.data.fileId
                    this.hasSaved = true
                    this.fileName = this.fileName + '.xlsx'
                    this.$message.success(res.message || '上传成功！')
                }).catch(_ => this.saving = false)
            },
            uploadFileForHistory(blob, fileName) {
                const file = new File([blob], this.fileName, { type: 'application/vnd.ms-excel;charset=utf-8' })
                console.log(fileName);
                const formData = new FormData()
                formData.append('fileId', this.fileId)
                formData.append('userId', this.userId)
                formData.append('uploadFile', file)
                uploadFileForUpdateHistory(formData).then(res => {
                    this.saving = false
                    this.$message.success(res.message || '文档更新成功！')
                }).catch(_ => this.saving = false)
            },
            exportFile(blob, fileName) {
                let objectUrl = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = objectUrl;
                a.download = fileName;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            downloadFile() {
                if(!this.fileName) {
                    this.$prompt('文件名称', '保存文件', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '请输入文件名称',
                    }).then(({value}) => {
                        exportExcel(luckysheet.getLuckysheetfile(), this.fileId? this.fileName: value + '.xlsx', this.exportFile).then(res => {
                            console.log(typeof res, res);
                        })

                    }).catch(() => {})
                }else {
                    exportExcel(luckysheet.getLuckysheetfile(), this.fileId? this.fileName: this.fileName + '.xlsx', this.exportFile).then(res => {
                        console.log(typeof res, res);
                    })
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

        .word-editor {
            height: calc(100% - 50px);
            width: 100%;
        }
    }
</style>

<style>
    .luckysheet-share-logo {
        display: none;
    }
</style>

