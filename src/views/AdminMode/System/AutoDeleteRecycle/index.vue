<template>
    <div class="config-container">

        <div class="remark">
            <div style="width: 60px;height: 28px;line-height: 28px;">备注：</div>
            <div>
                <p style="height: 28px;line-height: 28px;">个人网盘/群组网盘回收站占用个人空间，文件不自动清理；</p>
                <p style="height: 28px;line-height: 28px;">公共网盘回收站占用公共空间，按设置期限自动彻底删除；</p>
            </div>
        </div>

        <div class="form-container">
            <div>公共网盘自动彻底删除期限</div>
            <div style="width: 180px;">
                <el-radio-group v-model="isConfig" :disabled="formDisabled">
                    <el-radio :label="false">不设置</el-radio>
                    <el-radio :label="true">设置时间</el-radio>
                </el-radio-group>
            </div>
            <div>
                <el-select v-model="limitDate" :disabled="!isConfig || formDisabled">
                    <el-option v-for="limit in limitDates" :key="limit.value" :label="limit.label"
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

            const limitDates = [
                {
                    label: '7天',
                    value: '7'
                },
                {
                    label: '10天',
                    value: '10'
                },
                {
                    label: '15天',
                    value: '15'
                },
                {
                    label: '30天',
                    value: '30'
                }
            ]

            return {
                isConfig: true,
                formDisabled: true,
                limitDates,
                limitDate: '',
                saving: false
            }
        },

        created() {
            const recycleDay = this.$store.state.system.recycleDay
            if(recycleDay <0) {
                this.isConfig = false
                this.limitDate = ''
            }else {
                this.limitDate = recycleDay
            }
        },

        methods: {
            saveConfig() {
                this.saving = true
                if(!this.isConfig) {
                    saveDiskConfig([{ code: 'recycle_day', value: -1 }]).then(res => {
                        this.saving = false
                        this.$message.success(res.message || '修改成功')
                        this.$store.commit('system/SET_RECYCLE_DAY', -1)
                    }).catch(_ => this.saving = false)
                }else {
                    saveDiskConfig([{ code: 'recycle_day', value: this.limitDate }]).then(res => {
                        this.saving = false
                        this.$message.success(res.message || '修改成功')
                        this.$store.commit('system/SET_RECYCLE_DAY', this.limitDate)
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

        .remark {
            font-weight: bold;
            font-size: 1rem;
            display: flex;
            justify-content: flex-start;
            width: 100%;
            align-items: flex-start;
        }

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
