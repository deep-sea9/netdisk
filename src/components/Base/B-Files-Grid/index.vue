<template>
	<div class="b-files-grid">
		<b-files-card
			v-for="file in data"
			:key="file.id"
			:file="file"
		/>
	</div>
</template>
<script>
import { store } from '../B-Files/store'
export default {
	name: 'b-files-grid2',
	props: {
		data: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			checked: false,
		}
	},
	computed: {
		selection() {
			return store.selection
		},
	}
}
</script>
<style lang="scss" scoped>
.b-files-grid {
	margin-top: 20px;
	display: grid;
	/*grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));*/
	grid-template-columns: repeat(auto-fit, 120px);
	grid-row-gap: 20px;
	grid-column-gap: 20px;
	align-items: center;
	justify-items: center;
}
</style>
