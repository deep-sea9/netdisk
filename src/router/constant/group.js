/*eslint-disable*/
import empty from '../empty.vue'

const children = [
	{
		path: '/groupA/all',
		component: () => import('@/views/Group/FileType/index.vue'),
		meta: {
			icon: 'far fa-folder-open',
			title: '全部文件',
			type: -1,
		},
	},
	{
		path: '/groupA/documents',
		component: () => import('@/views/Group/Documents/index.vue'),
		meta: {
			icon: 'far fa-file-alt',
			title: '文档',
			type: 0,
		},
	},
	{
		path: '/groupA/images',
		component: () => import('@/views/Group/Image/index.vue'),
		meta: {
			icon: 'far fa-image',
			title: '图片',
			type: 1,
		},
	},
	{
		path: '/groupA/videos',
		component: () => import('@/views/Group/Video/index.vue'),
		meta: {
			icon: 'far fa-video',
			title: '视频',
			type: 2,
		},
	},
	{
		path: '/groupA/audio',
		component: () => import('@/views/Group/Audio/index.vue'),
		meta: {
			icon: 'far fa-music',
			title: '音频',
			type: 3,
		},
	},
	{
		path: '/groupA/zips',
		component: () => import('@/views/Group/Zip/index.vue'),
		meta: {
			icon: 'far fa-file-archive',
			title: '压缩文件',
			type: 4,
		},
	},
	{
		path: '/groupA/members',
		component: () => import('@/views/Group/Members/index.vue'),
		meta: {
			icon: 'far fa-users',
			title: '网盘成员',
			type: 9,
		},
	},
	{
		path: '/groupA/recycled',
		component: () => import('@/views/Group/Recycled/index.vue'),
		meta: {
			icon: 'far fa-trash-alt',
			title: '回收站',
			type: 5,
		},
	}
]

export default [
	{
		path: '/group/mine',
		name: 'group-mine',
		component: empty,
		meta: {
			title: '我创建的',
			type: '',
		},
		children: [{
			path: '/group/mine/groupA',
			component: empty,
			meta: {
				icon: 'far fa-folder-open',
				title: 'Z群组网盘',
				type: '',
			},
			children
		}],
	}
]
