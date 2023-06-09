<template>
    <div class="visit-log">
        <el-empty v-if="visitLog.length < 1" description="暂无数据"></el-empty>
        <div v-else class="log-row" v-for="log in visitLog" :key="log.id">
            <i class="fa fa-clock right-margin-15" />
            <p class="right-margin-15">{{ log.visitTime }}</p>
            <p class="right-margin-15">{{ log.visitUserName }}</p>
            <p class="right-margin-15" style="color: darkred">{{ log.visitType }}</p>
            <p>该文件</p>
        </div>
    </div>
</template>

<script>
    import { getVisitedLog } from '@/api/personal/share.js'
    export default {
        name: "VisitedMember",
        props: {
            fileId: { type: String },
            shareId: { type: String }
        },
        data() {
            return {
                visitLog: []
            }
        },
        mounted() {
            getVisitedLog({ fileId: this.fileId, shareId: this.shareId }).then(res => {
                this.visitLog = res.data
            })
        },
        watch: {
            fileId(val) {
                getVisitedLog({ fileId: val, shareId: this.shareId }).then(res => {
                    this.visitLog = res.data
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .visit-log {
        width: 100%;
        height: 280px;

        .log-row {
            width: 100%;
            height: 28px;
            display: flex;
            align-items: center;
            color: #888;
            font-size: 12px;
            padding: 0 10px;

            .right-margin-15 {
                margin-right: 15px;
            }
        }
    }
</style>
