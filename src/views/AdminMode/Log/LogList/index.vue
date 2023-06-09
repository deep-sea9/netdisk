<template>
    <div class="page">
        <div class="log-filter-header">
            <el-button style="margin-right: 15px" v-show="selections.length>0" @click="delLog()" type="danger" size="mini">删除</el-button>
            <div class="filter-item">
                <el-date-picker size="mini" v-model="beginDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd mm:HH:ss" type="date" placeholder="请选择开始日期" />
            </div>
            <div class="filter-item">
                <el-date-picker size="mini" v-model="endDate" format="yyyy-MM-dd" value-format="yyyy-MM-dd mm:HH:ss" type="date" placeholder="请选择结束日期" />
            </div>
            <div class="filter-item">
                <el-select size="mini" v-model="diskType" placeholder="请选择系统模块" clearable>
                    <el-option value="1" label="个人网盘" />
                    <el-option value="2" label="公共网盘" />
                    <el-option value="4" label="群组网盘" />
                </el-select>
            </div>
            <div class="filter-item">
                <el-input size="mini" v-model="operatorName" placeholder="请输入操作人员名称" />
            </div>
            <el-button :loading="searching" size="mini" type="primary" @click="getLogList">搜索</el-button>
        </div>

        <el-table
                :data="logList"
                height="calc(100% - 100px)"
                style="width: 100%"
                @selection-change="handleSelectionChange"
                ref="table"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column v-if="module !== 'USER_LOGIN' && module !== 'USER_LOGOUT'" prop="diskType" label="系统模块" />
            <el-table-column v-if="module !== 'USER_LOGIN' && module !== 'USER_LOGOUT'" width="150" show-tooltip-when-overflow prop="diskName" label="模块名称" />
            <el-table-column show-tooltip-when-overflow prop="summary" label="操作行为" />
            <el-table-column width="120" prop="operatorName" label="操作人员" />
            <el-table-column width="200" prop="organName" label="所属部门">
                <template slot-scope="scope">
                    <el-tooltip placement="top" effect="dark" trigger="hover" :content="scope.row.organPath">
                        <span style="cursor: default">
                            {{ scope.row.organName }}
                        </span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column width="120" prop="ip" label="操作地址" />
            <el-table-column width="170" prop="createTime" label="操作时间" />
            <el-table-column prop="createTime" label="操作状态" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.hasException? '失败': '成功' }}</span>
                </template>
            </el-table-column>
            <el-table-column width="160" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="viewDetail(scope.row)">查看详情</el-button>
                    <el-button type="text" style="color: #f56c6c" @click="delLog(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog :visible.sync="detailShow" title="操作日志详情" width="50%">
            <div class="flex-between detail-container">
                <div class="detail-item" v-for="detail in details" :key="detail.prop">
                    <div class="title">{{ detail.label }}：</div>
                    <div class="value">{{ formatDetail(detail.prop) }}</div>
                </div>
            </div>
        </el-dialog>

        <div class="bottom-pagination">
            <el-pagination
                    layout="sizes,total,prev,pager,next,jumper"
                    :current-page="pageNo"
                    :page-size="pageSize"
                    :total="logTotal"
                    @size-change="changeSize"
                    @current-change="changeCurrent"/>
        </div>
    </div>
</template>

<script>
    import { getLogList, delLog } from '@/api/admin/log'

    export default {
        name: "log-list",

        computed: {
            pageSize: {
                get() {
                    return this.$store.state.app.globalPageSize
                },
                set(v) {
                    this.$store.commit('app/SET_GLOBAL_PAGE_SIZE', v)
                }
            },
            module() {
                return this.$route.meta.code
            }
        },
        data() {
            return {
                logList: [],
                selections: [],
                diskType: '',
                operatorName: '',
                beginDate: '',
                endDate: '',
                pageNo: 1,
                logTotal: 0,
                detailShow: false,
                detailRow: {},
                details: [{
                    label: '系统模块',
                    prop: 'diskType'
                },{
                    label: '模块名称',
                    prop: 'diskName'
                },{
                    label: '操作人员',
                    prop: 'operatorName'
                },{
                    label: '所属部门',
                    prop: 'organName'
                },{
                    label: '操作地址',
                    prop: 'ip'
                },{
                    label: '请求方法',
                    prop: 'method'
                },{
                    label: '操作行为',
                    prop: 'summary'
                },{
                    label: '详细内容',
                    prop: 'detail'
                },{
                    label: '操作状态',
                    prop: 'hasException'
                },{
                    label: '操作时间',
                    prop: 'createTime'
                }],
                searching: false
            }
        },
        methods: {
            getLogList() {
                this.searching = true
                const { pageNo, pageSize, operatorName, module, diskType, beginDate, endDate } = this
                getLogList({ pageNo, pageSize, operatorName, module, diskType, beginDate, endDate }).then(res => {
                    this.logList = res.data.records
                    this.logTotal = res.data.total
                    this.searching = false
                }).catch(e => this.searching = false)
            },
            changeSize(size) {
                this.pageSize = size
                this.getLogList()
            },
            changeCurrent(page) {
                this.pageNo = page
                this.getLogList()
            },
            handleSelectionChange(selection) {
                this.selections = selection
            },
            delLog(id) {
                const loadingOption = { lock: true, text: '正在删除记录，请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .5)' }
                let formData = new FormData()

                if(id) {
                    formData.append('ids', [id])
                }else {
                    const ids = this.selections.map(log => log.id)
                    formData.append('ids', ids)
                }

                delLog(formData).then(res => {
                    this.$message({
                        message: res.message,
                        type: 'success',
                        showClose: true
                    })
                    this.getLogList()
                    loadingOption.close()
                }).catch(e => loadingOption.close())
            },
            viewDetail(row) {
                this.detailShow = true
                this.detailRow = row
            },
            formatDetail(prop) {
                switch (prop) {
                    case 'hasException':
                        return this.detailRow[prop] ? '失败' : '成功'
                    // case 'diskType':
                    //     return DISK_TYPE_LABEL_ENUM[this.detailRow.diskType]
                    default:
                        return this.detailRow[prop]
                }
            }
        },
        mounted() {
            console.log(this.module);
            this.getLogList()
        }
    }
</script>

<style lang="scss" scoped>
    .page {
        width: 100%;
        height: 100%;

        .log-filter-header {
            min-height: 40px;
            display: flex;
            justify-content: flex-start;
            position: relative;
            align-items: flex-end;
            border-bottom: 1px solid #dedede;
            padding: 0 20px 10px;
            box-sizing: content-box;
            flex-wrap: wrap;

            .filter-item {
                min-width: 120px;
                display: flex;
                align-items: center;
                margin-right: 15px;
            }
        }

        .detail-container {
            width: 100%;
            padding: 15px;
            box-sizing: border-box;

            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;

            .detail-item {
                min-width: 50%;
                height: 32px;
                line-height: 32px;
                display: flex;

                .title {
                    font-size: .9rem;
                    font-weight: bolder;
                }
                .value {
                    color: #333;
                    font-size: .8rem;
                }
            }
        }

        .bottom-pagination {
            bottom: 10px;
            position: fixed;
            right: 10px;
        }
    }
</style>
