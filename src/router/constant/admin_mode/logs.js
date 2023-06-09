/*eslint-disable*/
import LogList from '@/views/AdminMode/Log/LogList'
import empty from '../../empty.vue'
export default [
	{
		path: '/admin/logs/logsA',
		component: empty,
		meta: {
			icon: 'far fa-folder-open',
			title: 'LogsA',
			type: '',
		},
		redirect: '/admin/logs/logsA/log-codeA',
		children: [
			{
				path: '/admin/logs/logsA/log-codeA',
				component: LogList,
				meta: {
					icon: 'far fa-folder-open',
					title: 'log-codeA',
					type: '',
				},
			}
		]
	}
]
