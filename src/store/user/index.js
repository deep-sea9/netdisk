import store from "../index";
import publicMenus from "../../router/constant/public";
import groupMenus from "../../router/constant/group";
import groupUpholdMenus from "../../router/constant/group-member-uphold";
import adminPublicMenus from "../../router/constant/admin_mode/public";
import router from "../../router";
import logMenus from '../../router/constant/admin_mode/logs'
const avatar = require('@/assets/images/avatar.png')

import {getDiskList} from '@/api/public/index.js'
import {getGroupDiskList, getGroupList} from '@/api/group/index.js'
import {login, getUserInfo, getSpaceSizeInfo} from '@/api/common.js'
import { USER_ROUTES_NO_PUBLIC } from '@/utils/constants.js'
import { getAllPublicDiskList } from '@/api/admin/public'
import { getLogModule } from '@/api/admin/log'

export default {
	namespace: true,
	state: {
		userName: '',
		userId: '',
		userAvatar: avatar,
		token: '',
		adminUser: false,
		userInfo: {},
		spaceInfo: {}
	},
	mutations: {
		SET_INFO(state, data) {
			state.userInfo = data
			state.userName = data.username || data.displayName
			state.userId = data.userId || data.id
		},
		SET_ADMIN_USER(state, isAdmin) {
			state.adminUser = isAdmin
		},
		SET_TOKEN(state, data) {
			state.token = data
		},
		SET_SPACE_INFO(state, data) {
			state.spaceInfo = data
		},
		CLEAR_USER_INFO(state) {
			state.userId = ''
			state.token = ''
			state.userInfo = {}
		}
	},
	actions: {
		login({ commit }, data) {
			return new Promise((resolve, reject) => {
				login(data).then((res) => {
					if (res.code !== 200) return reject(res)
					commit('SET_INFO', res)
					commit('SET_TOKEN', res.token)
					commit('SET_ADMIN_USER', res.adminUser)
					resolve(res)
				}).catch(err => reject(err))
			})
		},
		getInfo({commit, dispatch}) {
			// state.userInfo = data
			return new Promise((resolve, reject) => {
				getUserInfo().then(result => {
					commit('SET_INFO', result.data)
					commit('SET_ADMIN_USER', result.data.adminUser)
					getSpaceSizeInfo().then(result => {
						commit('SET_SPACE_INFO', result.data)
					})
					dispatch('system/getSysConfig').then(group_flag => {
						if(group_flag.value !== '0') {
							registryGroupRoute()
						}
					})
					registryPublicRoute()

					registryLogRoute()
					resolve(result.data)
				}).catch(err => {
					reject(err)
				})
			})
		},
		updatePersonalSpaceInfo({ commit }) {
			getSpaceSizeInfo().then(result => {
				commit('SET_SPACE_INFO', result.data)
			})
		},
		registryGroupRoute() {
			registryGroupRoute()
		},
		updateGroupMenus() {
			registryGroupRoute(false)
		},
		registryPublicRoute() {
			registryPublicRoute()
		},
		updatePublicMenus() {
			registryPublicRoute(false)
		}
	},

}

