<template>
	<el-dialog :title="title? title: (move? '移动到': '复制到')" :visible.sync="visible" width="40%" close-on-click-modal destroy-on-close>
		<div class="b-move-body">
			<el-input v-model="searchKey" placeholder="输入关键字查询文件目录" />
			<el-tree check-strictly ref="folds" show-checkbox lazy :load="loadMore" :props="defaultProps" node-key="id" :filter-node-method="filterNode" @node-click="handleNodeClick" @check="handleCheckClick"></el-tree>
		</div>
		<span slot="footer">
			<el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
			<el-button size="small" @click="visible = false">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
	import { getFoldList } from '@/api/common.js'
	// import { PERSON_DISK_ID, PERSON_ROOT_FOLD_ID } from '@/utils/constants.js'
export default {
	name: 'b-move',
	props: {
		multiple: { type: Boolean, default: false },
		move: { type: Boolean, default: true },
		diskId: { type: String },
		title: { type: String ,default: '' }
	},
	data() {
		return {
			searchKey: '',
			defaultProps: {
				children: 'children',
				label: 'folderName',
			},
		}
	},
	methods: {
		handleNodeClick(data) {
			if(this.multiple) {
				const selects = this.$refs['folds'].getCheckedKeys()
				if(selects.indexOf(data.id) > -1) {
					this.$refs['folds'].setChecked(data.id, false)
				}else {
					this.$refs['folds'].setChecked(data.id, true)
				}

			}else {
				this.$refs['folds'].setCheckedKeys([data.id], true)
			}
		},
		handleCheckClick(data) {
			if(this.multiple) return
			this.$refs['folds'].setCheckedKeys([data.id], true)
		},
		loadMore(node, resolve) {
			if(node.level === 0) {
				this.$nextTick(() => {
					node.childNodes[0].expanded = true
					node.childNodes[0].loadData()
				})
				return resolve([{ folderName: '根目录', id: '0' }]) // 不设置id，单选有问题
			}
			getFoldList({ diskId: this.diskId, id: node.data.id === '0'? undefined: node.data.id }).then(res => {
				resolve(res.data)
			})
		},
		filterNode(value, data) {
			if(!value) return true;
			return data.folderName.indexOf(value) !== -1;
		},
		handleConfirm() {
			const selections = this.$refs['folds'].getCheckedNodes()
            if(selections.length === 0) {
                this.$message.warning('请选择一个目录')
                return
            }
			this.$emit('confirm', selections[0].id === '0'? [{ folderName: '根目录', id: undefined }] : selections)
		}
	},
	watch: {
		searchKey(val) {
			this.$refs.folds.filter(val)
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
	},
}
</script>
<style lang="scss">
.b-move-body{
    padding: 20px;
    .el-tree{
        background-color: transparent;
    }
}
</style>
