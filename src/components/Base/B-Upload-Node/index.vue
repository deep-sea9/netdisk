<template>
    <div class="b-files-node">
        <div class="b-files-node__main">
            <el-table
                    :data="type === 'uploading'? uploadingList : files"
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    ref="table"
                    height="750px"
            >
                <el-table-column type="selection" width="55" align="center"/>
                <el-table-column prop="fileName" label="文件名" width="320" show-overflow-tooltip>
                    <div class="table-column" slot-scope="scope">
                        <img class="file-icon"
                             @click.stop="() => {}"
                             :src="fetchFileIcon(scope.row.fileType, scope.row.fileName)"/>
                        <span>{{ scope.row.fileName }}</span>
                    </div>
                </el-table-column>
                <el-table-column v-if="type !== 'translated'" prop="fileSize" label="大小" align="center">
                    <!--                    <div slot-scope="scope">-->
                    <!--                        <span>{{ fileSize(scope.row.fileSize) }}</span>-->
                    <!--                    </div>-->
                </el-table-column>
                <el-table-column v-if="type === 'translated'" prop="fileSize" label="大小" align="center">
                    <div slot-scope="scope">
                        <span>{{ fileSize(scope.row.fileSize) }}</span>
                    </div>
                </el-table-column>
                <el-table-column v-if="type !== 'translated'" prop="progress" label="状态" align="center">
                    <template slot-scope="scope">
                        <div v-if="type !== 'uploading' && Number.isNaN(parseInt(scope.row.progress)) && scope.row.status === 'pending'">
                            <b-progress-loading :percentage="100" :format="() => '正在下载'" color="yellow" />
                            <span>正在下载</span>
                        </div>
                        <el-progress v-else :percentage="scope.row.status === 'error'? 0: (scope.row.progress.indexOf('%')> -1?parseInt(scope.row.progress): 100)" :format="percentFormat(scope.row)" />
<!--                        {{ ((scope.row.doneSize / scope.row.fileSize) * 100).toFixed(2) }} %-->
                    </template>
                </el-table-column>
                <el-table-column v-if="type === 'translated'" prop="type" label="状态" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.type === '1' ? '上传完成': '下载完成' }} <i style="color: #38b9ff"
                                                                         :class="scope.row.type === '1'? 'el-icon-upload2': 'el-icon-download'"/>
                    </template>
                </el-table-column>
                <el-table-column v-if="type === 'translated'" prop="endTime" label="时间" width="180px"
                                 align="center"></el-table-column>
                <el-table-column v-if="type === 'uploading'" prop="ope" label="操作" align="center" fixed="right"
                                 width="180px" :key="statusKey">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-delete" class="red"
                                   @click="removeRow(scope.$index, scope.row)"/>
                        <el-button v-if="scope.row.status === 'stop' || scope.row.status === 'pending'"
                                   type="text"
                                   :icon="scope.row.status === 'stop'? 'el-icon-video-play': 'el-icon-video-pause'"
                                   @click="stopUpload(scope.$index, scope.row)">
                            {{ scope.row.status === 'stop'? '继续' : '暂停' }}
                        </el-button>
                        <!--                    <el-button type="text" icon="el-icon-search" class="red" @click="seeFile(scope.$index, scope.row)">查看</el-button>-->
                        <el-button v-if="scope.row.status === 'error'" type="text" icon="el-icon-refresh"
                                   @click="retry(scope.$index, scope.row)">重试
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column v-if="type === 'translated'" prop="ope" label="操作" align="center" fixed="right"
                                 width="180px">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-delete" class="red"
                                   @click="removeRow(scope.$index, scope.row)"/>
                        <el-button v-if="scope.row.progress === 'stop' || scope.row.progress === 'pending'"
                                   type="text"
                                   :icon="scope.row.progress === 'stop'? 'el-icon-video-play': 'el-icon-video-pause'"
                                   @click="stopUpload(scope.$index, scope.row)">
                            {{ scope.row.progress === 'stop'? '继续' : '暂停' }}
                        </el-button>
                        <!--                    <el-button type="text" icon="el-icon-search" class="red" @click="seeFile(scope.$index, scope.row)">查看</el-button>-->
                        <el-button v-if="scope.row.progress === 'error'" type="text" icon="el-icon-refresh"
                                   @click="retry(scope.$index, scope.row)">重试
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div v-if="pagination" class="bottom-pagination">
                <el-pagination
                        layout="sizes,total,prev,pager,next,jumper"
                        :current-page="currentPage"
                        :page-size="pageSize"
                        :total="fileTotal"
                        @size-change="changeSize"
                        @current-change="changeCurrent"/>
            </div>
        </div>
    </div>
