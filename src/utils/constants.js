export const PERSON_DISK_ID = '1';
export const PUBLIC_DISK_ID = '2';
export const GROUP_DISK_ID = '4';
export const DISK_TYPE_LABEL_ENUM = {
    [PERSON_DISK_ID]: '个人网盘',
    [PUBLIC_DISK_ID]: '公共网盘',
    [GROUP_DISK_ID]: '群组网盘',
}

export const PERSON_ROOT_FOLD_ID = '806334271bd18e08caeaa0005299a7ab';

export const folderNameReg = /^(?![ .])[^\s\\/:*?"<>\[\]|]{1,50}$/; //不能包含\/:*?"<>|，且不能以空格或.开头，且不为空，且字数在50以内
export const folderRegTip = '名字不能包含\\\/:*?"<>[]|，且不能以空格或.开头，且不为空，且字数在50以内'; //不能包含\/:*?"<>|，且不能以空格或.开头，且不为空，且字数在50以内

export const SPACE_ENUM = [
    {
        label: '1G',
        value: 1024 * 1024 * 1024
    },
    {
        label: '5G',
        value: 5 * 1024 * 1024 * 1024
    },
    {
        label: '10G',
        value: 10 * 1024 * 1024 * 1024
    },
    {
        label: '20G',
        value: 20 * 1024 * 1024 * 1024
    },
    {
        label: '30G',
        value: 30 * 1024 * 1024 * 1024
    },
    {
        label: '40G',
        value: 40 * 1024 * 1024 * 1024
    },
    {
        label: '50G',
        value: 50 * 1024 * 1024 * 1024
    }
]

export const ADMIN_ROUTES = [
    {
        title: '个人网盘',
        path: '/admin/personal',
        icon: require("../assets/images/personal_menu_icon.png")
    },
    {
        title: '公共网盘',
        path: '/admin/public',
        icon: require("../assets/images/public_menu_icon.png")
    },
    {
        title: '群组网盘',
        path: '/admin/group',
        icon: require("../assets/images/group_menu_icon.png")
    },
    // {
    //     title: '统计分析',
    //     path: '/admin/statistics',
    //     icon: require("../assets/images/group_menu_icon.png")
    // },
    {
        title: '日志审计',
        path: '/admin/logs',
        icon: require("../assets/images/group_menu_icon.png")
    },
    {
        title: '系统设置',
        path: '/admin/system',
        icon: require("../assets/images/group_menu_icon.png")
    },
]

export const ADMIN_ROUTES_NO_GROUP = [
    {
        title: '个人网盘',
        path: '/admin/personal',
        icon: require("../assets/images/personal_menu_icon.png")
    },
    {
        title: '公共网盘',
        path: '/admin/public',
        icon: require("../assets/images/public_menu_icon.png")
    },
    {
        title: '日志审计',
        path: '/admin/logs',
        icon: require("../assets/images/group_menu_icon.png")
    },
    {
        title: '系统设置',
        path: '/admin/system',
        icon: require("../assets/images/group_menu_icon.png")
    },
]

export const USER_ROUTES = [
    {
        title: '个人网盘',
        path: '/personal',
        icon: require("../assets/images/personal_menu_icon.png")
    },
    {
        title: '公共网盘',
        path: '/public',
        icon: require("../assets/images/public_menu_icon.png")
    },
    {
        title: '群组网盘',
        path: '/group',
        icon: require("../assets/images/group_menu_icon.png")
    }
]

export const USER_ROUTES_NO_PUBLIC = [
    {
        title: '个人网盘',
        path: '/personal',
        icon: require("../assets/images/personal_menu_icon.png")
    },
    {
        title: '群组网盘',
        path: '/group',
        icon: require("../assets/images/group_menu_icon.png")
    }
]

export const USER_ROUTES_NO_GROUP = [
    {
        title: '个人网盘',
        path: '/personal',
        icon: require("../assets/images/personal_menu_icon.png")
    },
    {
        title: '公共网盘',
        path: '/public',
        icon: require("../assets/images/public_menu_icon.png")
    }
]

export const RIGHT_CONTEXT = [
    {
        name: "打开",
        code: "open"
    },
    {
        name: "打开所在目录",
        code: "open-in"
    },
    {
        name: "下载",
        code: "download"
    },
    {
        name: "共享",
        code: "share"
    },
    {
        name: "收藏",
        code: "favorite"
    },
    {
        name: "复制",
        code: "copy"
    },
    {
        name: "移动",
        code: "move"
    },
    {
        name: "重命名",
        code: "rename"
    },
    {
        name: "删除",
        code: "delete"
    }
]

export const RIGHT_CONTEXT_DB_SELECTION = [
    {
        name: "下载",
        code: "download"
    },
    {
        name: "共享",
        code: "share"
    },
    {
        name: "复制",
        code: "copy"
    },
    {
        name: "移动",
        code: "move"
    },
    {
        name: "删除",
        code: "delete"
    }
]

export const RIGHT_CONTEXT_RECYCLE = [
    {
        name: "还原",
        code: "restore"
    },
    {
        name: "彻底删除",
        code: "remove"
    }
]

export const RIGHT_CONTEXT_RECENT = [
    {
        name: "打开",
        code: "open"
    },
    {
        name: "下载",
        code: "download"
    },
    {
        name: "共享",
        code: "share"
    },
    {
        name: "收藏",
        code: "favorite"
    }
]

export const RIGHT_CONTEXT_RECENT_DB_SELECTION = [
    {
        name: "下载",
        code: "download"
    },
    {
        name: "共享",
        code: "share"
    }
]

export const RIGHT_CONTEXT_FAV = [
    {
        name: "打开",
        code: "open"
    },
    {
        name: "下载",
        code: "download"
    },
    // {
    //     name: "共享",
    //     code: "share"
    // },
    {
        name: "取消收藏",
        code: "unfav"
    }
]

export const RIGHT_CONTEXT_FAV_DB_SELECTION = [
    {
        name: "下载",
        code: "download"
    },
    {
        name: "共享",
        code: "share"
    }
]

export const RIGHT_CONTEXT_PUBLIC = [
    {
        name: "打开",
        code: "open"
    },
    {
        name: "打开所在目录",
        code: "open-in"
    },
    {
        name: "下载",
        code: "download"
    },
    {
        name: "收藏",
        code: "favorite"
    },
    {
        name: "复制",
        code: "copy"
    },
    {
        name: "移动",
        code: "move"
    },
    {
        name: "重命名",
        code: "rename"
    },
    {
        name: "删除",
        code: "delete"
    }
]

export const RIGHT_CONTEXT_NO_PERMISSION = [
    {
        name: "打开所在目录",
        code: "open-in"
    },
    {
        name: "下载",
        code: "download"
    },
    {
        name: "收藏",
        code: "favorite"
    }
]

export const RIGHT_CONTEXT_PUBLIC_DB_SELECTION = [
    {
        name: "下载",
        code: "download"
    },
    {
        name: "复制",
        code: "copy"
    },
    {
        name: "移动",
        code: "move"
    },
    {
        name: "删除",
        code: "delete"
    }
]

export const RIGHT_CONTEXT_MENU_OPERATION = [
    // {
    //     name: "在上方新增",
    //     code: "create-up"
    // },
    {
        name: "在下方新增",
        code: "create-down"
    },
    {
        name: "删除",
        code: "delete"
    },
    {
        name: "重命名",
        code: "rename"
    },
    {
        name: "上移",
        code: "move-up"
    },
    {
        name: "下移",
        code: "move-down"
    }
]

export const RIGHT_CONTEXT_MY_SHARE = [
    {
        name: "查看",
        code: "open"
    },
    {
        name: "修改共享",
        code: "modify"
    },
    {
        name: "取消共享",
        code: "cancel"
    },
    {
        name: "强制撤回",
        code: "recall"
    }
]

export const RIGHT_CONTEXT_MY_SHARE_EXPIRE = [
    {
        name: "查看",
        code: "open"
    },
    {
        name: "删除",
        code: "delete"
    }
]

export const RIGHT_CONTEXT_OTHER_SHARE = [
    {
        name: "下载",
        code: "download"
    },
    {
        name: "转存",
        code: "restore"
    }
]

export const FOLDER_TREE_CONTEXT = [
    {
        name: "新建文件夹",
        code: "create",
        icon: 'fa fa-folder-plus'
    },
    {
        name: "重命名",
        code: "rename",
        icon: 'fa fa-eraser'
    },
    {
        name: "删除",
        code: "delete",
        icon: 'fa fa-trash'
    }
]
export const ROOT_FOLDER_CONTEXT = [
    {
        name: "新建文件夹",
        code: "create",
        icon: 'fa fa-folder-plus'
    }
]

export const DOWNLOAD_NUM = [
    { label: '1次', value: 1 },
    { label: '3次', value: 3 },
    { label: '5次', value: 5 },
    { label: '10次', value: 10 },
    { label: '无限制', value: -1 },
]

export const THEME_OPTIONS = [
    {
        name: 'default',
        '--main-color': '#06a7ff',
        '--hover-color': '#38b9ff',
        '--light-color': '#38b9ff',
        '--split-color': '#dedede6b',
        '--menu-item-color': '#fff',
        '--menu-item-hover': '#f0f0f0',
        '--menu-active_text_color': '#06a7ff',
        '--menu-active_bg_color': '#d4f0ff',

    },
    {
        name: 'dark',
        '--main-color': '#181811',
        '--hover-color': '#6c6c66',
        '--light-color': '#b3b3b3',
        '--split-color': '#dedede6b',
        '--menu-item-color': '#fff',
        '--menu-item-hover': '#f0f0f0',
        '--menu-active_text_color': '#000',
        '--menu-active_bg_color': '#b3b3b3',
    },
    {
        name: 'green',
        '--main-color': '#223511',
        '--hover-color': '#558844',
        '--light-color': '#88bd99',
        '--split-color': '#dedede6b',
        '--menu-item-color': '#fff',
        '--menu-item-hover': '#f0f0f0',
        '--menu-active_text_color': '#113511',
        '--menu-active_bg_color': '#88bd99',
    },
]

export const THEME_SKINS = [
    {value: '1', label: '默认皮肤', color: '#06a7ff', name: 'default'},
    {value: '2', label: '军绿色', color: '#223511', name: 'green'},
    {value: '3', label: '暗黑色', color: '#181818', name: 'dark'},
]
