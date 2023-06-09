<template>
    <div class="editor-container">
        <div class="top-operation">
            <el-input v-if="!fileId" style="width: 30%" size="small" v-model="fileName" placeholder="可以在这里输入要保存的文档名称噢" />
            <div v-else class="word-title">{{ fileName }}</div>
            <div class="personal-info">
                {{ userName }}
                <el-button size="small" @click="saveAndUpload">保存至网盘</el-button>
                <el-button size="small" @click="downloadFile">下载到本地</el-button>
            </div>
        </div>
        <div class="word-editor">
            <el-input type="textarea"
                      :maxlength="100000"
                      v-model="txtStr"
                      id="txt-editor"
                      :show-word-limit="true"
                      rows="30"
                      @change="hasSaved = false"
                      placeholder="开始编辑吧..." />
        </div>
    </div>
</template>

<script>

    import qs from 'qs'
    import { uploadFileForUpdateHistory } from '@/api/file'
    import {checkFiles, uploadFiles} from "@/api/common";
    import { getFileSHA } from '@/utils/file-read'

    import SparkMd5 from 'spark-md5'

    const chunkSize = 10 * 1024 * 1024

    export default {
        name: "txt-edit",
        data() {
            return {
                fileName: '',
                txtStr: '',
                fileId: '',
                hasSaved: true
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
            saveAndUpload() {
                if(!this.fileName) {
                    this.$prompt('文件名称', '保存文件', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '请输入文件名称',
                    }).then(({value}) => {
                        this.fileName = value
                        const file = new File([this.txtStr], value + '.txt', {type: 'text/plain;charset=utf-8'})
                        this.checkFile(file).then(_ => {
                            console.log(_);
                            this.uploadFile(file)
                        })
                    }).catch(() => {})
                }else {
                    const file = new File([this.txtStr], this.fileName + '.txt', {type: 'text/plain;charset=utf-8'})
                    this.checkFile(file).then(_ => {
                        console.log(_);
                        this.uploadFile(file)
                    })
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
                if(this.fileId) {
                    formData.append('fileId', this.fileId)
                    formData.append('userId', this.userId)
                    formData.append('uploadFile', file)
                    uploadFileForUpdateHistory(formData).then(res => {
                        this.hasSaved = true
                        this.$message.success(res.message || '文档更新成功！')
                    })
                }else {
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
                        this.$message.success(res.message || '文档更新成功！')
                    })
                }

            },
            exportFile(blob, fileName) {
                let objectUrl = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = objectUrl;
                a.download = fileName + '.txt';

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
                        const txtStr = this.txtStr.replace(/\n/g, '\r\n')
                        const blob = new Blob([txtStr], { type: 'text/*;charset=utf-8' })
                        this.exportFile(blob, value)

                    }).catch(() => {})
                }else {
                    const txtStr = this.txtStr.replace(/\n/g, '\r\n')
                    const blob = new Blob([txtStr], { type: 'text/*;charset=utf-8' })
                    this.exportFile(blob, this.fileName)
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
            padding: 10px;

            .editor {
                width: 100%;
                height: calc(100% - 70px);
                border: 1px solid #a0cfff;
            }
        }
    }
</style>
