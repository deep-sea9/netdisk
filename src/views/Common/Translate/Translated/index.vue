<template>
    <div class="uploading-container">
        <div class="uploading-operation">
            <el-button type="danger" size="small" @click="deleteAll">
                <i class="el-icon-delete" /> 全部删除
            </el-button>
            <el-button :disabled="selection.length < 1" type="danger" size="small" @click="delTranslateRecord">
                <i class="el-icon-delete" /> 删除
            </el-button>
        </div>

        <b-upload-node type="translated"
                       pagination
                       :files="translatedList"
                       :selection.sync="selection"
                       :current-page="currentPage"
                       :page-size="pageSize"
                       :file-total="total"
                       @size-change="changeSize"
                       @current-change="changeCurrent"
                       @delete-row="handleDelRow" />


    </div>
</template>

<script>
    import {getTranslatedList, delTranslateRecord} from'@/api/system/index.js'
    export default {
        name: "downloading",
        data() {
            return {
                translatedList: [],
                selection: [],
                currentPage: 1,
                pageSize: 10,
                total: 0
            }
        },
        computed: {

        },
        methods: {
            getTranslatedList() {
                getTranslatedList(this.currentPage, this.pageSize).then(res => {
                    console.log(res.data);
                    this.translatedList = res.data.records
                    this.total = res.data.total
                })
            },
            delTranslateRecord() {
                const ids = this.selection.map(selection => selection.id).join()
                delTranslateRecord({ids}).then(res => {
                    this.getTranslatedList()
                    this.$message.success(res.msg || '删除成功')
                })
            },
            deleteAll() {
                delTranslateRecord().then(res => {
                    this.getTranslatedList()
                    this.$message.success(res.msg || '删除成功')
                })
            },
            handleDelRow(index, row) {
                delTranslateRecord({ ids: row.id }).then(res => {
                    this.getTranslatedList()
                    this.$message.success(res.msg || '删除成功')
                })
            },
            changeSize(size) {
                this.pageSize = size
                this.getTranslatedList()
            },
            changeCurrent(page) {
                this.currentPage = page
                this.getTranslatedList()
            }
        },
        mounted() {
            this.getTranslatedList()
        }
    }
</script>

<style lang="scss" scoped>
    .uploading-container {
        padding: 20px;
        width: 100%;
        height: 100%;

        .uploading-operation {
            margin-bottom: 5px;
        }
        .uploading-progress {
            height: 40px;
            width: 100%;
            display: flex;
            justify-content: flex-start;
            align-items: center;
        }

        .bottom-pagination {
            bottom: 10px;
            position: fixed;
            right: 10px;
        }
    }
</style>
