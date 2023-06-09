<template>
	<div class="b-table">
		<ul class="b-table-header row-item">
			<li>
				<b-checkbox v-model="allCheck" @change="change" />
			</li>
			<template v-if="selection.length == 0">
				<li>文件名</li>
				<li>大小</li>
				<li>修改日期</li>
			</template>
			<template v-if="selection.length > 0">
				<span>已选中{{ selection.length }}个文件/文件夹</span>
			</template>
		</ul>
		<b-table-item v-for="file in data" :key="file.id" :file="file" ref="tableItem" />
	</div>
</template>
<script>
import { store,mutations } from '../B-Files/store'
export default {
	name: 'b-files-list',
	props: {
		data: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			allCheck: false,
		}
	},
	computed: {
		selection() {
			return store.selection
		},
	},
	components: {
		BTableItem: () => import('./b-table-item.vue'),
	},

	methods: {
		change(check) {
			const arr = check? [...this.data]:[]
			mutations.resetSelection(arr)
		},
	},
}
</script>
<style lang="scss">
.b-table-header {
	position: sticky;
	top: 0px;
	z-index: 2;
}
.row-item {
	background-color: #fff;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	font-size: 13px;
	color: #424e67;
	border-bottom: 1px solid #dedede6b;
	user-select: none;
	&:hover,
	&.checked {
		background: #f4fbff;
		border-color: #cbedff;
	}
	li:nth-child(1) {
		width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		// margin-left: 2px;
	}
	li:nth-child(2) {
		width: 60%;
		display: flex;
		align-items: center;
		padding-left: 10px;
		img{
			width: 22px;
			height: 22px;
			margin-right: 10px;
		}
	}
	li:nth-child(3) {
		width: 15%;
	}
	li:nth-child(4) {
		width: calc(25% - 32px);
	}
}
</style>
