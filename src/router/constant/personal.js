import FileType from '@/views/Personal/FileType'
import empty from "../empty.vue"

export default [
    {
        path: '/personal/all',
        name: 'personal-all',
        component: FileType,
        meta: {
            icon: 'far fa-folder-open',
            title: '全部文件',
            type: 'all',
        },
    },
    {
        path: '/personal/documents',
        name: 'personal-doc',
        component: () => import("@/views/Personal/Documents/index.vue"),
        meta: {
            icon: 'far fa-file-alt',
            title: '文档',
            type: 0,
        },
    },
    {
        path: '/personal/images',
        name: 'personal-img',
        component: () => import("@/views/Personal/Image"),
        meta: {
            icon: 'far fa-image',
            title: '图片',
            type: 1,
        },
    },
    {
        path: '/personal/videos',
        name: 'personal-video',
        component: () => import("@/views/Personal/Video"),
        meta: {
            icon: 'far fa-video',
            title: '视频',
            type: 2
        },
    },
    {
        path: '/personal/music',
        name: 'personal-music',
        component: () => import("@/views/Personal/Audio"),
        meta: {
            icon: 'far fa-music',
            title: '音频',
            type: 3
        },
    },
    {
        path: '/personal/zips',
        name: 'personal-zip',
        component: () => import("@/views/Personal/Zip"),
        meta: {
            icon: 'far fa-file-archive',
            title: '压缩文件',
            type: 4,
        },
    },
    {
        path: '/personal/recycled',
        name: 'personal-recycled',
        component: () => import("@/views/Personal/Recycled"),
        meta: {
            icon: 'far fa-trash-alt',
            title: '回收站',
            type: 'recycle'
        },
    },
    {
        path: '/personal/shortcut',
        name: 'personal-shortcut',
        component: empty,
        redirect: '/personal/recently',
        meta: {
            icon: 'far fa-shipping-fast',
            title: '快捷通道',
        },
        children: [
            {
                path: '/personal/recently',
                name: 'personal-recently',
                component: () => import('@/views/Personal/Recently'),
                meta: {
                    icon: 'far fa-clock',
                    title: '最近访问',
                    type: 'recent'
                },
            },
            {
                path: '/personal/collection',
                name: 'personal-collection',
                component: () => import('@/views/Personal/Fav'),
                meta: {
                    icon: 'far fa-star',
                    title: '收藏夹',
                    type: 'fav'
                },
            },
            {
                path: '/personal/myshare',
                name: 'personal-myshare',
                component: () => import('@/views/Personal/MyShare'),
                meta: {
                    icon: 'far fa-user',
                    title: '我的共享',
                    type: 'myShare'
                },
            },
            {
                path: '/personal/othershare',
                name: 'personal-othershare',
                component: () => import('@/views/Personal/OtherShare'),
                meta: {
                    icon: 'far fa-users',
                    title: '他人共享',
                    type: 'otherShare'
                },
            },
        ],
    },
]
