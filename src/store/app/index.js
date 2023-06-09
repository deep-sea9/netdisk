export default {
	namespaced: true,
	state: {
		isGrid: {},
		publicAndGroupIsGrid: {},
		WSFTP: false,
		wsFTPConnectionCount: 0,
		lastDisk: 'W',
		ws: null,
		globalGrid: false,
		globalPageSize: 50,
		windowStatus: 'restore',
		fileDefaultSort: {
			prop: 'updateTime',
			order: 'descending'
		},
		isDesktop: !!window.globalAPI
	},
	mutations: {
		SET_IS_GRID(state, data) {
			state.isGrid = { ...state.isGrid, ...data }
			localStorage.setItem('isGrid', JSON.stringify(state.isGrid))
		},
		SET_GLOBAL_GRID(state, globalGrid) {
			state.globalGrid = globalGrid
			localStorage.setItem('isGridOfGlobal', JSON.stringify(state.globalGrid))
		},
		SET_PUBLIC_AND_GROUP_IS_GRID(state, data) {
			state.publicAndGroupIsGrid = { ...state.publicAndGroupIsGrid, ...data }
			localStorage.setItem('publicAndGroupIsGrid', JSON.stringify(state.publicAndGroupIsGrid))
		},
		SET_GLOBAL_PAGE_SIZE(state, pageSize) {
			state.globalPageSize = pageSize
			localStorage.setItem('globalPageSize', state.globalPageSize)
		},
		SET_FILE_DEFAULT_SORT(state, defaultSort) {
			state.fileDefaultSort = defaultSort
			localStorage.setItem('default-sort', JSON.stringify(defaultSort))
		},
		SET_WSFTP(state, data) {
			state.WSFTP = data
		},
		SET_WS_FTP_CONNECTION_COUNT(state, data) {
			state.wsFTPConnectionCount = data
		},
		SET_LAST_DISK(state, data) {
			state.lastDisk = data
		},
		SET_WS_INSTANCE(state, data) {
			state.ws = data
		},
		SET_WINDOW_STATUS(state, data) {
			state.windowStatus = data
		}
	}
}
