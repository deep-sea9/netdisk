<template>
    <div class="b-files-header">
        <span>全部文件</span>
        <div class="operate">
            <b-icon
                class="operate-item"
                :class="{ active: !isGrid }"
                icon="fa-th-list"
                theme="regular"
                @click="isGrid = false"
            />
            <b-icon
                class="operate-item"
                :class="{ active: isGrid }"
                icon="fa-th-large"
                theme="regular"
                @click="isGrid = true"
            />
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
        },
        methods: {
            handle(){
                this.isExpand = !this.isExpand
            }
        }
    };
</script>
<style lang='scss' scoped>
    $header: 30px;
    .b-files-header {
        display: flex;
        justify-content: space-between;
        color: #888;
        font-size: 12px;
        height: $header;
        align-items: center;
        margin-bottom: 10px;
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
