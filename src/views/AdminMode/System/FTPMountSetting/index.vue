<template>
    <div class="config-container">
        <el-form ref="size-form" :model="ftpForm" label-width="180px">
            <el-form-item label="FTP挂载服务" size="medium" required prop="ftpFlag">
                <el-radio v-model="ftpForm.ftpFlag" label="1" :disabled="formDisabled">开启</el-radio>
                <el-radio v-model="ftpForm.ftpFlag" label="0" :disabled="formDisabled">关闭</el-radio>
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
        name: "ftp-mount-config",
        data() {

            return {
                ftpForm: {
                    ftpFlag: '1'
                },
                formDisabled: true,
                saving: false
            }
        },

        mounted() {
            this.ftpForm.ftpFlag = this.ftpFlag
            console.log(this.ftpFlag);
        },
        computed: {
            ftpFlag() {
                return this.$store.state.system.ftpFlag
            }
        },
        watch: {
            ftpFlag(val) {
                this.ftpForm.ftpFlag = val
            }
        },

        methods: {
            saveConfig(){
                this.$refs['size-form'].validate(valid => {
                    if(valid) {
                        this.saving = true
                        saveDiskConfig([
                            { code: 'ftp_flag', value: this.ftpForm.ftpFlag }
                        ]).then(res => {
                            this.saving = false
                            this.$message.success(res.message || '修改成功')
                            this.$store.commit('system/SET_FTP_FLAG', this.ftpForm.ftpFlag)
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
