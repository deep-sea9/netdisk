/*eslint-disable*/
import empty from '../../empty.vue'
export default [
	{
		path: '/admin/system',
		component: empty,
		meta: {
			icon: 'setting',
			title: '系统设置',
			type: '',
			iconType: 'iconfont'
		},
		redirect: '/admin/system/system_name',
		children: [
			{
				path: '/admin/system/system_name',
				component: () => import('../../../views/AdminMode/System/SystemNameConfig'),
				meta: {
					icon: 'rename',
					title: '系统名称配置',
					iconType: 'iconfont'
				},
			}
		]
	},
	{
		path: '/admin/system/upload_size',
		component: () => import('../../../views/AdminMode/System/UploadSizeConfig'),
		meta: {
			icon: 'watermark',
			title: '上传文件大小设置',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/dead_line',
		component: () => import('../../../views/AdminMode/System/AutoDeleteRecycle'),
		meta: {
			icon: 'watermark',
			title: '回收站文件期限设置',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/group_limit',
		component: () => import('../../../views/AdminMode/System/GroupLimitConfig'),
		meta: {
			icon: 'watermark',
			title: '群组网盘群组上限设置',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/login_config',
		component: () => import('../../../views/AdminMode/System/LoginConfig'),
		meta: {
			icon: 'watermark',
			title: '独立登录设置',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/disk-migrate',
		component: () => import('../../../views/AdminMode/System/DiskMigrate'),
		meta: {
			icon: 'watermark',
			title: '旧网盘迁移',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/ftp-mount',
		component: () => import('../../../views/AdminMode/System/FTPMountSetting'),
		meta: {
			icon: 'watermark',
			title: 'FTP挂载服务配置',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/theme-config',
		component: () => import('../../../views/AdminMode/System/ThemeConfig'),
		meta: {
			icon: 'watermark',
			title: '主题色配置',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/open-group-config',
		component: () => import('../../../views/AdminMode/System/GroupDiskSetting'),
		meta: {
			icon: 'watermark',
			title: '开启群组网盘',
			iconType: 'iconfont'
		},
	},
	{
		path: '/admin/system/update-notice-config',
		component: () => import('../../../views/AdminMode/System/UpdateNoticeConfig'),
		meta: {
			icon: 'watermark',
			title: '开启更新通知',
			iconType: 'iconfont'
		},
	},
]
