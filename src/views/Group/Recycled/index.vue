<template>
	<div class="page">
		<div class="files-operate-header">
			<el-button-group style="float: left" type="primary" v-show="selection.length > 0">
				<el-button type="primary" size="small" plain @click="handleRestore">
					<i class="fa fa-undo" style="margin-right: 5px"></i>
					<span>还原</span>
				</el-button>
				<el-button type="primary" size="small" plain @click="removeFile">
					<i class="fa fa-file-times" style="margin-right: 5px"></i>
					<span>彻底删除</span>
				</el-button>
			</el-button-group>
			<el-button-group style="float: right" type="primary">
				<el-button :disabled="files.length < 1" type="primary" size="small" @click="clearRecycle">
					<i class="fa fa-trash" style="margin-right: 5px"></i>
					<span>清空回收站</span>
				</el-button>
			</el-button-group>
		</div>
		<b-files-node
				type="recycle"
				:files="files"
				:index-list="indexList"
				:selection.sync="selection"
				:file-total="fileTotal"
				:current-page="pageNo"
				:page-size="pageSize"
				@current-change="changeCurrent"
				@size-change="sizeChange"
				@restore="handleRestore"
				@remove="removeFile"/>
	</div>
</template>
<script>
import { getRecycleList, deleteRecycle, restoreFile } from '@/api/personal/recycle'
import fetchFileByWatch from "@/views/Personal/mixins/fetchFileByWatch";

export default {
	name: "fileType",
	mixins: [fetchFileByWatch],
	data() {
		return {
			files: [],
			indexList: [{
				folderName: '回收站',
				id: undefined
			}],
			selection: [],
			pageNo: 1,
			// pageSize: 10,
			fileTotal: 0
		};
	},
	computed: {
		type() {
			return this.$route.meta.type;
		},
		diskId() {
			return this.$route.meta.diskId
		}
	},
	methods: {
		fetchFiles() {
			getRecycleList({pageNo: this.pageNo, pageSize: this.pageSize, diskId: this.diskId}).then(res => {
				this.files = res.data.records
				this.fileTotal = res.data.total
			})
		},
		changeCurrent(current) {
			this.pageNo = current
			this.fetchFiles()
		},
		sizeChange(size) {
			// this.pageSize = size
			this.fetchFiles()
		},
		handleRestore(file) {
			let fileIds
			if(file && this.selection.length<1) {
				fileIds = [file.id]
			}else {
				fileIds = this.selection.map(file => file.id)
			}

			restoreFile({fileIds, diskId: this.diskId}).then(() => {
				this.fetchFiles()
				this.$message.success('还原成功')
			})
		},
		removeFile(file) {
			this.$confirm('此操作将永久删除该文件且不可撤回，是否继续？', '提示', 'warning').then(res => {
				if(res){
					let fileIds
					if(file && this.selection.length<1) {
						fileIds = [file.id]
					}else {
						fileIds = this.selection.map(file => file.id)
					}
					deleteRecycle({fileIds, diskId: this.diskId}).then(() => {
						this.fetchFiles()
						this.$_EB.$emit('update-space')
						this.$message.success('删除成功')
					})
				}
			})
		},
		clearRecycle() {
			this.$confirm('确认清空回收站吗？此操作将删除所有回收站数据且不可撤回，是否继续？', '提示', 'error').then(res => {
				if(res) {
					const loadingInstance = this.$loading({ lock: true, text: '正在清除回收站，请稍后...', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
					deleteRecycle({fileIds: null, diskId: this.diskId}).then(() => {
						loadingInstance.close()
						this.fetchFiles()
						this.$_EB.$emit('update-space')
						this.$message.success('清空回收站成功！')
					}).catch(_ => loadingInstance.close())
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
