/*eslint-disable*/
import FileType from '@/views/Public/FileType'
import Documents from '@/views/Public/Documents'
import Image from '@/views/Public/Image'
import Video from '@/views/Public/Video'
import Audio from '@/views/Public/Audio'
import Zip from '@/views/Public/Zip'
import empty from '../empty.vue'
export default [
	{
		path: '/public/publicA',
		component: empty,
		meta: {
			icon: 'far fa-folder-open',
			title: 'A公共网盘',
			type: '',
		},
		redirect: '/publicA/all',
		children: [
			{
				path: '/publicA/all',
				component: FileType,
				meta: {
					icon: 'far fa-folder-open',
					title: '全部文件',
					type: -1,
				},
			},
			{
				path: '/publicA/documents',
				component: Documents,
				meta: {
					icon: 'far fa-file-alt',
					title: '文档',
					type: 0,
				},
			},
			{
				path: '/publicA/images',
				component: Image,
				meta: {
					icon: 'far fa-image',
					title: '图片',
					type: 1,
				},
			},
			{
				path: '/publicA/videos',
				component: Video,
				meta: {
					icon: 'far fa-video',
					title: '视频',
					type: 2,
				},
			},
			{
				path: '/publicA/audio',
				component: Audio,
				meta: {
					icon: 'far fa-music',
					title: '音频',
					type: 3,
				},
			},
			{
				path: '/publicA/zips',
				component: Zip,
				meta: {
					icon: 'far fa-file-archive',
					title: '压缩文件',
					type: 4,
				},
			},
			{
				path: '/publicA/members',
				component: () => import('@/views/Public/Members/index.vue'),
				meta: {
					icon: 'far fa-users',
					title: '网盘成员',
					type: 9,
				},
			},
			{
				path: '/publicA/recycled',
				component: () => import('@/views/Public/Recycled/index.vue'),
				meta: {
					icon: 'far fa-trash-alt',
					title: '回收站',
					type: 5,
				},
			},
		],
	},
]
