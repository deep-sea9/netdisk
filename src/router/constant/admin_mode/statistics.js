/*eslint-disable*/
import FileType from '@/views/Personal/FileType'
import empty from '../../empty.vue'
export default [
	{
		path: '/admin/statistics',
		component: empty,
		meta: {
			icon: 'far fa-folder-open',
			title: 'A群组网盘',
			type: '',
		},
		redirect: '/admin/statistics/a',
		children: [
			{
				path: '/admin/statistics/a',
				component: FileType,
				meta: {
					icon: 'far fa-folder-open',
					title: '全部文件',
					type: '',
				},
			}
		]
	}
]
