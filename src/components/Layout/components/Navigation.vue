<template>
    <ul class="navigation">
        <li
            v-for="{ path, title,icon, tag } in navigationRes"
            :key="path"
            :id="tag"
            :class="{ active: route.indexOf(path)>=0}"
            @click="$router.push(path)"
        >
            <img
                :src="icon"
                alt="icon"
            >
            <span>{{ title }}</span>
            <span class="block"></span>
        </li>
    </ul>
</template>
<script>
    import { mapGetters } from "vuex";
    export default {
        name: "Navigation",
        computed: {
            ...mapGetters(["navigation"]),
            noPublicDisk() {
                return this.$store.state.navigation.noPublicDisk
            },
            openGroup() {
                return this.$store.state.system.open_group
            },
            navigationRes() {
                if(this.openGroup === '0') {
                    let navigationRes = []
                    this.navigation.forEach(n => {
                        if(n.title !== '群组网盘') {
                            if(this.noPublicDisk && this.$route.path.indexOf('/admin') < 0) {
                                if(n.title !== '公共网盘') {
                                    navigationRes.push(n)
                                }
                            }else {
                                navigationRes.push(n)
                            }
                        }
                    })
                    return navigationRes
                }
                return this.navigation
            },
            route() {
                return this.$route.path;
            }
        }
    };
</script>
<style lang="scss" scoped>
    .navigation {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        -webkit-app-region: no-drag;
        li {
            width: 130px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            transition: all 0.5s ease;
            overflow: hidden;
            img {
                width: 18px;
                height: 18px;
                margin-right: 6px;
            }
            &.active {
                // background-color: $hover_color;
                background-color: var(--hover-color, $hover_color);
                $triangle_height: 10px;
                .block {
                    width: $triangle_height * 2;
                    height: $triangle_height;
                    position: absolute;
                    bottom: 0;
                    overflow: hidden;
                    &::after {
                        content: "";
                        width: $triangle_height;
                        height: $triangle_height;
                        background-color: #fff;
                        transform: rotate(45deg);
                        position: absolute;
                        bottom: -$triangle_height/2;
						left: 5px
                    }
                }
            }
        }
    }
</style>
