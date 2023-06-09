<template>
    <div class="b-staff-transfer scrollbar">
        <div class="b-staff-transfer-part staff-transfer-left">
<!--            <div style="padding: 5px;position: absolute;top: 0;">-->
<!--                <el-input size="mini" v-model="searchKey" placeholder="请输入关键字进行过滤" />-->
<!--            </div>-->
            <el-tree
                    style="height: 100%;overflow: auto"
                    ref="userTree"
                    show-checkbox
                    node-key="id"
                    :props="defaultProps"
                    :lazy="lazy"
                    @check="add2Right"
                    :filter-node-method="filterNode"
                    :load="loadData"
            ></el-tree>
        </div>
        <div class="b-staff-transfer-icon">
            <i class="far fa-chevron-right" />
        </div>
        <ul class="b-staff-transfer-part staff-transfer-right scrollbar">
            <el-button v-if="rightList.length >= 9" type="text" style="color: darkred;position: absolute;right: 0;" size="mini" @click="clearAll">清除全部({{ rightList.length }}个) <i class="el-icon-delete" /></el-button>
            <div :class="{ 'user-list':  rightList.length >= 9}">
                <li v-for="user in rightList" :key="user.id">
                    <!--                <i class="far fa-plus" @click="handleRemove(user)" />-->
                    <span>{{ user.alias }}</span>
                    <i class="el-icon-delete" @click="handleRemove(user)" />
                </li>
            </div>
        </ul>
    </div>
</template>
<script>
    import { getFirstLayerOrg, getOrgById, getUsersById, getStaffTree } from '@/api/common.js'
    export default {
        name: 'department-transfer',
        props: {
            data: {
                type: Array,
                default: () => [],
            },
            lazy: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                defaultProps: {
                    label: 'alias',
                    value: 'id',
                    children: 'children',
                    isLeaf: 'isLeaf'
                },
                rightList: [],
                searchKey: '',
                staffData: [],
                loadingUser: false
            }
        },
        watch: {
            searchKey(v) {
                this.$refs['userTree'].filter(v)
            }
        },
        mounted() {

        },
        methods: {
            filterNode(value, data) {
                if(!value) return true;
                return data.alias.indexOf(value) !== -1
            },
            loadData(node, resolve) {
                if(node.level === 0) {
                    getFirstLayerOrg().then(res => {
                        resolve([{ ...res.data, disabled: true }])
                    })
                }else {
                    getOrgById(node.key).then(res => {
                        resolve(res.data.map(org => ({...org, isLeaf: org.childCount === 0, disabled: org.childCount !== 0})))
                    })
                }
            },
            add2Right() {
                this.rightList = this.$refs['userTree'].getCheckedNodes(true)
                this.rightList = [...new Set(this.rightList)]
            },
            clearAll() {
                if(this.rightList.length > 0) {
                    this.rightList = []
                    this.$refs['userTree'].setCheckedNodes(this.rightList)
                }
            },
            handleRemove(currentRemove) {
                this.rightList.splice(this.rightList.findIndex(user => user.id === currentRemove.id), 1)
                this.$refs['userTree'].setCheckedNodes(this.rightList)
            },
            getRightData() {
                return this.rightList
            },
            setRightDataByKeys(keys, nodes) {
                this.$refs['userTree'].setCheckedKeys(keys)
                this.rightList = nodes
            }
        }
    }
</script>
<style lang="scss">
    .b-staff-transfer {
        width: 100%;
        display: flex;
        min-height: 320px;
        height: 50%;

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
            position: relative;
            width: calc((100% - 40px) / 2);
            height: 100%;
            overflow: auto;
            border: 1px solid #dedede;
            // padding: 4px;
            background-color: #fff;

            .user-list {
                margin-top: 30px;
                height: calc(100% - 30px);
                overflow: auto
            }
        }

        .staff-transfer-right {
            // padding: 10px;
            li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                line-height: 30px;
                border-bottom: 1px solid #dedede;
                padding: 0 10px;
                &:hover {
                    i {
                        display: flex;
                    }
                }

                i {
                    width: 14px;
                    height: 14px;
                    /*background-color: #f46c3c;*/
                    color: #aaa;
                    border-radius: 50%;
                    /*display: flex;*/
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    margin-right: 6px;
                    /*transform: rotate(45deg);*/
                    cursor: pointer;
                    display: none;
                }
            }
        }
    }
</style>
