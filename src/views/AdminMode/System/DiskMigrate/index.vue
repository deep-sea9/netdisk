<template>
	<div class="page">
		<div class="files-operate-header">
			<el-button :loading="starting" style="margin-right: 5px" type="primary" size="small" @click="startMigrate">
				<span>开始迁移</span>
			</el-button>

			<el-button :loading="stopping" style="margin-right: 5px" type="primary" plain size="small" @click="stopMigrate">
				<span>停止迁移</span>
			</el-button>

		</div>
		<div style="padding: 15px;">
			<el-button style="margin-right: 5px" type="text" size="small" @click="refreshList">
				<i class="fa fa-undo" style="margin-right: 5px"></i>
				<span>刷新列表</span>
			</el-button>
			<div v-show="!isDetail">
				<el-table :data="disks" style="width: 100%" ref="table">
					<el-table-column prop="name" label="目标网盘" show-tooltip-when-overflow />
					<el-table-column prop="diskType" label="网盘类型" width="100" >
						<template slot-scope="scope">
							{{ getDiskTypeLabel(scope.row.diskType) }}
						</template>
					</el-table-column>
					<el-table-column prop="status" label="迁移状态" width="100" >
						<template slot-scope="scope">
							{{ getMigrateStatusLabel(scope.row.status) }}
						</template>
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间" />
					<el-table-column prop="updateTime" label="更新时间" />
					<el-table-column label="操作" width="100">
						<template slot-scope="scope">
							<el-button type="text" @click="enterDetail(scope.row)">查看详情</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<div v-show="isDetail">
				<!-- eslint-disable-next-line -->
				<el-button type="text" @click="return2MigrateList"><- 返回迁移列表</el-button>
				<el-table :data="fileList" style="width: 100%" ref="table">
					<el-table-column prop="name" label="文件名" show-tooltip-when-overflow />
					<el-table-column prop="diskType" label="当前网盘" show-tooltip-when-overflow >
						<template>
							{{ currentDisk.name }}
						</template>
					</el-table-column>
<!--					<el-table-column prop="status" label="迁移状态" >-->
<!--						<template slot-scope="scope">-->
<!--							{{ getMigrateStatusLabel(scope.row.status) }}-->
<!--						</template>-->
<!--					</el-table-column>-->
					<el-table-column prop="createTime" label="创建时间" width="180" />
					<el-table-column prop="updateTime" label="更新时间" width="180" />
					<el-table-column prop="remark" label="备注" width="120" show-tooltip-when-overflow />
				</el-table>
			</div>
		</div>
		<div class="bottom-pagination">
			<el-pagination
					layout="total,prev,pager,next,jumper"
					:current-page="isDetail? fileOption.pageNo : pageNo"
					:page-size="isDetail? fileOption.pageSize : pageSize"
					:total="isDetail? fileOption.fileTotal: total"
					@current-change="changeCurrent"/>
		</div>

	</div>
</template>
<script>
import { beginDiskMigrate, stopDiskMigrate, getMigrateList, getFileListOfMigrateRecord } from '@/api/system'

import { PERSON_DISK_ID, PUBLIC_DISK_ID, GROUP_DISK_ID } from '@/utils/constants'

export default {
	name: "disk-migrate",
	data() {
		return {
			disks: [],
			pageNo: 1,
			pageSize: 10,
			total: 0,
			isDetail: false,
			fileList: [],
			fileOption: {
				pageNo: 1,
				pageSize: 10,
				fileTotal: 0,
			},
			currentDisk: {},
			starting: false,
			stopping: false
		};
	},
	computed: {

	},
	methods: {

		getDiskTypeLabel(diskType) {
			switch (diskType) {
				case PERSON_DISK_ID:
					return '个人网盘';
				case PUBLIC_DISK_ID:
					return '公共网盘';
				case GROUP_DISK_ID:
					return '群组网盘'
			}
		},
		getMigrateStatusLabel(status) {
			switch (status) {
				case '0':
					return '未开始';
				case '1':
					return '正在迁移';
				case '2':
					return '迁移完成'
			}
		},
		fetchDisks() {
			getMigrateList(this.pageNo, this.pageSize).then(res => {
				this.disks = res.data && res.data.records
				this.total = res.data && res.data.total
			})
		},
		changeCurrent(current) {
			if(this.isDetail) {
				this.fileOption.pageNo = current
				this.fetchFileList()
				return
			}
			this.pageNo = current
			this.fetchDisks()
		},
		startMigrate() {
			this.starting = true
			beginDiskMigrate().then(() => {
				this.starting = false
				this.$message.success('已开始，如要查看迁移状态请手动刷新...')
			}).catch(_ => this.starting = false)
		},
		stopMigrate() {
			this.stopping = true
			stopDiskMigrate().then(() => {
				this.stopping = false
				this.$message.success('已停止迁移')
			}).catch(_ => this.stopping = false)
		},
		enterDetail(row) {
			this.isDetail = true
			this.currentDisk = row
			this.fetchFileList()
		},
		return2MigrateList() {
			this.isDetail = false
			this.currentDisk = {}
		},
		fetchFileList() {
			getFileListOfMigrateRecord(this.currentDisk.id, this.fileOption.pageNo, this.fileOption.pageSize).then(res => {
				this.fileList = res.data && res.data.records
				this.fileOption.fileTotal = res.data && res.data.total
			})
		},
		refreshList() {
			if(this.isDetail) {
				this.fetchFileList()
				return
			}
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
