// import { store } from '@/components/Base/B-Files/store'
// import fetchFileIcon from '@/utils/fetchFileIcon.js'
const fileItemMixins = {
	// props: {
	// 	file: {
	// 		type: Object,
	// 		required: true,
	// 	},
	// },
	data() {
		return {
			checked: false,
		}
	},
	// computed: {
	// 	selection() {
	// 		return store.selection
	// 	},
	// },
	methods: {
	
		onContextmenu(event) {
			this.$contextmenu({
				items: [
					{
						icon: 'far fa-folder-open',
						label: '打开(B)',
						onClick: () => {},
					},
					{ icon: 'far fa-arrow-alt-from-top', label: '下载', onClick: () => {} },
					{ icon: 'far fa-share-alt', label: '分享', onClick: () => {} },
					{ icon: 'far fa-clone', label: '复制到', onClick: () => {} },
					{ icon: 'far fa-expand-arrows', label: '移动到', onClick: () => {} },
					{ icon: 'fas fa-eraser', label: '重命名', onClick: () => {} },
					{ icon: 'far fa-trash-alt', label: '删除', onClick: () => {} },
				],
				event,
				customClass: 'class-a',
				zIndex: 3,
				minWidth: 120,
			})
			return false
		},
	},

	// watch: {
	// 	selection: {
	// 		deep: true,
	// 		immediate: true,
	// 		handler(selection) {
	// 			const checked = selection.some(cur => cur.id === this.file.id)
	// 			this.checked = checked
	// 		},
	// 	},
	// },
}

export default fileItemMixins
