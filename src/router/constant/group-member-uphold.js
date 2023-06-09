/*eslint-disable*/
import empty from '../empty.vue'

export default [
	{
		path: '/group/group-member-uphold/1',
		name: 'group-mine',
		component: empty,
		meta: {
			icon: 'far fa-folder-open',
			title: '我创建的',
			type: '',
		},
		children: [
			{
				path: '/group/group-member-uphold/1/1',
				component: () => import('@/views/Group/MemberUphold/DiskSetting/index.vue'),
				meta: {
					icon: 'far fa-folder-open',
					title: '我的网盘',
					type: -1,
				},
			}
		]
	}
]
