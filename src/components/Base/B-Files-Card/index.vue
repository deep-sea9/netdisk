<template>
	<ul class="b-file-card" :class="{ checked }" @contextmenu.prevent="onContextmenu" @click="handleCheck">
		<img class="file-icon" @click.stop="() => {}" :src="fetchFileIcon(file.name)" />
		<li class="file-name">{{ file.name }}</li>
		<b-icon icon="fa-check-circle" class="file-check" />
	</ul>
</template>
<script>
import { mutations } from '../B-Files/store'
import fileItemMixins from '@/mixins/fileItem.js'
export default {
	name: 'b-files-card',
	mixins: [fileItemMixins],
	methods: {
		handleCheck() {
			this.checked = !this.checked
			if (this.checked) {
				mutations.addItem(this.file)
			} else {
				mutations.removeItem(this.file)
			}
		},
	},
}
</script>
<style lang="scss" scoped>
.b-file-card {
	width: 100%;
	max-width: 120px;
	height: 127px;
	border: 1px solid transparent;
	border-radius: 5px;

	box-sizing: border-box;
	padding: 4px;
	position: relative;
	cursor: pointer;
	&:hover {
		background-color: #f1f5fa;
		.file-check {
			position: absolute;
			top: 5px;
			left: 5px;
			font-size: 19px;
			color: #9dddff;
		}
	}
	&.checked {
		border-color: #90d8ff;
		background-color: #f1f5fa;
		.file-check {
			position: absolute;
			top: 5px;
			left: 5px;
			font-size: 19px;
			color: #09aaff;
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
