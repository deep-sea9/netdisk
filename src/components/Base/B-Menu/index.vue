<template>
    <div style="border-right: 1px solid #EBECF2;position: relative;">
        <el-scrollbar style="height: calc(100% - 100px)">
            <el-menu
                    id="file-type"
                    @open="subMenuOpen"
                    background-color="#fff"
                    text-color="#555"
                    router
                    class="mf-menu"
                    v-bind="$attrs"
                    v-on="$listeners"
                    :default-active="activeMenu"
                    :default-openeds="defaultOpeneds"
            >
                <template v-if="type === 'admin-public'">
                    <mf-menu-item
                            :type="type"
                            v-for="router in menus"
                            :key="router.path"
                            :data="router"
                            :base="router.path"
                            v-contextmenu:contextmenu @contextmenu.native.stop="handleRightClick($event, router)"
                    />
                </template>

                <mf-menu-item
                        v-else
                        :type="type"
                        v-for="router in menus"
                        :key="router.path"
                        :data="router"
                        :base="router.path"
                />
            </el-menu>
        </el-scrollbar>


        <div v-if="showAdd" class="add-group" style="position: absolute;bottom: 112px; right: 12px;">
            <el-button circle :icon="operationIcon" type="primary" size="small" @click="$emit('create-disk')"></el-button>
        </div>

        <div class="space-info" v-if="type === 'personal'">
            <div class="info progress-info">
                <div class="progress" :style="{
                    backgroundColor: themeColor,
                    width: personPercent + '%',
                    borderTopLeftRadius: '5px',
                    borderBottomLeftRadius: '5px'
                }" />
                <div v-if="openGroup" class="progress" :style="{
                    backgroundColor: '#ED6666',
                    width: groupPercent + '%'
                }" />
                <div class="progress" :style="{
                    width: restPercent + '%',
                    borderTopRightRadius: '5px',
                    borderBottomRightRadius: '5px'
                }" />
            </div>
            <div class="info number-info">
                <span> {{personalSpace}}G <span v-if="openGroup">/ {{groupSpace}}G</span> / {{restSpace}}G </span>
            </div>
            <div class="info type-info">
                <div class="type">
                    <div :style="{ width: '10px', height: '10px', backgroundColor: themeColor }"></div>
                    <div style="margin-left: 10px;">个人</div>
                </div>
                <div v-if="openGroup" class="type" style="margin-left: 10px;">
                    <div style="width: 10px;height: 10px;background-color: #ED6666"></div>
                    <div style="margin-left: 10px;">群组</div>
                </div>
            </div>
        </div>
        <div class="space-info" v-else>
            <div class="info-25 progress-info">
                <div class="progress" :style="{
                    backgroundColor: themeColor,
                    width: type === 'public' ? publicUsedPercent: groupUsedPercent + '%',
                    borderTopLeftRadius: '5px',
                    borderBottomLeftRadius: '5px'
                }" />
                <div class="progress" :style="{
                    width: type === 'public' ? publicRestPercent: groupRestPercent + '%',
                    borderTopRightRadius: '5px',
                    borderBottomRightRadius: '5px'
                }" />
            </div>
            <div class="info-25 number-info">
                <span> {{type === 'public'? publicUsedSpace : groupUsedSpace}}G / {{type === 'public'? publicTotalSpace : groupTotalSpace}}G </span>
            </div>
            <div class="info-25 type-info">
                <div class="type">
                    <div :style="{ width: '10px', height: '10px', backgroundColor: themeColor }"></div>
                    <div style="margin-left: 10px;">已用</div>
                </div>
                <div class="type" style="margin-left: 10px;">
                    <div style="width: 10px;height: 10px;background-color: #E0E5EE"></div>
                    <div style="margin-left: 10px;">剩余</div>
                </div>

            </div>
            <div class="info-25 type-info" v-if="type === 'public' && currentPublicMenu">
                <el-tooltip :content="currentPublicMenu.name">
                    <span>{{ currentPublicMenu.name }}</span>
                </el-tooltip>
            </div>
            <div class="info-25 type-info" v-else-if="type === 'group' && currentGroupMenu">
                <el-tooltip :content="currentGroupMenu.groupName + '>' + currentGroupMenu.name">
                    <span>{{ currentGroupMenu.groupName + '>' + currentGroupMenu.name  }}</span>
                </el-tooltip>
            </div>

        </div>
        <v-contextmenu v-if="type === 'admin-public'" ref="contextmenu">
            <v-contextmenu-item
                    v-for="operation in menuOperations"
                    :key="operation.code"
                    @click.native="handleDeleteDisk(operation)"
            >
                <i class="fa fa-trash" style="width: 13px;"></i>
                <span>{{ operation.name }}</span>
            </v-contextmenu-item>
        </v-contextmenu>
    </div>
