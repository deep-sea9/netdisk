<template>
    <div class="b-staff-transfer scrollbar">
        <div class="b-staff-transfer-part staff-transfer-left">
            <div style="height: 28px;line-height: 28px;">
                <span class="no-last" @click="toPre" v-if="indexList.length > 1">返回上一级  | </span>
                <span v-for="(fold, index) in indexList"
                      :key="fold.id"
                      @click="toPrevious(fold, index)" :class="{
                    'no-last': index < indexList.length - 1
                }">
                    {{ fold.folderName }}
                    <span v-if="index < indexList.length - 1">></span>
                </span>
            </div>
            <el-table
                    height="calc(100% - 30px)"
                    size="mini"
                    ref="fileNode"
                    v-loading="loading"
                    element-loading-text="数据加载中"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0,0,0, 0.3)"
                    :data="fileList"
                    @row-click="handleRowClick"
                    @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" :selectable="canSelect"/>
                <el-table-column prop="fileName" label="全选" show-overflow-tooltip>
                    <template class="table-column"
                         slot-scope="scope">
                        <img style="width: 20px;height: 20px;"
                             @click.stop="() => {}"
                             :src="getPreviewSrc(scope.row)"/>
                        <span>{{ getFileName(scope.row) }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="b-staff-transfer-icon">
            <i class="far fa-chevron-right" @click="add2Right" />
        </div>
        <ul class="b-staff-transfer-part staff-transfer-right scrollbar">
            <el-button v-if="rightList.length >= 9" type="text" style="color: darkred;position: absolute;right: 0;" size="mini" @click="clearAll">清除全部({{ rightList.length }}个) <i class="el-icon-delete" /></el-button>
            <div :class="{ 'user-list':  rightList.length >= 9}">
                <li v-for="file in rightList" :key="file.id">
                    <span>{{ getFileName(file) }}</span>
                    <i class="el-icon-delete" @click="handleRemove(file)" />
                </li>
            </div>
        </ul>
    </div>
</template>
<script>
    import {fileListAll, getThumnUrlOfImg} from "@/api/file";
    import fetchFileIcon from "@/utils/fetchFileIcon";

    export default {
        name: 'file-transfer',
        props: {
            data: {
                type: Array,
                default: () => [],
            }
        },
        data() {
            return {
                rightList: [],
                selections: [],
                fileList: [],
                loading: false,
                foldId: '0',
                indexList: [{
                    folderName: '根目录',
                    id: undefined
                }],
            }
        },
        computed: {
            staffTree() {
                return this.$store.state.system.staffTree
            }
        },
        mounted() {
            this.fetchFiles()
        },
        methods: {
            fetchFileIcon,
            getPreviewSrc(row) {
                if(row.fileKind === '图片' || row.fileKind === '视频') {
                    return getThumnUrlOfImg(row.fileId || row.id)
                }else {
                    return this.fetchFileIcon(row.fileType, row.fileName || row.folderName, row.tableKind)
                }
            },
            canSelect(row) {
                return row.fileType
            },
            getFileName(file) {
                if(file.fileType) {
                    return `${file.fileName}.${file.fileType}`
                }else {
                    return file.folderName
                }
            },
            async fetchFiles() {
                await fileListAll(this.diskId, this.foldId === '0' ? undefined: this.foldId, 1, 100).then(res => {
                    this.fileList = res.data.records
                    this.fileTotal = res.data.total
                    this.selections = []
                })
            },
            add2Right() {
                this.rightList = this.selections
                this.rightList = [...new Set(this.rightList.concat(this.selections))]
            },
            clearAll() {
                if(this.rightList.length > 0) {
                    this.rightList = []
                    this.$refs['fileNode'].clearSelection()
                }
            },
            handleRemove(currentRemove) {
                const targetIndex = this.rightList.findIndex(user => user.id === currentRemove.id)
                const target = this.rightList.splice(targetIndex, 1)
                this.$refs['fileNode'].toggleRowSelection(target[0], false)
            },
            getRightData() {
                return this.rightList
            },
            handleSelectionChange(selections) {
                this.selections = selections
            },
            handleRowClick(row, column, event) {
                if (!row.fileType) {
                    this.handleNextFold(row)
                } else {
                    this.$emit('click-file', row, column, event)
                }
            },
            async handleNextFold(row) {
                this.foldId = row.id;
                this.loading = true
                await this.fetchFiles()
                this.indexList.push({ folderName: row.folderName, id: row.id })
                this.loading = false
            },

            async toPre() {
                const current = this.indexList[this.indexList.length - 2]
                this.foldId = current.id;
                this.loading = true
                await this.fetchFiles()
                this.indexList.pop()
                this.loading = false
            },
            async toPrevious(current, index) {
                if(index < this.indexList.length - 1) {
                    this.foldId = current.id;
                    this.loading = true
                    await this.fetchFiles()
                    this.indexList = this.indexList.splice(0, index + 1)
                    this.loading = false
                }
            },
        }
    }
</script>
<style scoped lang="scss">
    .b-staff-transfer {
        width: 100%;
        display: flex;
        min-height: 320px;
        height: 100%;

        & > i {
            font-size: 20px;
            color: #555;
            width: 40px;
            height: 40px;
        }

        .b-staff-transfer-icon {
            height: 100%;
            width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;

            i {
                font-size: 20px;
                color: #bbb;
            }
        }

        .b-staff-transfer-part {
            position: relative;
            width: calc((100% - 40px) / 2);
            height: 100%;
            overflow: auto;
            border: 1px solid #dedede;
            // padding: 4px;
            background-color: #fff;

            .no-last {
                cursor: pointer;
                /*color: #008FCC;*/
                color: var(--main-color, $main_color);
            }

            .user-list {
                margin-top: 30px;
                height: calc(100% - 30px);
                overflow: auto
            }
        }

        .staff-transfer-right {
            // padding: 10px;
            li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                line-height: 30px;
                border-bottom: 1px solid #dedede;
                padding: 0 10px;
                &:hover {
                    i {
                        display: flex;
                    }
                }

                i {
                    width: 14px;
                    height: 14px;
                    /*background-color: #f46c3c;*/
                    color: #aaa;
                    border-radius: 50%;
                    /*display: flex;*/
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    margin-right: 6px;
                    /*transform: rotate(45deg);*/
                    cursor: pointer;
                    display: none;
                }
            }
        }
    }
</style>
