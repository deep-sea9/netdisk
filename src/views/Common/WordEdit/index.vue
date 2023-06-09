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
            <editor v-model="editText" :init="initConfig" />
        </div>
    </div>
</template>

<script>
    import 'tinymce'
    import 'tinymce/icons/default'
    import 'tinymce/models/dom/model'

    import 'tinymce/themes/silver'

    import 'tinymce/skins/ui/oxide/skin.css'
    import 'tinymce/skins/ui/oxide/content.min.css'

    import 'tinymce/plugins/advlist/plugin'
    import 'tinymce/plugins/code/plugin'
    import 'tinymce/plugins/emoticons'
    import 'tinymce/plugins/emoticons/js/emojis.min'
    import 'tinymce/plugins/link'
    import 'tinymce/plugins/lists/plugin'
    import 'tinymce/plugins/table/plugin'
    import 'tinymce/plugins/image'
    import 'tinymce/plugins/preview'
    import 'tinymce/plugins/charmap/plugin'
    import 'tinymce/plugins/anchor/plugin'
    import 'tinymce/plugins/wordcount/plugin'
    import 'tinymce/plugins/autoresize/plugin'
    import 'tinymce/plugins/save'
    import 'tinymce/plugins/save/plugin'
    import '@leadal/netiler-ui/dist/lib/tinymce/langs/zh_CN'

    // import contentUiSkinCss from 'tinymce/skins/ui/oxide/content.css'
    //
    // import contentCss from 'tinymce/skins/content/default/content.min.css'

    const toolbar = ['searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code', 'hr bullist numlist link image charmap preview anchor pagebreak insertdatetime table emoticons forecolor backcolor fullscreen']
    const plugins = ['advlist anchor code emoticons image link lists preview save table wordcount']

    import Editor from '@tinymce/tinymce-vue'

    import htmlDocx from 'html-docx-js/dist/html-docx'

    import {downloadFiles,checkFiles, uploadFiles} from "@/api/common";
    import { uploadFileForUpdateHistory } from "@/api/file";
    import mammoth from 'mammoth'

    import qs from 'qs'
    import {getFileSHA} from "@/utils/file-read";
    import SparkMd5 from "spark-md5";

    const docx2htmlOptions = {
        // convertImage: mammoth.images.imgElement(img => {
        //     return img.read("base64").then(imgBuffer => {
        //         console.log('data:' + img.contentType + ':base64,' + imgBuffer);
        //         return {
        //             src: 'data:' + img.contentType + ':base64,' + imgBuffer
        //         }
        //     })
        // }),
        ignoreEmptyParagraphs: false
    }

    const chunkSize = 10 * 1024 * 1024


    export default {
        name: "word-edit",
        components: { Editor },
        data() {
            return {
                editText: '',
                initConfig: {
                    height: '100%',
                    language: 'zh_CN',
                    toolbar,
                    menubar: 'file edit insert view format table',
                    plugins: plugins[0],
                    nonbreaking_force_tab: true,
                    convert_urls: false,
                },
                fileName: '',
                fileId: ''
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
            handleDownload() {
                const loadingOption = { lock: true, text: '正在加载文档，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)

                downloadFiles({fileId: this.fileId}, (e) => {
                    console.log(e);
                }).then(res => {
                    let blob = new Blob([res.data], {
                        type: "application/vnd.ms-word",
                    });

                    loadingOption.text = '正在转换文档，请稍后'

                    const fileReader = new FileReader()

                    fileReader.onload = (e) => {
                        console.log(e.currentTarget.result);
                        mammoth.convertToHtml({ arrayBuffer: e.currentTarget.result }, docx2htmlOptions).then(res => {
                            this.editText = res.value
                            console.log(res);
                            this.loading.close()
                        }).done()
                    }
                    fileReader.readAsArrayBuffer(blob)
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
                            const convertString = `<!DOCTYPE html><html lang="en"><meta charset="utf-8" /><body>${this.editText}</body></html>`
                            let converted = htmlDocx.asBlob(convertString)
                            const file = new File([converted], this.fileName + '.docx', { type: 'application/vnd.ms-word;charset=utf-8' })
                            this.checkFile(file).then(_ => {
                                this.uploadFile(file)
                            })

                        }).catch(() => {})
                    }else {
                        const convertString = `<!DOCTYPE html><html lang="en"><meta charset="utf-8" /><body>${this.editText}</body></html>`
                        let converted = htmlDocx.asBlob(convertString)
                        const file = new File([converted], this.fileName + '.docx', { type: 'application/vnd.ms-word;charset=utf-8' })
                        this.checkFile(file).then(_ => {
                            this.uploadFile(file)
                        })
                    }
                }else {
                    const convertString = `<!DOCTYPE html><html lang="en"><meta charset="utf-8" /><body>${this.editText}</body></html>`
                    let converted = htmlDocx.asBlob(convertString)
                    const file = new File([converted], this.fileName, { type: 'application/vnd.ms-word;charset=utf-8' })
                    console.log(file);
                    const formData = new FormData()
                    formData.append('fileId', this.fileId)
                    formData.append('userId', this.userId)
                    formData.append('uploadFile', file)
                    uploadFileForUpdateHistory(formData).then(res => {
                        this.$message.success(res.message || '文档更新成功！')
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
                    this.fileName = this.fileName + '.docx'
                    this.$message.success(res.message || '上传成功！')
                })
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
                const convertString = `<!DOCTYPE html><html lang="en"><meta charset="utf-8" /><body>${this.editText}</body></html>`
                let converted = htmlDocx.asBlob(convertString)
                const file = new File([converted], this.fileId? this.fileName : this.fileName + '.docx', { type: 'application/vnd.ms-word' })
                const fileReader = new FileReader()
                fileReader.onload = (e) => {
                    console.log(e.target.result);
                    let tempArr = e.target.result.split(',')
                    let data = atob(tempArr[1])
                    let mime = tempArr[0].match(/:(.*?);/)[1]
                    let ia = new Uint8Array(data.length)
                    for(let i = 0;i < data.length; i++) {
                        ia[i] = data.charCodeAt(i)
                    }

                    let blob = new Blob([ia], {type: mime})
                    this.exportFile(blob, this.fileName + '.docx')
                }
                fileReader.onerror = e => {
                    console.log(e);
                }
                fileReader.readAsDataURL(file)
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
    .tox-promotion {
        display: none;
    }
    .tox-statusbar__branding {
        display: none;
    }
</style>
