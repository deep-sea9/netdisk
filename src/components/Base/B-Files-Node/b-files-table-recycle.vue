<template>
	<div class="out-container" ref="out-container" style="user-select: none;height: 100%">
		<el-table :data="data" style="width: 100%"
			height="100%"
			@selection-change="handleSelectionChange"
			@row-contextmenu="rightClick"
			@row-dblclick="handleRowClick"
			@sort-change="handleSortChange"
			ref="table">
			<el-table-column type="selection" width="55" align="center" />
			<el-table-column prop="fileName" label="文件名" width="300" show-overflow-tooltip>
				<div class="table-column" slot-scope="scope" v-contextmenu:contextmenu>
					<img class="file-icon"
						@click.stop="() => {}"
						:src="getPreviewSrc(scope.row)"/>
					<span>{{ getFileName(scope.row) }}</span>
				</div>
			</el-table-column>
			<el-table-column prop="deleteTime" label="删除时间" width="300" />
			<el-table-column prop="fileSize" label="大小" width="100">
				<div slot-scope="scope">
					<span>{{ fileSize(scope.row.fileSize) }}</span>
				</div>
			</el-table-column>
			<el-table-column prop="resetTime" label="还原剩余时间">
				<span v-if="isPublic" slot-scope="scope">
					{{ recycleDay === -1? '永久': restDay(scope.row.deleteTime) + '天'}}
				</span>
				<span v-else>永久</span>
			</el-table-column>
		</el-table>
		<v-contextmenu ref="contextmenu" v-loading="fileLimitsLoading">
			<v-contextmenu-item
				v-for="item in fileLimits"
				:key="item.code"
				@click.native="$emit('contextmenu', menuTarget, item)"
			>
				<i :class="iconType(item.code)" style="width: 13px;"></i>
				<span>{{ item.name }}</span>
			</v-contextmenu-item>
		</v-contextmenu>
	</div>
</template>
<script>
/*eslint-disable*/
import fetchFileIcon from "@/utils/fetchFileIcon.js";
import { getThumnUrlOfImg } from "@/api/file";
import { RIGHT_CONTEXT_RECYCLE } from "@/utils/constants.js";
import _mixin from './mixin'

