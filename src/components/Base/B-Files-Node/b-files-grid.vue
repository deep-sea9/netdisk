<template>
    <div class="out-container" ref="out-container">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-empty v-if="data.length <= 0" description="暂无数据" />
        <template v-else>
            <div class="b-files-grid" v-if="type === 'default'">
                <b-files-grid-item
                        ref="file-box"
                        v-bind="$attrs"
                        :selection="selection"
                        v-for="file in data"
                        :key="file.id"
                        :file="file"
                        v-contextmenu:contextmenu
                        @item-click="handleItemClick"
                        @drag-move-success="handleDragMoveSuccess"
                        @context-menu="handleContextmenu"/>
            </div>
            <div class="b-files-grid" v-else-if="type === 'recycle'">
                <b-files-grid-item-recycle
                        ref="file-box"
                        v-bind="$attrs"
                        :selection="selection"
                        v-for="file in data"
                        :key="file.id"
                        :file="file"
                        v-contextmenu:contextmenu
                        @item-click="handleItemClick"
                        @context-menu="handleContextmenu"/>
            </div>
            <div class="b-files-grid" v-else-if="type === 'recent'">
                <b-files-grid-item-recent
                        ref="file-box"
                        v-bind="$attrs"
                        :selection="selection"
                        v-for="file in data"
                        :key="file.id"
                        :file="file"
                        v-contextmenu:contextmenu
                        @item-click="handleItemClick"
                        @context-menu="handleContextmenu"/>
            </div>
            <div class="b-files-grid" v-else-if="type === 'fav'">
                <b-files-grid-item-fav
                        ref="file-box"
                        v-bind="$attrs"
                        :selection="selection"
                        v-for="file in data"
                        :key="file.id"
                        :file="file"
                        v-contextmenu:contextmenu
                        @item-click="handleItemClick"
                        @context-menu="handleContextmenu"/>

            </div>
            <div class="b-files-grid" v-else>
                <b-files-grid-item-share
                        ref="file-box"
                        v-bind="$attrs"
                        :selection="selection"
                        v-for="file in data"
                        :key="file.fileId + file.id"
                        :file="file"
                        v-contextmenu:contextmenu
                        @item-click="handleItemClick"
                        @context-menu="handleContextmenu"/>
            </div>
        </template>
        <v-contextmenu ref="contextmenu">
            <v-contextmenu-item v-for="item in fileLimits" :key="item.code"
                                @click.native="$emit('contextmenu', currentRightClickFile, item.code === 'favorite' && favColor? { code: 'unfav', name: '取消收藏' } : item)">
                <i :class="iconType(item.code)" :style="{
                    width: '13px',
                    color: item.code === 'favorite'? favColor: null
                }"></i>
                <span :style="{ color: item.code === 'favorite'? favColor: null }">{{ item.code === 'favorite'? `${favColor? '取消': ''}${item.name}`: item.name }}</span>
            </v-contextmenu-item>
        </v-contextmenu>
    </div>
