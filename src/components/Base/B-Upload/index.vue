<template>
	<el-dialog title="上传文件" :visible.sync="visible" width="40%" destroy-on-close>
		<div class="b-move-body">
			<el-upload ref="upload" class="upload-container" drag action="#" multiple :auto-upload="false" name="files" :http-request="handleUpload">
				<i class="el-icon-upload"></i>
				<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
			</el-upload>
		</div>
		<span slot="footer">
			<el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
			<el-button size="small" @click="visible = false">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
	import { uploadFiles } from '@/api/common.js'
	// import { PERSON_DISK_ID } from '@/utils/constants.js'
export default {
	name: 'b-upload',
	props: {
		foldId: { type: String, default: '' },
		diskId: { type: String },
		diskType: { type: String, default: '1' } // 1: 个人；2：公共；4：群组
	},
	data() {
		return {

		}
	},

	methods: {
		handleNodeClick(data) {
			console.log(data)
		},
		handleConfirm() {
			this.$refs['upload'].submit()
		},
		handleUpload(params) {
			console.log(params);
			const formData = new FormData()
			formData.append('mFiles', params.file)
			if(this.diskId) {
				formData.append('diskId', this.diskId)
			}
			if(this.foldId) {
				formData.append('folderIds', [this.foldId])
			}
			formData.append('diskType', this.diskType)
			uploadFiles(formData).then(res => {
				this.$message.success(res.message)
				this.$emit('upload-success')
			})
		}
	},
	computed: {
		visible: {
			get() {
				return this.$attrs.visible
			},
			set(value) {
				this.$emit('update:visible', value)
			},
		},
	},
}
</script>
<style lang="scss">
.b-move-body{
    padding: 20px;

	.upload-container {
		margin: 0 auto;
		width: 360px;
	}
}
</style>
