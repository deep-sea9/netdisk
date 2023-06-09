<template>
    <el-dialog :title="title? title: '同步到'" :visible.sync="visible" width="40%" close-on-click-modal>
        <div class="b-move-body">
			<el-tabs v-model="activeTab">
				<el-tab-pane lazy v-if="diskType !== personalDiskId" label="个人网盘" :name="personalDiskId">
					<el-input size="small" v-model="searchKey" placeholder="输入关键字查询文件目录" @input="filterData" />
					<el-tree check-strictly :ref="personalDiskId" show-checkbox lazy :load="loadMore" :props="defaultProps" node-key="id" :filter-node-method="filterNode" @node-click="handleNodeClick" @check="handleCheckClick"></el-tree>
				</el-tab-pane>
				<el-tab-pane v-if="diskType !== publicDiskId" label="公共网盘" :name="publicDiskId">
					<el-input size="small" v-model="searchPublic" placeholder="输入关键字查询文件目录" @input="filterData" />
					<el-tree check-strictly :ref="publicDiskId" show-checkbox lazy :load="loadMore" :props="defaultProps" node-key="id" :filter-node-method="filterNode" @node-click="handleNodeClick" @check="handleCheckClick"></el-tree>
				</el-tab-pane>
				<el-tab-pane lazy v-if="diskType !== groupDiskId" label="群组网盘" :name="groupDiskId">
					<el-input size="small" v-model="searchGroup" placeholder="输入关键字查询文件目录" @input="filterData" />
					<el-tree  check-strictly :ref="groupDiskId" show-checkbox lazy :load="loadMore" :props="defaultProps" node-key="id" :filter-node-method="filterNode" @node-click="handleNodeClick" @check="handleCheckClick"></el-tree>
				</el-tab-pane>
			</el-tabs>
		</div>
        <span slot="footer">
			<el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
			<el-button size="small" @click="visible = false">取消</el-button>
		</span>
    </el-dialog>
</template>
<script>
    import {getFoldList} from '@/api/common.js'
    import { PERSON_DISK_ID, PUBLIC_DISK_ID, GROUP_DISK_ID } from '@/utils/constants.js'
    export default {
        name: 'b-sync-file',
        props: {
            multiple: {type: Boolean, default: false},
            title: {type: String},
			diskType: { type: String, default: PERSON_DISK_ID}
        },
        data() {
            return {
                searchKey: '',
				searchPublic: '',
				searchGroup: '',
                defaultProps: {
                    children: 'children',
                    label: 'folderName',
                },
				activeTab: PUBLIC_DISK_ID,
				personalDiskId: PERSON_DISK_ID,
				publicDiskId: PUBLIC_DISK_ID,
				groupDiskId: GROUP_DISK_ID
            }
        },
        methods: {
			filterData(v) {
				this.$refs[this.activeTab].filter(v)
			},
            handleNodeClick(data) {
                if (this.multiple) {
                	const treeInstance = this.$refs[this.activeTab]
                    const selects = treeInstance.getCheckedKeys()
                    if (selects.indexOf(data.id) > -1) {
						treeInstance.setChecked(data.id, false)
                    } else {
						treeInstance.setChecked(data.id, true)
                    }

                } else {
					this.$refs[this.activeTab].setCheckedKeys([data.id], true)
                }
            },
            handleCheckClick(data) {
                if (this.multiple) return
                this.$refs[this.activeTab].setCheckedKeys([data.id], true)
            },
            loadMore(node, resolve) {
				if(this.activeTab === PUBLIC_DISK_ID) {
					if (node.level === 0) {
						this.$nextTick(() => {
							node.childNodes[0].expanded = true
							node.childNodes[0].loadData()
						})
						const rootFolder = this.publicDiskList.filter(p => p.diskAuth === '2').map(p => ({ ...p, folderName: p.name }))
						return resolve(rootFolder)
					}

					getFoldList({diskId: node.data.diskAuth? node.data.id : undefined, id: node.data.diskAuth? undefined : (node.data.id === '0' ? undefined : node.data.id)}).then(res => {
						resolve(res.data)
					})
				}else if(this.activeTab === GROUP_DISK_ID) {
					if (node.level === 0) {
						this.$nextTick(() => {
							node.childNodes[0].expanded = true
						})
						// const rootFolder = this.groupMenus
						return resolve(this.groupMenus)
					}else if(node.level === 1) {
						this.$nextTick(() => {
							if(node.childNodes[0]) {
								node.childNodes[0].expanded = true
								node.childNodes[0].loadData()
							}
						})

						return resolve(node.data.children)
					}

					getFoldList({diskId: node.data.diskAuth? node.data.id : undefined, id: node.data.diskAuth? undefined : (node.data.id === '0' ? undefined : node.data.id)}).then(res => {
						resolve(res.data)
					})
				}else {
					if (node.level === 0) {
						this.$nextTick(() => {
							node.childNodes[0].expanded = true
							node.childNodes[0].loadData()
						})
						return resolve([{folderName: '根目录', id: '0'}])// 不设置id，单选有问题
					}

					getFoldList({id: node.data.id === '0' ? undefined : node.data.id}).then(res => {
						resolve(res.data)
					})

				}

            },
            filterNode(value, data) {
                if (!value) return true;
                return data.folderName.indexOf(value) !== -1;
            },
            handleConfirm() {
                const selections = this.$refs[this.activeTab].getCheckedNodes()
				this.$emit('confirm', selections, this.activeTab)

            }
        },
        computed: {
            visible: {
                get() {
                    return this.$attrs.visible
                },
                set(value) {
                    this.$emit('update:visible', value)
                },
            },
			publicDiskList() {
            	return this.$store.state.navigation.publicMenus
			},
			groupMenus() {
            	let groupMenus = this.$store.state.navigation.groupMenus
            	groupMenus.forEach(g => {
					g.children = g.child
					g.folderName = g.name
					if(!g.id) {
						g.id = 'null'
					}
					g.disabled = true
					g.children.filter(d => d.diskAuth === '2').forEach(d => {
						d.folderName = d.name
					})
				})
				return groupMenus
			}
        },
		watch: {
        	diskType: {
        		immediate: true,
        		handler(v) {
					if(v === '2') {
						this.activeTab = '1'
					}
				}

			}
		}
    }
</script>
