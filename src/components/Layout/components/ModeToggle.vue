<template>
    <ui-switch :bg-color="mainColor" v-model="value" @change="change" :items="switchItem" :default-index="defaultIndex" style="margin-right: 20px;color: #fff !important;"/>
</template>

<script>

    import { ADMIN_ROUTES, ADMIN_ROUTES_NO_GROUP, USER_ROUTES, USER_ROUTES_NO_GROUP, USER_ROUTES_NO_PUBLIC } from '@/utils/constants.js'
    import { mapGetters } from "vuex";
    import { THEME_SKINS, THEME_OPTIONS } from "@/utils/constants";

    export default {
        name: 'Mode-Toggle',
        data() {
            return {
                value: 'admin',
                switchItem: [
                    {name: "user", label: "用户模式"},
                    {name: "admin", label: "管理员模式"}
                ],
                defaultIndex: 1
            };
        },
        computed: {
            themeValue() {
                return this.$store.state.system.themeValue
            },
            mainColor() {
                const selectedTheme = THEME_SKINS.find(t => t.value === this.themeValue) || {}
                const selectedColor = THEME_OPTIONS.find(t => t.name === selectedTheme.name)
                return selectedColor['--light-color']
            },
            openGroup() {
                return this.$store.state.system.open_group
            },
            noPublicDisk() {
                return this.$store.state.navigation.noPublicDisk
            }
        },
        created() {
            if(this.$route.fullPath.indexOf('admin')>-1) {
                this.value = 'admin'
                this.defaultIndex = 1
                console.log(this.defaultIndex);
            }else {
                this.value = 'user'
                this.defaultIndex = 0
            }
        },
        methods: {
            change() {
                if (this.value === 'admin') {
                    if(this.openGroup === '0') {
                        this.$store.commit('setNavigation', ADMIN_ROUTES_NO_GROUP)
                    }else {
                        this.$store.commit('setNavigation', ADMIN_ROUTES)
                    }

                    this.$router.push('/admin/personal/used')
                }else {
                    if(this.openGroup === '0') {
                        if(this.noPublicDisk) {
                            const navigations = [USER_ROUTES_NO_GROUP[0]]
                            this.$store.commit('setNavigation', navigations)
                        }else {
                            this.$store.commit('setNavigation', USER_ROUTES_NO_GROUP)
                        }
                    }else {
                        if(this.noPublicDisk) {
                            this.$store.commit('setNavigation', USER_ROUTES_NO_PUBLIC)
                        }else {
                            this.$store.commit('setNavigation', USER_ROUTES)
                        }
                    }

                    this.$router.push('/personal/all')
                }
            }
        }
    }
</script>

<style scoped>

</style>