</template>
<script>
    import fetchFileIcon from "@/utils/fetchFileIcon.js";
    // import { throttle } from '@/utils/index.js'

    import {
        RIGHT_CONTEXT,
        RIGHT_CONTEXT_DB_SELECTION,
        RIGHT_CONTEXT_RECYCLE,
        RIGHT_CONTEXT_RECENT,
        RIGHT_CONTEXT_RECENT_DB_SELECTION,
        RIGHT_CONTEXT_FAV,
        RIGHT_CONTEXT_FAV_DB_SELECTION,
        RIGHT_CONTEXT_OTHER_SHARE,
        RIGHT_CONTEXT_MY_SHARE,
        RIGHT_CONTEXT_MY_SHARE_EXPIRE
    } from "@/utils/constants.js";

    export default {
        name: "b-files-grid",
        props: {
            data: {
                type: Array,
                default: () => [],
            },
            selection: {type: Array},
            type: {type: String, default: ''}
        },
        data() {
            return {
                currentRightClickFile: {},
                // isIndeterminate: false,
                checkAll: false
            }
        },
        computed: {
            fileLimits() {
                switch (this.type) {
                    case 'recycle':
                        return RIGHT_CONTEXT_RECYCLE
                    case 'recent':
                        return this.selection.length < 2 ? RIGHT_CONTEXT_RECENT : RIGHT_CONTEXT_RECENT_DB_SELECTION
                    case 'fav':
                        return this.selection.length < 2 ? RIGHT_CONTEXT_FAV : RIGHT_CONTEXT_FAV_DB_SELECTION
                    case 'myShare': {
                        const hasExpire = this.selection.findIndex(link => {
                            const deltaTime = new Date(link.expireTime).getTime() - new Date().getTime()
                            return deltaTime < 0
                        })

                        let fileLimits
                        if (hasExpire > -1 || this.currentRightClickFile.status === '已取消') {
                            fileLimits = RIGHT_CONTEXT_MY_SHARE_EXPIRE;
                        } else {
                            fileLimits = RIGHT_CONTEXT_MY_SHARE
                        }

                        if (this.currentRightClickFile.shareWay === '2') {
                            fileLimits = [...fileLimits, {
                                name: "复制链接",
                                code: "copy-link"
                            }]
                        }
                        return fileLimits
                    }
                    case 'otherShare':
                        return RIGHT_CONTEXT_OTHER_SHARE
                    default:
                        return this.selection.length < 2 ? RIGHT_CONTEXT : RIGHT_CONTEXT_DB_SELECTION
                }
            },
            iconType() {
                return (type) => {
                    switch (type) {
                        case 'open':
                            return 'far fa-folder-open'
                        case 'download':
                            return 'fa fa-arrow-alt-from-top'
                        case 'share':
                            return 'fa fa-share-alt'
                        case 'favorite':
                            return 'fa fa-star'
                        case 'unfav':
                            return 'fa fa-file-times'
                        case 'copy':
                            return 'fa fa-copy';
                        case 'move':
                            return 'fa fa-file-export'
                        case 'rename':
                            return 'fa fa-eraser';
                        case 'delete':
                            return 'fa fa-trash'
                        case 'modify':
                            return 'fa fa-eraser';
                        case 'cancel':
                            return 'fa fa-reply';
                        case 'recall':
                            return 'fa fa-retweet';
                        case 'restore':
                            return 'fa fa-window-restore';
                        case 'copy-link':
                            return 'fa fa-link'
                    }
                }
            },
            isIndeterminate: {
                get() {
                    let sampleOne = -1, l = this.selection.length
                    for(let i = 0; i< l; i++) {
                        sampleOne = this.data.findIndex(file => file.id === this.selection[i].id)
                        if(sampleOne > -1) {
                            break;
                        }
                    }

                    return this.selection.length > 0 && sampleOne >= 0 && this.selection.length !== this.data.length
                },
                set(val) {
                    return val
                }
            },
            favColor() {
                const hasUnFavOfMulti = this.selection.length > 1 && this.selection.findIndex(file => file.collectFlag === '0' || file.isCollect === false)
                const unFavOfSingle = this.selection.length === 1 && (this.selection[0].collectFlag === '0' || this.selection[0].isCollect === false)
                if(hasUnFavOfMulti || unFavOfSingle) {
                    return undefined
                }else {
                    return '#FDBA3A'
                }
            }
        },
        components: {
            BFilesGridItem: () => import("./b-files-grid-item.vue"),
            BFilesGridItemRecycle: () => import("./b-files-grid-item-recycle.vue"),
            BFilesGridItemRecent: () => import("./b-files-grid-item-recent.vue"),
            BFilesGridItemFav: () => import("./b-files-grid-item-fav.vue"),
            BFilesGridItemShare: () => import("./b-files-grid-item-share.vue"),
        },
        methods: {
            fetchFileIcon,
            handleContextmenu(file) {
                this.currentRightClickFile = file
                // this.$emit("contextmenu", file, item);
            },
            handleItemClick(file) {
                this.$emit('item-click', file)
                if (!file.fileType) {
                    this.$emit('to-next-fold', file)
                } else {
                    this.$emit('click-file', file)
                }
            },
            handleCheckAllChange(checkAll) {
                console.log(checkAll);
                if(checkAll) {
                    this.$attrs.checkedAllFiles()
                }else {
                    this.$attrs.removeAllSelection()
                }
                this.isIndeterminate = false
            },
            createSelectArea(e) {
                this.x = e.pageX - 250
                this.y = e.pageY - 180
                const div = document.createElement('div')
                div.id = 'select-box'
                this.$refs['out-container'].appendChild(div)
                this.firstPane = document.getElementsByClassName('splitpanes__pane')[0]
                this.paneWidth = this.firstPane ? this.firstPane.clientWidth : 0
                this.nodeFile.addEventListener('mousemove', this.drawSelectArea)
            },
            drawSelectArea(e) {
                const selectBox = document.getElementById('select-box')
                if(selectBox) {
                    selectBox.style.left = `${e.pageX - 250 > this.x ? this.x - this.paneWidth : e.pageX - 250 - this.paneWidth}px`;
                    selectBox.style.top = `${e.pageY - 180 > this.y ? this.y : e.pageY - 180}px`;
                    selectBox.style.width = `${Math.abs(e.pageX - 250 - this.x)}px`;
                    selectBox.style.height = `${Math.abs(e.pageY - 180 - this.y)}px`;

                    const VNodeOfFileGrid = this.$refs['file-box']

                    VNodeOfFileGrid.forEach(vGrid => {
                        if(this.isCollision(selectBox, vGrid.$el)) {
                            this.hasCollided = true
                            if(!vGrid.checked) {
                                vGrid.setNodeChecked()
                            }
                        }else {
                            if(this.hasCollided) {
                                if(vGrid.checked) {
                                    vGrid.setNodeUnchecked()
                                }
                            }
                        }

                    })

                }
            },

            removeSelectArea() {
                // this.$refs['out-container'].removeEventListener('mousemove', this.drawSelectArea)
                this.nodeFile.removeEventListener('mousemove', this.drawSelectArea)
                const selectBox = document.getElementById('select-box')
                if(selectBox) {
                    this.$refs['out-container'].removeChild(selectBox)
                }
            },
            handleDragMoveSuccess(res) {
                this.$emit('drag-move-success', res)
            },
            isCollision(ele1, ele2) {
                const xLeft = ele2.offsetLeft - ele1.offsetWidth
                const xRight = ele2.offsetLeft + ele2.offsetWidth

                const yTop = ele2.offsetTop - ele1.offsetHeight
                const yBottom = ele2.offsetTop + ele2.offsetHeight

                return ele1.offsetLeft >= xLeft && ele1.offsetLeft <= xRight && ele1.offsetTop >= yTop && ele1.offsetTop <= yBottom
            },
        },
        watch: {
            selection(v) {

                if(v.length === 0) {
                    this.checkAll = false
                    return
                }
                let sampleOne = -1, l = v.length
                for(let i = 0; i< l; i++) {
                    sampleOne = this.data.findIndex(file => file.id === v[i].id)
                    if(sampleOne > -1) {
                        break;
                    }
                }
                if(sampleOne > -1 && this.data.length === v.length) {
                    this.checkAll = true
                }
            }
        },
        mounted() {
            this.nodeFile = document.getElementsByClassName('b-files-node__panel scrollbar')[0]
            this.nodeFile.addEventListener('mousedown', this.createSelectArea)
            this.nodeFile.addEventListener('mouseup', this.removeSelectArea)
            document.addEventListener('mouseleave', this.removeSelectArea)
        },
        beforeDestroy() {
            this.nodeFile.removeEventListener('mousedown', this.createSelectArea)
            this.nodeFile.removeEventListener('mouseup', this.removeSelectArea)
            document.removeEventListener('mouseleave', this.removeSelectArea)
        }
    };
</script>
<style lang="scss" scoped>
    .out-container {
        height: calc(100% - 28px);
        user-select: none;

        .b-files-grid {
            margin-top: 20px;
            display: grid;
            /*grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));*/
            grid-template-columns: repeat(auto-fit, 120px);
            grid-row-gap: 20px;
            grid-column-gap: 20px;
            align-items: center;
            justify-items: center;
        }
    }
</style>
