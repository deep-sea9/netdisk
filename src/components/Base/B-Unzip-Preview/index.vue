<template>
    <el-dialog width="680px" :visible.sync="visible" :title="currentFile.fileName" @open="handleOpenUnzip" @close="clearPreviewBuffer">
        <div class="unzip-body">
            <div class="unzip-tree" :style="{ width: filePreview? '50%': '100%' }">
                <el-tree
                        ref="unzipFiles"
                        v-loading="loadingZip"
                        :element-loading-text="loadingText"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(0, 0, 0, 0.1)"
                        :data="unzipFilesMap[currentFile.fileName] ? unzipFilesMap[currentFile.fileName].data: []" :props="{ label: 'aliasName' }" show-checkbox >
                        <span class="custom-tree-node" slot-scope="{ node, data }">
                            <el-tooltip v-if="!data.dir" :content="data.name" placement="left-start">
                                <span class="text-ellipse-1 node-label">{{ node.label }}</span>
                            </el-tooltip>
                            <span v-else class="text-ellipse-1 node-label">{{ node.label }}</span>
                            <el-button v-if="!data.dir" style="width: 40px" type="text" size="mini" @click="previewUnzipFile(node, data)">预览</el-button>
                        </span>
                </el-tree>
            </div>

            <div
                    v-loading="loadingFile"
                    element-loading-text="正在加载文件内容，请稍后"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.1)"
                    class="unzip-preview"
                    :style="{ width: filePreview? '50%': 0 }">
                <img style="max-width: 90%" v-if="unzipFilePreviewObj.type === 'img'" :src="unzipFilePreviewObj.blob" alt="加载图片资源失败">
                <pre style="width: 90%;height: 100%;" v-else-if="unzipFilePreviewObj.type === 'txt'">{{ unzipFilePreviewObj.blob }}</pre>
            </div>
            <el-tooltip content="关闭预览" placement="top">
                <el-icon v-show="filePreview" class="el-icon-circle-close" style="position: absolute;top: 20px;right: 20px;font-size: 20px;cursor: pointer;float: right" @click.native="filePreview = false" />
            </el-tooltip>
        </div>
        <span slot="footer">
            <el-button size="small" type="primary" @click="saveCurrentZipFile">保存选中</el-button>
            <el-button size="small" type="primary" @click="saveOriginZip">保存所有</el-button>
            <el-button size="small" @click="visible = false">取消</el-button>
        </span>
    </el-dialog>
