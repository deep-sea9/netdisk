<template>
    <div class="page">
        <el-tabs v-model="activeName">
            <el-tab-pane label="网盘信息" name="info">
                <disk-info :disk-id="diskId" />
            </el-tab-pane>
            <el-tab-pane label="成员信息" name="member">
                <member-info :disk-id="diskId" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import DiskInfo from './disk-info'
    import MemberInfo from './member-info'
    export default {
        name: "disk-setting",
        components: {
            DiskInfo,
            MemberInfo
        },
        computed: {
            diskId() {
                return this.$route.meta.diskId
            }
        },
        data() {
            return {
                activeName: 'info'
            }
        },
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
        padding: 20px;
    }
</style>
