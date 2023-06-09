<template>
    <ul class="operations">
        <li
                class="flex-center"
                v-for="{ icon, event } in operations"
                :key="event"
                :id="event"
                @click="handleOperate(event)"
        >
            <b-icon v-if="event !== 'restore' || event !== 'maximize'" :icon="icon" theme="regular"
                    :class="{'last-child': event === 'close', 'rotate-90': icon === 'fa-exchange-alt'}"/>
            <b-icon v-else-if="windowStatus === 'restore'" icon="maximize" theme="regular"/>
        </li>
    </ul>
</template>
<script>
    export default {
        name: 'Operations',
        data() {
            return {
                operationList: [
                    {icon: 'fa-exchange-alt', event: 'translate'},
                    // { icon: 'fa-bell', event: 'notify' },
                    // { icon: 'fa-cog', event: 'setting' },
                    // { icon: 'fa-question-circle', event: 'help' },
                    {icon: 'fa-minus', event: 'minimize'},
                    {icon: 'fa-window-maximize', event: 'maximize'}, // window-restore
                    {icon: 'fa-window-restore', event: 'restore'}, // window-restore
                    {icon: 'fa-close', event: 'close'},
                ],
            }
        },
        computed: {
            windowStatus() {
                return this.$store.state.app.windowStatus
            },
            operations() {
                if (this.$store.state.app.isDesktop) {
                    const copyOperations = JSON.parse(JSON.stringify(this.operationList))
                    this.windowStatus === 'maximize' ? copyOperations.splice(2, 1) : copyOperations.splice(3, 1)
                    return copyOperations
                } else {
                    return [
                        {icon: 'fa-exchange-alt', event: 'translate'},
                        {icon: 'fa-user', event: 'session'}
                    ]
                }

            }
        },
        methods: {
            handleOperate(event) {
                console.log(event)
                switch (event) {
                    case 'translate':
                        this.$router.push({
                            name: event
                        })
                        return;
                    case 'session':
                        this.$router.push({
                            name: event
                        })
                        return;

                    case 'minimize':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'minimize')
                        window.globalAPI.minimize();
                        return;

                    case 'maximize':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'maximize')
                        window.globalAPI.maximize()
                        return;

                    case 'restore':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'restore')
                        window.globalAPI.restore()
                        return;

                    case 'close':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'restore')
                        window.globalAPI.closeMain()
                        return;

                }

            },
        },
    }
</script>
<style lang="scss" scoped>
    .operations {
        display: flex;
        height: 100%;
        align-items: center;

        li {
            /*margin-right: 20px;*/
            font-size: 20px;
            cursor: pointer;
            width: 40px;
            height: 100%;
            align-items: center;
            display: flex;
            justify-content: center;

            .rotate-90 {
                transform: rotate(90deg);
            }

            &:hover {
                /*background-color: #38b9ff;*/
                background-color: var(--hover-color, $hover_color);
            }

            &:nth-child(3) {
                font-size: 15px;
            }

            &.last-child {
                &:hover {
                    background-color: red;
                }
            }
        }
    }
</style>
