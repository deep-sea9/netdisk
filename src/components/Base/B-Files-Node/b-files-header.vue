<template>
    <div class="b-files-header">
        <div>
            <span class="no-last" @click="toPre" v-if="indexList.length > 1">返回上一级  | </span>
            <span v-for="(fold, index) in indexList"
                  :key="fold.id"
                  @click="toPrevious(fold, index)" :class="{
                    'no-last': index < indexList.length - 1
            }">
                {{ fold.folderName }}
                <span v-if="index < indexList.length - 1">></span>
            </span>
        </div>
        <div class="operate">
            <b-icon
                    v-if="fileType === 'all'"
                    class="operate-item"
                    :class="{ active: treeView }"
                    icon="fa-list"
                    theme="regular"
                    @click="toggleTreeView"
            />
            <b-icon
                class="operate-item"
                :class="{ active: !isGrid }"
                icon="fa-th-list"
                theme="regular"
                @click="toggleIsGrid(false)"
            />
            <b-icon
                class="operate-item"
                :class="{ active: isGrid }"
                icon="fa-th-large"
                theme="regular"
                @click="toggleIsGrid(true)"
            />
<!--            style="color:#06a7ff"-->
            <b-icon
                class="operate-item"

                :icon="expandIcon"
                theme="regular"
                @click="handle"
            />
        </div>
    </div>
</template>
<script>
    export default {
        name: "b-files-header",
        props: {
            indexList: {
                type: Array,
                default: () => [
                    {
                        diskId: '1',
                        id: '',
                        folderName: '全部文件',
                        parentId: '0',
                        updateTime: null,
                        createTime: null,
                        sequence: 1
                    }
                ]
            },
            fileType: { type: [String, Number], default: 'all' }
        },
        computed: {
            expandIcon(){
                if(this.isExpand){
                    return 'fa fa-arrow-alt-square-right'
                }else{
                    return "fa fa-arrow-alt-square-left"
                }
            },
            isGrid: {
                get() {
                    return this.$attrs.isGrid;
                    // return !!this.$store.state.app.isGrid[this.$route.name];
                },
                set(value) {
                    return this.$emit("update:isGrid", value);
                }
            },
            isExpand: {
                get() {
                    return this.$attrs.isExpand;
                },
                set(value) {
                    return this.$emit("update:isExpand", value);
                }
            },
            treeView: {
                get() {
                    return this.$attrs.treeView;
                },
                set(v) {
                    this.$emit("update:treeView", v)
                }
            }
        },
        methods: {
            toggleTreeView() {
                this.treeView = !this.treeView
            },
            handle(){
                this.isExpand = !this.isExpand
            },
            toPre() {
                this.$emit('to-pre', this.indexList[this.indexList.length - 2])
            },
            toPrevious(current, index) {

                if(index < this.indexList.length - 1) {
                    this.$emit('to-previous', current, index)
                }

            },
            toggleIsGrid(isGrid) {
                this.isGrid = isGrid
                const gridConfig = {
                    [this.$route.name]: isGrid
                }
                this.$store.commit('app/SET_IS_GRID', gridConfig)
                this.$store.commit('app/SET_GLOBAL_GRID', isGrid)
            }
        }
    };
</script>
<style lang='scss' scoped>
    $header: 30px;
    .b-files-header {
        display: flex;
        justify-content: space-between;
        color: #999;
        font-size: 12px;
        height: $header;
        align-items: center;
        margin-bottom: 10px;

        .no-last {
            cursor: pointer;
            /*color: #008FCC;*/
            color: var(--main-color, $main_color);
        }

        .operate {
            font-size: 20px;
            width: 120px;
            display: flex;
            justify-content: space-around;
            cursor: pointer;
            .operate-item {
                transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
                &.active {
                    // color: $main_color;
                    color: var(--main-color, $main_color);
                }
                &:hover {
                    // color: $main_color;
                    color: var(--main-color, $main_color);
                }
            }
        }
    }
</style>