</template>
<script>
    import fetchFileIcon from "@/utils/fetchFileIcon.js";

    export default {
        name: "b-upload-node",
        props: {
            files: Array,

            fileTotal: {type: Number, default: 0},
            currentPage: {type: Number, default: 1},
            pageSize: {type: Number, default: 10},
            type: {type: String, default: 'uploading'},
            pagination: {type: Boolean, default: false}
        },
        data() {
            return {
                statusKey: 'pending' // 用于更新行视图
            };
        },
        computed: {
            selection: {
                get() {
                    return this.$attrs.selection;
                },
                set(value) {
                    this.$emit("update:selection", value);
                },
            },
            uploadingList() {
                return this.$store.state.translate.uploadingList
            },
            uploader() {
                return this.$store.state.translate.uploader
            }
        },
        methods: {
            fetchFileIcon,
            percentFormat(row) {

                return (percent) => {
                    switch (row.status) {
                        case 'error':
                            return this.type === 'uploading'? '上传失败' : '下载失败';
                        case 'pending':
                            if(Number.isNaN(percent)) {
                                return '正在下载'
                            }else {
                                return percent === 100? (this.type === 'uploading'? '上传完成' : '下载完成'): `${percent}%`
                            }

                        case 'success':
                            return this.type === 'uploading'? '上传成功' : '下载成功'

                        default:
                            return '等待下载'
                    }

                }

            },
            removeRow(index, row) {
                // this.uploader && this.uploader.removeFile(row.fileId)
                this.$emit('delete-row', index, row)
                // this.uploadingList.splice(index, 1)
            },
            stopUpload(index, row) {
                if (row.status === 'stop') {
                    this.$emit('continue-upload', index, row)
                    row.status = 'pending'
                    this.statusKey = 'pending'
                    this.uploader.upload()
                    console.log(row.file, this.uploader);
                } else if (row.status === 'pending') {
                    this.$emit('stop-upload', index, row)
                    row.status = 'stop'
                    this.statusKey = 'stop'
                    this.uploader.stop(row.file)
                }
            },
            seeFile(index, row) {
                console.log(index, row);
            },
            retry(index, row) {
                this.$emit('retry-upload', index, row)
                this.uploader.retry(row.file)
            },
            handleSelectionChange(selection) {
                this.selection = selection
            },
            fileSize(fileSize) {
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

            handleClickFile(row) {
                this.$emit('click-file', row)
            },
            changeCurrent(current) {
                this.$emit('update:currentPage', current)
                this.$emit('current-change', current)
            },
            changeSize(size) {
                this.$emit('size-change', size)
            }
        },
        components: {}
    };
</script>
<style lang="scss" scoped>
    .b-files-node {
        height: 100%;
        display: flex;
        width: 100%;

        .b-files-node__main {
            flex: 1;
            height: 100%;
            width: 100%;
            padding: 10px 20px;
            transition: width .5s ease;
            overflow: auto;

            .table-column {
                display: flex;
                align-items: center;
                user-select: none;

                .file-icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 6px;
                }
            }

            .bottom-pagination {
                bottom: 10px;
                position: fixed;
                right: 10px;
            }
        }

        .b-files-node__detail {
            width: 300px;
            flex-shrink: 0;
            padding: 20px;

            .title {
                font-size: 16px;
            }

            border-left: 1px solid #dedede;
            display: flex;
            flex-direction: column;
            font-size: 14px;

            img {
                height: 80px;
                object-fit: contain;
                margin: 40px auto;
            }

            .name {
                font-size: 16px;
                font-weight: bold;
            }

            .createTime,
            .modifyTime,
            .modifyTimes {
                margin-top: 10px;
                color: #555;
            }
        }
    }
</style>
