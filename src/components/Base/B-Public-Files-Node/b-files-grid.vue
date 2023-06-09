<template>
    <div class="out-container" ref="out-container">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-empty v-if="data.length <= 0" description="暂无数据"/>
        <div v-else class="b-files-grid">
            <b-files-grid-item ref="file-box"
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
    // import { fileListLimit } from "@/api/file";
    import {RIGHT_CONTEXT_PUBLIC, RIGHT_CONTEXT_NO_PERMISSION} from "@/utils/constants.js";

    export default {
        name: "b-public-files-grid",
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
                checkAll: false
            }
        },
        computed: {
            fileLimits() {
                // return this.selection.length < 2 ? RIGHT_CONTEXT_PUBLIC : RIGHT_CONTEXT_PUBLIC_DB_SELECTION
                return this.currentRightClickFile.allowKeep? RIGHT_CONTEXT_PUBLIC: RIGHT_CONTEXT_NO_PERMISSION
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
                        case 'copy':
                            return 'fa fa-copy';
                        case 'move':
                            return 'fa fa-file-export'
                        case 'rename':
                            return 'fa fa-eraser';
                        case 'delete':
                            return 'fa fa-trash'
                    }
                }
            },
            isIndeterminate: {
                get() {
                    let sampleOne = -1, l = this.selection.length
                    for (let i = 0; i < l; i++) {
                        sampleOne = this.data.findIndex(file => file.id === this.selection[i].id)
                        if (sampleOne > -1) {
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
                const hasUnFavOfMulti = this.selection.length > 1 && this.selection.findIndex(file => file.collectFlag === '0')
                const unFavOfSingle = this.selection.length === 1 && this.selection[0].collectFlag === '0'
                if(hasUnFavOfMulti || unFavOfSingle) {
                    return undefined
                }else {
                    return '#FDBA3A'
                }
            }
        },
        components: {
            BFilesGridItem: () => import("./b-files-grid-item.vue"),
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
                if (checkAll) {
                    this.$attrs.checkedAllFiles()
                } else {
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
                if (selectBox) {
                    selectBox.style.left = `${e.pageX - 250 > this.x ? this.x - this.paneWidth : e.pageX - 250 - this.paneWidth}px`;
                    selectBox.style.top = `${e.pageY - 180 > this.y ? this.y : e.pageY - 180}px`;
                    selectBox.style.width = `${Math.abs(e.pageX - 250 - this.x)}px`;
                    selectBox.style.height = `${Math.abs(e.pageY - 180 - this.y)}px`;

                    const VNodeOfFileGrid = this.$refs['file-box']

                    VNodeOfFileGrid.forEach(vGrid => {
                        if (this.isCollision(selectBox, vGrid.$el)) {
                            this.hasCollided = true
                            if (!vGrid.checked) {
                                vGrid.setNodeChecked()
                            }
                        } else {
                            if (this.hasCollided) {
                                if (vGrid.checked) {
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
                if (selectBox) {
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

                if (v.length === 0) {
                    this.checkAll = false
                    return
                }
                let sampleOne = -1, l = v.length
                for (let i = 0; i < l; i++) {
                    sampleOne = this.data.findIndex(file => file.id === v[i].id)
                    if (sampleOne > -1) {
                        break;
                    }
                }
                if (sampleOne > -1 && this.data.length === v.length) {
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