export default {
	name: "b-files-table",
	mixins:  [_mixin],
	props: {
		data: Array,
		selection: Array,
		resetSelection: Function,
	},
	data() {
		return {
			menuTarget: null,
			fileLimits: [],
			fileLimitsLoading: false,
		};
	},
	methods: {
		fetchFileIcon,
		getPreviewSrc(row) {
			if(row.fileKind === '图片' || row.fileKind === '视频') {
				return getThumnUrlOfImg(row.fileId || row.id)
			}else {
				return this.fetchFileIcon(row.fileType, row.fileName || row.folderName, row.tableKind)
			}
		},
		handleSelectionChange(selection) {
			this.resetSelection(selection);
		},
		rightClick(row, column, event) {
			this.menuTarget = row;
			event.preventDefault();
			// this.$refs.contextmenu.hide();
			this.fileLimitsLoading = true;
			this.$refs['table'].clearSelection()
			this.$refs['table'].toggleRowSelection(row)
			this.fileLimits = RIGHT_CONTEXT_RECYCLE;
			this.fileLimitsLoading = false;
			// fileListLimit().then((res) => {});
		},
		handleRowClick(row, column, event) {
			if(!row.fileType) {
				this.$emit('to-next-fold', row, column, event)
			}else {
				this.$emit('click-file', row, column, event)
			}
		},
		fileSize(fileSize) {
			let size = fileSize? (fileSize / 1024).toFixed(2) : '-'
			if(size === '-') {
				return size
			}
			if(size > 1024) {
				size = (size/1024).toFixed(2)
			}else {
				if(fileSize != 0 && size < 0.01) {
					return '0.01KB'
				}
				return size + 'KB'
			}
			if(size > 1024) {
				size = (size/1024).toFixed(2)
			}else {
				return size + 'MB'
			}
			return size + 'GB'
		},
		createSelectArea(e) {
			this.x = e.pageX - 210
			this.y = e.pageY - 150
			const div = document.createElement('div')
			div.id = 'select-box'
			this.$refs['out-container'].appendChild(div)
			this.nodePanel.addEventListener('mousemove', this.drawSelectArea)
		},
		drawSelectArea(e) {
			const selectBox = document.getElementById('select-box')

			if (selectBox) {
				selectBox.style.left = `${e.pageX - 210 > this.x ? this.x : e.pageX - 210}px`;
				selectBox.style.top = `${e.pageY - 150 > this.y ? this.y : e.pageY - 150}px`;
				selectBox.style.width = `${Math.abs(e.pageX - 210 - this.x)}px`;
				selectBox.style.height = `${Math.abs(e.pageY - 150 - this.y)}px`;

				const fileRow = document.getElementsByClassName('el-table__row')
				fileRow.forEach((row, index) => {
					if (this.isCollision(selectBox, row)) {
						// 记录是否已经碰撞过：减少选中/移除操作
						this.hasCollided = true

						this.$refs['table'].toggleRowSelection(this.data[index], true)
					} else {
						if (this.hasCollided) {
							this.$refs['table'].toggleRowSelection(this.data[index], false)
						}
					}

				})
			}
		},
		removeSelectArea() {
			this.nodePanel.removeEventListener('mousemove', this.drawSelectArea)
			const selectBox = document.getElementById('select-box')
			if (selectBox) {
				this.$refs['out-container'].removeChild(selectBox)
			}
		},
		isCollision(ele1, ele2) {
			const xLeft = ele2.offsetLeft - ele1.offsetWidth
			const xRight = ele2.offsetLeft + ele2.offsetWidth

			// 减48 是因为el-table-row外层父元素div具有position: relative属性，导致offsetTop有偏差
			const yTop = ele2.offsetTop + 48 - ele1.offsetHeight
			const yBottom = ele2.offsetTop + 48 + ele2.offsetHeight

			return ele1.offsetLeft >= xLeft && ele1.offsetLeft <= xRight && ele1.offsetTop >= yTop && ele1.offsetTop <= yBottom
		},
		handleSortChange({ column, prop, order }) {
			this.$store.commit('app/SET_FILE_DEFAULT_SORT', { prop, order })
		},
		restDay(delTime) {
			const targetTime = new Date(delTime).getTime() + this.recycleDay * 24 * 60 * 60 * 1000
			const restTime = targetTime - new Date().getTime()
			return Math.ceil(restTime / 1000 / 60 / 60 / 24)
		}
	},
	computed: {
		iconType() {
			return (type) => {
				switch (type) {
					case 'restore':
						return 'far fa-folder-open'
					case 'remove':
						return 'fa fa-trash'
				}
			}
		},
		isPublic() {
			return this.$route.path.indexOf('/public') > -1
		},
		recycleDay() {
			return this.$store.state.system.recycleDay
		}
	},
	watch: {
		selection: {
			deep: true,
			immediate: true,
			handler(selection) {
				this.$nextTick(() => {
					selection.forEach((cur) => {
						this.$refs.table.toggleRowSelection(cur, true);
					});
				});
			},
		},
	},
	mounted() {
		this.nodePanel = document.getElementsByClassName('b-files-node__panel scrollbar')[0]
		this.nodePanel.addEventListener('mousedown', this.createSelectArea)
		this.nodePanel.addEventListener('mouseup', this.removeSelectArea)
		document.addEventListener('mouseleave', this.removeSelectArea)
	},
	beforeDestroy() {
		this.nodePanel.removeEventListener('mousedown', this.createSelectArea)
		this.nodePanel.removeEventListener('mouseup', this.removeSelectArea)
		document.removeEventListener('mouseleave', this.removeSelectArea)
	}
};
</script>
<style lang="scss" scoped>
.table-column {
	display: flex;
	align-items: center;
	user-select: none;
	.file-icon {
		width: 20px;
		height: 20px;
		margin-right: 6px;
	}
}

</style>
