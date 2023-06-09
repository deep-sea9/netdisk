<template>
    <div class="out-container" ref="out-container" style="user-select: none;height: 100%">
        <el-table :data="data" style="width: 100%"
                  height="100%"
                  :default-sort="fileDefaultSort"
                  @selection-change="handleSelectionChange"
                  @row-contextmenu="rightClick"
                  @row-dblclick="handleRowClick"
                  @sort-change="handleSortChange"
                  ref="table">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column prop="fileName" label="文件名称" show-overflow-tooltip sortable="custom">
                <div draggable="true"
                     class="table-column"
                     slot-scope="scope"
                     @mousedown.stop="() => {}"
                     @dragstart="fileDragStart($event, scope.row)"
                     @dragenter="decideCanDrop($event, scope.row)"
                     @dragover="fileDragOver($event, scope.row)"
                     @drop="fileDrop($event, scope.row)"
                     v-contextmenu:contextmenu>
                    <img class="file-icon" @click.stop="() => {}"
                         :src="getPreviewSrc(scope.row)"/>
                    <span>{{ getFileName(scope.row) }}</span>
                </div>
            </el-table-column>
            <el-table-column prop="collectFlag" width="40">
                <template slot-scope="scope">
                    <i v-if="scope.row.collectFlag === '1'" style="color: #FDBA3A" class="fa fa-star" />
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="上次修改时间" width="170" sortable="custom"/>
            <el-table-column prop="fileSize" label="大小" width="120" sortable="custom">
                <div slot-scope="scope">
                    <span>{{ fileSize(scope.row.fileSize) }}</span>
                </div>
            </el-table-column>
            <el-table-column prop="fileSize" label="剩余下载次数" width="110" align="center">
                <div slot-scope="scope">
                    <span>{{ scope.row.tableKind === '文件夹' ? '--' : scope.row.downNum === -1 ? '无限次': scope.row.downNum + ' 次' }}</span>
                </div>
            </el-table-column>
            <el-table-column prop="createUserName" label="创建者" width="100"/>
            <el-table-column prop="organName" label="所属部门" width="120"/>
        </el-table>
        <v-contextmenu ref="contextmenu" v-loading="fileLimitsLoading">
            <v-contextmenu-item
                    v-for="item in fileLimits"
                    :key="item.code"
                    @click.native="$emit('contextmenu', menuTarget, item.code === 'favorite' && favColor? { code: 'unfav', name: '取消收藏' } : item)"
            >
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
    /*eslint-disable*/
    import fetchFileIcon from "@/utils/fetchFileIcon.js";
    import { getThumnUrlOfImg } from "@/api/file";
    import {RIGHT_CONTEXT_PUBLIC, RIGHT_CONTEXT_PUBLIC_DB_SELECTION, RIGHT_CONTEXT_NO_PERMISSION} from "@/utils/constants.js";
    import {moveFiles} from "@/api/common.js"
    import _mixin from "../B-Files-Node/mixin";

    export default {
        name: "b-public-files-table",
        mixins: [_mixin],
        props: {
            data: Array,
            selection: Array,
            resetSelection: Function,
        },
        data() {
            return {
                menuTarget: null,
                fileLimits: [],
                fileLimitsLoading: false,
            };
        },
        methods: {
            fetchFileIcon,
            getPreviewSrc(row) {
                if(row.fileKind === '图片' || row.fileKind === '视频') {
                    return getThumnUrlOfImg(row.fileId || row.id)
                }else {
                    return this.fetchFileIcon(row.fileType, row.fileName || row.folderName, row.tableKind)
                }
            },
            fileDragStart(e, file) {
                if (this.selection.length > 1) {
                    const img = document.querySelectorAll('#dragImg')[0]
                    e.dataTransfer.setDragImage(img, 10, 10)
                    e.dataTransfer.setData('application/json', JSON.stringify(this.selection))
                    return
                }
                e.dataTransfer.setData('application/json', JSON.stringify([file]))
            },
            fileDragOver(e, file) {
                // 只能在此事件里更改dataTransfer.dropEffect
                if (!file.fileType) {
                    e.preventDefault()
                } else {
                    e.dataTransfer.dropEffect = 'move'
                }
            },
            decideCanDrop(e, file) {
                // document默认阻止了拖动事件，捕获机制导致其他元素也被动不接受拖动事件，所以允许被放置的目标元素要阻止冒泡
                if (!file.fileType) {
                    e.preventDefault()
                }
            },
            fileDrop(e, file) {

                if (file.fileType) return

                const resource = JSON.parse(e.dataTransfer.getData('application/json'))
                e.dataTransfer.clearData()

                if(resource.some((_file) => _file.id === file.id)) {
                    this.$message.warning('无法将包含自身的文件夹拖拽入自身，请取消选择要移入的文件夹后重试...')
                    return
                }

                let fileIds
                if (Array.isArray(resource)) {
                    fileIds = resource.map(_file => _file.id)
                } else {
                    fileIds = [resource.id]
                }

                moveFiles({fileIds, folderId: file.id}).then(res => {
                    this.$emit('drag-move-success', res)
                })
            },
            createSelectArea(e) {
                this.x = e.pageX - 210
                this.y = e.pageY - 150
                const div = document.createElement('div')
                div.id = 'select-box'
                this.$refs['out-container'].appendChild(div)
                this.firstPane = document.getElementsByClassName('splitpanes__pane')[0]
                this.paneWidth = this.firstPane ? this.firstPane.clientWidth : 0
                this.nodePanel.addEventListener('mousemove', this.drawSelectArea)
            },
            drawSelectArea(e) {
                const selectBox = document.getElementById('select-box')

                if (selectBox) {
                    selectBox.style.left = `${e.pageX - 210 > this.x ? this.x - this.paneWidth : e.pageX - 210 - this.paneWidth}px`;
                    selectBox.style.top = `${e.pageY - 150 > this.y ? this.y : e.pageY - 150}px`;
                    selectBox.style.width = `${Math.abs(e.pageX - 210 - this.x)}px`;
                    selectBox.style.height = `${Math.abs(e.pageY - 150 - this.y)}px`;

                    const fileRow = document.getElementsByClassName('el-table__row')
                    fileRow.forEach((row, index) => {
                        if (this.isCollision(selectBox, row)) {
                            // 记录是否已经碰撞过：减少选中/移除操作
                            this.hasCollided = true

                            this.$refs['table'].toggleRowSelection(this.data[index], true)
                        } else {
                            if (this.hasCollided) {
                                this.$refs['table'].toggleRowSelection(this.data[index], false)
                            }
                        }

                    })
                }
            },
            removeSelectArea() {
                this.nodePanel.removeEventListener('mousemove', this.drawSelectArea)
                const selectBox = document.getElementById('select-box')
                if (selectBox) {
                    this.$refs['out-container'].removeChild(selectBox)
                }
            },
            isCollision(ele1, ele2) {
                const xLeft = ele2.offsetLeft - ele1.offsetWidth
                const xRight = ele2.offsetLeft + ele2.offsetWidth

                // 减48 是因为el-table-row外层父元素div具有position: relative属性，导致offsetTop有偏差
                const yTop = ele2.offsetTop + 48 - ele1.offsetHeight
                const yBottom = ele2.offsetTop + 48 + ele2.offsetHeight

                return ele1.offsetLeft >= xLeft && ele1.offsetLeft <= xRight && ele1.offsetTop >= yTop && ele1.offsetTop <= yBottom
            },
            handleSelectionChange(selection) {
                this.resetSelection(selection);
                if (selection.length > 1) {
                    this.fileLimits = RIGHT_CONTEXT_PUBLIC_DB_SELECTION
                } else {
                    this.fileLimits = RIGHT_CONTEXT_PUBLIC;
                }
            },
            rightClick(row, column, event) {
                this.menuTarget = row;
                event.preventDefault();
                // this.$refs.contextmenu.hide();
                this.fileLimitsLoading = true;
                this.$refs['table'].clearSelection()
                this.$refs['table'].toggleRowSelection(row)
                if(row.allowKeep) {
                    this.fileLimits = RIGHT_CONTEXT_PUBLIC;
                }else {
                    this.fileLimits = RIGHT_CONTEXT_NO_PERMISSION
                }
                this.fileLimitsLoading = false;
                // fileListLimit().then((res) => {});
            },
            handleRowClick(row, column, event) {
                if (!row.fileType) {
                    this.$emit('to-next-fold', row, column, event)
                } else {
                    this.$emit('click-file', row, column, event)
                }
            },
            fileSize(fileSize) {
                let size = fileSize ? (fileSize / 1024).toFixed(2) : '--'
                if (size === '--') {
                    return size
                }
                if (size > 1024) {
                    size = (size / 1024).toFixed(2)
                } else {
                    if(fileSize != 0 && size < 0.01) {
                        return '0.01KB'
                    }
                    return size + 'KB'
                }
                if (size > 1024) {
                    size = (size / 1024).toFixed(2)
                } else {
                    return size + 'MB'
                }
                return size + 'GB'
            },
            handleSortChange({ column, prop, order }) {
                // console.log(column, prop, order);
                this.$store.commit('app/SET_FILE_DEFAULT_SORT', { prop, order })
            }
        },
        computed: {
            iconType() {
                return (type) => {
                    switch (type) {
                        case 'open':
                            return 'far fa-book-open'
                        case 'open-in':
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
            favColor() {
                const hasUnFavOfMulti = this.selection.length > 1 && this.selection.findIndex(file => file.collectFlag === '0')
                const unFavOfSingle = this.selection.length === 1 && this.selection[0].collectFlag === '0'
                if(hasUnFavOfMulti || unFavOfSingle) {
                    return undefined
                }else {
                    return '#FDBA3A'
                }
            },
            fileDefaultSort() {
                return this.$store.state.app.fileDefaultSort
            }
        },
        watch: {
            selection: {
                deep: true,
                immediate: true,
                handler(selection) {
                    this.$nextTick(() => {
                        selection.forEach((cur) => {
                            this.$refs.table.toggleRowSelection(cur, true);
                        });
                    });
                },
            },
        },
        mounted() {
            this.nodePanel = document.getElementsByClassName('b-files-node__panel scrollbar')[0]
            this.nodePanel.addEventListener('mousedown', this.createSelectArea)
            this.nodePanel.addEventListener('mouseup', this.removeSelectArea)
            document.addEventListener('mouseleave', this.removeSelectArea)
        },
        beforeDestroy() {
            this.nodePanel.removeEventListener('mousedown', this.createSelectArea)
            this.nodePanel.removeEventListener('mouseup', this.removeSelectArea)
            document.removeEventListener('mouseleave', this.removeSelectArea)
        }
    };
</script>
<style lang="scss" scoped>
    .table-column {
        display: flex;
        align-items: center;
        user-select: none;

        .file-icon {
            width: 20px;
            height: 20px;
            margin-right: 6px;
        }
    }
</style>
