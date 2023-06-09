<template>
	<el-dialog :visible.sync="visible" :title="title">
		<div style="padding: 20px;">
			<div class="b-staff-transfer scrollbar">
				<b-staff-transfer v-if="type === 'user'" ref="staffTrans" style="height:240px"></b-staff-transfer>
				<department-transfer
						v-else
						ref="staffTrans"
						style="height:240px"
						:from_data="fromData"
						:to_data="toData"
						:defaultProps="defaultProps"
						:check-strictly="checkStrictly"
						@add-btn="handleAdd"
						@remove-btn="handleRemove"
						height="540px"
						:lazy="lazy"
						:lazyFn="loadNode"
						filter />
			</div>
		</div>
		<div slot="footer">
			<el-button size="medium" @click="visible=false">取消</el-button>
			<el-button size="medium" type="primary" @click="confirmSelect">确定</el-button>
		</div>
	</el-dialog>

</template>
<script>
	import { getDepartmentTree, getFirstLayerOrg, getOrgById, getUsersById } from '@/api/common.js'
	import DepartmentTransfer from './department-transfer'
export default {
	name: 'b-department-transfer',
	props: {
		data: { type: Array, default: () => [] },
		title: { type: String, default: '部门组织树' },
		lazy: { type: Boolean, default: true },
		selectStaff: { type: Boolean, default: false },
		checkStrictly: { type: Boolean, default: true },
		type: { type: String, default: 'user' }
	},
	components: { DepartmentTransfer },
	data() {
		return {
			fromData: [],
			defaultProps: {
				label: 'displayName',
				value: 'id',
				children: 'children',
				isLeaf: 'isLeaf'
			},
			valueField: null,
			selectDepart: null,
			toData: []
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
	watch: {
		// selectDepart: {
		// 	deep: true,
		// 	handler(val) {
		// 		console.log('selectDepart-chage', val);
		// 	}
		// },
		data: {
			deep: true,
			handler(val) {
				if(Array.isArray(val) && val.length >1) {
					this.fromData = val
				}
			}
		}
	},
	created() {
		if(this.type !== 'user') {
			if(this.data.length > 1) {
				this.fromData = this.data
			}else {
				getDepartmentTree().then(res => {
					this.fromData = res.data
				})
			}
		}
	},
	methods: {
		handleAdd(from , to, obj) {
			console.log(from, to, obj);
		},
		handleRemove(from , to, obj) {
			console.log(from, to, obj);
		},
		confirmSelect() {
			// console.log(this.toData);
			if(this.type === 'user') {
				this.$emit('confirm-select', this.getStaffSelections())
			}else {
				this.$emit('confirm-select', this.getDepartmentSelections())
			}

		},
		loadNode(node, resolve, from) {
			if(from === 'left') {
				if(node.level === 0) {
					getFirstLayerOrg().then(res => {
						resolve([{ ...res.data, disabled: true }])
					})
				}else {
					if(this.selectStaff) {
						if(node.data.childCount === 0) {
							getUsersById(node.key).then(res => {
								return resolve(res.data.map(org => ({...org, isLeaf: true})))
							})
						}else {
							getOrgById(node.key).then(res => {
								return resolve(res.data.map(org => ({...org, disabled: true})))
							})
						}
					}else {
						getOrgById(node.key).then(res => {
							resolve(res.data.map(org => ({...org, isLeaf: org.childCount === 0, disabled: org.childCount !== 0})))
						})
					}
				}
			}
		},
		getStaffSelections() {
			return this.$refs['staffTrans'].getRightData()
		},
		getDepartmentSelections() {
			return this.$refs['staffTrans'].getRightData()
		}
	}
}
</script>
<style lang="scss" scoped>
.b-staff-transfer {
	width: 100%;
	display: flex;
	& > i {
		font-size: 20px;
		color: #555;
		width: 40px;
		height: 40px;
	}
	.el-tree {
		background-color: transparent;
	}
	.b-staff-transfer-icon {
		height: 100%;
		width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		i {
			font-size: 20px;
			color: #bbb;
		}
	}
	.b-staff-transfer-part {
		width: calc((100% - 40px) / 2);
		height: 100%;
		overflow: auto;
		border: 1px solid #dedede;
		// padding: 4px;
		background-color: #fff;
	}
    .staff-transfer-right{
        // padding: 10px;
        li{
            display: flex;
            align-items: center;
            line-height: 30px;
            border-bottom: 1px solid #dedede;
            padding: 0 10px;
            i{
                width: 14px;
                height: 14px;
                background-color: #f46c3c;
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                margin-right: 6px;
                transform: rotate(45deg);
                cursor: pointer;
            }
        }
    }
}
</style>
