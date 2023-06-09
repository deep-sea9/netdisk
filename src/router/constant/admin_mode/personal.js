

export default [
    {
        path: '/admin/personal/used',
        component: () => import('@/views/AdminMode/Personal/SizeConfig/'),
        meta: {
            icon: 'far fa-folder-open',
            title: '容量设置(已使用)',
            type: 'all',
        },
    },
    {
        path: '/admin/personal/no-use',
        component: () => import('@/views/AdminMode/Personal/SizeConfigOfUnused/'),
        meta: {
            icon: 'far fa-folder-open',
            title: '容量设置(通讯录)',
            type: 'all',
        },
    }
]
