<template>
    <el-drawer title="文件库" :visible.sync="visible" width="550px">
        <div class="b-share-body">
            <el-button-group v-if="selections.length > 0">
                <el-button size="small" type="primary" :disabled="!canRestore" @click="handleRestore">转存</el-button>
                <el-button size="small" type="primary" @click="handleDownload">下载</el-button>
            </el-button-group>
            <el-table :data="data" height="100%" size="small" @selection-change="handleSelectionChange">
                <el-table-column type="selection" />
                <el-table-column show-tooltip-when-overflow label="文件名">
                    <div slot-scope="scope">
                        <div class="title">{{ scope.row.fileName }}</div>
                        <div class="tip flex-between">
                            <div class="tip-item">分享人:{{ scope.row.createUserName }}</div>
                            <div class="tip-item">{{ scope.row.createTime }}</div>
                        </div>
                    </div>
                </el-table-column>
                <el-table-column label="大小">
                    <template slot-scope="scope">{{ getFormatFileSize(scope.row.fileSize) }}</template>
                </el-table-column>
            </el-table>
        </div>
    </el-drawer>
</template>
<script>
    import {getCurrentTime, getFormatFileSize, getRawType} from '@/utils'
    import {secondFile} from "@/api/common";

    export default {
        name: 'file-store',
        props: {
            data: { type: Array, default: () => [] },
            userId: { type: String }
        },
        data() {
            return {
                selections: []
            }
        },
        computed: {
            visible: {
                get(){
                    return this.$attrs.visible
                },
                set(value){
                    this.$emit("update:visible",value)
                }
            },
            canRestore() {
                return !(this.selections.findIndex(f => (f.createUserId === this.userId) || !f.fileId) > -1)
            }
        },

        methods: {
            getFormatFileSize,
            handleSuccess() {
                this.visible = false
            },
            handleSelectionChange(selections) {
                this.selections = selections
            },
            handleRestore() {
                this.selections.forEach(s => {
                    if(s.fileId && getRawType(s.fileId) === 'array') {
                        const fileSet = s.fileId.map((f, index) => ({ fileId: f, fileName: s.fileName[index], resourceId: s.resourceId[index] }))

                        Promise.allSettled(fileSet.map(f => secondFile({
                            fileName: f.fileName,
                            resourceId: f.resourceId
                        }))).then(res => {
                            this.$message.success('保存成功！')
                        })

                    }else {
                        secondFile({
                            fileName: s.fileName,
                            resourceId: s.resourceId
                        }).then(_ => {
                            this.$message.success('保存成功')
                        })
                    }
                })
            },
            handleDownload() {
                this.selections.forEach(s => this.handleLinkDownload(s))
            },
            handleLinkDownload(fileInfo) {
                if(fileInfo.fileId && typeof fileInfo.fileId === 'string') {
                    let a = document.createElement("a");
                    a.href = `${previewURL}/files/download?fileId=${fileInfo.fileId}`
                    if(fileInfo.fileType) {
                        a.download = fileInfo.fileName + '.' + fileInfo.fileType;
                    } else {
                        a.download = fileInfo.folderName + '.zip';
                    }

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }else if(fileInfo.fileId && getRawType(fileInfo.fileId) === 'array') {
                    this.handleBatchLinkDownload(fileInfo.fileId.join(','))
                }else {
                    // local-file
                    const file = fileInfo.file
                    const url = URL.createObjectURL(file)
                    let a = document.createElement("a");
                    a.href = url
                    a.download = fileInfo.fileName

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }

            },
            handleBatchLinkDownload(fileIds) {
                let fileName = getCurrentTime()
                let a = document.createElement("a");
                a.href = `${previewURL}/files/batchDownload?fileIds=${fileIds}`
                a.download = fileName + '.zip';

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
        },
    }
</script>
<style scoped lang="scss">
    .b-share-body {
        height: 600px;
        padding: 20px;
    }
</style>
