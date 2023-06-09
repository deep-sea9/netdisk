<template>
	<div class="page">
		<div class="files-operate-header">
			<el-button v-show="selection.length > 0" style="margin-right: 5px" type="primary" size="small" plain :disabled="canModify" @click="handleModifySelected">
				<i class="fa fa-undo" style="margin-right: 5px"></i>
				<span>修改最大空间</span>
			</el-button>

			<el-input
					style="float: right;width: 400px;"
					size="small"
					:maxlength="10"
					placeholder="搜索全部成员"
					clearable
					@keydown.native.enter="handleSearch"
					v-model="keyword" >
				<el-button slot="append" icon="el-icon-search" @click="handleSearch" />
			</el-input>
		</div>
		<el-table
				:data="disks"
				height="calc(100% - 100px)"
				@selection-change="handleSelectionChange"
				style="width: 100%;"
				ref="table"
		>
			<el-table-column type="selection" width="55" align="center" />
			<el-table-column prop="userName" label="用户姓名" />
			<el-table-column prop="organName" label="所属部门" />
			<el-table-column prop="allocateSpace" label="最大空间" >
				<template slot-scope="scope">
					{{ b2G(scope.row.allocateSpace) }} G
				</template>
			</el-table-column>
			<el-table-column prop="usedSpace" label="已用空间" >
				<template slot-scope="scope">
					{{ b2G(scope.row.usedSpace) }} G
				</template>
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="text" @click="handleModify(scope.row)">修改最大空间</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="bottom-pagination">
			<el-pagination
					layout="sizes,total,prev,pager,next,jumper"
					:current-page="pageNo"
					:page-size="pageSize"
					:total="fileTotal"
					@size-change="changeSize"
					@current-change="changeCurrent"/>
		</div>

		<el-dialog title="修改最大空间" :visible.sync="modifyShow" width="40%">
			<div class="dialog-form">
				<el-row v-show="single">
					<el-col :span="8">
						<div style="height: 32px;line-height: 32px;margin: 10px;">
							用户姓名：{{ currentUser.userName }}
						</div>
					</el-col>
					<el-col :span="16">
						<div style="height: 32px;line-height: 32px;;margin: 10px;overflow: hidden">
							所属部门：{{ currentUser.organName }}
						</div>
					</el-col>
				</el-row>

				<div class="max-size">
					<span style="width: 80px;">最大空间：</span>
					<el-input v-model.trim="maxSize" @input="limitInput" style="width: 200px;" size="medium">
						<template slot="append">G</template>
					</el-input>
				</div>
			</div>
			<div slot="footer">
				<el-button size="medium" @click="() => { this.modifyShow = false;this.single = false }">取消</el-button>
				<el-button :loading="confirming" size="medium" type="primary" @click="confirmModify">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { getPersonalDiskList, modifyDiskSize } from '@/api/admin/personal'
import { b2G } from '@/utils/index.js'

export default {
	name: "size-config",
	data() {
		return {
			disks: [],
			selection: [],
			pageNo: 1,
			// pageSize: 10,
			fileTotal: 0,
			keyword: '',
			modifyShow: false,
			single: false,
			currentUser: {},
			maxSize: 10,
			confirming: false
		};
	},
	computed: {
		type() {
			return this.$route.meta.type;
		},
		canModify() {
			const firstAllocateSpace = this.selection.length > 0 && this.selection[0].allocateSpace
			return this.selection.findIndex(user => user.allocateSpace !== firstAllocateSpace) > -1
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
	components: {
		// BFilesOperate,
	},
	methods: {
		limitInput(v) {
			this.maxSize = ('' + v).replace(/[^\d^\.]+/g, '') // 过滤非数字、小数点
					.replace(/^0+(\d)/, '$1') // 第一位0开头，后面为数字，过滤掉0
					.replace(/^\./, '0.') // 第一位输入小数点，则第一位补0
					.match(/^\d*(\.?\d{0,2})/g)[0] || ''
		},
		handleSelectionChange(selections) {
			this.selection = selections
		},
		handleModify(row) {
			this.modifyShow = true
			this.single = true
			this.currentUser = row
			this.maxSize = b2G(row.allocateSpace).toFixed(2)
			console.log(row);
		},
		fetchDisks() {
			getPersonalDiskList({pageNo: this.pageNo, pageSize: this.pageSize, userName: this.keyword}).then(res => {
				this.disks = res.data.records
				this.fileTotal = res.data.total
			})
		},
		changeCurrent(current) {
			this.pageNo = current
			this.fetchDisks()
		},
		changeSize(size) {
			this.pageSize = size
			this.fetchDisks()
		},
		handleModifySelected() {
			this.modifyShow = true
		},
		b2G(b) {
			return b2G(b).toFixed(2)
		},
		confirmModify() {
            if(this.maxSize > 10000) {
                this.$message.error('因空间限制，请输入不大于10000的数字')
                return
            }
			this.confirming = true
			let diskIds
			if(this.single) {
				diskIds = [this.currentUser.id]
			}else {
				diskIds = this.selection.map(disk => disk.id)
			}
			const formData = new FormData()
			formData.append('diskIds', diskIds)
			formData.append('space', this.maxSize * 1024 * 1024 * 1024)
			modifyDiskSize(formData).then(res => {
				this.$message.success(res.message || '修改成功')
				this.fetchDisks()
				this.confirming = false
			}).catch(e => this.confirming = false)
			this.modifyShow = false
		},
		handleSearch() {
			this.fetchDisks()
		}
	},
	mounted() {
		this.fetchDisks()
	}
};
</script>
<style lang="scss" scoped>
.page {
	width: 100%;
	height: 100%;


	.bottom-pagination {
		bottom: 10px;
		position: fixed;
		right: 10px;
	}

	.dialog-form {
		height: 180px;
		padding: 20px;

		.max-size {
			display: flex;
			justify-content: flex-start;
			flex-wrap: nowrap;
			align-items: center;
			width: 100%;
			margin: 10px;
		}
	}
}
.files-operate-header {
	height: 40px;
	/*display: flex;*/
	/*justify-content: space-between;*/
	position: relative;
	align-items: flex-end;
	border-bottom: 1px solid #dedede;
	padding: 10px 20px 0px;
	box-sizing: content-box;
}
</style>