function registryPublicRoute(registerRoute = true) {
	getDiskList().then(res => {
		if(res.data.length>0) {
			let asyncMenus = []
			if(res.data.length > 0) {
				res.data.forEach((disk, index) => {
					asyncMenus[index] = {
						...publicMenus[0],
						children: publicMenus[0].children.map(child => ({...child})),
						name: disk.id,
						path: `/public/${disk.id}`,
						redirect: `/public/${disk.id}/all`,
						meta: { ...publicMenus[0].meta, title: disk.name, diskId: disk.id }
					}
					if(registerRoute) {
						router.addRoute('public_disk', asyncMenus[index])
						asyncMenus[index].children.forEach(menuChild => {
							switch (menuChild.meta.type) {
								case -1:
									menuChild.path = `/public/${disk.id}/all`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-all`;
									router.addRoute(disk.id, menuChild)
									break;
								case 0:
									menuChild.path = `/public/${disk.id}/documents`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-documents`;
									router.addRoute(disk.id, menuChild)
									break;
								case 1:
									menuChild.path = `/public/${disk.id}/images`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-images`;
									router.addRoute(disk.id, menuChild)
									break;
								case 2:
									menuChild.path = `/public/${disk.id}/videos`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-videos`;
									router.addRoute(disk.id, menuChild)
									break;
								case 3:
									menuChild.path = `/public/${disk.id}/audio`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-audio`;
									router.addRoute(disk.id, menuChild)
									break;
								case 4:
									menuChild.path = `/public/${disk.id}/zips`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-zips`;
									router.addRoute(disk.id, menuChild)
									break;
								case 9:
									menuChild.path = `/public/${disk.id}/members`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-members`;
									router.addRoute(disk.id, menuChild)
									break;
								case 5:
									menuChild.path = `/public/${disk.id}/recycled`;
									menuChild.meta = { ...menuChild.meta, diskId: disk.id };
									menuChild.name = `${disk.id}-recycled`;
									router.addRoute('public_disk', menuChild)
									break;
							}
						})
					}
				})
			}
			// console.log(asyncMenus);
			store.commit('SET_PUBLIC_MENUS', res.data)
			if(registerRoute) {
				store.commit('SET_PUBLIC_ROUTES', asyncMenus)
			}
			// console.log('public', asyncMenus, res.data);
		}else {
			// store.commit('setNavigation', USER_ROUTES_NO_PUBLIC)
			store.commit('SET_NO_PUBLIC', true)
		}
	})
	if(registerRoute) {
		registryAdminPublicRoute()
	}
}

function registryGroupRoute(registerRoute = true) {
	return getGroupList().then(res => {
		if(res.data.length > 0) {
			let asyncGroupMenus = [], asyncGroupUphold = []
			store.commit('SET_GROUP_LIST', res.data)

			res.data.forEach((group, index) => {

				asyncGroupMenus[index] = {
					...groupMenus[0],
					path: `/group/${group.id}`,
					name: group.id,
					meta: { title: group.name },
					// redirect: `/group/${group.id}/${disk.id}`
				};

				asyncGroupUphold[index] = {
					...groupUpholdMenus[0],
					path: `/group/group-member-uphold/${group.id}`,
					name: `uphold-${group.id}`,
					meta: { ...groupUpholdMenus[0].meta, title: group.name, groupId: group.id, sequence: group.sequence }
				}

			})

			Promise.all(res.data.map(group => getGroupDiskList(group.id))).then(allRes => {

				const menuRes = allRes.map(group => group.data), groupUpholdChild = groupUpholdMenus[0].children[0]

				let groupMenuList = [...res.data]

				groupMenuList.forEach((group, i) => {
					group.child = menuRes[i]

					if(menuRes[i].length > 0) {
						asyncGroupUphold[i].children = JSON.parse(JSON.stringify(menuRes[i]))

						asyncGroupUphold[i].children.forEach(diskUphold => {
							diskUphold.path = `/group/group-member-uphold/${group.id}/${diskUphold.id}`;
							diskUphold.meta = { ...groupUpholdChild.meta, title: `${diskUphold.name}(${diskUphold.userName})`, diskId: diskUphold.id, userId: diskUphold.userId }
							diskUphold.name = `group-disk-uphold-${diskUphold.id}`;
							diskUphold.component = groupUpholdChild.component;
							asyncGroupUphold[i].redirect = `/group/group-member-uphold/${group.id}/${asyncGroupUphold[i].children[0].id}`
						})
						if(registerRoute) {
							router.addRoute('group-member-uphold', asyncGroupUphold[i])
						}

					}else {
						asyncGroupUphold[i].children = []
					}

				})

				store.commit('SET_GROUP_MENUS', groupMenuList)
				console.log('SET_GROUP_UPHOLD_ROUTES', groupMenuList, asyncGroupUphold);
				store.commit('SET_GROUP_UPHOLD_ROUTES', asyncGroupUphold)

				const groupRouteChild = groupMenus[0].children[0]

				menuRes.forEach((groupMenu, i) => {
					let asyncMenus = []

					if(groupMenu.length > 0) {
						groupMenu.forEach((disk, ind) => {
							asyncMenus[ind] = {
								...groupRouteChild,
								children: groupRouteChild.children.map(child => ({...child})),
								name: disk.id,
								// name: disk.groupId,
								path: `/group/${disk.groupId}/${disk.id}`,
								redirect: `/group/${disk.groupId}/${disk.id}/all`,
								meta: { ...groupRouteChild.meta, title: disk.name, diskId: disk.id }
							}

							asyncMenus[ind].children.forEach(menuChild => {
								switch (menuChild.meta.type) {
									case -1:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/all`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-all`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 0:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/documents`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-documents`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 1:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/images`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-images`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 2:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/videos`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-videos`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 3:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/audio`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-audio`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 4:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/zips`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-zips`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 9:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/members`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-members`;
										// router.addRoute(disk.id, menuChild)
										break;
									case 5:
										menuChild.path = `/group/${disk.groupId}/${disk.id}/recycled`;
										menuChild.meta = { ...menuChild.meta, diskId: disk.id, groupId: disk.groupId };
										menuChild.name = `${disk.id}-recycled`;
										// router.addRoute(disk.id, menuChild)
										break;
								}
							})
						})

						asyncGroupMenus[i].children = asyncMenus
						asyncGroupMenus[i].redirect = `${asyncMenus[0].path}`
					}else {
						asyncGroupMenus[i].children = []
					}

					if(registerRoute) {
						router.addRoute('group_disk', asyncGroupMenus[i])
					}
				})

				if(registerRoute) {
					store.commit('SET_GROUP_ROUTES', asyncGroupMenus)
				}

			}).catch(() => {
				this.$message.error('未获取到个人群组信息，请刷新重试或重新登录...')
			})

		}

	})
}

function registryAdminPublicRoute() {

	let asyncMenus = []

	getAllPublicDiskList().then(res => {
		if(res.data.length > 0) {
			res.data.forEach((disk, index) => {
				res.data[index] = {
					...adminPublicMenus[0],
					name: `admin-${disk.id}`,
					path: `/admin/public/${disk.id}`,
					meta: { ...adminPublicMenus[0].meta, title: disk.name, diskId: disk.id }
				}

				asyncMenus[index] = res.data[index]
				router.addRoute('admin-public', asyncMenus[index])
			})

			store.commit('SET_ADMIN_PUBLIC_ROUTES', asyncMenus)
		}
	})



}

function registryLogRoute() {
	getLogModule().then(res => {
		let asyncLogMenus = []
		let logMenuList = [...res.data]
		res.data.forEach((module, index) => {

			asyncLogMenus[index] = {
				...logMenus[0],
				path: `/admin/logs/${module.id}`,
				name: module.id,
				meta: { ...logMenus[0].meta, title: module.name, code: module.code }
			}
		})
		Promise.all(res.data.map(module => getLogModule({ parentCode: module.code }))).then(allRes => {

			const menuRes = allRes.map(m => m.data)

			let child = {...logMenus[0].children[0]}

			asyncLogMenus.forEach((parentModule, i) => {
				parentModule.children = JSON.parse(JSON.stringify(menuRes[i]))
				parentModule.children.forEach(childModule => {
					childModule.path = `/admin/logs/${parentModule.name}/${childModule.id}`
					childModule.meta = { ...child.meta, title: childModule.name, code: childModule.code }
					childModule.name = childModule.id
					childModule.component = child.component
				})
				asyncLogMenus[i].redirect = `/admin/logs/${parentModule.name}/${asyncLogMenus[i].children[0].id}`
				router.addRoute('admin-logs', asyncLogMenus[i])
			})
			store.commit('SET_LOG_MENUS', logMenuList)
			store.commit('SET_LOG_ROUTES', asyncLogMenus)
			console.log('asyncLogMenus', asyncLogMenus);
		}).catch(_ => {
			console.log('获取日志模块错误..', _);
		})
	})
}
