<template>
    <el-table
            :data="visitor"
            style="width: 100%"
            ref="table"
            size="small"
            max-height="240px"
    >
        <el-table-column prop="visitUserName" label="姓名" />
        <el-table-column prop="organName" label="所属部门" />
        <el-table-column prop="visitNum" label="访问次数" />
    </el-table>
</template>

<script>
    import { getVisitorList } from '@/api/personal/share.js'
    export default {
        name: "VisitedMember",
        props: {
            fileId: { type: String },
            shareId: { type: String }
        },
        data() {
            return {
                visitor: []
            }
        },
        mounted() {
            getVisitorList({ fileId: this.fileId, shareId: this.shareId }).then(res => {
                this.visitor = res.data
            })
        },
        watch: {
            fileId(val) {
                getVisitorList({ fileId: val, shareId: this.shareId }).then(res => {
                    this.visitor = res.data
                })
            }
        }
    }
</script>

<style scoped>

</style>
