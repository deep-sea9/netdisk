<template>
	<div class="page">
		<b-files-operate
				ref="operate"
				:disk-id="diskId"
				:disk-type="diskType"
				:selection="selection"
				:layout="layoutOfNoCreateOperation"
				@upload-success="handleUploadSuccess"
				@download="handleDownload"
				@favorite="handleFav"
				@search="handleSearch"
				@move="handleMove"
				@copy="handleCopy"
				@delete="handleDelete"
				@sync-file="handleSyncFile"
				@rename="handleRename"/>
		<b-public-files-node
				:files="files"
				:index-list="indexList"
				:selection.sync="selection"
				:file-total="fileTotal"
				:current-page="currentPage"
				:page-size="pageSize"
				@current-change="changeCurrent"
				@size-change="sizeChange"
				@update-data="fetchFiles"
				@click-file="handleOpen"
				@open="handleOpen"
				@open-in="handleOpenIn"
				@favorite="handleFav"
				@download="handleRightClickDown"
				@move="openMove"
				@copy="openCopy"
				@rename="handleRename"
				@delete="handleDelete"/>
		<b-image-preview :visible.sync="imagePreview" :slides="imgList" :initial-slide="defaultImgIndex" />

	</div>
</template>
<script>
	import BFilesOperate from "@/components/Base/B-Files-Operate";
	import {typeFileList} from "@/api/group/index.js";
	import {favFile} from "@/api/personal/fav.js"
	import {renameFileName} from "@/api/file/"
	import { deleteFiles, downloadFiles, moveFiles, copyFiles, previewImg, getFilesByKeyword } from "@/api/common.js"
	import { GROUP_DISK_ID } from '@/utils/constants.js'

	import operation from "../mixins/operation";
	import commonFileOperation from '../mixins/common-file-operation'
	import downloadTask from '../mixins/download-task'
	import fetchFileByWatch from "@/views/Personal/mixins/fetchFileByWatch";

	// const baseURL = process.env.VUE_APP_BASE_URL

	export default {
		name: "fileType",
		mixins: [operation, commonFileOperation, downloadTask, fetchFileByWatch],
		data() {
			return {
				diskType: GROUP_DISK_ID,
				files: [],
				indexList: [{
					folderName: '图片',
					id: undefined
				}],
				selection: [],
				fileTotal: 0,
				cachePageNo: 1,
				currentPage: 1,
				// pageSize: 10,
				imagePreview: false,
				imgList: [],
				defaultImgIndex: 0,
			};
		},
		computed: {
			code() {
				return this.$route.meta.type
			},
			diskId() {
				return this.$route.meta.diskId
			},
			downloadingList() {
				return this.$store.state.translate.downloadingList
			},
		},
		components: {
			BFilesOperate,
		},
		methods: {
			fetchFiles() {
				const {code} = this;
				typeFileList(code, this.currentPage, this.pageSize, this.diskId, this.sortName, this.isAsc).then(res => {
					this.files = res.data.records
					this.fileTotal = res.data.total
				})
			},
			changeCurrent(current) {
				this.currentPage = current
				this.fetchFiles()
			},
			sizeChange(size) {
				// this.pageSize = size
				this.fetchFiles()
			},
			handleFav(file) {
				const fileId = (this.selection.length< 1 && file) ? file.id : this.selection.map(file => file.id).join()
				favFile({ fileIds: fileId, formType: GROUP_DISK_ID }).then(res => {
					this.$message.success(res.message)
					this.fetchFiles()
				})
			},
			handleUploadSuccess() {
				this.fetchFiles()
			},
			handleOpen(file) {
				if(this.imgList.length > 0 && this.cachePageNo === this.currentPage) {
					this.imagePreview = true
					this.defaultImgIndex = this.imgList.findIndex(imgInfo => imgInfo.id === file.id)
				}else {
					const loadingInstance = this.$loading({ lock: true, text: '正在加载图片请稍后', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, .7)' })
					this.cachePageNo = this.currentPage
					getFilesByKeyword({ diskId: this.diskId, pageNo: this.currentPage, pageSize: 100, code: 1, sortName: this.sortName, isAsc: this.isAsc }).then(res => {
						const imgInfoList = res.data.records

						this.defaultImgIndex = imgInfoList.findIndex(imgInfo => imgInfo.id === file.id)

						Promise.allSettled(imgInfoList.map(imgInfo => previewImg(imgInfo.id))).then(res => {

							this.imgList = res.map((p, index) => {
								if(p.status === 'fulfilled') {
									let blob = new Blob([p.value], {
										type: "image/PNG",
									});
									return { objUrl: URL.createObjectURL(blob), ...imgInfoList[index] };
								}else {
									return { objUrl: undefined, ...imgInfoList[index] }
								}

							})
							loadingInstance.close()
							this.imagePreview = true
						})
					})
				}
			},
			handleSearch(keyword) {
				getFilesByKeyword({keyword, pageNo: 1, pageSize: this.pageSize, diskId: this.diskId, code: this.code, sortName: this.sortName, isAsc: this.isAsc}).then(res => {
					this.currentPage = 1;
					this.searchKeyword = keyword
					this.files = res.data.records
					this.fileTotal = res.data.total
				})
			},
			handleRename(value, file) {
				const current = file || this.selection[0]
				let { id } = current
				const formData = new FormData()
				formData.append('fileName', value)
				formData.append('id', id)
				renameFileName(formData).then(() => {
					this.fetchFiles()
				})
			},
			handleDelete(file) {
				const fileIds = this.selection.length<1 ? [file.id] : this.selection.map(file => file.id)
				deleteFiles({fileIds, diskId: this.diskId}).then(res => {
					this.$message.success(res.message)
					this.fetchFiles()
				})
			},
			handleMove(folds, rightClickFile, closeDialog) {
				const fileIds = (this.selection.length<1 && rightClickFile != null)? [rightClickFile.id] : this.selection.map(file => file.id)
				moveFiles({ fileIds, folderId: folds[0].id, diskId: this.diskId }).then(res => {
					this.$message.success(res.message)
					closeDialog()
					this.fetchFiles()
				})

			},
			handleCopy(folds, rightClickFile, closeDialog) {
				const fileIds =  (this.selection.length<1 && rightClickFile != null)? [rightClickFile.id] : this.selection.map(file => file.id)
				copyFiles({ fileIds, folderId: folds[0].id, diskId: this.diskId }).then(res => {
					this.$message.success(res.message)
					closeDialog()
					this.fetchFiles()
				})
			},
			handleRightClickDown(file) {
				if(this.selection.length>0) {
					this.handleDownload()
				}else {
					downloadFiles({
						// resouseId: file.resourceId,
						fileId: file.id,
						realFileName: file.fileName + '.' + file.fileType
					}, this.handleDownloadProgress).then(res => {
						let blob = new Blob([res], {
							type: 'charset=utf-8'
						});
						let objectUrl = URL.createObjectURL(blob);
						let a = document.createElement("a");
						a.href = objectUrl;
						a.download = file.fileName + '.' + file.fileType;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					})
				}
			},
			openMove(file) {
				this.$refs['operate'].handleMove(file)
			},
			openCopy(file) {
				this.$refs['operate'].handleCopy(file)
			},
		},
		mounted() {
			this.fetchFiles();
		},
	};
</script>
<style lang="scss" scoped>
	.page {
		width: 100%;
		height: 100%;
	}
</style>
