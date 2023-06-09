<template>
    <div class="editor-container">
        <div class="top-operation">
            <el-input v-if="!fileId" style="width: 30%" size="small" v-model="fileName" placeholder="可以在这里输入要保存的文档名称噢" />
            <div v-else class="word-title">{{ fileName }}</div>
            <div class="personal-info">
                <span style="margin-right: 8px;">{{ userName }}</span>

                <el-button size="small" @click="restart">擦除重做</el-button>
                <el-button size="small" @click="lintToggle">开启/关闭流程校验</el-button>
                <el-button size="small" @click="mockSimulationToggle">开启/关闭流程模拟</el-button>

                <el-upload style="margin: 0 8px;" :auto-upload="false" action="" accept=".bpmn,.xml" :show-file-list="false" :multiple="false" @change.native="handleImportFile">
                    <el-button size="small" type="primary">导入</el-button>
                </el-upload>

                <el-button :loading="saving" size="small" @click="saveAndUpload">保存至网盘</el-button>
                <el-dropdown trigger="click" @command="downloadFile">
                    <el-button size="small">下载到本地</el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="pic" @click="downloadFile">下载为PNG</el-dropdown-item>
                        <el-dropdown-item command="svg">下载为SVG</el-dropdown-item>
                        <el-dropdown-item command="xml">下载为XML</el-dropdown-item>
                        <el-dropdown-item command="bpmn">下载为BPMN</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div class="flow-editor">
            <bpmn-designer ref="bpmnDesigner" :xml.sync="xmlString" />
        </div>
    </div>
</template>

<script>

    import qs from 'qs'
    import FileSaver from 'file-saver'

    import {checkFiles, downloadFiles, uploadFiles} from "@/api/common";
    import {uploadFileForUpdateHistory} from "@/api/file";

    import {getFileSHA} from "@/utils/file-read";
    import SparkMd5 from "spark-md5";
    import html2canvas from 'html2canvas'

    import BpmnDesigner from '@/components/Custom/BpmnDesigner'

    import {getModeler} from "@/components/Custom/BpmnDesigner/bpmn-utils/BpmnDesignerUtils";


    const chunkSize = 10 * 1024 * 1024

    export default {
        name: "flow-edit",
        components: { BpmnDesigner },
        data() {
            return {
                fileName: '',
                hasSaved: false,
                fileId: '',
                bpmnViewer: null,
                spacing_x: 40,
                spacing_y: 100,
                defaultRenderData: undefined,
                xmlString: undefined,
                saving: false
            }
        },
        computed: {
            userId() {
                return this.$store.state.user.userId
            },
            userName() {
                return this.$store.state.user.userName
            },
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

            restart() {
                this.$refs['bpmnDesigner'].restart()
            },

            mockSimulationToggle() {
                this.$refs['bpmnDesigner'].mockSimulationToggle()
            },
            lintToggle() {
                this.$refs['bpmnDesigner'].lintToggle()
            },

            handleImportFile(e) {
                console.log(e.target.files);
                try {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.readAsText(file);
                    reader.onload = function () {
                        const xmlStr = this.result;
                        getModeler() && getModeler().importXML(xmlStr);
                    };

                } catch (e) {
                    this.$message.error('无法解析！')
                    console.error(e);
                }
            },

            handleDownload() {
                if(this.suffix !== 'bpmn') {
                    this.$message.warning('非bpmn格式文档，无法解析，请打开本地编辑器编辑')
                    return
                }
                const loadingOption = { lock: true, text: '正在加载文档，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)

                downloadFiles({fileId: this.fileId}).then(res => {

                    const fileReader = new FileReader()

                    fileReader.onload = (result) => {
                        this.xmlString = result.target.result

                        this.$store.commit('bpmn/setConfiguration', { xml: this.xmlString })
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
                        }).then(async ({value}) => {
                            this.fileName = value
                            const { err, xml } = await getModeler().saveXML()
                            if(err) {
                                console.error(err);
                            }
                            const file = new File([xml], value + '.bpmn', {type: 'application/text;charset=utf-8'})
                            this.saving = true
                            this.checkFile(file).then(_ => {
                                this.uploadFile(file)
                            }).catch(_ => this.saving = false)

                        }).catch(() => {})
                    }else {
                        getModeler().saveXML().then(({ xml }) => {
                            console.log(xml);
                            this.saving = true
                            const file = new File([xml], this.fileName + '.bpmn', {type: 'application/text;charset=utf-8'})
                            this.checkFile(file).then(_ => {
                                this.uploadFile(file)
                            }).catch(_ => this.saving = false)
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
                    this.saving = false
                    this.fileId = res.data.fileId
                    this.hasSaved = true
                    this.fileName = this.fileName + '.bpmn'
                    this.$message.success(res.message || '上传成功！')
                }).catch(_ => this.saving = false)
            },
            async uploadFileForHistory() {
                const { err, xml } = await getModeler().saveXML()
                if(err) {
                    console.error(err)
                    return
                }
                this.saving = true
                const file = new File([xml], this.fileName, {type: 'application/text;charset=utf-8'})
                const formData = new FormData()
                formData.append('fileId', this.fileId)
                formData.append('userId', this.userId)
                formData.append('uploadFile', file)
                uploadFileForUpdateHistory(formData).then(res => {
                    this.$message.success(res.message || '文档更新成功！')
                    this.saving = false
                }).catch(_ => this.saving = false)
            },

            export2Img(fileName) {
                const loadingOption = { lock: true, text: '正在保存为png图片，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' }
                this.loading = this.$loading(loadingOption)
                const image = document.getElementsByClassName('djs-container')[0]

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
                        // console.log('mind data', this.$refs['zFlow'].getRenderData());
                        if(command === 'pic') {
                            this.export2Img(value)
                        }else if(command === 'svg'){
                            this.$refs['bpmnDesigner'].downloadAsSvg(value + '.svg')
                        }else if(command === 'xml'){
                            this.$refs['bpmnDesigner'].downloadAsXml(value + '.xml')
                        }else if(command === 'bpmn'){
                            this.$refs['bpmnDesigner'].downloadAsBpmn(value + '.bpmn')
                        }
                    }).catch(() => {})
                }else {
                    if(command === 'pic') {
                        this.export2Img(this.fileName)
                    }else if(command === 'svg'){
                        this.$refs['bpmnDesigner'].downloadAsSvg(this.fileName + '.svg')
                    }else if(command === 'xml'){
                        this.$refs['bpmnDesigner'].downloadAsXml(this.fileName + '.xml')
                    }else if(command === 'bpmn'){
                        this.$refs['bpmnDesigner'].downloadAsBpmn(this.fileName + '.bpmn')
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
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
        }

        .flow-editor {
            height: calc(100% - 50px);
            width: 100%;
        }
    }
</style>
