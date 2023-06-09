<template>
    <div class="config-container">
        <el-form ref="size-form" :model="sizeForm" label-width="180px">
            <el-form-item label="网络云盘登录方式" size="medium" required prop="aloneLogin">
                <el-radio v-model="sizeForm.aloneLogin" label="1" :disabled="formDisabled">独立登录</el-radio>
                <el-radio v-model="sizeForm.aloneLogin" label="0" :disabled="formDisabled">统一登录</el-radio>
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
        name: "upload-size-config",
        data() {

            return {
                sizeForm: {
                    aloneLogin: '1'
                },
                formDisabled: true,
                saving: false
            }
        },

        mounted() {
            this.sizeForm.aloneLogin = this.alone_login
        },
        computed: {
            alone_login() {
                return this.$store.state.system.alone_login
            }
        },
        watch: {
            alone_login(val) {
                this.sizeForm.aloneLogin = val
            }
        },

        methods: {
            saveConfig(){
                this.$refs['size-form'].validate(valid => {
                    if(valid) {
                        this.saving = true
                        saveDiskConfig([
                            { code: 'alone_login', value: this.sizeForm.aloneLogin }
                        ]).then(res => {
                            this.saving = false
                            this.$message.success(res.message || '修改成功')
                            this.$store.commit('system/SET_ALONE_LOGIN', this.sizeForm.aloneLogin)
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
