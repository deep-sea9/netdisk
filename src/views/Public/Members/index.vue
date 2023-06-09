<template>
	<div class="page">
		<div class="member-header">
			<el-input size="small" style="width: 400px;" suffix-icon="el-icon-search" clearable placeholder="请输入用户名查找" v-model="keyword" @keydown.native.enter="fetchFiles" />
		</div>

		<div class="members-container">
			<el-table
					:data="members"
					style="width: 100%;"
					ref="table"
			>

				<el-table-column prop="userName" label="成员姓名" />

				<el-table-column
						prop="organName"
						label="所属部门"
				>
					<template slot-scope="scope">
						<el-tooltip :content="scope.row.organPath" placement="top">
							<span>{{ scope.row.organName }}</span>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column prop="tel" label="联系电话" />
				<el-table-column
						prop="uploadNum"
						label="上传文件数"
				>
					<div slot-scope="scope">
						<el-button type="text" @click="jumpToAll(scope.row)">{{ scope.row.uploadNum }}</el-button>
					</div>
				</el-table-column>
			</el-table>
			<div class="bottom-pagination">
				<el-pagination
						layout="sizes,total,prev,pager,next,jumper"
						:current-page="currentPage"
						:page-size="pageSize"
						:total="memberTotal"
						@size-change="changeSize"
						@current-change="changeCurrent"/>
			</div>
		</div>
	</div>
</template>
<script>
import { getDiskMembers } from '@/api/public/members'

export default {
	name: "members",
	data() {
		return {
			members: [],
			currentPage: 1,
			// pageSize: 10,
			memberTotal: 0,
			keyword: ''
		};
	},
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
	methods: {
		fetchFiles() {
			getDiskMembers({diskId: this.diskId, pageNo: this.currentPage, pageSize: this.pageSize, userName: this.keyword}).then(res => {
				this.members = res.data.records
				this.memberTotal = res.data.total
				this.currentPage = res.data.current
			})
		},
		changeCurrent(current) {
			this.currentPage = current
			this.fetchFiles()
		},
		changeSize(size) {
			this.pageSize = size
			this.fetchFiles()
		},
		manageMembers() {},
		jumpToAll(row) {
			this.$router.push({
				name: `${this.diskId}-all`,
				params: {
					userId: row.userId
				}
			})
		}
	},
	mounted() {
		this.fetchFiles()
	}
};
</script>
<style lang="scss" scoped>
.page {
	width: 100%;
	height: 100%;

	.member-header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 50px;
		border-bottom: 1px solid #dedede;
		padding: 0 20px;
	}

	.members-container {
		padding: 10px 20px;
		box-sizing: border-box;
		overflow: auto;
		height: calc(100% - 100px);

		.bottom-pagination {
			bottom: 10px;
			position: fixed;
			right: 10px;
		}
	}
}
</style>
