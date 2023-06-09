<template>
    <div class="uploading-container">
<!--        <div class="uploading-operation">-->
<!--            <el-button type="primary" size="small">-->
<!--                <i class="el-icon-video-pause" /> 全部暂停-->
<!--            </el-button>-->
<!--            <el-button type="plain" size="small">-->
<!--                <i class="el-icon-video-play" /> 全部开始-->
<!--            </el-button>-->
<!--            <el-button type="danger" size="small" @click="deleteAll">-->
<!--                <i class="el-icon-delete" /> 全部删除-->
<!--            </el-button>-->
<!--            <el-button :disabled="selection.length < 1" type="danger" size="small" @click="delTranslateRecord">-->
<!--                <i class="el-icon-delete" /> 删除-->
<!--            </el-button>-->
<!--        </div>-->
<!--        <div class="uploading-progress">-->
<!--            <span style="width: 100px">当前进度：</span> <el-progress style="width: 80%;max-width: 600px" :percentage="percentage" />-->
<!--        </div>-->

        <b-upload-node type="downloading" :files="downloadingList" :selection.sync="selection" />
    </div>
</template>

<script>
    import {getDownloadingList, delTranslateRecord} from'@/api/system/index.js'
    export default {
        name: "downloading",
        data() {
            return {
                // downloadingList: [],
                selection: []
            }
        },
        computed: {
            percentage() {
                return 14
            },
            downloadingList() {
                return this.$store.state.translate.downloadingList
            },
        },
        methods: {
            getDownloadingList() {
                getDownloadingList().then(res => {
                    this.downloadingList = res.data
                })
            },
            delTranslateRecord() {
                const ids = this.selection.map(selection => selection.id).join()
                delTranslateRecord({ids}).then(res => {
                    this.getDownloadingList()
                    this.$message.success(res.msg || '删除成功')
                })
            },
            deleteAll() {
                delTranslateRecord().then(res => {
                    this.getDownloadingList()
                    this.$message.success(res.msg || '删除成功')
                })
            }
        },
        mounted() {
            // this.getDownloadingList()
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
    }
</style>
