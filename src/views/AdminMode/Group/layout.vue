<template>
	<div class="page-layout">
		<b-menu :menus="menus"></b-menu>
		<div class="page-layout-main">
			<router-view />
		</div>
	</div>
</template>
<script>
import menus from '@/router/constant/admin_mode/group.js'
export default {
	name: 'index',
	data() {
		return {
			menus,
		}
	},
	computed: {
		route() {
			return this.$route.path
		},
	},
	methods: {},
}
</script>
<style lang="scss" scoped>
.page-layout {
	width: 100%;
	height: 100%;
	display: flex;

	.page-layout-main {
		width:calc(100vw - 200px);
		background-color: #fff;
		// padding: 10px 20px;
		box-sizing: border-box;
	}
}
</style>
