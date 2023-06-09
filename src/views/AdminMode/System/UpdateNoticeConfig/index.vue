<template>
    <div class="config-container">
        <el-form ref="size-form" :model="noticeForm" label-width="180px">
            <el-form-item label="应用更新通知" size="medium" required prop="noticeFlag">
                <el-radio v-model="noticeForm.noticeFlag" label="1" :disabled="formDisabled">开启</el-radio>
                <el-radio v-model="noticeForm.noticeFlag" label="0" :disabled="formDisabled">关闭</el-radio>
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
    // import { saveDiskConfig } from '@/api/common.js'
    import LStorage from "@/utils/storage-packing";

    export default {
        name: "update-notice-config",
        data() {

            return {
                noticeForm: {
                    noticeFlag: '0'
                },
                formDisabled: true,
                saving: false
            }
        },

        mounted() {
            this.ls = new LStorage({ prefix: 'notice' })
            this.noticeForm.noticeFlag = this.ls.getItem('open') || '0'
        },

        methods: {
            saveConfig(){
                this.$refs['size-form'].validate(valid => {
                    if(valid) {
                        this.ls.setItem('open', this.noticeForm.noticeFlag, true)
                        this.$store.commit('system/SET_STATE_VALUE', { key: 'notice_open', value: this.noticeForm.noticeFlag })

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
