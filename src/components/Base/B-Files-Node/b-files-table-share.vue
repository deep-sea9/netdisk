<template>
	<div class="out-container" ref="out-container" style="user-select: none;">
		<el-table :data="data" style="width: 100%"
			@selection-change="handleSelectionChange"
			@row-contextmenu="rightClick"
			@row-dblclick="handleRowClick"
			row-class-name="target-row"
			ref="table">
			<el-table-column fixed type="selection" width="55" align="center" />
			<el-table-column prop="fileName" label="文件名" width="300" show-overflow-tooltip fixed>
				<div class="table-column" slot-scope="scope" v-contextmenu:contextmenu>
					<img class="file-icon" @click.stop="() => {}"
						:src="getPreviewSrc(scope.row)"/>
					<span>{{ getFileName(scope.row) }}</span>
				</div>
			</el-table-column>
			<el-table-column prop="fileSize" label="大小" width="100">
				<template slot-scope="scope">
					<span>{{ fileSize(scope.row.fileSize) }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="shareTime" label="共享时间" width="160" />
<!--			<el-table-column v-if="isOther" prop="visitTime" label="提取时间" width="200" sortable />-->
			<el-table-column v-if="isOther" prop="shareUserName" label="共享人员" width="100" />
			<el-table-column prop="status" label="当前状态" />
			<el-table-column width="90" prop="expire" label="有效期剩余">
				<template slot-scope="scope">
					{{ computedExpire(scope.row) }}
				</template>
			</el-table-column>
			<el-table-column prop="expire" label="有效期" >
				<template slot-scope="scope">
					{{ scope.row.expire < 0 ? '无限期': scope.row.expire + ' 天' }}
				</template>
			</el-table-column>
			<el-table-column prop="allowDown" label="允许下载">
				<template slot-scope="scope">
					{{ scope.row.allowDown ? '是': '否' }}
				</template>
			</el-table-column>
			<el-table-column prop="allowStore" label="允许转存">
				<template slot-scope="scope">
					{{ scope.row.allowStore ? '是': '否' }}
				</template>
			</el-table-column>
<!--			<el-table-column prop="allowPrint" label="允许打印">-->
<!--				<template slot-scope="scope">-->
<!--					{{ scope.row.allowPrint ? '是': '否' }}-->
<!--				</template>-->
<!--			</el-table-column>-->
<!--			<el-table-column prop="addMark" label="允许水印">-->
<!--				<template slot-scope="scope">-->
<!--					{{ scope.row.addMark ? '是': '否' }}-->
<!--				</template>-->
<!--			</el-table-column>-->
			<el-table-column prop="expireDel" label="失效后删除" width="90">
				<template slot-scope="scope">
					{{ scope.row.expireDel ? '是': '否' }}
				</template>
			</el-table-column>
			<el-table-column v-if="!isOther" width="200" fixed="right" label="操作">
				<template slot-scope="scope">
					<el-button v-if="scope.row.shareWay === '2'" round plain size="mini" type="warning" @click.stop="handleCopyLink(scope.row)">复制链接</el-button>
					<el-button v-if="!scope.row.folderName" round plain size="mini" type="primary" @click.stop="handleShare(scope.$index, scope.row)">共享详情</el-button>
				</template>
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
import { RIGHT_CONTEXT_MY_SHARE, RIGHT_CONTEXT_MY_SHARE_EXPIRE, RIGHT_CONTEXT_OTHER_SHARE } from "@/utils/constants.js";

import copy from 'copy-to-clipboard'
import _mixin from "./mixin";

export default {
	name: "b-files-table",
	mixins:  [_mixin],
	props: {
		data: Array,
		selection: Array,
		resetSelection: Function,
		isOther: { type: Boolean, default: false }
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

			if(this.isOther) {
				this.fileLimits = RIGHT_CONTEXT_OTHER_SHARE;
			}else {
				const hasExpire = this.selection.findIndex(link => {
					if(link.expire === -1) {
						return false
					}
					const deltaTime = new Date(link.expireTime).getTime() - new Date().getTime()
					return deltaTime < 0
				})

				if(hasExpire > -1 || row.status === '已取消') {
					this.fileLimits = RIGHT_CONTEXT_MY_SHARE_EXPIRE;
				}else {
					this.fileLimits = RIGHT_CONTEXT_MY_SHARE
				}

				if(row.shareWay === '2') {
					this.fileLimits = [...this.fileLimits, {
						name: "复制链接",
						code: "copy-link"
					}]
				}
			}

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
		handleCopyLink(row) {
			if(row.linkAddress) {
				if(copy(`${window.location.origin}${window.location.pathname}#/other-link-share/${row.linkAddress}`, { format: 'text/plain' })) {
					this.$message.success('复制成功!')
				}else {
					this.$message.warning('访问剪切板失败，请重试或尝试使用其它浏览器重试')
				}
			}else {
				this.$message.warning('未找到分享链接，请重新创建分享链接')
			}

		},
		handleShare(index, row) {
			this.$emit('share-detail', row, index)
		},
		computedExpire(row) {
			if(!row.expireTime) {
				return '无限期'
			}
			const now = new Date().getTime()
			const expireTime = new Date(row.expireTime).getTime()
			const oneDayTime = 1000 * 60 * 60 *24
			const deltaTime = expireTime - now
			if(deltaTime > 0) {
				return Math.ceil((expireTime - now) / oneDayTime) + '天'
			}else {
				return 0 + '天'
			}


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
			console.log('start move', e);
			const selectBox = document.getElementById('select-box')

			if (selectBox) {
				selectBox.style.left = `${e.pageX - 210 > this.x ? this.x : e.pageX - 210}px`;
				selectBox.style.top = `${e.pageY - 150 > this.y ? this.y : e.pageY - 150}px`;
				selectBox.style.width = `${Math.abs(e.pageX - 210 - this.x)}px`;
				selectBox.style.height = `${Math.abs(e.pageY - 150 - this.y)}px`;

				const fileRow = Array.from(document.getElementsByClassName('target-row'))
				// el-table只要给el-column添加fix固定属性，该列就会生成一个新表格，导致dom元素获取多余

				if(this.isOther) {
					fileRow.length = fileRow.length / 2
				}else {
					fileRow.length = fileRow.length / 3
				}

				fileRow.forEach((row, index) => {

					if (this.isCollision(selectBox, row)) {
						// 记录是否已经碰撞过：减少选中/移除操作
						this.data[index].hasCollided = true

						this.$refs['table'].toggleRowSelection(this.data[index], true)
					} else {
						// if (this.data[index].hasCollided) {
						//
						// }
						this.$refs['table'].toggleRowSelection(this.data[index], false)
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
			const yTop = ele2.offsetTop + 60 - ele1.offsetHeight
			const yBottom = ele2.offsetTop + 60 + ele2.offsetHeight

			return ele1.offsetLeft >= xLeft && ele1.offsetLeft <= xRight && ele1.offsetTop >= yTop && ele1.offsetTop <= yBottom
		},
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
					case 'modify':
						return 'fa fa-eraser';
					case 'cancel':
						return 'fa fa-reply';
					case 'recall':
						return 'fa fa-retweet';
					case 'restore':
						return 'fa fa-window-restore';
					case 'copy-link':
						return 'fa fa-link'
				}
			}
		},
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
