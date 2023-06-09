<template>
    <el-menu-item
        v-if="childLength === 0 "
        :index="resolve(data.path)"
    >
        <i  v-if="!data.meta.iconType"
            class="menu-icon"
            :class="data.meta.icon"
        ></i>
        <z-svg-icon v-else :icon-class="data.meta.icon" />
        <span slot="title">{{data.meta.title}}</span>
    </el-menu-item>
<!--    <el-menu-item-->
<!--        v-else-if="childLength === 1 "-->
<!--        :index="resolve(data.children[0].path)"-->
<!--    >-->
<!--        <i  v-if="!data.meta.iconType"-->
<!--            class="menu-icon"-->
<!--            :class="data.meta.icon"-->
<!--        ></i>-->
<!--        <z-svg-icon v-else :icon-class="data.meta.icon" />-->
<!--        <span slot='title'>{{data.children[0].meta.title}}</span>-->
<!--    </el-menu-item>-->
    <fragment v-else>
        <el-submenu :index="resolve(data.path)" popper-append-to-body>
            <template slot='title'>
                <i  v-if="!data.meta.iconType"
                    class="menu-icon"
                    :class="data.meta.icon"
                ></i>
                <z-svg-icon v-else :icon-class="data.meta.icon" />
                <span slot='title'>
                    <el-tooltip v-if="data.meta.title.length > (120 / 16)" :content="data.meta.title">
                        <span style="width: 80%;display: inline-block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap">{{data.meta.title}}</span>
                    </el-tooltip>
                    <span v-else slot="title">{{data.meta.title}}</span>
                </span>
            </template>
            <template v-for="child in data.children">
                <mf-menu-item
                    :key="child.path"
                    :data="child"
                    :base="resolve(data.path)"
                />
            </template>
        </el-submenu>
    </fragment>
</template>
<script>
    import { Fragment } from "vue-fragment";
    import path from "path";
    export default {
        name: "mf-menu-item",
        props: {
            data: Object,
            base: String,
            type: { type: String, default: 'personal' }
        },
        components: {
            Fragment
        },
        computed: {
            childLength() {
                const {
                    data: { children }
                } = this;
                return children?.length ?? 0;
            }
        },
        methods: {
            resolve(routePath) {
                // console.log(path.resolve(this.base, routePath));
                return path.resolve(this.base, routePath);
            }
        }
    };
</script>
<style lang='scss' scoped>
</style>
