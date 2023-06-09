import {findFirstHasChildObj} from '@/utils/index.js'

export default {
    namespace: true,
    state: {
        navigation: [{
                title: '个人网盘',
                path: '/personal',
                tag: 'personal',
                icon: require("../../assets/images/personal_menu_icon.png")
            },
            {
                title: '公共网盘',
                path: '/public',
                tag: 'public',
                icon: require("../../assets/images/public_menu_icon.png")
            },
            {
                title: '群组网盘',
                path: '/group',
                tag: 'group',
                icon: require("../../assets/images/group_menu_icon.png")
            },
        ],
        noPublicDisk: false,
        publicMenus: [],
        publicRoutes: [],
        firstHasChildOfPublicRoute: {},
        groupList: [],
        groupMenus: [],
        groupRoutes: [],
        firstHasChildOfGroupRoute: {},
        groupUpholdRoutes: [],
        firstHasChildOfGroupUpholdRoute: {},
        adminPublicRoutes: [],
        logMenus: [],
        logRoutes: []
    },
    mutations: {
        setNavigation(state, data) {
            state.navigation = data
        },
        SET_NO_PUBLIC(state, data) {
            state.noPublicDisk = data
        },
        SET_PUBLIC_MENUS(state, data) {
            state.publicMenus = data
        },
        SET_PUBLIC_ROUTES(state, data) {
            state.publicRoutes = data
            state.firstHasChildOfPublicRoute = findFirstHasChildObj(state.publicRoutes)
        },
        SET_GROUP_LIST(state, data) {
            state.groupList = data
        },
        SET_GROUP_MENUS(state, data) {
            state.groupMenus = data
        },
        SET_GROUP_ROUTES(state, data) {
            state.groupRoutes = data
            state.firstHasChildOfGroupRoute = findFirstHasChildObj(state.groupRoutes)
        },
        SET_GROUP_UPHOLD_ROUTES(state, data) {
            state.groupUpholdRoutes = data
            state.firstHasChildOfGroupUpholdRoute = findFirstHasChildObj(state.groupUpholdRoutes)
        },
        SET_ADMIN_PUBLIC_ROUTES(state, data) {
            state.adminPublicRoutes = data
        },
        SET_LOG_MENUS(state, data) {
            state.logMenus = data
        },
        SET_LOG_ROUTES(state, data) {
            state.logRoutes = data
        },
        CLEAR_ALL_ROUTE_AND_MENUS(state) {
            state.publicMenus = []
            state.publicRoutes = []
            state.groupList = []
            state.groupMenus = []
            state.groupRoutes = []
            state.firstHasChildOfGroupRoute = {}
            state.groupUpholdRoutes = []
            state.firstHasChildOfGroupUpholdRoute = {}
            state.adminPublicRoutes = []
            state.logMenus = []
            state.logRoutes = []
        }
    },
    actions: {},
    getters: {
        navigation: state => state.navigation,
        publicMenus: state => state.publicMenus,
        publicRoutes: state => state.publicRoutes,
        firstHasChildOfPublicRoute: state => state.firstHasChildOfPublicRoute,
        adminPublicRoutes: state => state.adminPublicRoutes,
        groupRoutes: state => state.groupRoutes,
        firstHasChildOfGroupRoute: state => state.firstHasChildOfGroupRoute,
        groupMenus: state => state.groupMenus,
        groupUpholdRoutes: state => state.groupUpholdRoutes,
        firstHasChildOfGroupUpholdRoute: state => state.firstHasChildOfGroupUpholdRoute,
        logMenus: state => state.logMenus,
        logRoutes: state => state.logRoutes
    },
}
