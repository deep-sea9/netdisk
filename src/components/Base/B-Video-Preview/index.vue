<template>
	<el-dialog :visible.sync="visible" fullscreen :show-close="false" destroy-on-close custom-class="previewClass" @open="handleOpen">
		<div class="b-video-preview">
			<div class="preview-header">
<!--				<img class="close-class" src="../../../assets/images/operation-icons/video/close.png" @click="visible = false" />-->
				<img v-if="themeValue === '1'" class="close-class" src="../../../assets/images/operation-icons/video/close.png"
					 @click="visible = false"/>
				<img v-else-if="themeValue === '2'" class="close-class" src="../../../assets/images/operation-icons/close_green.png"
					 @click="visible = false"/>
				<img v-else class="close-class" src="../../../assets/images/operation-icons/close.png"
					 @click="visible = false"/>
			</div>

			<div class="content-container" style="width: 80%;margin: 0 auto">
				<div class="preview-others text-ellipse-1">
					{{videoTitle}}
				</div>
				<div class="video-preview">
					<video-player class="vjs-custom-skin" ref="videoPlayer" :options="playerOptions" @ready="handleReady" @changed="handleChange($event)" />
<!--					<video src="http://localhost:2997/test.mov" controls></video>-->
				</div>

				<div class="operations">
					<el-button size="small" plain type="primary" icon="el-icon-share" @click="shareVisible = true">分享</el-button>
					<el-button size="small" plain type="primary" icon="el-icon-download" @click="handleDownload">下载</el-button>
					<el-button size="small" plain type="primary" icon="el-icon-picture-outline" @click="setCover">设当前画面为封面</el-button>
				</div>

				<div class="preview-others">
					其它视频
				</div>

				<div class="preview-video__thumb">
					<agile class="video-thumbnails" ref="thumbnails" :options="optionThumb">
						<div class="slide slide--thumbnails" v-for="(slide, index) in testSlides" :key="index" @click="$refs.thumbnails.goTo(index)">
							<img :src="slide" alt="" class="img-no-active">
						</div>

						<template slot="prevButton">
							<i class="fas fa-chevron-left" />
						</template>
						<template slot="nextButton">
							<i class="fas fa-chevron-right" />
						</template>

					</agile>
				</div>
			</div>
			<b-share :visible.sync="shareVisible" :ids="[videoResourceId]"></b-share>
		</div>
	</el-dialog>
</template>
<script>
	import 'vue-video-player/src/custom-theme.css'
	// import { previewVideo } from "@/api/common.js"

	import { downloadFiles } from '@/api/common.js'
	import { setVideoCover } from '@/api/file'

	import { dataURL2File } from '@/utils'

	const baseURL = process.env["VUE_APP_BASE_URL"]
	const previewURL = baseURL
