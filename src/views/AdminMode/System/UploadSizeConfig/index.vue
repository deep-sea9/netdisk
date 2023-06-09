<template>
    <div class="config-container">
        <el-form ref="size-form" :model="sizeForm" label-width="180px" :rules="rules">
            <el-form-item label="个人文件柜默认大小" size="medium" required prop="perSpace">
                <el-input v-model.number="sizeForm.perSpace" :disabled="formDisabled">
                    <template slot="append">G</template>
                </el-input>
            </el-form-item>
            <el-form-item label="上传单个文件最大限制" size="medium" required prop="fileMax">
                <el-input v-model="sizeForm.fileMax" :disabled="formDisabled">
                    <template slot="append">G</template>
                </el-input>
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
    import { b2G } from '@/utils/index.js'

    export default {
        name: "upload-size-config",
        data() {

            const numberValidator = (rule, value, cb) => {
                if(value <= 2 && value > 0) {
                    cb()
                }else {
                    cb(new Error('请输入大于0且小于等于2数字'))
                }
            }

            const personSpaceValidator = (rule, value, cb) => {
                if(value >= 1 && value <= 5000) {
                    cb()
                }else {
                    cb(new Error('默认最小空间为1G,最大为5000G'))
                }
            }

            return {
                sizeForm: {
                    perSpace: 0,
                    fileMax: 0
                },
                formDisabled: true,
                rules: {
                    perSpace: [
                        { required: true, message: '请输入个人文件柜默认大小' },
                        { type: 'number', message: '请输入数字' },
                        { validator: personSpaceValidator }
                    ],
                    fileMax: [
                        { required: true, message: '请输入上传单个文件最大限制' },
                        { validator: numberValidator, message: '请输入大于0且小于等于2数字' },
                    ]
                },
                saving: false
            }
        },
        computed: {
            fileMax() {
                return this.$store.state.system.fileMax
            },
            perSpace() {
                return this.$store.state.system.perSpace
            }
        },

        created() {
            const {perSpace, fileMax} = this.$store.state.system
            this.sizeForm.perSpace = b2G(perSpace)
            this.sizeForm.fileMax = b2G(fileMax)
        },
        watch: {
            fileMax(v) {
                this.sizeForm.fileMax = b2G(v)
            },
            perSpace(v) {
                this.sizeForm.perSpace = b2G(v)
            }
        },

        methods: {
            saveConfig(){
                this.$refs['size-form'].validate(valid => {
                    if(valid) {
                        this.saving = true
                        saveDiskConfig([
                            { code: 'per_space', value: this.sizeForm.perSpace * Math.pow(1024, 3) },
                            { code: 'file_max', value: this.sizeForm.fileMax * Math.pow(1024, 3) }
                        ]).then(res => {
                            this.saving = false
                            this.$message.success(res.message || '修改成功')
                            this.$store.commit('system/SET_FILE_MAX', this.sizeForm.fileMax * Math.pow(1024, 3))
                            this.$store.commit('system/SET_PER_SPACE', this.sizeForm.perSpace * Math.pow(1024, 3))
                        }).catch(_ => this.saving = true)
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
