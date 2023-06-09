<template>
    <div class="member-info">
        <div class="operate-header">
            <h3 style="margin-right: 10px;">已授权部门</h3>
            <el-button size="small" type="primary" @click="addDepartment = true">
                <i style="margin-right: 6px" class="fa fa-plus"></i>
                新增部门授权
            </el-button>
        </div>

        <el-table :data="memberData" @selection-change="handleSelectionChange" height="580">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="organName" label="部门名称" />
            <el-table-column prop="auth" label="权限" >
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
                    <el-button type="text" @click="handleModify(scope.row)">修改权限</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog :visible.sync="permissionModify" title="修改权限" width="40%">
            <div style="padding: 20px;">
                <el-row>
                    <el-col :span="4">
                        <div style="height: 32px;line-height: 32px;margin: 10px;">
                            权限
                        </div>
                    </el-col>
                    <el-col :span="16">
                        <div style="height: 32px;line-height: 32px;;margin: 10px;overflow: hidden">
                            <el-radio-group v-model="auth">
                                <el-radio label="1">只能查看</el-radio>
                                <el-radio label="2">查看、上传</el-radio>
                            </el-radio-group>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <div slot="footer">
                <el-button size="medium" @click="permissionModify=false">取消</el-button>
                <el-button :loading="confirming" size="medium" type="primary" @click="confirmModify">确定</el-button>
            </div>
        </el-dialog>
        <b-department-transfer type="department" :visible.sync="addDepartment" :title="title" @confirm-select="handleConfirm">

        </b-department-transfer>
    </div>
</template>

<script>
    import BDepartmentTransfer from "../../../../components/Base/B-Department-Transfer/index";

    import { getPublicDepartmentById, deletePublicDepartmentById, savePublicDepartmentById, addPublicDepartment } from '@/api/admin/public/index.js'

    export default {
        name: "member-info",
        props: {
            diskId: { type: String, default: '' }
        },
        components: {BDepartmentTransfer},
        data() {
            return {
                permissionModify: false,
                auth: '1',
                memberData: [{
                    organName: '组织部',
                    adminPermission: '查看'
                }],
                addDepartment: false,
                title: '新增部门授权',
                currentSelectOrg: {},
                confirming: false
            }
        },

        watch: {
            diskId: {
                immediate: true,
                handler(val) {
                    this.getPublicDepartmentById(val)
                }
            }
        },
        methods: {
            getPublicDepartmentById(id) {
                getPublicDepartmentById(id).then(res => {
                    this.memberData = res.data
                })
            },
            handleDelete(row) {
                this.$confirm('确定删除所选的部门吗？\n' +
                    '删除后部门成员将失去公共网盘对应目录访问权限', '提示', 'error').then((res) => {
                    if (res) {
                        const loadingOption = { lock: true, text: '正在删除，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .5)' }
                        let formData = new FormData()
                        formData.append('diskId', this.diskId)
                        formData.append('organId', row.organId)

                        deletePublicDepartmentById(formData).then(res => {
                            this.getPublicDepartmentById(this.diskId)
                            loadingOption.close()
                            this.$message.success(res.message || '删除成功！')
                        }).catch(_ => loadingOption.close())
                    }
                })
            },
            handleModify(row) {
                this.permissionModify = true
                this.currentSelectOrg = row
                this.auth = row.authCode
            },
            handleSelectionChange(selections) {
                this.selections = selections
            },
            handleConfirm(targetData) {

                let formData = new FormData()
                formData.append('diskId', this.diskId)
                formData.append('organIds', targetData.map(department => department.id))

                addPublicDepartment(formData).then(res => {
                    this.$message.success((res.message || '新增成功') + '，请通知该部门成员刷新应用后查看！')
                    this.getPublicDepartmentById(this.diskId)
                    this.addDepartment = false
                })
            },
            confirmModify() {
                this.confirming = true
                let formData = new FormData()
                formData.append('diskId', this.diskId)
                formData.append('id', this.currentSelectOrg.id)
                formData.append('auth', this.auth)

                savePublicDepartmentById(formData).then(res => {
                    this.$message.success(res.message || '修改成功！')
                    this.permissionModify = false
                    this.getPublicDepartmentById(this.diskId)
                    this.confirming = false
                }).catch(_ => this.confirming = false)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .member-info {
        .operate-header {
            height: 40px;
            display: flex;
            justify-content: flex-start;
            position: relative;
            align-items: center;
            border-bottom: 1px solid #dedede;
            padding: 0 20px 10px;
            box-sizing: content-box;
        }
    }
</style>
