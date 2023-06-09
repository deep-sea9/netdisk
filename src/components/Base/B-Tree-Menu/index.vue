<template>
    <div class="b-tree-menu" style="border-right: 1px solid #EBECF2;position: relative;">
        <el-tree
                class="mf-menu"
                :data="menus"
                node-key="name"
                v-bind="$attrs"
                v-on="$listeners"
                draggable
                highlight-current
        >
            <div class="custom-tree-node" slot-scope="{ node, data }">
                <div style="width: 100%;height: 100%;display: flex;align-items: center" @contextmenu="handleRightCLick(data)">
                    <router-link v-contextmenu:contextmenu v-if="node.level === 2" tag="div" style="width: 100%;height: 100%;display: flex;align-items: center" :to="data.path">{{ data.meta.title }}</router-link>
                    <div v-contextmenu:contextmenu v-else-if="node.data.meta.groupId !== null">
                        {{ data.meta.title }}
                    </div>
                    <div v-else>
                        {{ data.meta.title }}
                    </div>
                </div>
                <span v-if="node.level === 1">
                    <el-button circle type="primary" size="mini" @click.stop="createDisk(data)">
                        <i class="el-icon-plus" style="font-size: 16px;" />
                    </el-button>
                </span>
            </div>
        </el-tree>

        <v-contextmenu ref="contextmenu" v-loading="fileLimitsLoading">
            <v-contextmenu-item
                    v-for="operation in menuOperations"
                    :key="operation.code"
                    @click.native="$emit(operation.code, menuTarget, operation)"
            >
                <i :class="iconType(operation.code)" style="width: 13px;"></i>
                <span>{{ operation.name }}</span>
            </v-contextmenu-item>
        </v-contextmenu>

        <div class="add-group">
            <el-button circle icon="el-icon-folder-add" style="font-size: 16px;" type="primary" size="small" @click="$emit('create-group')"></el-button>
        </div>

        <div class="space-info">
            <div class="info progress-info">
                <div class="progress" :style="{
                    backgroundColor: '#06A7FF',
                    width: personPercent + '%',
                    borderTopLeftRadius: '5px',
                    borderBottomLeftRadius: '5px'
                }"></div>
                <div class="progress" :style="{
                    backgroundColor: '#ED6666',
                    width: groupPercent + '%'
                }"></div>
                <div class="progress" :style="{
                    width: restPercent + '%',
                    borderTopRightRadius: '5px',
                    borderBottomRightRadius: '5px'
                }"></div>
            </div>
            <div class="info number-info">
                <span> {{personalSpace}}G / {{groupSpace}}G / {{restSpace}}G </span>
            </div>
            <div class="info type-info">
                <div class="type">
                    <div style="width: 10px;height: 10px;background-color: #06A7FF"></div>
                    <div style="margin-left: 10px;">个人</div>
                </div>
                <div class="type" style="margin-left: 10px;">
                    <div style="width: 10px;height: 10px;background-color: #ED6666"></div>
                    <div style="margin-left: 10px;">群组</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex'
    import { RIGHT_CONTEXT_MENU_OPERATION } from "@/utils/constants.js";
    import {b2G} from "../../../utils";

    export default {
        name: "b-tree-menu",
        props: {
            menus: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                fileLimitsLoading: false,
                menuOperations: [],
                menuTarget: {}
            }
        },
        computed: {
            ...mapGetters(['spaceInfo', 'spaceInfo']),
            personalSpace() {
                return b2G(this.spaceInfo.personalSpace).toFixed(2)
            },
            groupSpace() {
                return b2G(this.spaceInfo.groupSpace).toFixed(2)
            },
            restSpace() {
                return b2G(this.spaceInfo.totalSpace - this.spaceInfo.personalSpace - this.spaceInfo.groupSpace).toFixed(2)
            },
            personPercent() {
                return (this.spaceInfo.personalSpace / this.spaceInfo.totalSpace)*100
            },
            groupPercent() {
                return (this.spaceInfo.groupSpace / this.spaceInfo.totalSpace)*100
            },
            restPercent() {
                return 100 - this.personPercent - this.groupPercent
            },
            iconType() {
                return (type) => {
                    switch (type) {
                        case 'create-up':
                            return 'far fa-folder-open'
                        case 'create-down':
                            return 'fa fa-arrow-alt-from-top'
                        case 'move-up':
                            return 'fa fa-copy';
                        case 'move-down':
                            return 'fa fa-file-export'
                        case 'rename':
                            return 'fa fa-eraser';
                        case 'delete':
                            return 'fa fa-trash'
                    }
                }
            },
        },
        methods: {
            createDisk(data) {
                this.$emit('create-disk', data)
            },
            handleRightCLick(data) {
                this.menuTarget = data
            }
        },
        mounted() {
            this.menuOperations = RIGHT_CONTEXT_MENU_OPERATION
        }
    };
</script>
<style lang='scss'>

    .b-tree-menu {

        .add-group {
            position: absolute;
            bottom: 112px;
            right: 12px;
        }

        .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
            /*background-color: #d4f0ff;*/
            background-color: var(--light-color, $light_color);
        }

        /*.el-tree-node__children {*/
        /*    .is-current {*/
        /*        .el-tree-node__content {*/
        /*            background-color: #d4f0ff;*/
        /*        }*/
        /*    }*/
        /*}*/

        .el-tree-node__content {
            height: 50px !important;
        }
        .custom-tree-node {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: transparent;
            padding-right: 8px;
            height: 50px;
            color: #555;
        }
    }

</style>
