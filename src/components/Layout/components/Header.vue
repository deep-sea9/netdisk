<template>
    <div class="layout-header">
        <div class="drag-area"></div>
        <div class="header-left" style="-webkit-app-region: drag;">
            <slot name="logo"></slot>
            <slot name="nav"></slot>

        </div>
        <div class="header-right">
            <slot name="mode"></slot>
            <slot name="user"></slot>
            <slot name="operations"></slot>
        </div>
    </div>
</template>
<script>
    import Driver from "driver.js";
    import LStorage from "@/utils/storage-packing";

    export default {
        name: 'layout-header',
        mounted() {
            this.storage = new LStorage({ prefix: 'guider' })

            if(this.storage.getItem('first') === '0') return

            this.steps = [
                {
                    element: '#operations',
                    popover: {
                        title: '操作栏',
                        description: '在此上传或新建文件/夹'
                    }
                },
                {
                    element: '#translate',
                    popover: {
                        title: '传输列表入口',
                        description: '上传文件或者下载文件时，可以通过此入口进入到传输列表查看文件进度',
                        position: 'left',
                        offset: 20,
                    }
                },
                {
                    element: '#file-type',
                    popover: {
                        title: '文件分类',
                        description: '可以通过此菜单栏查看文件分类信息',
                        position: 'right'
                    }
                },
                {
                    element: '.navigation',
                    popover: {
                        title: '网盘分类',
                        description: '网盘类型区分三种不同功能类型',
                        position: 'bottom'
                    }
                },
                {
                    element: '#personal',
                    popover: {
                        title: '个人网盘',
                        description: '存储个人文件，该网盘中文件仅有自己能够访问',
                        position: 'bottom'
                    },
                    onNext: this.tagNoFirstLogin
                },
                {
                    element: '#public',
                    popover: {
                        title: '公共网盘',
                        description: '管理员才能创建的网盘类型，主要用于存储公共文件，即所有被邀请进入的网盘成员且给予权限才能访问该类型网盘文件',
                        position: 'bottom'
                    },
                    onNext: this.tagNoFirstLogin
                },
                {
                    element: '#group',
                    popover: {
                        title: '群组网盘',
                        description: '每个人都能建立的群组共享文件的网盘类型，上传至此类型网盘的文件，在此群组中的成员均能访问',
                        position: 'bottom'
                    },
                    onNext: this.tagNoFirstLogin
                },
            ]
            this.driver = new Driver({
                padding: 0,
                doneBtnText: '开始体验',
                closeBtnText: '关闭',
                nextBtnText: '下一步',
                prevBtnText: '上一步',
                stageBackground: '#ccc'
            })
            this.driver.defineSteps(this.steps)
            this.driver.start()
        },
        methods: {
            tagNoFirstLogin() {
                console.log(this.driver, this.driver.hasNextStep());
                if(!this.driver.hasNextStep()) {
                    this.storage.setItem('first', '0')
                }
            },
            directTagLogin() {
                this.storage.setItem('first', '0')
            }
        }
    }
</script>
<style lang="scss" scoped>
    .layout-header,
    .header-left,
    .header-right {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .layout-header {
        width: 100vw;
        height: 50px;
        // background-color: $main_color;
        background-color: var(--main-color, $main_color);
        color: #fff;
        justify-content: space-between;
        user-select: none;
        flex-shrink: 0;

        .drag-area {
            -webkit-app-region: drag;
            width: 100%;
            height: 20px;
            position: fixed;
            background: transparent;
            top: 0;
            left: 0;
        }
    }
</style>
