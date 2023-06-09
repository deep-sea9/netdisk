<template>
    <div id="app">
        <router-view />
    </div>
</template>
<script>
    import UpdateNotice from '@/utils/UpdateNotice'
    export default {
        data() {
            return {};
        },
        computed: {
            noticeOpen() {
                return this.$store.state.system.notice_open
            }
        },
        methods: {
            startListening() {
                this.updateNotice = new UpdateNotice({
                    timer: 10000
                })

                this.updateNotice.on('no-update', () => {
                    console.log('未更新');
                })
                this.updateNotice.on('update', () => {
                    this.$notify({
                        title: '更新通知',
                        message: '发现有新版本，刷新体验最新版本功能'
                    })
                })
            },
            offListening() {
                this.updateNotice.off('no-update')
                this.updateNotice.off('update', clearInterval(this.updateNotice.timer))
            }
        },
        watch: {
            noticeOpen: {
                immediate: true,
                handler(v) {
                    if(v === '1') {
                        this.startListening()
                    }else {
                        console.log(this.updateNotice);
                        this.updateNotice && this.offListening()
                    }
                }
            }
        }
    };
</script>
<style lang="scss">


    #app {
        width: 100vw;
        height: 100vh;
    }
    .el-button {
        -webkit-app-region: no-drag;
    }
    #select-box {
        border: 1px solid #ddd;
        /*background-color: rgba(137, 217, 255, .5);*/
        background-color: var(--drag-select-bg-color, rgba(137, 217, 255, .5));
        position: absolute;
        display: block;
        z-index: 999;
    }

    .text-ellipse-1 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
