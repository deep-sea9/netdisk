<template>
    <div class="b-files-node">
        <div class="b-files-node__main" :style="{width: isExpand ? 'calc(100% - 300px)': null}">
            <b-files-header @to-pre="handleToPre" @to-previous="handleToPrevious" :index-list="indexList"
                            :isGrid.sync="isGrid" :isExpand.sync="isExpand" :treeView.sync="treeView" :draggable="!isFirefox" :file-type="fileType"/>
            <ui-layout-split v-if="fileType === 'all'" mode="vertical" style="width: 100%;height: 100%;"
                             :show-collapse="false">
                <ui-layout-split-aside :width="treeView? 20: 0">
                    <el-tree lazy
                             ref="folderTree"
                             @node-contextmenu="handleNodeContextMenu"
                             :load="loadMore"
                             :default-expanded-keys="[folderId]"
                             :current-node-key="folderId"
                             :props="defaultProps"
                             node-key="id"
                             highlight-current
                             icon-class="null"
                             @node-click="handleNodeClick">
                        <span slot-scope="{ node }" style="user-select: none;width: 100%;" v-contextmenu:contextmenu>
                            <b-icon theme="regular" v-show="node.expanded" icon="fa-folder-open" />
                            <b-icon theme="regular" v-show="!node.expanded" icon="fa-folder" />
                            <span style="margin-left: 5px">{{ node.label }}</span>
                        </span>
                    </el-tree>
                </ui-layout-split-aside>
                <ui-layout-split-main>
                    <div class="b-files-node__panel scrollbar">
                        <b-files-grid
                                v-if="isGrid"
                                :data="files"
                                :selection="selection"
                                :addSelection="addSelection"
                                :resetSelection="resetSelection"
                                :removeSelection="removeSelection"
                                :removeAllSelection="removeAllSelection"
                                :checkedAllFiles="checkedAllFiles"
                                @contextmenu="contextmenu"
                                @to-next-fold="handleToNextFold"
                                @click-file="handleClickFile"
                                @drag-move-success="handleDragMoveSuccess"
                        />
                        <b-files-table
                                style="width: 100%"
                                v-if="!isGrid"
                                :data="files"
                                :selection="selection"
                                :addSelection="addSelection"
                                :resetSelection="resetSelection"
                                :removeSelection="removeSelection"
                                @contextmenu="contextmenu"
                                @to-next-fold="handleToNextFold"
                                @click-file="handleClickFile"
                                @drag-move-success="handleDragMoveSuccess"
                        />
                        <div class="bottom-pagination">
                            <el-pagination
                                    layout="sizes,total,prev,pager,next,jumper"
                                    :current-page="currentPage"
                                    :page-size="pageSize"
                                    :total="fileTotal"
                                    @size-change="changeSize"
                                    @current-change="changeCurrent"/>
                        </div>
                    </div>
                </ui-layout-split-main>
            </ui-layout-split>
            <div v-else class="b-files-node__panel scrollbar">
                <b-files-grid
                        v-if="isGrid"
                        :data="files"
                        :selection="selection"
                        :addSelection="addSelection"
                        :resetSelection="resetSelection"
                        :removeSelection="removeSelection"
                        :removeAllSelection="removeAllSelection"
                        :checkedAllFiles="checkedAllFiles"
                        @contextmenu="contextmenu"
                        @to-next-fold="handleToNextFold"
                        @click-file="handleClickFile"
                        @drag-move-success="handleDragMoveSuccess"
                />
                <b-files-table
                        style="width: 100%"
                        v-if="!isGrid"
                        :data="files"
                        :selection="selection"
                        :addSelection="addSelection"
                        :resetSelection="resetSelection"
                        :removeSelection="removeSelection"
                        @contextmenu="contextmenu"
                        @to-next-fold="handleToNextFold"
                        @click-file="handleClickFile"
                        @drag-move-success="handleDragMoveSuccess"
                />
                <div class="bottom-pagination">
                    <el-pagination
                            layout="sizes,total,prev,pager,next,jumper"
                            :current-page="currentPage"
                            :page-size="pageSize"
                            :total="fileTotal"
                            @size-change="changeSize"
                            @current-change="changeCurrent"/>
                </div>
            </div>
        </div>
        <div class="b-files-node__detail" v-show="isExpand">
            <template v-if="selection.length === 1">
                <h1 class="title">文件详情</h1>
                <img :src="previewSrc"/>
                <div class="name">{{(selection[0].fileName || selection[0].folderName) + (selection[0].fileType ? '.' + selection[0].fileType :'')}}</div>
                <div class="createTime">创建时间: {{ selection[0].createTime }}</div>
                <div class="modifyTime">最后修改时间: {{selection[0].updateTime}}</div>
                <div v-if="selection[0].type" class="modifyTimes">文件格式: {{selection[0].fileType}}</div>
            </template>
            <template v-else-if="selection.length > 1">
                <h1 class="title">共选中{{selection.length}}个文件</h1>
                <img src="@/assets/images/filetype_icon/default.png"/>
            </template>
            <template v-else>
                <h1 class="title">文件详情</h1>
                <img src="@/assets/images/filetype_icon/default.png"/>
                <div class="createTime" style="text-align: center">选中文件，查看详情</div>
            </template>
        </div>
        <div id="dragImg"
             style="width: 150px;height: 40px;border-radius: 5px;border: 1px solid #06A7FF;position: fixed;left: -150px;right: 0;line-height: 40px;text-align: center">
            {{ selection.length || 0 }} 个文件将被移动
        </div>

        <v-contextmenu ref="contextmenu">
            <v-contextmenu-item
                    v-for="item in folderOperations"
                    :key="item.code"
                    @click.native="handleClickOperation(item.code)"
            >
                <i :class="item.icon" :style="{width: '13px'}" />
                <span >{{ item.name  }}</span>
            </v-contextmenu-item>
        </v-contextmenu>
    </div>
