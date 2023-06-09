<template>
	<div class="page-layout">
		<b-menu type="public" :menus="logRoutes" :default-openeds="defaultOpeneds" unique-opened></b-menu>
		<div class="page-layout-main">
			<router-view :key="$route.path" />
		</div>
	</div>
</template>
<script>
import {mapGetters} from "vuex";
export default {
	name: 'index',
	data() {
		return {
			// menus,
		}
	},
	computed: {
		route() {
			return this.$route.path
		},
		...mapGetters(['logRoutes']),
		defaultOpeneds() {
			return [this.logRoutes[0].path]
		}
	},
	mounted() {

	},
	methods: {

	},
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
