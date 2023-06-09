<template>
    <div class="skins-container">
        <div class="skins-type">
            <div class="skin-item" v-for="skin in themeSkins" :key="skin.value" @click="handleToggleTheme(skin)">
                <div class="skin-border" :style="{ borderWidth: themeValue === skin.value ? `1px`: 0, borderStyle: 'solid', borderColor: skin.color  }">
                    <div class="skin-show" :style="{ backgroundImage: `linear-gradient(to bottom, ${skin.color}, #fff)` }"></div>
                </div>
                <div class="skin-label" :style="{color: skin.color}">{{ skin.label }}</div>
            </div>
        </div>

    </div>
</template>

<script>
    import { saveDiskConfig } from '@/api/common.js'
    // import Theme from 'theme-vue'

    export default {
        name: "theme-config",
        data() {
            return {
                // themeInstance: null
            }
        },
        computed: {
            themeSkins() {
                return this.$store.state.system.themeSkins
            },
            themeValue() {
                return this.$store.state.system.themeValue
            }
        },
        mounted() {
            // this.themeInstance = new Theme()
        },

        methods: {
            handleToggleTheme(skin) {
                this.loadingInstance = this.$loading({
                    lock: true,
                    text: '正在切换，请稍后...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.5)'
                })
                saveDiskConfig([{ code: 'sys_color', value: skin.value }]).then(res => {
                    this.loadingInstance.close()
                    this.$message.success(res.message || '修改成功')
                    this.$store.commit('system/SET_THEME_VALUE', skin.value)
                    this.$_th.changeTheme(skin.color)
                }).catch(_ => this.loadingInstance.close())
            }
        }
    }
</script>

<style lang="scss" scoped>
    .skins-container {
        padding: 15px;

        .skins-type {
            width: 100%;
            height: 150px;
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .skin-item {
                width: 80px;
                height: 120px;
                border-radius: 5px;
                padding: 3px;
                margin-right: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                cursor: pointer;

                .skin-border {
                    width: 100%;
                    height: 80px;
                    border-radius: 5px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .skin-show {
                        width: 90%;
                        height: 90%;
                        border-radius: 5px;
                    }
                }

                .skin-label {
                    color: #a5a5a5;
                    font-size: .8rem;
                }


            }
        }
    }
</style>
