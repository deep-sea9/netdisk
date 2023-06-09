<template>
	<el-dropdown @command="handleCommand">
		<div class="user_info">
			<img :src="userAvatar" class="avatar" />
			<span>{{ userName }}</span>
		</div>
		<el-dropdown-menu slot="dropdown">
<!--			<el-dropdown-item icon="el-icon-info" command="info">个人资料</el-dropdown-item>-->
<!--			<el-dropdown-item icon="el-icon-edit" command="pwd">修改密码</el-dropdown-item>-->
<!--			<el-dropdown-item icon="el-icon-help" command="help">帮助中心</el-dropdown-item>-->
			<el-dropdown-item icon="el-icon-error" command="quit">退出</el-dropdown-item>
		</el-dropdown-menu>
	</el-dropdown>
</template>
<script>
import { mapGetters } from 'vuex'

import { quitSys } from '@/api/common.js'

export default {
	name: 'UserInfo',
	computed: {
		...mapGetters(['userName', 'userAvatar']),
	},
	methods: {
		handleCommand(command) {
			switch (command) {
				case 'quit':
					this.quitSys();
					return;
			}
		},
		quitSys() {
			this.$confirm('确定退出吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'error'
			}).then((res) => {
				if(res) {
					quitSys().then(res => {
						this.$message.success(res.message || '退出成功！')
						this.$store.commit('CLEAR_USER_INFO')
						this.$store.commit('CLEAR_ALL_ROUTE_AND_MENUS')
						const {alone_login, cas_logout_url} = this.$store.state.system
						if(alone_login == '1') {
							this.$router.replace('/login')
						}else {
							const currentHref = window.location.href
							console.log(cas_logout_url + "?service=" + currentHref);
							window.location.href = `${cas_logout_url}?service=${currentHref.split('?')[0]}`
						}

					}).catch(err => {
						console.log(err);
						this.$store.commit('CLEAR_USER_INFO')
						this.$router.replace('/login')
					})
				}
			})

		}
	}
}
</script>
<style lang="scss" scoped>
.user_info {
	display: flex;
	align-items: center;
	margin-right: 40px;
	color: #fff;
	.avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		margin-right: 10px;
	}
}
</style>
