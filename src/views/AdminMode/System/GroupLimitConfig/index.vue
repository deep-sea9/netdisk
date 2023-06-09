<template>
    <div class="config-container">
        <div class="form-container">
            <div>限制群组网盘群组上限</div>
            <div style="width: 180px;">
                <el-radio-group v-model="isConfig" :disabled="formDisabled">
                    <el-radio :label="false">无上限</el-radio>
                    <el-radio :label="true">设置上限</el-radio>
                </el-radio-group>
            </div>
            <div>
                <el-select v-model="limitSize" :disabled="!isConfig || formDisabled">
                    <el-option v-for="limit in limitSizes" :key="limit.value" :label="limit.label"
                               :value="limit.value"/>
                </el-select>
            </div>
        </div>

        <div class="operate">
            <el-button v-if="!formDisabled" style="width: 100px;" size="small" @click="formDisabled = true">取消</el-button>
            <el-button v-if="formDisabled" style="width: 100px;" size="small" @click="formDisabled = false">编辑</el-button>
            <el-button :loading="saving" type="primary" style="width: 100px;" size="small" @click="saveConfig">保存</el-button>
        </div>
    </div>
</template>

<script>
    import { saveDiskConfig } from '@/api/common.js'

    export default {
        name: "auto-delete-recycle",
        data() {

            const limitSizes = [
                {
                    label: '5G',
                    value: (5 * 1024 * 1024 * 1024).toString()
                },
                {
                    label: '10G',
                    value: (10 * 1024 * 1024 * 1024).toString()
                },
                {
                    label: '20G',
                    value: (20 * 1024 * 1024 * 1024).toString()
                },
                {
                    label: '30G',
                    value: (30 * 1024 * 1024 * 1024).toString()
                },
                {
                    label: '40G',
                    value: (40 * 1024 * 1024 * 1024).toString()
                },
                {
                    label: '50G',
                    value: (50 * 1024 * 1024 * 1024).toString()
                }
            ]

            return {
                isConfig: true,
                formDisabled: true,
                limitSizes,
                limitSize: '',
                saving: false
            }
        },

        created() {
            const groupSpace = this.$store.state.system.groupSpace
            if(groupSpace <0) {
                this.isConfig = false
                this.limitSize = ''
            }else {
                this.limitSize = groupSpace
            }
        },

        methods: {
            saveConfig() {
                this.saving = true
                if(!this.isConfig) {
                    saveDiskConfig([{ code: 'group_space', value: -1 }]).then(res => {
                        this.saving = false
                        this.$message.success(res.message || '修改成功')
                        this.$store.commit('system/SET_GROUP_SPACE', -1)
                    }).catch(_ => this.saving = false)
                }else {
                    saveDiskConfig([{ code: 'group_space', value: this.limitSize }]).then(res => {
                        this.saving = false
                        this.$message.success(res.message || '修改成功')
                        this.$store.commit('system/SET_GROUP_SPACE', this.limitSize)
                    }).catch(_ => this.saving = false)
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .config-container {
        padding: 40px;
        width: 720px;

        .form-container {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 50px;
            align-items: center;
        }

        .operate {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 50px;
        }
    }
</style>
