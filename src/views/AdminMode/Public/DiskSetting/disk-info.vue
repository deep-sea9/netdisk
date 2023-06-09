<template>
    <div class="disk-info">
        <el-form ref="diskForm" :model="formInfo" label-width="120px" size="medium" :disabled="Boolean(diskId && editStatus)">
            <el-form-item prop="name" label="网盘名称" :rules="[{ required: true, message: '请输入网盘名称' }, { validator: diskNameLimit }]">
                <el-input style="width: 400px;" v-model.trim="formInfo.name" />
            </el-form-item>
            <el-form-item prop="allocateSpace" label="网盘大小"  :rules="[{ required: true, message: '请选择网盘空间' }]">
                <el-select v-model="formInfo.allocateSpace">
                    <el-option v-for="space in spaceEnum" :key="space.value" :value="space.value" :label="space.label">{{ space.label }}</el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="adminIds" label="网盘管理员"  :rules="[{ required: true, message: '请选择网盘管理员', trigger: 'blur' }]">
                <pull-tree v-model="formInfo.adminIds" :node-config="{ value: 'id', label: 'name' }" :placeholder="admins" />
            </el-form-item>
            <el-form-item prop="permission" label="成员默认权限">
                <el-radio-group v-model="formInfo.adminPermission">
                    <el-radio label="1">只能查看</el-radio>
                    <el-radio label="2">查看、上传</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="文档权限">
                <el-row>
                    <el-col :span="4">
                        <el-form-item prop="allowDown">
                            <el-checkbox v-model="formInfo.allowDown">允许下载</el-checkbox>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item prop="downNum" label="次数">
                            <el-select v-model="formInfo.downNum">
                                <el-option v-for="num in downloadNums" :key="num.value" :label="num.label" :value="num.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form-item>
<!--            <el-form-item>-->
<!--                <el-row>-->
<!--                    <el-col :span="4">-->
<!--                        <el-form-item prop="allowDown">-->
<!--                            <el-checkbox v-model="formInfo.allowPrint">允许打印</el-checkbox>-->
<!--                        </el-form-item>-->
<!--                    </el-col>-->
<!--                    <el-col :span="6">-->
<!--                        <el-form-item prop="allowDown">-->
<!--                            <el-checkbox v-model="formInfo.addMark">允许加水印</el-checkbox>-->
<!--                        </el-form-item>-->
<!--                    </el-col>-->
<!--                </el-row>-->
<!--            </el-form-item>-->
            <el-form-item>
                <el-checkbox v-model="formInfo.allowAllKeep">允许全员维护文档</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-alert title="提示" type="error" description="默认文档作者及管理员可对文档进行删除、复制、移动。允许全员维护开启后网盘所有人员都可以对文档进行删除、复制、移动" />
            </el-form-item>
            <el-form-item v-show="!editStatus">
                <el-button v-if="diskId" @click="handleCancel">取消</el-button>
                <el-button :loading="saving" type="primary" @click="handleSave">保存</el-button>
            </el-form-item>
        </el-form>
        <div v-if="diskId" style="padding-left: 120px;">
            <el-button v-show="editStatus" type="text" @click="editStatus = false">{{ diskId? '修改网盘信息': '开始新增网盘' }}</el-button>
        </div>
    </div>
</template>

<script>
    import { getPublicConfigById, setPublicConfigById } from '@/api/admin/public'
    import { DOWNLOAD_NUM, SPACE_ENUM } from '@/utils/constants.js'
    import PullTree from '@/components/Custom/PullTree'

    export default {
        name: "disk-info",
        props: {
            diskId: { type: String, default: '' }
        },
        components: { PullTree },
        data() {
            return {
                spaceEnum: SPACE_ENUM,
                editStatus: true,
                formInfo: {
                    name: '',
                    allocateSpace: 1024 * 1024 * 1024,
                    adminIds: [],
                    adminPermission: '1',
                    allowDown: false,
                    downNum: 1,
                    allowPrint: false,
                    addMark: false,
                    allowAllKeep: false
                },
                admins: '请选择',
                downloadNums: DOWNLOAD_NUM,
                saving: false
            }
        },
        methods: {
            diskNameLimit(r, v, cb) {
                if(v.length <= 8) {
                    cb()
                }else {
                    cb(new Error('请限制网盘名称在8个字符内'))
                }
            },
            handleCancel() {
                this.formInfo.adminIds = []
                this.editStatus = true
                console.log(this.formInfo);
            },
            handleSave() {
                this.$refs['diskForm'].validate(valid => {
                    if(valid) {
                        this.saving = true
                        if(this.diskId) {
                            setPublicConfigById({ ...this.formInfo, id: this.diskId }).then(res => {
                                this.$_EB.$emit('update-space')
                                this.$message.success(res.message || '保存成功！')
                                this.saving = false
                            }).catch(e => this.saving = false)
                        }else {
                            setPublicConfigById({ ...this.formInfo }).then(res => {
                                this.$message.success((res.message || '新增成功') + '，现在您可以进入[ 成员信息 ]模块邀请新成员加入您所创建的公共网盘')
                                this.$router.go(-1)
                                this.$store.dispatch('registryPublicRoute')
                                this.saving = false
                            }).catch(e => this.saving = false)
                        }
                    }
                })
            }
        },
        watch: {
            'formInfo.adminIds'(v) {
                if(v.length === 0) {
                    this.formInfo.adminIds = this.originAdminIds
                }
            }
        },
        mounted() {

            if(this.diskId) {
                getPublicConfigById(this.diskId).then(res => {

                    const admins = Object.keys(res.data.admins)
                    let adminLabels= []
                    this.originAdminIds = JSON.parse(JSON.stringify(admins))

                    const oAdmins = res.data.admins

                    for(let key in oAdmins) {
                        if(Object.prototype.hasOwnProperty.call(oAdmins, key)) {
                            adminLabels.push(oAdmins[key])
                        }
                    }


                    this.formInfo = { ...res.data, adminIds: admins }
                    this.admins = adminLabels.toString()
                })
            }else {
                this.editStatus = false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .disk-info {
       padding: 10px;
    }
</style>
