<template>
    <div class="page">
        <div class="dismiss-group-header">
            <el-button v-show="selections.length>0" @click="dismissSelected" type="primary" size="small">解散</el-button>
            <el-input
                    size="small"
                    class="header-search"
                    placeholder="请输入群组名称、创建人"
                    clearable
                    @keydown.native.enter="handleSearch"
                    v-model="keyword"
            >
                <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
            </el-input>
        </div>

        <h3 style="padding: 10px;">群组网盘解散</h3>

        <el-table
                :data="groupData"
                height="calc(100% - 100px)"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                ref="table"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column width="280" show-tooltip-when-overflow prop="name" label="群组名称" />
            <el-table-column prop="userName" label="创建人" />
            <el-table-column prop="organName" label="创建人部门" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="dismissCurrent(scope.row)">解散</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="bottom-pagination">
            <el-pagination
                    layout="sizes,total,prev,pager,next,jumper"
                    :current-page="currentPage"
                    :page-size="pageSize"
                    :total="groupTotal"
                    @size-change="changeSize"
                    @current-change="changeCurrent"/>
        </div>
    </div>
</template>

<script>

    import { getGroupDiskList, dismissGroupDisk } from '@/api/admin/group'

    export default {
        name: "dismiss-group",

        computed: {
            diskId() {
                return this.$route.meta.diskId
            },
            pageSize: {
                get() {
                    return this.$store.state.app.globalPageSize
                },
                set(v) {
                    this.$store.commit('app/SET_GLOBAL_PAGE_SIZE', v)
                }
            }
        },
        data() {
            return {
                keyword: '',
                groupData: [{
                    name: 'A群组网盘',
                    createUser: '张三',
                    createUserOrg: '法外狂徒',
                    createTime: '2022-06-09 10:49'
                }],
                selections: [],
                currentPage: 1,
                // pageSize: 10,
                groupTotal: 0
            }
        },
        methods: {
            handleSelectionChange(selections) {
                this.selections = selections
            },
            getGroupDiskList() {
                getGroupDiskList({ pageNo: this.currentPage, pageSize: this.pageSize, userName: this.keyword }).then(res => {
                    this.groupData = res.data.records
                    this.groupTotal = res.data.total
                })
            },
            handleSearch() {
                this.currentPage = 1;
                this.getGroupDiskList()
            },
            dismissSelected() {
                this.$confirm('群组解散后，原成员全部不可访问该群组，且不可逆。\n' +
                    '请问您确认要解散该群组吗？', '解散群组').then(res => {
                        if(res) {
                            const formData = new FormData()
                            formData.append('ids', this.selections.map(selection => selection.id))
                            dismissGroupDisk(formData).then(res => {
                                this.getGroupDiskList()
                                this.$message.success(res.message || '解散成功')
                            })
                        }
                })
            },
            dismissCurrent(row) {
                this.$confirm('群组解散后，原成员全部不可访问该群组，且不可逆。\n' +
                    '请问您确认要解散该群组吗？', '解散群组').then(res => {
                    if(res) {
                        this.loadingInstance = this.$loading({
                            lock: true,
                            text: '正在解散该群组，请稍后...',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.5)'
                        })
                        const formData = new FormData()
                        formData.append('ids', [row.id])
                        dismissGroupDisk(formData).then(res => {
                            this.getGroupDiskList()
                            this.$message.success(res.message || '解散成功')
                            this.loadingInstance.close()
                        }).catch(e => this.loadingInstance.close())
                    }
                })
            },
            changeCurrent(current) {
                // console.log(current);
                this.currentPage = current
                this.getGroupDiskList()
            },
            changeSize(size) {
                this.pageSize = size
                this.getGroupDiskList()
            }
        },
        mounted() {
            this.getGroupDiskList()
        }
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;

        .dismiss-group-header {
            height: 40px;
            display: flex;
            justify-content: flex-start;
            position: relative;
            align-items: flex-end;
            border-bottom: 1px solid #dedede;
            padding: 0 20px 10px;
            box-sizing: content-box;

            .header-search {
                width: 400px;
                position: absolute;
                bottom: 10px;
                right: 20px;
            }
        }

        .bottom-pagination {
            bottom: 10px;
            position: fixed;
            right: 10px;
        }
    }
</style>