export default {
	name: 'b-video-preview',
	props: {
		videoTitle: { type: String, default: '一只小青蛙' },
		videoResourceId: { type: String, default: '' },
		shareId: { type: String, default: '' },
		slides: {
			type: Array,
			default: () => []
		},

	},
	data() {
		return {
			bottomThumbHeight: 150,
			thumbShow: true,
			infoShow: false,
			optionThumb: {
				centerMode: true,
				dots: false,
				navButtons: true,
				slidesToShow: 5,
			},
			playerOptions: {
				height: '520',
				autoplay: false,
				hls: true,
				sources: [{
					type: 'video/mp4',
					// src: `${previewURL}/preview/video?fileId=${this.videoResourceId}`
				}],
				poster: '',
				language: 'zh-CN',
				playbackRates: [0.5, 1.0, 1.5, 2.0],
				notSupportedMessage: '此视频暂时无法播放，请稍后再试'
			},
			testSlides: [],
			shareVisible: false
		}
	},

	mounted() {

	},

	methods: {
		handleOpen() {
			this.$nextTick(() => {
				this.player = this.$refs.videoPlayer.player
				let video = document.getElementsByClassName('vjs-tech')[0]
				video.setAttribute('crossorigin', 'Anonymous')
			})
		},
		onPlayerTimeUpdate() {
			// console.log(e);
		},
		handleReady(player) {
			// console.log(player.tech);
			this.player = this.$refs.videoPlayer.player
			let video = document.getElementsByClassName('vjs-tech')[0]
			video.setAttribute('crossorigin', 'Anonymous')
			let isVhsSet = player.tech({ IWillNotUseThisInPlugins: true }).vhs
			let isBeforeRequestSet = isVhsSet && undefined !== player.tech({ IWillNotUseThisInPlugins: true }).vhs.xhr.beforeRequest
			if(isVhsSet && !isBeforeRequestSet) {
				player.tech({ IWillNotUseThisInPlugins: true }).vhs.xhr.beforeRequest = (options) => {
					console.log(options);
					options.headers = {
						'token': this.$store.getters.token
					}
					return options
				}
			}
		},
		handleChange(playerCurrentState) {
			console.log(playerCurrentState);
		},
		handleDownload() {
			downloadFiles({fileId: this.videoResourceId}).then(res => {
				let blob = new Blob([res], {
					type: 'charset=utf-8'
				});
				let objectUrl = URL.createObjectURL(blob);
				let a = document.createElement("a");
				a.href = objectUrl;
				a.download = this.videoTitle;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			})
		},
		setCover() {
			let video = document.getElementsByClassName('vjs-tech')[0]
			let _canvas = document.createElement('canvas')
			let w = window.innerHeight
			let h = (w/16)*9
			_canvas.width = w
			_canvas.height = h
			const ctx = _canvas.getContext('2d')
			ctx.drawImage(video, 0, 0, w, h)
			let imgUrl = _canvas.toDataURL('image/png')
			let coverImgFile = dataURL2File(imgUrl)
			let formData = new FormData()
			formData.append('fileId', this.videoResourceId)
			formData.append('file', coverImgFile)

			setVideoCover(formData).then(res => {
				this.$message.success(res.message || '设置成功')
				_canvas = null
			})
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
		}
	},
	watch: {
		videoResourceId: {
			handler() {
				// previewVideo(val, 'bytes=0-10000').then(res => {
				// 	let blob = new Blob([res], {
				// 		type: "image/PNG",
				// 	});
				// 	let objectUrl = URL.createObjectURL(blob);
				//
				// 	this.$set(this.playerOptions, 'sources', [{
				// 		type: 'video/mp4',
				// 		src: objectUrl
				// 		// src: `${previewURL}/preview/video?fileId=${this.videoResourceId}`
				// 	}])
				// })
				console.log(this.videoResourceId);
				this.$set(this.playerOptions, 'sources', [{
					type: 'video/mp4',
					src: `${previewURL}/preview/video?fileId=${this.videoResourceId}&userId=${this.$store.state.user.userId}&shareId=${this.shareId}`
				}])
				this.$set(this.playerOptions, 'poster', `${previewURL}/preview/compressPic?fileId=${this.videoResourceId}`)
			}
		}
	}
}
</script>
<style lang="scss">
	.previewClass {

		.agile__nav-button {
			background: transparent;
			border: none;
			color: #ccc;
			cursor: pointer;
			font-size: 24px;
			transition-duration: .3s;

			&:hover {
				color: #888;
			}
		}
		.agile__dot {
			margin: 0 10px;

			button {
				background-color: #eee;
				border: none;
				border-radius: 50%;
				cursor: pointer;
				display: block;
				height: 10px;
				font-size: 0;
				line-height: 0;
				margin: 0;
				padding: 0;
				transition: .3s;
				width: 10px;
			}
		}
		.agile__dot--current button,.agile__dot:hover button {
			background-color: #888;
		}

		.el-dialog__header {
			display: none !important;
			padding: 0;
		}

		.b-video-preview{
			padding: 20px;
			width: 100%;
			margin: 0 auto;
			color: #000;
			height: 100vh;
			background: #fff;
			position: relative;
			overflow: hidden;
			.preview-header {
				text-align: right;
				padding: 10px 0px;
				font-size: 1.5rem;

				.close-class {
					cursor: pointer;
				}
			}

			.video-preview {
				width: 100%;
				height: 550px;

				.agile-main {
					margin: 0 auto;
					width: 70%;
				}
			}

			.operations {
				margin: 20px 0;
			}

			.slide {
				align-items: center;
				box-sizing: border-box;
				display: flex;
				height: 600px;
				width: 70%;
				justify-content: center;

				img {
					height: 100%;
					width: 100%;
					object-fit: cover;
					object-position: center;
				}
			}

			.preview-others {

				margin: 0 auto;
				height: 40px;
				box-sizing: border-box;
				color: #000;
				font-size: 1.2rem;
				text-align: left;
				font-weight: bold;
				border-bottom: 1px solid #c3c6c9;
			}

			.preview-video__thumb {
				user-select: none;
				width: 100%;
				height: 120px;
				overflow: hidden;
				margin-top: 10px;
				position: relative;


				.img-no-active {
					filter: brightness(50%);
				}

				.video-thumbnails {
					box-sizing: border-box;
					width: 90%;
					margin: 0 auto;

					.agile__actions {
						.agile__nav-button {
							position: absolute;
							top: 50%;
							transform: translateY(-50%);
						}
						.agile__nav-button--prev {
							left: -5%;
						}
						.agile__nav-button--next {
							right: -5%;
						}
					}

					.slide--thumbnails {
						cursor: pointer;
						height: 110px;
						padding: 10px 15px;
						box-sizing: border-box;
						transition: opacity .3s;
						&:hover {
							opacity: .75;
						}
					}
					.agile__slide--active {
						filter: none;
					}
				}
			}
		}
	}

</style>
