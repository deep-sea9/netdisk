<template>
	<div class="layout">
		<layout-header>
			<logo slot="logo"></logo>
			<navigation slot="nav"></navigation>
			<mode-toggle v-if="adminUser" slot="mode" />
			<userInfo slot="user"></userInfo>
			<operations slot="operations"></operations>
		</layout-header>
		<div class="layout_main">
			<router-view />
		</div>
	</div>
</template>
<script>
export default {
	name: 'layout',
	components: {
		layoutHeader: () => import('./components/Header.vue'),
		logo: () => import('./components/Logo.vue'),
		navigation: () => import('./components/Navigation.vue'),
		userInfo: () => import('./components/UserInfo.vue'),
		operations: () => import('./components/Operations.vue'),
		ModeToggle: () => import('./components/ModeToggle.vue'),
	},
	computed: {
		adminUser() {
			return this.$store.state.user.adminUser
		}
	}
}
</script>
<style lang="scss" scoped>
.layout {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	.layout_main {
		flex: 1;
		background-color: #fff;
		overflow: hidden;
	}
}
</style>
