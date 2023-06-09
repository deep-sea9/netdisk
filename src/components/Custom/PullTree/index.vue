<template>
    <div class="root">
        <el-select v-model="selectShowLabel" @blur="handleBlur" @change="changeHandle" :clearable="clearable" @clear="clear" @remove-tag="removeTag" :placeholder="placeholder" multiple :collapse-tags="collapseTags">
            <el-option style="margin: 5px;height: 240px;overflow-y: auto" value="">
<!--                <el-input size="small" prefix-icon="el-icon-search" clearable placeholder="请输入关键字查找" v-model="filterText" />-->
                <el-tree ref="tree" @check-change="checkChange" :load="loadNode" lazy show-checkbox :node-key="defaultProps.value" :props="defaultProps" :filter-node-method="filterNode"></el-tree>
            </el-option>
        </el-select>
    </div>
</template>

<script>

    import { getFirstLayerOrg, getOrgById, getUsersById } from '@/api/common.js'

    export default {
        name: "pull-tree",
        model: {
            prop: 'checkedArray',
            event: 'change-checked'
        },
        props: {
            checkedArray: { type: Array, default: () => []},
            // treeData: { type: Array, required: true, default: () => [] },
            nodeConfig: {
                type: Object,
                default: () => {
                    return {
                        label: 'label',
                        value: 'value',
                        children: 'children'
                    }
                }
            },
            collapseTags: { type: Boolean, default: false },
            clearable: { type: Boolean, default: true },
            placeholder: { type: String, default: '请选择' }
        },
        data() {
            return {
                selectShowLabel: '',
                filterText: ''
            }
        },
        methods: {
            loadNode(node, resolve) {
                if(node.level === 0) {
                    getFirstLayerOrg().then(res => {
                        return resolve([{ ...res.data, disabled: true }])
                    })
                }else {
                    if(node.data.childCount === 0) {
                        getUsersById(node.key).then(res => {
                            return resolve(res.data.map(org => ({...org, isLeaf: true})))
                        })
                    }else {
                        getOrgById(node.key).then(res => {
                            return resolve(res.data.map(org => ({...org, disabled: true})))
                        })
                    }

                }
            },
            clear() {
                this.$refs.tree.setCheckedKeys([])
            },
            removeTag(label) {
                let selectedValueArray = this.getCheckedNodes().filter(o => o[this.defaultProps.label] != label).map(o => o[this.defaultProps.value])

                let removeNode = this.$refs.tree.getCheckedNodes(true).filter(o => o[this.defaultProps.label] == label)

                removeNode.forEach(o => {
                    this.$refs.tree.setChecked(o, false, true)
                })

                this.$emit('change-checked', selectedValueArray)
            },
            filterNode(value, data) {
                if(!value) return true;
                return data[this.defaultProps.label].indexOf(value) !== -1
            },
            getCheckedNodes() {
                let onlyLeaf = true

                return this.$refs.tree.getCheckedNodes(onlyLeaf).map(node => ({ [this.defaultProps.label]: node[this.defaultProps.label], [this.defaultProps.value]: node[this.defaultProps.value] }))
            },
            async setCheckedNodes(selectedArray) {
                if(!selectedArray || selectedArray.length === 0) {
                    this.clear()

                    let sa = this.getCheckedNodes()

                    this.selectShowLabel = sa.map(node => node[this.defaultProps.label])
                    return;
                }

                this.$nextTick(() => {
                    this.$refs.tree.setCheckedKeys(selectedArray)

                    let sa = this.getCheckedNodes()

                    this.selectShowLabel = sa.map(node => node[this.defaultProps.label])
                })
            },
            checkChange() {
                let selectedArray = this.getCheckedNodes()

                this.selectShowLabel = selectedArray.map(node => node[this.defaultProps.label])

                let selectValueArray = selectedArray.map(node => node[this.defaultProps.value])
                this.$emit('change-checked', selectValueArray)
            },
            dispatch(componentName, eventName, params) {
                var parent = this.$parent || this.$root;
                var name = parent.$options.componentName;

                while(parent && (!name || name !== componentName)) {
                    parent = parent.$parent;

                    if(parent) {
                        name = parent.$options.componentName
                    }
                }

                if(parent) {
                    parent.$emit.apply(parent, [eventName].concat(params))
                }
            },
            handleBlur(val) {
                this.$emit('blur', val.target.value)
                this.dispatch('ElFormItem', 'el.form.blur', [this.checkedArray])
            },
            changeHandle() {
                this.dispatch('ElFormItem', 'el.form.change', [this.checkedArray])
            }
        },
        watch: {
            checkedArray: {
                handler(val) {
                    // if(val && val.length > 0) {
                    //     this.setCheckedNodes(val)
                    // }
                    this.setCheckedNodes(val)
                }
            },
            filterText(val) {
                this.$refs.tree.filter(val)
            }
        },
        computed: {
            defaultProps() {
                return Object.assign({
                    label: 'label',
                    value: 'value',
                    children: 'children',
                    isLeaf: 'isLeaf'
                }, this.nodeConfig)
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
