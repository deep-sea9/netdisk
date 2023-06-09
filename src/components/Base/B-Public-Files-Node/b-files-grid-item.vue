<template>
	<ul class="b-file-grid-item"
		:class="{ checked }"
		draggable="true"
		@contextmenu="handleContextMenu"
		@click.stop="handleCheck"
		@mousedown.stop="() => {}"
		@dragstart="fileDragStart"
		@dragenter="decideCanDrop"
		@dragover="fileDragOver"
		@drop="fileDrop">
		<img
			class="file-icon"
			draggable="false"
			@dblclick.stop="handleClick"
			:src="src"/>
		<el-tooltip effect="dark" placement="bottom" :content="getFileName(file)">
			<li class="file-name">{{ getFileName(file) }}</li>
		</el-tooltip>
		<b-icon icon="fa-check-circle" class="file-check" />
		<div v-if="file.collectFlag === '1'" class="star-icon">
			<i style="color: #FDBA3A;position: absolute;left: 4px;bottom: 4px;font-size: .5rem;" class="fa fa-star" />
		</div>
	</ul>
</template>
<script>
/*eslint-disable*/
import fetchFileIcon from "@/utils/fetchFileIcon.js";
import { moveFiles } from "@/api/common.js"
import { getThumnUrlOfImg } from '@/api/file'
import _mixin from "@/components/Base/B-Files-Node/mixin";

export default {
	name: "b-public-files-grid-item",
	mixins: [_mixin],
	props: {
		file: {
			type: Object,
			required: true,
		},
		selection: Array,
		addSelection: Function,
		removeSelection: Function,
		removeAllSelection: Function,
	},
	data() {
		return {
			checked: false,
			fileLimits: [],
            fileLimitsLoading: false,
			contextVisible: false
		};
	},
	methods: {
		fetchFileIcon,
		handleCheck() {
			this.checked = !this.checked;
			if (this.checked) {
				this.addSelection(this.file);
			} else {
				this.removeSelection(this.file);
			}
		},
		handleClick() {
			this.$emit('item-click', this.file)
		},
		setNodeChecked() {
			this.addSelection(this.file);
		},
		setNodeUnchecked() {
			this.removeSelection(this.file);
		},
		fileDragStart(e) {
			console.log(e);
			if(this.selection.length > 1 && this.checked) {
				const img = document.querySelectorAll('#dragImg')[0]
				e.dataTransfer.setDragImage(img, 10, 10)
				e.dataTransfer.setData('application/json', JSON.stringify(this.selection))
				return
			}
			e.dataTransfer.setData('application/json', JSON.stringify(this.file))
		},
		fileDragOver(e) {
			// 只能在此事件里更改dataTransfer.dropEffect
			if(!this.file.fileType) {
				e.preventDefault()
			}else {
				e.dataTransfer.dropEffect = 'move'
			}
		},
		decideCanDrop(e) {
			// document默认阻止了拖动事件，捕获机制导致其他元素也被动不接受拖动事件，所以允许被放置的目标元素要阻止冒泡
			if(!this.file.fileType) {
				e.preventDefault()
			}
		},
		fileDrop(e) {
			if(this.file.fileType) {
				return
			}

			const resource = JSON.parse(e.dataTransfer.getData('application/json'))
			e.dataTransfer.clearData()

			if(resource.some((file) => file.id === this.file.id)) {
				this.$message.warning('无法将包含自身的文件夹拖拽入自身，请取消选择要移入的文件夹后重试...')
				return
			}

			let fileIds

			if(Array.isArray(resource)) {
				fileIds = resource.map(file => file.id)
			}else {
				fileIds = [resource.id]
			}

			console.log(resource, this.file);
			moveFiles({ fileIds, folderId: this.file.id }).then(res => {
				this.$emit('drag-move-success', res)
			})

		},
		handleContextMenu() {
			this.removeAllSelection()
			this.setNodeChecked()
			this.$emit('context-menu', this.file)
		}
	},
	computed: {
		iconType() {
			return (type) => {
				switch (type) {
					case 'open':
						return 'far fa-folder-open'
					case 'download':
						return 'fa fa-arrow-alt-from-top'
					case 'share':
						return 'fa fa-share-alt'
					case 'favorite':
						return 'fa fa-star'
					case 'copy':
						return 'fa fa-copy';
					case 'move':
						return 'fa fa-file-export'
					case 'rename':
						return 'fa fa-eraser';
					case 'delete':
						return 'fa fa-trash'
				}
			}
		},
		src() {
			if(this.file.fileKind === '图片' || this.file.fileKind === '视频') {
				return getThumnUrlOfImg(this.file.id)
			}else {
				return this.fetchFileIcon(this.file.fileType, this.file.fileName || this.file.folderName, this.file.tableKind)
			}

		}
	},
	watch: {
		selection: {
			deep: true,
			immediate: true,
			handler(selection) {
				this.checked = selection.some((cur) => {
					return cur.id === this.file.id;
				});
			},
		},
	},
};
</script>
<style lang="scss" scoped>
.b-file-grid-item {
	width: 100%;
	max-width: 120px;
	height: 127px;
	border: 1px solid transparent;
	border-radius: 5px;

	box-sizing: border-box;
	padding: 4px;
	position: relative;
	cursor: pointer;
	overflow: hidden;

	.star-icon {
		background-color: #FFEA3A;
		border-radius: 50%;
		position: absolute;
		right: -18px;
		top: -18px;
		width: 36px;
		height: 36px;
	}
	&:hover {
		background-color: #f1f5fa;
		.file-check {
			position: absolute;
			top: 5px;
			left: 5px;
			font-size: 19px;
			/*color: #9dddff;*/
			color: var(--hover-color, $hover_color)
		}
	}
	&.checked {
		/*border-color: #90d8ff;*/
		border-color: var(--light-color, $light_color);
		/*background-color: #f1f5fa;*/
		/*background-color: #c3d9ff;*/
		background-color: var(--light-color, $light_color);
		.file-check {
			position: absolute;
			top: 5px;
			left: 5px;
			font-size: 19px;
			/*color: #09aaff;*/
			color: var(--main-color, $main_color);
		}
	}
	.file-icon {
		display: block;
		margin: 9px auto 0;
		width: 60px;
		height: 60px;
		background-repeat: no-repeat;
		overflow: hidden;
		background-size: 60px 60px;
		margin-top: 20px;
		margin-bottom: 10px;
	}
	.file-name {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		text-align: center;
		font-size: 12px;
		color: #666;
	}
	.file-check {
		position: absolute;
		top: 5px;
		left: 5px;
		font-size: 19px;
		color: transparent;
	}
}
</style>
