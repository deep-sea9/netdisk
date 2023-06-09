<template>
    <div class="config-container">
        <el-form ref="size-form" :model="groupForm" label-width="180px">
            <el-form-item label="是否开启群组网盘功能" size="medium" required prop="openGroup">
                <el-radio v-model="groupForm.openGroup" label="1" :disabled="formDisabled">是</el-radio>
                <el-radio v-model="groupForm.openGroup" label="0" :disabled="formDisabled">否</el-radio>
            </el-form-item>
            <el-form-item>
                <el-button v-if="!formDisabled" style="width: 100px;" size="small" @click="formDisabled = true">取消</el-button>
                <el-button v-if="formDisabled" style="width: 100px;" size="small" @click="formDisabled = false">编辑</el-button>
                <el-button :loading="saving" type="primary" style="width: 100px;" size="small" @click="saveConfig">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import { saveDiskConfig } from '@/api/common.js'

    export default {
        name: "group-disk-setting",
        data() {

            return {
                groupForm: {
                    openGroup: '1'
                },
                formDisabled: true,
                saving: false
            }
        },

        mounted() {
            this.groupForm.openGroup = this.open_group
        },
        computed: {
            open_group() {
                return this.$store.state.system.open_group
            }
        },
        watch: {
            open_group(val) {
                this.groupForm.openGroup = val
            }
        },

        methods: {
            saveConfig(){
                this.$refs['size-form'].validate(valid => {
                    if(valid) {
                        this.saving = true
                        saveDiskConfig([
                            { code: 'group_flag', value: this.groupForm.openGroup }
                        ]).then(res => {
                            this.saving = false
                            if(this.groupForm.openGroup === '1') {
                                this.$message.success('请重新登录或刷新应用启用群组网盘！')
                            }else {
                                this.$message.success(res.message || '修改成功')
                            }
                            this.$store.commit('system/SET_OPEN_GROUP', this.groupForm.openGroup)
                        }).catch(_ => this.saving = false)
                    }else {
                        return false
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .config-container {
        padding: 40px;
        width: 480px;
    }
</style>
