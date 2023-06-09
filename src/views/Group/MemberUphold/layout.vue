<template>
	<div class="page-layout">
<!--		<b-menu :menus="groupUpholdRoutes" :default-openeds="defaultOpeneds" unique-opened></b-tree-menu>-->

		<b-tree-menu
				:menus="groupUpholdRoutes"
				:default-expanded-keys="defaultOpeneds"
				:current-node-key="currentNodeKey"
				@create-disk="handleCreateDisk"
				@create-up="handleCreateUp"
				@create-down="handleCreateUp"
				@move-up="handleMove"
				@move-down="handleMove"
				@delete="handleDelete"
				@rename="handleRename"
				@create-group="handleCreateGroup"
				@node-drop="handleDrop"
				:allow-drop="allowDrop"
				:allow-drag="allowDrag"
		></b-tree-menu>
		<div class="page-layout-main">
			<router-view :key="$route.path" />
		</div>
	</div>
</template>
<script>

import {mapGetters} from "vuex";
import { setGroupDiskConfig, saveGroupName, dismissGroupDisk, deleteGroupById, dragSortDisk, dragSortGroup } from '@/api/admin/group'
import { findFirstHasChildObj } from '@/utils/index.js'
export default {
	name: 'member-uphold-layout',
	data() {
		return {
			fromRouteName: ''
		}
	},
	provide() {
		return {
			fromRoute: this.$route.params.routeName
		}
	},
	computed: {
		...mapGetters(['groupUpholdRoutes', 'userId']),
		currentDiskId() {
			return this.$route.meta.diskId
		},
		currentGroup() {
			const groupIdOfRoute = this.$route.fullPath.split('/')[3]
			return this.groupUpholdRoutes.find(group => String(group.meta.groupId) === groupIdOfRoute)
		},
		currentDisk() {
			return this.currentGroup.children.find(disk => disk.id === this.currentDiskId)
		},
		defaultOpeneds() {
			// const targetObj = findFirstHasChildObj(this.groupUpholdRoutes)
			// return targetObj? [targetObj.children[0].name]: []
			return ['group-disk-uphold-' + this.currentDiskId]
		},
		currentNodeKey() {
			// const targetObj = findFirstHasChildObj(this.groupUpholdRoutes)
			// return targetObj? targetObj.children[0].name : undefined
			return 'group-disk-uphold-' + this.currentDiskId
		}
	},
	mounted() {
		// console.log('groupUpholdRoutes', this.groupUpholdRoutes, this.$route);
		// console.log('route params', this.$route.params);
		// this.fromRouteName = this.$route.params.routeName
	},
	methods: {

		handleCreateDisk(data) {
			const groupId = data.name.split('-')[1]
			// this.$prompt('请输入网盘名称', '提示').then(({ value }) => {
			// 	setGroupDiskConfig({ name: value, groupId, allocateSpace: 10*1024*1024*1024 }).then(res => {
			// 		this.$message.success(res.message || '创建成功！')
			// 		this.$store.dispatch('registryGroupRoute')
			// 	})
			// }).catch(() => {})
			this.$router.push({
				name: 'group-disk-create',
				params: { groupId, from: this.$route.fullPath }
			})
		},
		handleCreateUp(data) {
			console.log(data);

			if(!data.children) {
				this.$prompt('请输入网盘名称', '提示').then(({ value }) => {
					setGroupDiskConfig({ name: value, groupId: data.groupId, allocateSpace: 10*1024*1024*1024 }).then(res => {
						this.$message.success(res.message || '创建成功！')
						this.$store.dispatch('registryGroupRoute')
					})
				}).catch(() => {})
			}else {
				this.handleCreateGroup()
			}
		},
		moveDisk(data, operation) {
			if(data.groupId === null) {
				this.$message.warning('默认群组中的网盘不支持排序，您可以将默认分组中的网盘拖拽到别的分组或者将别的分组网盘拖拽到默认分组')
				return
			}

			const currentGroup = this.groupUpholdRoutes.find(g => g.meta.groupId === data.groupId)
			const allChildOfCurrent = currentGroup.children || []

			if(allChildOfCurrent.length === 0 || allChildOfCurrent === 1) {
				this.$message.warning('请先新建新网盘！')
			}else {
				const currentDiskIndex = allChildOfCurrent.findIndex(d => d.id === data.id)
				const formData = new FormData()

				if(operation.code === 'move-up') {
					if(currentDiskIndex === 0) {
						this.$message.warning('已处于第一个！')
					}else {
						let preDisk = allChildOfCurrent[currentDiskIndex - 1]
						formData.append('id', currentDiskIndex.id)
						formData.append('place', 'before')
						formData.append('groupId', currentDiskIndex.groupId)
						formData.append('newSort', preDisk.sequence === null ? '': preDisk.sequence)

						dragSortDisk(formData).then((res) => {
							this.$store.dispatch('registryGroupRoute')
						})
					}
				}else {
					if(currentDiskIndex === allChildOfCurrent.length - 1) {
						this.$message.warning('已处于最后一个')
					}else {
						let nextDisk = allChildOfCurrent[currentDiskIndex + 1]
						formData.append('id', currentDiskIndex.id)
						formData.append('place', 'after')
						formData.append('groupId', currentDiskIndex.groupId)
						formData.append('newSort', nextDisk.sequence === null ? '': nextDisk.sequence)

						dragSortDisk(formData).then((res) => {
							this.$store.dispatch('registryGroupRoute')
						})
					}
				}
			}
		},
		moveGroup(data, operation) {
			if(this.groupUpholdRoutes.length === 1) {
				this.$message.warning('请先创建新网盘')
				return
			}

			const currentGroupIndex = this.groupUpholdRoutes.findIndex(g => g.meta.groupId === data.meta.groupId)
			const formData = new FormData()

			if(operation.code === 'move-up') {
				if(currentGroupIndex === 0) {
					this.$message.warning('已处于第一个')
				}else {
					const preGroup = this.groupUpholdRoutes[currentGroupIndex - 1]

					formData.append('id', data.meta.groupId === null ? '': data.meta.groupId)
					formData.append('groupId', data.meta.groupId === null ? '' : data.meta.groupId)
					formData.append('place', 'before')
					formData.append('newSort', preGroup.meta.sequence)
					dragSortGroup(formData).then((res) => {
						this.$store.dispatch('registryGroupRoute')
					})
				}
			}else {
				if(currentGroupIndex === this.groupUpholdRoutes.length - 1) {
					this.$message.warning('已处于最后一个')
				}else {
					const nextGroup = this.groupUpholdRoutes[currentGroupIndex + 1]

					formData.append('id', data.meta.groupId === null ? '': data.meta.groupId)
					formData.append('groupId', data.meta.groupId === null ? '' : data.meta.groupId)
					formData.append('place', 'after')
					formData.append('newSort', nextGroup.meta.sequence)
					dragSortGroup(formData).then((res) => {
						this.$store.dispatch('registryGroupRoute')
					})
				}
			}
		},
		handleMove(data, operation) {
			if(!data.children) {
				this.moveDisk(data, operation)
			}else {
				this.moveGroup(data, operation)
			}
		},
		handleDelete(data) {
			if(!data.children) {
				if(this.userId !== data.userId) {
					this.$message.warning('您不是该网盘创建人，无法删除！')
				}else {
					this.$confirm('确认删除该网盘吗？').then(res => {
						if(res) {
							const formData = new FormData()
							formData.append('ids', [data.id])
							dismissGroupDisk(formData).then(result => {
								this.$store.dispatch('registryGroupRoute')
								this.$message.success(result.message || '删除成功！')
							})
						}
					})
				}
			}else {
				if(data.children.some(groupDisk => groupDisk.userId !== this.userId)) {
					this.$message.warning('该分组下存在不属于您创建的网盘，暂时无法删除，请移出后再尝试...')
					return
				}
				const groupId = data.name.split('-')[1]
				this.$confirm('确认删除该分组吗？删除分组后，该分组下的网盘也将删除').then(res => {
					if(res) {
						const formData = new FormData()
						formData.append('id', groupId)
						deleteGroupById(formData).then(result => {
							this.$message.success(result.message || '删除成功！')
							// location.reload()
							this.$store.dispatch('registryGroupRoute')
						})
					}
				})
			}
		},
		handleRename(data) {
			if(data.children) {
				const groupId = data.name.split('-')[1]
				this.$prompt('请输入群组名称', '提示', { inputPlaceholder: data.meta.title }).then(({ value }) => {
					saveGroupName({ name: value, id: groupId }).then(res => {
						this.$message.success(res.message || '修改成功！')
						this.$store.dispatch('registryGroupRoute')
					})
				}).catch(() => {})
			}else {
				this.$prompt('请输入网盘名称', '提示', { inputPlaceholder: data.meta.title }).then(({ value }) => {
					setGroupDiskConfig({ name: value, id: data.id }).then(res => {
						this.$message.success(res.message || '修改成功！')
						this.$store.dispatch('registryGroupRoute')
					})
				}).catch(() => {})
			}
		},
		handleCreateGroup() {
			this.$prompt('请输入群组名称', '提示', { inputPlaceholder: '请输入群组名称' }).then(({ value }) => {
				saveGroupName({ name: value }).then(res => {
					this.$message.success(res.message || '创建成功！')
					this.$store.dispatch('registryGroupRoute')
				})
			}).catch(() => {})
		},
		handleDragStart(node, e) {
			console.log(node, e);
		},
		handleDrop(node, endNode, place, e) {
			console.log(node, endNode, place, e);
			const formData = new FormData()

			// 拖得是网盘
			if(node.data.groupId || node.data.groupId === null) {
				// 放置的节点是网盘
				if(endNode.data.groupId) {
					formData.append('groupId', endNode.data.groupId + '')
					formData.append('newSort', endNode.data.sort)
				} else if(endNode.data.groupId === null) { // 默认群组
					formData.append('newSort', endNode.data.sort === null ? '' : endNode.data.sort)
				}else {
					// 放置的是网盘
					formData.append('groupId', endNode.data.meta.groupId === null ? '' : endNode.data.meta.groupId)
					formData.append('newSort', endNode.data.meta.sequence === null ? '': endNode.data.meta.sequence)
				}
				formData.append('id', node.data.id)
				formData.append('place', place)

				if(node.data.groupId === null && endNode.data.groupId === null) {
					this.$message.warning('默认群组中的网盘不支持拖拽排序，您可以将默认分组中的网盘拖拽到别的分组或者将别的分组网盘拖拽到默认分组')
					return
				}

				dragSortDisk(formData).then((res) => {
					console.log(res);
					this.$store.dispatch('registryGroupRoute')
				})
			}else {
				formData.append('id', node.data.meta.groupId === null ? '': node.data.meta.groupId)
				formData.append('groupId', node.data.meta.groupId === null ? '' : node.data.meta.groupId)
				formData.append('place', place)
				formData.append('newSort', endNode.data.meta.sequence)
				dragSortGroup(formData).then((res) => {
					console.log(res);
					this.$store.dispatch('registryGroupRoute')
				})
			}
		},
		allowDrop(draggingNode, dropNode, type) {
			// 判断拖的是网盘
			if(draggingNode.data.groupId || draggingNode.data.groupId === null) {
				if(type === 'inner') {
					return !dropNode.data.groupId && dropNode.data.groupId !== null
				}else {
					return !!dropNode.data.groupId || dropNode.data.groupId === null
				}
			}else {
				// 群组只有不能嵌套拖拽一个限制，即只能平级拖
				return type !== 'inner' && !dropNode.data.groupId;
			}
		},
		allowDrag(node) {
			return node.data.meta.groupId !== null
		}
	},
}
</script>
<style lang="scss" scoped>
.page-layout {
	width: 100%;
	height: 100%;
	display: flex;

	.page-layout-main {
		width:calc(100vw - 200px);
		background-color: #fff;
		// padding: 10px 20px;
		box-sizing: border-box;
	}
}
</style>
