export default {
	namespaced: true,
	state: {
		uploadingList: [],
		historyDownloadList: [],
		downloadingList: [],
		uploader: null
	},
	mutations: {
		SET_UPLOADER(state, uploader) {
			state.uploader = uploader
		},
		SET_UPLOADING_LIST(state, data) {
			state.uploadingList = data
		},
		SET_DOWNLOADING_LIST(state, data) {
			state.downloadingList = data
		}
	},
	actions: {
		setDownloadingList({commit}, data) {
			// 暂时只显示等待中、下载中、失败
			// let resultList = data.filter(item => item.status !== 'success')
			// console.log(resultList);
			commit("SET_DOWNLOADING_LIST", data)
		}
	}
}