</template>
<script>

    import JSZip from "jszip";
    import jschardet from "jschardet";
    import FileSaver from 'file-saver'
    import {downloadFiles} from "@/api/common";

    const previewPrefix = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp', 'svg']
    const textPrefix = ['txt', 'html', 'js', 'css', 'ts', 'jsx', 'tsx', 'java', 'cpp', 'xml', 'properties', 'md']

    export default {
        name: 'b-unzip-preview',
        props: {
            currentFile: { type: Object, default: () => ({}) },
        },
        data() {
            return {
                unzipFilesMap: {},
                unzipFilePreviewObj: {
                    type: 'txt',
                    blob: null
                },
                loadingZip: false,
                loadingText: '正在加载压缩资源包，请稍后',
                filePreview: false,
                loadingFile: false
            }
        },
        methods: {
            handleOpenUnzip() {
                const {fileName, fileId, id} = this.currentFile
                if(this.unzipFilesMap[fileName]) {
                    return
                }
                this.loadingZip = true
                downloadFiles({fileId: fileId? fileId: id}).then(res => {
                    this.loadingZip = false
                    this.handleUnZip(res.data, this.currentFile)
                }).catch((err) => {
                    this.loadingZip = false
                    this.visible = false
                    this.$message.warning(err.message || '获取资源失败，请重试')
                })
            },
            clearPreviewBuffer() {
                this.unzipFilePreviewObj = {
                    type: 'txt',
                    blob: null
                }
                this.currentPreviewNode = null
            },
            handleUnZip(res, _file) {
                const { fileName } = _file
                let fileData = []
                const zip = new JSZip()
                this.$set(this.unzipFilesMap, fileName, {})
                // this.unzipFilesMap[fileName] = {}
                this.unzipFilesMap[fileName].zip = zip
                this.unzipFilesMap[fileName].buffer = res
                this.unzipFilesMap[fileName].name = fileName
                this.loadingText = '正在解压，请稍后...'
                this.loadingZip = true
                zip.loadAsync(res).then(zipData => {
                    zipData.forEach((relativePath, file) => {
                        if(!relativePath.startsWith('__MACOSX')) {
                            if(!file.dir) {
                                fileData.push(file)
                            }
                        }
                    })
                    this.$set(this.unzipFilesMap[fileName], 'data', this.flat2Tree(fileData))
                    // this.unzipFilesMap[fileName].data = this.flat2Tree(fileData)
                    this.loadingZip = false
                }).catch(err => {
                    this.$message.error(err.message || err || '解压失败，请重试')
                    this.loadingZip = false
                })
            },
            saveCurrentZipFile() {
                const files = this.$refs['unzipFiles'].getCheckedNodes()
                files.forEach(f => {
                    this.unzipFilesMap[this.currentFile.fileName].zip.file(f.name).async('blob').then(res => {
                        FileSaver.saveAs(res, f.aliasName)
                    })
                })

            },
            saveOriginZip() {
                const { fileName, fileType } = this.currentFile
                this.unzipFilesMap[fileName] && FileSaver.saveAs(this.unzipFilesMap[fileName].buffer, fileName + '.' + fileType)
            },
            flat2Tree(data) {
                let sortByFolderNameOfFile = {}
                let rootFile = []
                data.forEach(file => {
                    const folderRoute = file.name.split('/')
                    if(folderRoute.length > 1) {
                        let stringLever = folderRoute.slice(0, folderRoute.length - 1).join('/')
                        if(!sortByFolderNameOfFile[stringLever]) {
                            sortByFolderNameOfFile[stringLever] = [{ ...file, aliasName: folderRoute.pop() }]
                        }else {
                            sortByFolderNameOfFile[stringLever].push({ ...file, aliasName: folderRoute.pop() })
                        }
                    }else {
                        rootFile.push({ ...file, aliasName: file.name})
                    }
                })

                let result = { children: {} }

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

                const recursiveReadFile = (fileTree, rootObj) => {
                    Object.keys(fileTree).forEach(folderName => {
                        if(fileTree[folderName].children) {
                            let childrenArr = fileTree[folderName].value? fileTree[folderName].value : []
                            rootObj.push({ aliasName: folderName, dir: true, children: childrenArr, disabled: true })
                            recursiveReadFile(fileTree[folderName].children, childrenArr)
                        }else {
                            rootObj.push({ aliasName: folderName, dir: true, children: fileTree[folderName].value, disabled: true })
                        }

                    })
                }

                recursiveReadFile(result.children, rootFile)

                return rootFile
            },
            previewUnzipFile(node, data) {
                if(this.currentPreviewNode === node) return
                console.log(node, data);
                this.currentPreviewNode = node
                const prefix = data.aliasName.split('.').pop()
                if(textPrefix.includes(prefix.toLowerCase())) {
                    this.filePreview = true
                    this.loadingFile = true
                    this.unzipFilePreviewObj.type = 'txt'
                    this.unzipFilesMap[this.currentFile.fileName].zip.file(data.name).async('arraybuffer').then(res => {

                        const { encoding } = jschardet.detect(res)
                        const blob = new Blob([res])
                        const fileReader = new FileReader()
                        fileReader.onload = (e) => {
                            this.unzipFilePreviewObj.blob = e.target.result
                            this.loadingFile = false
                        }
                        fileReader.onerror = e => {
                            this.$message.error(e.message || e || '读取文件内容失败，请重试')
                            this.loadingFile = false
                        }

                        if(encoding) {
                            fileReader.readAsText(blob, encoding)
                            return
                        }
                        fileReader.readAsText(blob, 'gbk')

                    })
                }else if(previewPrefix.includes(prefix.toLowerCase())) {
                    this.filePreview = true
                    this.unzipFilePreviewObj.type = 'img'
                    this.unzipFilesMap[this.currentFile.fileName].zip.file(data.name).async('blob').then(res => {
                        console.log(res);
                        this.unzipFilePreviewObj.blob = URL.createObjectURL(res)
                    })
                }else {
                    this.$message.warning('暂不支持预览该类型文件，请下载后查看')
                }
            },
        },
        computed: {
            visible: {
                get() {
                    return this.$attrs.visible
                },
                set(value) {
                    this.$emit('update:visible', value)
                },
            },
        },
    }
</script>
<style lang="scss">
    .unzip-body {
        padding: 10px;
        height: 480px;
        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        overflow: hidden;
        position: relative;

        .unzip-tree {
            transition: width .5s ease;
            height: 100%;
            overflow: auto;
        }

        .custom-tree-node {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            overflow: hidden;

            .node-label {
                flex: 1;
            }
        }

        .unzip-preview {
            width: 50%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
            position: relative;
        }
        .el-tree{
            background-color: transparent;
        }
    }
</style>
