import { getDiskConfig } from '@/api/common.js'
import {downloadLogo} from "@/api/common";
import {THEME_SKINS} from "@/utils/constants";
import { updateThemeForStyle } from "@/utils";

// import Theme from 'theme-vue'

export default {
	namespaced: true,
	state: {
		sysName: '网络云盘',
		fileMax: 0,
		perSpace: 0,
		groupSpace: 0,
		recycleDay: -1,
		alone_login: '1', // 1开启，0关闭
		cas_login_url: '',
		cas_logout_url: '',
		ftpHost: '',
		ftpPort: '',
		ftpFlag: "1",
		staffTree: [],
		logo: require('../../assets/images/logo.png'),
		themeValue: '1',
		themeSkins: THEME_SKINS,
		themeInstance: null,
		open_group: '1',
		notice_open: localStorage.getItem('notice-open') || '0'
	},
	mutations: {
		SET_SYS_NAME(state, data) {
			state.sysName = data
			document.title = data
		},
		SET_FILE_MAX(state, data) {
			state.fileMax = data
		},
		SET_PER_SPACE(state, data) {
			state.perSpace = data
		},
		SET_GROUP_SPACE(state, data) {
			state.groupSpace = data
		},
		SET_RECYCLE_DAY(state, data) {
			state.recycleDay = data
		},
		SET_ALONE_LOGIN(state, data) {
			state.alone_login = data
		},
		SET_CAS_LOGIN_URL(state, data) {
			state.cas_login_url = data
		},
		SET_CAS_LOGOUT_URL(state, data) {
			state.cas_logout_url = data
		},
		SET_FTP(state, data) {
			const ftpURL = data.split(':')
			state.ftpHost = ftpURL[0]
			state.ftpPort = ftpURL[1]
			// state.ftpFlag = data.flag
		},
		SET_FTP_FLAG(state, data) {
			state.ftpFlag = data
		},
		SET_STAFF_TREE(state, data) {
			state.staffTree = data
		},
		SET_LOGO(state, data) {
			state.logo = data
		},
		SET_THEME_VALUE(state, data) {
			state.themeValue = data
			const selectedTheme = state.themeSkins.find(t => t.value === data) || {}
			state.themeInstance.changeTheme(selectedTheme.color)

			updateThemeForStyle(selectedTheme.name)

		},
		SET_THEME_INSTANCE(state, data) {
			state.themeInstance = data
		},
		SET_OPEN_GROUP(state, data) {
			state.open_group = data
		},
		SET_STATE_VALUE(state, { key, value }) {
			state[key] = value
		}
	},
	actions: {
		getSysConfig({commit}) {
			downloadLogo().then(res => {
				const fileReader = new FileReader();

				fileReader.onload = (e) => {
					commit('SET_LOGO', e.target.result)
				}

				fileReader.readAsDataURL(res)

			})

			return getDiskConfig().then(res => {

				const name = res.data.find(config => config.code === 'sys_name')
				const fileMax = res.data.find(config => config.code === 'file_max')
				const perSpace = res.data.find(config => config.code === 'per_space')
				const groupSpace = res.data.find(config => config.code === 'group_space')
				const recycleDay = res.data.find(config => config.code === 'recycle_day')
				const alone_login = res.data.find(config => config.code === 'alone_login')
				const cas_login_url = res.data.find(config => config.code === 'cas_login_url')
				const cas_logout_url = res.data.find(config => config.code === 'cas_logout_url')
				const ftp_url = res.data.find(config => config.code === 'ftp_url')
				const ftp_flag = res.data.find(config => config.code === 'ftp_flag')
				const theme = res.data.find(config => config.code === 'sys_color')
				const group_flag = res.data.find(config => config.code === 'group_flag')

				commit('SET_SYS_NAME', name.value)
				commit('SET_FILE_MAX', fileMax.value)
				commit('SET_PER_SPACE', perSpace.value)
				commit('SET_GROUP_SPACE', groupSpace.value)
				commit('SET_RECYCLE_DAY', recycleDay.value)
				commit('SET_ALONE_LOGIN', alone_login.value)
				commit('SET_CAS_LOGIN_URL', cas_login_url.value)
				commit('SET_CAS_LOGOUT_URL', cas_logout_url.value)
				commit('SET_FTP', ftp_url.value)
				commit('SET_FTP_FLAG', ftp_flag.value)
				commit('SET_THEME_VALUE', theme.value)
				commit('SET_OPEN_GROUP', group_flag.value)

				return group_flag
			})
		}
	}
}
