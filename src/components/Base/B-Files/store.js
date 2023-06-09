import Vue from 'vue'

// let selectionMap

// function resetMap(selection) {
// 	selectionMap = new Map()
// 	selection.map(cur => {
// 		selectionMap.set(cur.id, cur)
// 	})
// }

export let store = Vue.observable({ selection: [] })

export let mutations = {
	resetSelection(arr) {
		store.selection = JSON.parse(JSON.stringify(arr))
		// resetMap(store.selection)
	},
	addItem(file) {
		const index = store.selection.findIndex(cur => cur.id === file.id)
		if (index < 0) {
			store.selection.push(file)
		}
	},
	removeItem(file) {
		const index = store.selection.findIndex(cur => cur.id === file.id)
		if (index >= 0) {
			store.selection.splice(index, 1)
		}
	},
}
