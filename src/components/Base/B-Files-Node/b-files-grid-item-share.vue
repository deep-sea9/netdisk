<template>
    <ul class="b-file-grid-item"
        :class="{ checked }"
        @contextmenu="handleContextMenu"
        @click="handleCheck">
        <img class="file-icon"
             @dblclick.stop="handleClick"
             :src="src"/>
        <el-tooltip effect="dark" placement="bottom" :content="getFileName(file)">
            <li class="file-name">{{ getFileName(file) }}</li>
        </el-tooltip>
        <b-icon icon="fa-check-circle" class="file-check"/>
    </ul>
</template>
<script>
    /*eslint-disable*/
    import fetchFileIcon from "@/utils/fetchFileIcon.js";
    import { getThumnUrlOfImg } from '@/api/file'
    import _mixin from "./mixin";

    export default {
        name: "b-files-grid-item-fav",
        mixins:  [_mixin],
        props: {
            file: {
                type: Object,
                required: true,
            },
            selection: Array,
            addSelection: Function,
            removeSelection: Function,
            removeAllSelection: Function,
        },
        data() {
            return {
                checked: false,
                fileLimits: [],
                fileLimitsLoading: false
            };
        },
        methods: {
            fetchFileIcon,
            handleCheck() {
                this.checked = !this.checked;
                if (this.checked) {
                    this.addSelection(this.file);
                } else {
                    this.removeSelection(this.file);
                }
            },
            handleClick() {
                this.$emit('item-click', this.file)
            },
            setNodeChecked() {
                this.addSelection(this.file);
            },
            setNodeUnchecked() {
                this.removeSelection(this.file);
            },
            handleContextMenu() {
                this.removeAllSelection()
                this.setNodeChecked()
                this.$emit('context-menu', this.file)
            }
        },
        watch: {
            selection: {
                deep: true,
                immediate: true,
                handler(selection) {
                    this.checked = selection.some((cur) => {
                        // return cur.fileId === this.file.fileId;
                        return cur.fileId + cur.id === this.file.fileId + this.file.id
                    });
                },
            }
        },
        computed: {
            src() {
                if(this.file.fileKind === '图片'|| this.file.fileKind === '视频') {
                    return getThumnUrlOfImg(this.file.fileId)
                }else {
                    return this.fetchFileIcon(this.file.fileType, this.file.fileName || this.file.folderName, this.file.tableKind)
                }

            }
        }
    };
</script>
<style lang="scss" scoped>
    .b-file-grid-item {
        width: 100%;
        max-width: 120px;
        height: 127px;
        border: 1px solid transparent;
        border-radius: 5px;

        box-sizing: border-box;
        padding: 4px;
        position: relative;
        cursor: pointer;

        &:hover {
            background-color: #f1f5fa;

            .file-check {
                position: absolute;
                top: 5px;
                left: 5px;
                font-size: 19px;
                /*color: #9dddff;*/
                color: var(--hover-color, $hover_color)
            }
        }

        &.checked {
            /*border-color: #90d8ff;*/
            border-color: var(--light-color, $light_color);
            /*background-color: #f1f5fa;*/
            /*background-color: #c3d9ff;*/
            background-color: var(--light-color, $light_color);

            .file-check {
                position: absolute;
                top: 5px;
                left: 5px;
                font-size: 19px;
                /*color: #09aaff;*/
                color: var(--main-color, $main_color);
            }
        }

        .file-icon {
            display: block;
            margin: 9px auto 0;
            width: 60px;
            height: 60px;
            background-repeat: no-repeat;
            overflow: hidden;
            background-size: 60px 60px;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .file-name {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            text-align: center;
            font-size: 12px;
            color: #666;
        }

        .file-check {
            position: absolute;
            top: 5px;
            left: 5px;
            font-size: 19px;
            color: transparent;
        }
    }
</style>