</template>
<script>
    import mfMenuItem from "./mf-menu-item.vue";
    import { mapGetters } from 'vuex'
    import { b2G } from "@/utils";
    import { deletePublicDisk } from '@/api/admin/public'

    import { THEME_SKINS } from "@/utils/constants";

    export default {
        name: "b-menu",
        data(){
            return {
                activeMenu:"",
                menuOperations: [{
                    name: "删除",
                    code: "delete"
                }]
            }
        },
        computed: {
            ...mapGetters(['spaceInfo', 'publicMenus', 'groupMenus']),
            themeColor() {
                const selectedTheme = THEME_SKINS.find(t => t.value === this.$store.state.system.themeValue) || {}
                return selectedTheme.color
            },
            openGroup() {
                return this.$store.state.system.open_group === '1'
            },
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
            currentPublicMenu() {
                return this.publicMenus.find(menu => menu.id === this.$route.meta.diskId)
            },
            publicUsedSpace() {
                return b2G(this.currentPublicMenu? this.currentPublicMenu.usedSpace : 0).toFixed(2)
            },
            publicTotalSpace() {
                return b2G(this.currentPublicMenu? this.currentPublicMenu.allocateSpace: 0).toFixed(2)
            },
            publicUsedPercent() {
                if(this.currentPublicMenu) {
                    return (this.currentPublicMenu.usedSpace / this.currentPublicMenu.allocateSpace) * 100
                }else {
                    return 0
                }
            },
            publicRestPercent() {
                if(this.currentPublicMenu) {
                    return 100 - this.publicUsedPercent
                }else {
                    return 100
                }
            },
            currentGroupMenu() {
                const group = this.groupMenus.find(group => group.id + '' === this.$route.meta.groupId + '')
                console.log('currentGroupMenu', this.groupMenus, group, this.$route.meta.groupId);
                if(group) {
                    const targetMenu = group.child.find(menu => menu.id === this.$route.meta.diskId)
                    return { ...targetMenu, groupName: group.name }
                }else {
                    return undefined
                }
            },
            groupUsedPercent() {
                if(this.currentGroupMenu) {
                    const resultPercent = (this.currentGroupMenu.usedSpace / this.currentGroupMenu.allocateSpace) * 100
                    return resultPercent< 1? 1: resultPercent
                }else {
                    return 0
                }
            },
            groupRestPercent() {
                if(this.currentGroupMenu) {
                    return 100 - this.groupUsedPercent
                }else {
                    return 100
                }
            },
            groupUsedSpace() {
                const result = b2G(this.currentGroupMenu? this.currentGroupMenu.usedSpace : 0).toFixed(2)
                return result<0.01 ? 0.01 : result
            },
            groupTotalSpace() {
                return b2G(this.currentGroupMenu? this.currentGroupMenu.allocateSpace: 0).toFixed(2)
            },
        },
        props: {
            menus: Array,
            defaultOpeneds: {
                type: Array,
                default: () => []
            },
            showAdd: { type: Boolean, default: false },
            operationIcon: { type: String, default: 'el-icon-plus' },
            type: { type: String, default: 'personal' }
        },
        components: {
            mfMenuItem
        },
        methods: {
            handleRightClick(e, data) {
                if(this.type === 'admin-public') {
                    e.preventDefault()
                    this.currentDisk = data
                }
            },
            handleDeleteDisk() {
                deletePublicDisk(this.currentDisk.meta.diskId).then(res => {
                    this.$message.success(res.message || '删除成功!')
                    this.$store.dispatch('registryPublicRoute')
                })
            },
            subMenuOpen(index, indexPath) {
                if(indexPath.length === 2) {
                    this.$router.replace(index + '/all')
                }
            }
        },
        watch: {
            $route:{
                immediate: true,
                deep: true,
                handler({fullPath}){
                    this.activeMenu = fullPath
                }
            }
        }

    };
</script>
<style lang='scss'>
    @import "./reset.scss";

    .space-info {
        position: absolute;
        bottom: 12px;
        width: 100%;
        height: 100px;
        background-color: #fff;

        .info {
            width: 90%;
            height: 30px;
            margin: 0 auto;
            line-height: 30px;
            color: #9099A9;
            font-size: .8rem;
        }
        .info-25 {
            width: 90%;
            height: 25px;
            margin: 0 auto;
            line-height: 25px;
            color: #9099A9;
            font-size: .8rem;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .progress-info {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .progress {
                /*border-radius: 5px;*/
                /*border-top-left-radius: 5px;*/
                /*border-bottom-left-radius: 5px;*/
                height: 8px;
                background-color: #E0E5EE;
            }
        }

        .type-info {
            display: flex;
            justify-content: flex-start;

            .type {
                width: 33%;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }
        }
    }
</style>
