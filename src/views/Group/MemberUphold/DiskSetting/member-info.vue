<template>
    <div class="member-info">
        <div class="operate-header">
            <h3 style="margin-right: 10px;">已授权成员</h3>
            <el-button size="small" type="primary" @click="addDepartment = true">
                <i style="margin-right: 6px" class="fa fa-plus"></i>
                新增成员授权
            </el-button>
        </div>

        <el-table :data="memberData" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="userName" label="成员名称" />
            <el-table-column prop="organName" label="所属部门" />
            <el-table-column prop="auth" label="权限" >
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <span v-if="scope.row.userId !== currentDiskUserId">
                        <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
                        <el-button type="text" @click="handleModify(scope.row)">修改权限</el-button>
                    </span>
                </template>
            </el-table-column>
        </el-table>
        <div class="bottom-pagination">
            <el-pagination
                    layout="total,prev,pager,next,jumper"
                    :current-page="currentPage"
                    :page-size="pageSize"
                    :total="memberTotal"
                    @current-change="changeCurrent"/>
        </div>
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
                <el-button size="medium" type="primary" @click="confirmModify">确定</el-button>
            </div>
        </el-dialog>
        <b-department-transfer :visible.sync="addDepartment" :title="title" :select-staff="true" @confirm-select="handleConfirm">

        </b-department-transfer>
    </div>
</template>

<script>
    import BDepartmentTransfer from "../../../../components/Base/B-Department-Transfer/index";

    import { getGroupDiskMember, deleteGroupMemberByIds, saveGroupDiskPermissionById, addGroupDiskUsers } from '@/api/admin/group/index.js'

    export default {
        name: "member-info",
        props: {
            diskId: { type: String, default: '' },
            currentDiskUserId: { type: String }
        },
        components: {BDepartmentTransfer},
        data() {
            return {
                permissionModify: false,
                auth: '1',
                memberData: [],
                addDepartment: false,
                title: '新增成员授权',
                currentSelectOrg: {},
                currentPage: 1,
                pageSize: 10,
                memberTotal: 0
            }
        },

        watch: {
            diskId: {
                immediate: true,
                handler(val) {
                    this.getGroupDiskMember(val)
                }
            }
        },
        methods: {
            getGroupDiskMember(id) {
                getGroupDiskMember({ diskId: id, pageNo: this.currentPage, pageSize: this.pageSize }).then(res => {
                    this.memberData = res.data.records
                    this.memberTotal = res.data.total
                    console.log(this.memberData);
                })
            },
            changeCurrent(val) {
                this.currentPage = val
                this.getGroupDiskMember(this.diskId)
            },
            handleDelete(row) {
                this.$confirm('确定删除所选的成员吗？\n' +
                    '\n' +
                    '删除后成员将失去群组网盘访问权限', '提示', 'error').then((res) => {
                    if (res) {
                        let formData = new FormData()
                        formData.append('diskId', this.diskId)
                        formData.append('userIds', row.userId)

                        deleteGroupMemberByIds(formData).then(res => {
                            this.getGroupDiskMember(this.diskId)
                            this.$message.success(res.message || '删除成功！')
                        })
                    }
                })
            },
            handleModify(row) {
                console.log(row);
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
                formData.append('userIds', targetData.map(user => user.id))

                // const jsonData = { diskId: this.diskId, organIds: targetData.map(department => department.id) }

                addGroupDiskUsers(formData).then(res => {
                    this.$message.success(res.message || '新增成功！')
                    this.getGroupDiskMember(this.diskId)
                    this.addDepartment = false
                })
            },
            confirmModify() {
                let formData = new FormData()
                formData.append('diskId', this.diskId)
                formData.append('id', this.currentSelectOrg.id)
                formData.append('auth', this.auth)

                saveGroupDiskPermissionById(formData).then(res => {
                    this.$message.success(res.message || '修改成功！')
                    this.permissionModify = false
                    this.getGroupDiskMember(this.diskId)
                })
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

        .bottom-pagination {
            bottom: 10px;
            position: fixed;
            right: 10px;
        }
    }
</style>
