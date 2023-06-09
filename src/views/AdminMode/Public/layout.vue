<template>
	<div class="page-layout">
		<b-menu type="admin-public" :menus="adminPublicRoutes" show-add @create-disk="handleCreateDisk"></b-menu>
		<div class="page-layout-main">
			<router-view :key="route" />
		</div>
	</div>
</template>
<script>
import menus from '@/router/constant/public.js'
// import { setPublicConfigById } from '@/api/admin/public'
import { mapGetters } from 'vuex'
export default {
	name: 'index',
	data() {
		return {
			menus,
		}
	},
	mounted() {
		console.log(this.adminPublicRoutes);
	},
	computed: {
		route() {
			return this.$route.path
		},
		...mapGetters(['adminPublicRoutes', 'userId'])
	},
	methods: {
		handleCreateDisk() {
			// this.$prompt('请输入网盘名称', '提示').then(({ value }) => {
			// 	setPublicConfigById({ name: value, allocateSpace: 10*1024*1024*1024, adminIds: [this.userId] }).then(res => {
			// 		this.$message.success(res.message || '创建成功！')
			// 		this.$store.dispatch('registryPublicRoute')
			// 	})
			// }).catch(() => {})

			this.$router.push({
				name: 'public-disk-create',
				from: this.$route.fullPath
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
