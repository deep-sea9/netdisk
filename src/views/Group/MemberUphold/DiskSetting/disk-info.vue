<template>
    <div class="disk-info">
        <el-form ref="diskForm" :model="formInfo" label-width="120px" size="medium" :disabled="editStatus">
            <el-form-item prop="name" label="网盘名称"  :rules="[{ required: true, message: '请输入网盘名称' }]">
                <el-row>
                    <el-col :span="10">
                        <el-input style="width: 90%" v-model="formInfo.name" />
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item prop="allocateSpace" label="网盘大小"  :rules="[{ required: true, message: '请选择网盘空间' }]">
                <el-row>
                    <el-col :span="10">
                        <el-select style="width: 90%" v-model="formInfo.allocateSpace">
                            <el-option v-for="space in spaceEnum" :key="space.value" :value="space.value" :label="space.label">{{ space.label }}</el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="14">
                        <span style="color: #9099A9">个人剩余可用空间 {{ resetSpace2G }} G</span>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item prop="adminPermission" label="成员默认权限">
                <el-radio-group v-model="formInfo.adminPermission">
                    <el-radio label="1">只能查看</el-radio>
                    <el-radio label="2">查看、上传</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item prop="adminPermission" label="允许成员维护组">
                <el-checkbox v-model="formInfo.allowMemberAdmin">开启(开启后所有成员可以维护组，即拉人、删人)</el-checkbox>
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
                            <el-select :disabled="!formInfo.allowDown" v-model="formInfo.downNum">
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
                <el-button @click="editStatus = true">取消</el-button>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </el-form-item>
        </el-form>
        <div style="padding-left: 120px;">
            <el-button v-show="editStatus && isMyselfDisk" type="text" @click="editStatus = false">{{ groupId? '创建新网盘': '修改网盘信息' }}</el-button>
        </div>
    </div>
</template>

<script>
    import { getGroupDiskConfigById, setGroupDiskConfig } from '@/api/admin/group'
    import { SPACE_ENUM, DOWNLOAD_NUM } from '@/utils/constants.js'
    import { mapGetters } from 'vuex'
    import {b2G} from "@/utils";

    export default {
        name: "disk-info",
        props: {
            diskId: { type: String, default: '' }
        },
        data() {
            return {
                editStatus: true,
                formInfo: {
                    name: '',
                    allocateSpace: 1024 * 1024 * 1024,
                    adminPermission: '1',
                    allowMemberAdmin: false,
                    allowDown: false,
                    downNum: '',
                    allowPrint: false,
                    addMark: false,
                    allowAllKeep: false
                },
                admins: '请选择',
                groupId: '',
                downloadNums: DOWNLOAD_NUM
            }
        },
        computed: {
            ...mapGetters(['spaceInfo']),
            restSpace() {
                return this.spaceInfo.totalSpace - this.spaceInfo.personalSpace - this.spaceInfo.groupSpace
            },
            resetSpace2G() {
                return b2G(this.restSpace).toFixed(2)
            },
            sysGroupSpace() {
                return this.$store.state.system.groupSpace
            },
            spaceEnum() {
                const spaceEnum = JSON.parse(JSON.stringify(SPACE_ENUM))
                const maxSpace = spaceEnum.findIndex(space => space.value == this.sysGroupSpace)
                return spaceEnum.splice(0, maxSpace + 1)
            },
            userId() {
                return this.$store.state.user.userId
            },
            isMyselfDisk() {
                // 创建新网盘或者是自己群组下的网盘
                return this.groupId || (this.userId === this.formInfo.createBy)
            }
        },
        methods: {
            handleSave() {
                this.$refs['diskForm'].validate(valid => {
                    if(valid) {
                        // if(this.restSpace < this.formInfo.allocateSpace) {
                        //     this.$message.warning('剩余可分配空间不足，请修改群组空间后重试')
                        //     return
                        // }
                        if(this.groupId) {
                            setGroupDiskConfig({ ...this.formInfo, groupId: this.groupId }).then(res => {
                                this.$message.success(res.message || '新增成功！')
                                this.$router.go(-1)
                                this.$store.dispatch('registryGroupRoute')

                            })
                        }else {
                            setGroupDiskConfig({ ...this.formInfo, id: this.diskId }).then(res => {
                                this.$_EB.$emit('update-space')
                                this.$message.success(res.message || '保存成功！')
                            })
                        }
                    }
                })
            }
        },
        mounted() {
            const { groupId } = this.$route.params

            if(!groupId) {
                getGroupDiskConfigById(this.diskId).then(res => {
                    this.formInfo = res.data
                    this.$emit('update:allowMemberAdmin', res.data.allowMemberAdmin)
                })
            }else {
                this.groupId = groupId
            }

        }
    }
</script>

<style lang="scss" scoped>
    .disk-info {
        padding: 10px;
    }
</style>
