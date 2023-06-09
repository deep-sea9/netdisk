<template>
	<div class="page-layout">
		<b-menu type="group" :menus="groupRoutes" :default-openeds="defaultOpeneds" unique-opened show-add operation-icon="el-icon-edit" @create-disk="handleCreate" />
		<div class="page-layout-main">
			<router-view :key="$route.path" />
		</div>
	</div>
</template>
<script>
import menus from '@/router/constant/group.js'
import {mapGetters} from "vuex";
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
		...mapGetters(['groupRoutes', 'firstHasChildOfGroupRoute']),
		defaultOpeneds() {
			return this.firstHasChildOfGroupRoute?[this.firstHasChildOfGroupRoute.children[0].path]: []
		}
	},
	methods: {
		handleCreate() {
			if(!this.$route.meta.diskId) {
				this.$router.push({
					name: 'group-member-uphold',
					// name: 'group-disk-create',
					params: { routeName: this.$route.name }
				})
			}else {
				this.$router.push({
					// name: 'group-member-uphold'
					name: `group-disk-uphold-${this.$route.meta.diskId}`,
					params: { routeName: this.$route.name }
				})
			}
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
