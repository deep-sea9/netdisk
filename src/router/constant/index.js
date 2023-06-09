/*eslint-disable*/
import Layout from '@/components/Layout'
import person_routes from "./personal"
// import group_routes from "./group"
// import public_routes from "./public"

import admin_person from './admin_mode/personal'
// import admin_public from './admin_mode/public'
import admin_group from './admin_mode/group'
// import admin_statistics from './admin_mode/statistics'
// import admin_logs from './admin_mode/logs'
import admin_system from './admin_mode/system'
import translate from './translate'

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: '/personal',
        children: [
            {
                path: 'personal',
                component: () => import('@/views/Personal/layout.vue'),
                redirect: '/personal/all',
                meta: {
                    icon: require('../../assets/images/personal_menu_icon.png'),
                    title: '个人网盘',
                },
                children: [
                    {
                        path: '/personal/other-link-share',
                        name: 'other-link-share',
                        component: () => import("@/views/Personal/OtherLinkShare/index.vue"),
                        meta: {
                            icon: 'far fa-user',
                            title: '他人链接共享',
                            type: -1
                        },
                    },
                    ...person_routes
                ]
            },
            {
            	path: 'public',
            	component: () => import('@/views/Public/layout.vue'),
            	meta: {
            		icon: require('../../assets/images/public_menu_icon.png'),
            		title: '公共网盘',
            	},
                name: 'public_disk',
            	// children: public_routes
            },
            {
            	path: 'group',
            	component: () => import('@/views/Group/layout.vue'),
            	meta: {
            		icon: require('../../assets/images/group_menu_icon.png'),
            		title: '群组网盘',
            	},
            	// children: group_routes,
                name: 'group_disk',
                // redirect: '/group/mine',
            },
            {
                path: 'group/member-uphold',
                component: () => import('@/views/Group/MemberUphold/layout.vue'),
                meta: {
                    icon: require('../../assets/images/group_menu_icon.png'),
                    title: '群组网盘-成员维护',
                },
                name: 'group-member-uphold',
                children: [
                    {
                        path: '/group/member-uphold/create-disk',
                        component: () => import('@/views/Group/MemberUphold/DiskSetting/disk-info-create.vue'),
                        name: 'group-disk-create'
                    }
                ]
            },
            {
                path: 'admin/personal',
                component: () => import('@/views/AdminMode/Personal/layout.vue'),
                meta: {
                    icon: require('../../assets/images/public_menu_icon.png'),
                    title: '管理员模式-个人',
                },
                children: admin_person,
                redirect: '/admin/personal/used',
            },
            {
                name: 'admin-public',
                path: 'admin/public',
                component: () => import('@/views/AdminMode/Public/layout.vue'),
                meta: {
                    icon: require('../../assets/images/public_menu_icon.png'),
                    title: '管理员模式-公共',
                },
                children: [
                    {
                        path: '/admin/public/create-disk',
                        component: () => import('@/views/AdminMode/Public/DiskSetting/disk-info.vue'),
                        name: 'public-disk-create'
                    }
                ]
                // children: admin_public,
                // redirect: '/admin/public/publicA',
            },
            {
                path: 'admin/group',
                component: () => import('@/views/AdminMode/Group/layout.vue'),
                meta: {
                    icon: require('../../assets/images/public_menu_icon.png'),
                    title: '管理员模式-群组',
                },
                children: admin_group,
                redirect: '/admin/group/setting',
            },
            // {
            //     path: 'admin/statistics',
            //     component: () => import('@/views/AdminMode/Personal/layout.vue'),
            //     meta: {
            //         icon: require('../../assets/images/public_menu_icon.png'),
            //         title: '管理员模式-统计分析',
            //     },
            //     children: admin_statistics,
            //     redirect: '/admin/statistics',
            // },
            {
                path: 'admin/logs',
                component: () => import('@/views/AdminMode/Log/layout.vue'),
                meta: {
                    icon: require('../../assets/images/public_menu_icon.png'),
                    title: '管理员模式-日志管理',
                },
                name: 'admin-logs',
                // children: admin_logs,
                // redirect: '/admin/logs',
            },
            {
                path: 'admin/system',
                component: () => import('@/views/AdminMode/System/layout.vue'),
                meta: {
                    icon: require('../../assets/images/public_menu_icon.png'),
                    title: '管理员模式-系统设置',
                },
                children: admin_system,
                redirect: '/admin/system',
            },
            {
                path: 'translate',
                name: 'translate',
                component: () => import('@/views/Common/Translate/layout.vue'),
                meta: {
                    icon: require('../../assets/images/public_menu_icon.png'),
                    title: '传输列表',
                },
                children: translate,
                redirect: '/translate/upload',
            },
            {
                path: '/session',
                name: 'session',
                component: () => import('../../views/Common/WebRTCSession')
            }
        ],
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../../views/Common/Login')
    },
    {
        path: '/other-link-share/:id',
        name: 'link-share',
        component: () => import("@/views/Personal/OtherLinkShare/index.vue"),
        meta: {
            icon: 'far fa-user',
            title: '他人链接共享',
            type: -1
        },
    },
    {
        path: '/word-edit',
        name: 'word-edit',
        component: () => import('../../views/Common/WordEdit')
    },
    {
        path: '/xlsx-edit',
        name: 'xlsx-edit',
        component: () => import('../../views/Common/XlsxEdit')
    },
    {
        path: '/txt-edit',
        name: 'txt-edit',
        component: () => import('../../views/Common/TxtEdit')
    },
    {
        path: '/mind-edit',
        name: 'mind-edit',
        component: () => import('../../views/Common/MindMap')
    },
    {
        path: '/flow-edit',
        name: 'flow-edit',
        component: () => import('../../views/Common/FlowChart')
    },
    {
        path: '/draw-board',
        name: 'draw-board',
        component: () => import('../../views/Common/DrawBoard')
    },
    {
        path: '/bpmn-designer',
        name: 'bpmn-designer',
        component: () => import('../../views/Common/BpmnDesigner')
    }
]
export default routes