</template>
<script>
    import fetchFileIcon from "@/utils/fetchFileIcon.js";
    import {getThumnUrlOfImg} from '@/api/file'
    import {cancelFav} from "@/api/personal/fav.js"
    import {createFold, deleteFiles, getFoldList, renameFold} from "@/api/common";

    import { FOLDER_TREE_CONTEXT, ROOT_FOLDER_CONTEXT, folderNameReg, folderRegTip } from "@/utils/constants";

    export default {
        name: "b-public-files-node",
        props: {
            files: Array,
            indexList: {
                type: Array,
                default: () => []
            },
            fileTotal: {type: Number, default: 0},
            currentPage: {type: Number, default: 1},
            // pageSize: {type: Number, default: 10},
            folderId: {type: String},
            diskId: { type: String },
            diskType: { type: String }
        },
        data() {
            return {
                // isGrid: false,
                isExpand: false,
                treeView: navigator.userAgent.indexOf('Firefox') > -1,
                defaultProps: {
                    children: 'children',
                    label: 'folderName',
                },
                folderOperations: FOLDER_TREE_CONTEXT,
                isFirefox: navigator.userAgent.indexOf('Firefox') > -1
            };
        },
        computed: {
            selection: {
                get() {
                    return this.$attrs.selection;
                },
                set(value) {
                    this.$emit("update:selection", value);
                },
            },
            isGrid: {
                get() {
                    // console.log(!!this.$store.state.app.publicAndGroupIsGrid[this.$route.name]);
                    // return !!this.$store.state.app.publicAndGroupIsGrid[this.$route.name];
                    return this.$store.state.app.globalGrid;
                },
                set() {
                    // console.log(value);
                }
            },
            previewSrc() {
                if (this.selection[0].fileKind === '图片') {
                    return getThumnUrlOfImg(this.selection[0].fileId || this.selection[0].id)
                } else {
                    return this.fetchFileIcon(this.selection[0].fileType, this.selection[0].fileName || this.selection[0].folderName)
                }
            },
            fileType() {
                return this.$route.meta.type === -1? 'all': this.$route.meta.type;
            },
            pageSize: {
                get() {
                    return this.$store.state.app.globalPageSize
                },
                set(v) {
                    this.$store.commit('app/SET_GLOBAL_PAGE_SIZE', v)
                }
            }
        },
        watch: {
            folderId(v) {
                this.$refs['folderTree'].setCurrentKey(v)
            }
        },
        methods: {
            fetchFileIcon,
            handleToPre(current) {
                this.$emit('to-pre', current)
            },
            handleToPrevious(current, index) {
                this.$emit('to-previous', current, index)
            },
            resetSelection(files) {
                this.selection = [...files];
            },
            addSelection(file) {
                const index = this.selection.findIndex((cur) => cur.id === file.id);
                if (index < 0) {
                    this.selection.push(file);
                }
            },
            removeSelection(file) {
                const index = this.selection.findIndex((cur) => cur.id === file.id);
                if (index >= 0) {
                    this.selection.splice(index, 1);
                }
            },
            removeAllSelection() {
                this.selection.splice(0);
            },
            checkedAllFiles() {
                this.selection = [...this.files]
            },
            contextmenu(file, item) {
                switch (item.code) {
                    case 'open':
                        this.$emit('open', file)
                        break;
                    case 'download':
                        if(file.downNum === 0) {
                            this.$message.warning('下载次数已用完，请联系管理员')
                        }else {
                            this.$emit('download', file)
                        }
                        break;
                    case 'share':
                        this.$emit('share', file)
                        break;
                    case 'favorite':
                        this.$emit('favorite', file)
                        break;
                    case 'unfav':
                        cancelFav({ids: file.fileId || file.id}).then(res => {
                            this.$message.success(res.message || '取消成功')
                            this.$emit('update-data')
                        })
                        break;
                    case 'copy':
                        this.$emit('copy', file)
                        break;
                    case 'move':
                        this.$emit('move', file)
                        break;
                    case 'rename':
                        this.$prompt('请输入新的名称:', '重命名', {
                            closeOnClickModal: false,
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            inputPattern: folderNameReg,
                            inputErrorMessage: folderRegTip,
                            // inputPattern: /^[0-9a-zA-Z-_\u4e00-\u9fa5 ]+$/,
                            // inputErrorMessage: '无法使用非法字符@ . / \\ 等，请重新输入',
                            inputValue: file.fileName || file.folderName
                        }).then(({value}) => {
                            if (value === file.fileName || value === file.folderName) {
                                return
                            }
                            this.$emit('rename', value, file)
                        }).catch(() => {
                            this.$message({
                                type: 'info',
                                message: '取消输入',
                            })
                        })
                        break;
                    case 'delete':
                        this.$confirm('确定要删除选中的记录吗？', '提示', 'error').then((res) => {
                            if (res) {
                                this.$emit('delete', file)
                            }
                        })
                        break;
                    case 'restore':
                        this.$emit('restore', file)
                        break;
                    case 'remove':
                        this.$emit('remove', file)
                        break;
                    default:
                        this.$emit(item.code, file)
                }
            },
            handleToNextFold(row) {
                this.$emit('to-next-fold', row)
            },
            handleClickFile(row) {
                this.$emit('click-file', row)
            },
            changeSize(size) {
                this.pageSize = size
                this.$emit('size-change', size)
            },
            changeCurrent(current) {
                this.$emit('update:currentPage', current)
                this.$emit('current-change', current)
            },
            handleDragMoveSuccess(res) {
                this.$emit('drag-move-success', res)
            },
            loadMore(node, resolve) {
                if (node.level === 0) {
                    this.$nextTick(() => {
                        node.childNodes[0].expanded = true
                        node.childNodes[0].loadData()
                    })
                    return resolve([{folderName: '根目录', id: '0'}]) // 不设置id，单选有问题
                }
                getFoldList({diskId: this.diskId, id: node.data.id === '0' ? undefined : node.data.id}).then(res => {
                    resolve(res.data)
                })
            },
            recursivePushFolder(folderNode, folderCas = []) {
                folderCas.push(folderNode.data)
                if (folderNode.parent && folderNode.level > 1) {
                    this.recursivePushFolder(folderNode.parent, folderCas)
                }
            },
            handleNodeClick(nodeObj, Node) {
                const folderCas = []
                this.recursivePushFolder(Node, folderCas)
                if(this.folderId === nodeObj.id) {
                    return
                }
                this.$emit('change-folder', folderCas.reverse())
            },
            updateFolderTree(folderId) {
                getFoldList({ diskId: this.diskId, id: folderId === '0'? undefined: folderId }).then(res => {
                    this.$refs['folderTree'].updateKeyChildren(folderId, res.data)
                })
            },
            handleNodeContextMenu(e, nodeObj) {
                this.currentRightClickFolder = nodeObj
                if(nodeObj.id === '0') {
                    this.folderOperations = ROOT_FOLDER_CONTEXT
                }else {
                    this.folderOperations = FOLDER_TREE_CONTEXT
                }
            },
            handleClickOperation(code) {
                switch (code) {
                    case 'create':
                        this.createFold(this.currentRightClickFolder.id)
                        break;
                    case 'rename':
                        this.renameFold(this.currentRightClickFolder)
                        break;
                    case 'delete':
                        this.deleteFolder(this.currentRightClickFolder)
                        break
                }
            },
            createFold(folderId) {
                this.$prompt('文件夹名称:', '新建文件夹', {
                    closeOnClickModal: false,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: folderNameReg,
                    inputErrorMessage: folderRegTip,
                    // inputPattern: /\S/,
                    // inputErrorMessage: '名字不能为空',
                }).then(({value}) => {
                    this.loadingInstance = this.$loading({
                        lock: true,
                        text: '正在创建，请稍后...',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.7)'
                    })
                    createFold({folderName: value, id: folderId === '0'? undefined: folderId, diskId: this.diskId, diskType: this.diskType}).then(res => {
                        this.$refs['folderTree'].append({ id: res.data, folderName: value }, folderId)
                        this.$emit('update-data')
                        this.loadingInstance.close()
                    }).catch(() => {
                        this.loadingInstance.close()
                    })
                }).catch(() => {})

            },
            renameFold(nodeObj) {
                this.$prompt('请输入新的名称:', '重命名', {
                    closeOnClickModal: false,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: folderNameReg,
                    inputErrorMessage: folderRegTip,
                    // inputPattern: /^[0-9a-zA-Z-_\u4e00-\u9fa5 ]+$/,
                    // inputErrorMessage: '无法使用非法字符@ . / \\ 等，请重新输入',
                    inputPlaceholder: nodeObj.folderName,
                    inputValue: nodeObj.folderName
                }).then(({value}) => {
                    if (value === nodeObj.folderName) {
                        return
                    }
                    this.loadingInstance = this.$loading({
                        lock: true,
                        text: '正在重命名，请稍后...',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.7)'
                    })
                    renameFold({folderName: value, id: nodeObj.id}).then(() => {
                        nodeObj.folderName = value
                        this.$emit('update-data')
                        this.loadingInstance.close()
                    }).catch(() => {
                        this.loadingInstance.close()
                    })
                }).catch(() => {})
            },
            deleteFolder(nodeObj) {
                this.$confirm('确定要删除选中的记录吗？', '提示', 'error').then((res) => {
                    if (res) {
                        this.loadingInstance = this.$loading({
                            lock: true,
                            text: '正在删除，请稍后...',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        })
                        deleteFiles({fileIds: [nodeObj.id], diskId: this.diskId}).then(() => {
                            this.$refs['folderTree'].remove(nodeObj)
                            this.$emit('update-data')
                            this.loadingInstance.close()
                        }).catch(() => {
                            this.loadingInstance.close()
                        })
                    }
                })
            }
        },
        components: {
            BFilesHeader: () => import("./b-files-header"),
            BFilesTable: () => import("./b-files-table"),
            BFilesGrid: () => import("./b-files-grid"),
        },
    };
</script>
<style lang="scss" scoped>
    .b-files-node {
        height: 100%;
        display: flex;
        width: 100%;

        .b-files-node__main {
            flex: 1;
            height: 100%;
            width: 100%;
            padding: 10px 20px;
            transition: width .5s ease;

            .b-files-node__panel {
                width: 100%;
                height: calc(100% - 120px);
                position: relative;

                .bottom-pagination {
                    bottom: 10px;
                    position: fixed;
                    right: 10px;
                }
            }
        }

        .b-files-node__detail {
            width: 300px;
            flex-shrink: 0;
            padding: 20px;

            .title {
                font-size: 16px;
            }

            border-left: 1px solid #dedede;
            display: flex;
            flex-direction: column;
            font-size: 14px;

            img {
                height: 80px;
                object-fit: contain;
                margin: 40px auto;
            }

            .name {
                font-size: 16px;
                font-weight: bold;
            }

            .createTime,
            .modifyTime,
            .modifyTimes {
                margin-top: 10px;
                color: #555;
            }
        }
    }
</style>
