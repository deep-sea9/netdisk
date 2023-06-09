<template>
    <div class="page">
        <el-button @click="jumpToPreRoute" size="mini" type="primary">< 返回</el-button>
        <el-tabs v-model="activeName">
            <el-tab-pane label="网盘信息" name="info">
                <disk-info :disk-id="diskId" :current-disk-user-id="currentDiskUserId" :user-id="userId" :allowMemberAdmin.sync="allowMemberAdmin" />
            </el-tab-pane>
<!--            <el-tab-pane v-if="currentDiskUserId === userId" label="成员信息" name="member">-->
            <el-tab-pane v-if="allowMemberAdmin || (currentDiskUserId === userId)" label="成员信息" name="member">
                <member-info :disk-id="diskId" :current-disk-user-id="currentDiskUserId" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import DiskInfo from './disk-info'
    import MemberInfo from './member-info'
    import {mapGetters} from "vuex";
    export default {
        name: "disk-setting",
        components: {
            DiskInfo,
            MemberInfo
        },
        inject: ['fromRoute'],
        computed: {
            diskId() {
                return this.$route.meta.diskId
            },
            currentDiskUserId() {
                return this.$route.meta.userId
            },
            ...mapGetters(['userId']),
        },
        data() {
            return {
                activeName: 'info',
                allowMemberAdmin: false
            }
        },
        methods: {
            jumpToPreRoute() {
                this.$router.replace({
                    name: this.fromRoute
                })
            }
        },
        mounted() {
            console.log('disk setting', this.$route, this.fromRoute);
        }
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;
        padding: 20px;
    }
</style>
