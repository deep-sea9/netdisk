/*eslint-disable*/
export default [
	{
		path: '/translate/upload',
		component: () => import('@/views/Common/Translate/Uploading'),
		meta: {
			icon: 'fa fa-upload',
			title: '正在上传',
		},
	},
	{
		path: '/translate/download',
		component: () => import('@/views/Common/Translate/Downloading'),
		meta: {
			icon: 'fa fa-arrow-alt-from-top',
			title: '正在下载',
		},
	},
	{
		path: '/translate/all',
		component: () => import('@/views/Common/Translate/Translated'),
		meta: {
			icon: 'fa fa-history',
			title: '传输完成',
			// iconType: 'iconfont'
		},
	},
]
