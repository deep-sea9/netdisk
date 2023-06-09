<template>
    <div class="audio-panel" :style="{height: !zoomIn? '240px': '42px'}" v-if="visible">
        <div class="audio-panel__header">
            <span style="flex: 1;" class="text-ellipse-1">{{title}}</span>
            <div style="width: 50px">
                <i :class="{
					'el-icon-minus': !zoomIn,
					'el-icon-full-screen': zoomIn
				}" :style="{
					marginRight: '10px',
					cursor: 'pointer'
				}" @click="zoomInOrOut"/>
                <i class="el-icon-close" style="cursor: pointer" @click="visible = false"/>
            </div>
        </div>

        <div class="audio-panel__controller">
            <img :src="preIcon" class="audio-operation"
                 @click="$emit('pre-song')">
            <img :src="audio.playing?pauseIcon: playIcon"
                 class="audio-operation" @click="playOrPause">
            <img :src="preIcon" class="audio-operation"
                 @click="$emit('next-song')"
                 style="transform: rotate(-180deg)">
        </div>
        <div class="audio-progress__container">
            <span>{{ currentTime }}</span>
            <div class="audio-panel__progress">
                <el-slider v-model="percentage" :format-tooltip="formatProcessToolTip" @change="processChange"/>
            </div>
            <span>{{ maxFormatTime }}</span>
        </div>

        <audio ref="audio" style="display: none" :src="audioURL" :preload="audio.preload"
               @play="handlePlay"
               @error="handleError"
               @waiting="handleWaiting"
               @pause="handlePause"
               @timeupdate="handleTimeUpdate"
               @loadedmetadata="handleLoadedMeta"/>
    </div>
</template>
<script>

    import {previewAudio} from "@/api/common.js"

    function formatSecond(second) {
        let secondType = typeof second
        if (secondType === 'number' || secondType === 'string') {
            second = parseInt(second)

            let hours = Math.floor(second / 3600)
            second = second - hours * 3600
            let minute = Math.floor(second / 60)
            second = second - minute * 60

            return `${hours}:${('0' + minute).slice(-2)}:${('0' + second).slice(-2)}`
        } else {
            return '0:00:00'
        }
    }

    export default {
        name: 'b-audio-preview',
        props: {
            url: {type: String, default: ''},
            title: {type: String, default: '小青蛙.wav'},
            audioId: {type: String, default: ''},
            shareId: {type: String},
        },
        data() {
            return {
                zoomIn: false,
                percentage: 0,

                audio: {
                    min: 0,
                    maxTime: 5 * 60 + 30,
                    currentTime: 0,
                    playing: false,
                    loading: false,
                    waiting: true,
                    preload: 'auto'
                },

                currentTime: '00:00',
                maxFormatTime: '00:00',

                audioURL: ''
            }
        },

        methods: {
            zoomInOrOut() {
                this.zoomIn = !this.zoomIn
            },
            formatProcessToolTip(value) {
                return '当前进度：' + formatSecond(parseInt(this.audio.maxTime / 100 * value))
            },
            processChange(value) {
                console.log(value);
                this.$refs.audio.currentTime = parseInt(value / 100 * this.audio.maxTime)
            },
            handlePlay(res) {
                this.audio.playing = true
                this.audio.loading = false
                console.log(res);
            },
            handleError(err) {
                console.log(err);
                this.audio.waiting = true
            },
            handleWaiting(res) {
                console.log(res);
            },
            handlePause() {
                this.audio.playing = false
            },
            handleTimeUpdate(res) {
                this.audio.currentTime = res.target.currentTime
                this.currentTime = formatSecond(parseInt(this.audio.currentTime))
                this.percentage = parseInt(this.audio.currentTime / this.audio.maxTime * 100)
            },
            // 加载语音流元数据完成后，触发该回调
            // 语音元数据主要是语言的长度之类的数据
            handleLoadedMeta(res) {
                console.log('meta', res);
                this.audio.waiting = false
                this.audio.maxTime = parseInt(res.target.duration)
                this.maxFormatTime = formatSecond(parseInt(this.audio.maxTime))
            },
            startPlay() {
                this.$refs.audio.play()
                // this.audio.playing = true
            },
            pausePlay() {
                this.$refs.audio.pause()
                // this.audio.playing = false
            },
            playOrPause() {
                this.audio.playing ? this.pausePlay() : this.startPlay()
            }
        },
        computed: {
            visible: {
                get() {
                    return this.$attrs.visible
                },
                set(value) {
                    this.$emit('update:visible', value)
                },
            },
            themeValue() {
                return this.$store.state.system.themeValue
            },
            preIcon() {
                switch (this.themeValue) {
                    case '1':
                        return require('../../../assets/images/operation-icons/audio/pre.png')
                    case '2':
                        return require('../../../assets/images/operation-icons/audio/pre_green.png')
                    default:
                        return require('../../../assets/images/operation-icons/audio/pre.png')
                }
            },
            playIcon() {
                switch (this.themeValue) {
                    case '1':
                        return require('../../../assets/images/operation-icons/audio/play.png')
                    case '2':
                        return require('../../../assets/images/operation-icons/audio/play_green.png')
                    default:
                        return require('../../../assets/images/operation-icons/audio/play.png')
                }
            },
            pauseIcon() {
                switch (this.themeValue) {
                    case '1':
                        return require('../../../assets/images/operation-icons/audio/pause.png')
                    case '2':
                        return require('../../../assets/images/operation-icons/audio/pause_green.png')
                    default:
                        return require('../../../assets/images/operation-icons/audio/pause.png')
                }
            }
        },

        watch: {
            audioId(val) {
                previewAudio(val, 'bytes=0-', this.shareId).then(res => {
                    let blob = new Blob([res], {
                        type: "audio",
                    });
                    this.audioURL = URL.createObjectURL(blob)
                })
            }
        }
    }
</script>
<style lang="scss" scoped>
    .audio-panel {
        position: fixed;
        left: $side_width;
        bottom: 0;
        background-color: #fafdff;
        z-index: 999;
        width: 440px;
        box-shadow: 0 0 10px #ccc;
        border: 1px solid #dedede;
        text-align: center;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        height: 240px;
        transition: height .3s ease;

        .audio-panel__header {
            display: flex;
            /*background-color: #dfeaf7;*/
            background-color: var(--hover-color, $hover_color);
            line-height: 42px;
            justify-content: space-between;
            width: 100%;
            border-bottom: 1px solid #dedede;
            padding: 5px 15px;
            box-sizing: border-box;
            font-weight: bold;
        }

        .audio-panel__controller {
            margin-top: 30px;
            display: flex;
            align-items: center;
            justify-content: center;

            .audio-operation {
                margin: 0 20px;
                cursor: pointer;
            }
        }

        .audio-progress__container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 95%;
            color: #999;
            font-size: .8rem;
            margin: 0 auto;

            .audio-panel__progress {
                width: 70%;
                margin: 0 10px;
            }
        }
    }

</style>
