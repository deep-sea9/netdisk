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
        <div class="draw-editor">
            <div class="draw-controls">
                <div class="controls-panel">
                    <el-button size="small" v-for="control in controls" :key="control.code" :icon="control.icon" circle @click="changePen(control)"></el-button>
                    <el-color-picker style="margin: 0 10px;" @change="changeStrokeColor" v-model="strokeColor" size="small" />
                    <div style="width: 100px;">
                        <el-slider @change="changeStrokeWidth" v-model="strokeWidth" :min="1" :max="20" />
                    </div>
                </div>
            </div>
            <canvas id="draw-board" style="margin: 0;padding: 0;width: 100%;height: calc(100% - 100px);"></canvas>
        </div>
    </div>
</template>

<script>
    import DrawBoard from "./draw-board";

    import qs from 'qs'

    import {checkFiles, uploadFiles} from "@/api/common";

    import {getFileSHA} from "@/utils/file-read";
    import { dataURL2File } from '@/utils/index'
    import SparkMd5 from "spark-md5";

    const chunkSize = 10 * 1024 * 1024

    export default {
        name: "draw-board",
        data() {
            return {
                fileName: '',
                hasSaved: false,
                fileId: '',
                controls: [
                    { label: '画笔', icon: 'el-icon-edit', code: 'point' },
                    { label: '直线', icon: 'el-icon-male', code: 'line' },
                    { label: '矩形', icon: 'el-icon-folder', code: 'rect' },
                    { label: '圆形', icon: 'el-icon-orange', code: 'arc' },
                    { label: '橡皮擦', icon: 'el-icon-pear', code: 'eraser' },
                    { label: '撤销一步', icon: 'el-icon-refresh-left', code: 'withdraw' },
                    // { label: '前进一步', icon: 'el-icon-refresh-right', code: 'forward' },
                    { label: '清空画板', icon: 'el-icon-delete', code: 'delete' },
                ],
                strokeColor: '#920997',
                strokeWidth: 5
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
            this.foldId = queryStringMap.foldId
            this.diskId = queryStringMap.diskId
            this.initDrawBoard()

        },
        methods: {
            initDrawBoard() {
                this.drawBoard = new DrawBoard({
                    element: 'draw-board'
                })
            },

            saveAndUpload() {

                if(!this.fileName) {
                    this.$prompt('文件名称', '保存文件', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '请输入文件名称',
                    }).then(({value}) => {
                        this.fileName = value
                        const file = dataURL2File(this.drawBoard.getDataURL(), value)
                        this.checkFile(file).then(_ => {
                            this.uploadFile(file)
                        })

                    }).catch(() => {})
                }else {
                    const file = dataURL2File(this.drawBoard.getDataURL(), this.fileName)
                    this.checkFile(file).then(_ => {
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
                    this.fileName = this.fileName + '.png'
                    this.$message.success(res.message || '上传成功！')
                })
            },
            downloadFile() {
                if(!this.fileName) {
                    this.$prompt('文件名称', '保存文件', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /\S/,
                        inputErrorMessage: '请输入文件名称',
                    }).then(({value}) => {
                        this.drawBoard.download(value)

                    }).catch(() => {})
                }else {
                    this.drawBoard.download(this.fileName)
                }
            },

            changePen(control) {
                switch (control.code) {
                    case 'point':
                        this.drawBoard.usePenTool();
                        break;
                    case 'line':
                        this.drawBoard.useLineTool();
                        break;
                    case 'rect':
                        this.drawBoard.useRectTool();
                        break;
                    case 'arc':
                        this.drawBoard.useCircleTool();
                        break;
                    case 'eraser':
                        this.drawBoard.useEraser();
                        break
                    case 'delete':
                        this.drawBoard.clearAll();
                        break;
                    case 'withdraw':
                        this.drawBoard.backspace();
                        break
                }
            },
            changeStrokeColor(value) {
                this.drawBoard.setColor(value)
            },
            changeStrokeWidth(value) {
                this.drawBoard.setLineWidth(value)
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

        .draw-editor {
            height: calc(100% - 50px);
            width: 100%;

            .draw-controls {
                width: 100%;
                height: 50px;
                align-items: center;
                display: flex;
                justify-content: center;
                padding: 0;
                margin: 0;

                .controls-panel {
                    min-width: 200px;
                    padding: 10px;
                    border-radius: 10px;
                    height: 44px;
                    align-items: center;
                    display: flex;
                    box-shadow: #9995 0 5px 5px;
                }
            }
        }
    }
</style>

<style lang="scss">
    .lt {
        width: 40px !important;
    }
</style>
