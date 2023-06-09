<template>
	<div class="page-layout">
		<b-menu type="public" :menus="publicRoutes" :default-openeds="defaultOpeneds" unique-opened @create-disk="handleCreate"></b-menu>
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
		...mapGetters(['userName', 'userAvatar', 'publicRoutes']),
		defaultOpeneds() {
			return [this.publicRoutes[0].path]
		}
	},
	mounted() {

	},
	methods: {
		handleCreate() {
			this.$router.push({
				name: 'admin-public'
			})
		}
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
