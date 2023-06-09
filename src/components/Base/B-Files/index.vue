<template>
	<div class="page">
		<!-- <b-files-operate :selection="selection" /> -->
		<div class="c-files">
			<div class="c-files-main">
				<b-files-header :isGrid.sync="isGrid" :isExpand.sync="isExpand" />
				<div class="c-files-panel scrollbar">
					<b-files-grid v-if="isGrid" :data="files" />
					<b-files-list v-if="!isGrid" :data="files" />
				</div>
			</div>
			<div class="c-files-detail" v-show="isExpand">
				<h1 class="title">文件详情</h1>
				<img src="@/assets/images/filetype_icon/ai.png">
				<div class="name">电子因子系统.png</div>
				<div class="createTime">创建时间: 2000-02-02 02:00:00</div>
				<div class="modifyTime">最后修改时间: 2000-02-02 02:00:00</div>
				<div class="modifyTimes">修改次数: 3次</div>
			</div>
		</div>
	</div>
</template>
<script>
import BFilesHeader from './b-files-header.vue'
// import BFilesOperate from './b-files-operate.vue'
import { store } from './store'

// const files = new Array(10).fill(0).map((cur, index) => {
// 	const ext = ['pdf', 'mp4', 'mp3', 'txt', 'psd', 'png', 'fig']
// 	if (index === 1) {
// 		return {
// 			id: Math.random() * 10000,
// 			name: `新建文件夹`,
// 			modifyTime: '2021-11-04 19:09:21',
// 			size: '32.06M',
// 		}
// 	} else {
// 		return {
// 			id: Math.random() * 10000,
// 			name: `新建文件夹.${ext[parseInt(Math.random() * 7)]}`,
// 			modifyTime: '2021-11-04 19:09:21',
// 			size: '32.06M',
// 		}
// 	}
// })

export default {
	name: 'b-files',
	props: {
		files: Array
	},
	data() {
		return {
			isGrid: false,
			isExpand: false,
		
		}
	},
	computed: {
		selection() {
			return store.selection
		},
	},
	components: {
		BFilesHeader,
		// BFilesOperate,
	},
}
</script>
<style lang="scss" scoped>
.c-files {
	height: 100%;
	display: flex;
}
.c-files-main {
	flex: 1;
	height: 100%;
	padding: 10px 20px;
	.c-files-panel {
		height: calc(100% - 120px);
	}
}
.c-files-detail {
	width: 300px;
	flex-shrink: 0;
	padding: 20px;
	.title{
		font-size: 16px;
		
	}
	border-left: 1px solid #dedede;
	display: flex;
	flex-direction: column;
	font-size: 14px;
	img{
		height: 80px;
		object-fit: contain;
		margin: 40px auto;
	}
	.name{
		font-size: 16px;
		font-weight: bold;
	}
	.createTime,.modifyTime,.modifyTimes{
		margin-top: 10px;
		color:#555;
	}
}
</style>
