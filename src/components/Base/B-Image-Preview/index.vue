<template>
	<el-dialog v-on="$listeners" :visible.sync="visible" fullscreen :show-close="false" custom-class="img-previewClass" @open="handleOpen">
		<div class="b-preview-body" :style="{ width: infoShow? 'calc(100% - 300px)': '100%' }">
			<div class="preview-header">
				<i @click="visible = false" class="el-icon-close close-class" />
			</div>

			<div class="preview-body">
				<agile class="agile-main" ref="main" :options="optionMain" :as-nav-for="asNavForMain" :initial-slide="initialSlide" @after-change="handleAfterChange">
					<div class="slide" v-for="(slide, index) in slides" :key="index" :class="`slide-${index}`">
						<img :src="slide.objUrl" alt="" :style="{
							transform: `scale(${scale}) rotate(${rotate}deg)`
						}">
					</div>
					<template slot="prevButton">
						<i class="fas fa-chevron-left" />
					</template>
					<template slot="nextButton">
						<i class="fas fa-chevron-right" />
					</template>
				</agile>


			</div>

			<div class="preview-operation" :style="{ 'bottom': thumbShow ? '150px' : '0px' }">
				<div class="image-view__nav-bottom">
					<div class="image-view__nav-bottom-icon">
						<span class="image-view__nav-bottom-icon-button img-container__printer"></span>
					</div>
				</div>
				<div class="image-view__nav-bottom">
					<div class="image-view__nav-bottom-icon" @click="scale += .15">
						<span class="image-view__nav-bottom-icon-button img-container__larger"></span>
					</div>
					<div class="image-view__nav-bottom-icon" style="margin-left: 30px;" @click="scale -= .15">
						<span class="image-view__nav-bottom-icon-button img-container__smaller"></span>
					</div>
					<div class="image-view__nav-bottom-icon" style="margin-left: 30px;" @click="rotate -= 45">
						<span class="image-view__nav-bottom-icon-button img-container__rotate"></span>
					</div>
				</div>
				<div class="image-view__nav-bottom">
					<div class="image-view__nav-bottom-icon">
						<span class="image-view__nav-bottom-icon-button img-container__download"></span>
					</div>
					<div class="image-view__nav-bottom-icon" style="margin-left: 30px;">
						<span class="image-view__nav-bottom-icon-button img-container__delete"></span>
					</div>
					<div class="image-view__nav-bottom-icon" style="margin-left: 30px;" @click="toggleInfo">
						<span class="image-view__nav-bottom-icon-button img-container__info"></span>
					</div>
				</div>
				<div class="image-view__nav-bottom">
					<div class="image-view__nav-bottom-icon" @click="toggleThumb">
						<span :class="{
							'image-view__nav-bottom-icon-button': true,
							'img-container__thumb': !thumbShow,
							'img-container__thumb-open': thumbShow,
						}"></span>
					</div>
				</div>
			</div>

			<div class="preview-thumb" :style="{height: thumbShow ? '120px': 0}">
				<agile class="agile-thumbnails" ref="thumbnails" :options="optionThumb" :as-nav-for="asNavForThumb" :initial-slide="initialSlide">
					<div class="slide slide--thumbnails" v-for="(slide, index) in slides" :key="index" @click="$refs.thumbnails.goTo(index)">
						<img :src="slide.objUrl" alt="" class="img-no-active">
					</div>

				</agile>
			</div>
		</div>

		<div class="pic-info" :style="{ width: infoShow? '300px': 0 }">
			<div class="info-title">详情</div>
			<div class="info-row" v-for="(info, index) in infoRows" :key="index">
				<div class="info-label">{{info.label}}</div>
				<div class="info-desc">{{info.desc}}</div>
			</div>
		</div>
	</el-dialog>
</template>
<script>
	import { getFormatFileSize } from '@/utils/index.js'

export default {
	name: 'b-image-preview',
	props: {
		foldId: { type: String, default: '' },
		initialSlide: { type: Number, default: 0 },
		slides: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			bottomThumbHeight: 150,
			thumbShow: true,
			infoShow: false,
			optionMain: {
				dots: false,
				fade: true,
				navButtons: true
			},
			optionThumb: {
				centerMode: true,
				dots: false,
				navButtons: false,
				slidesToShow: 5,
			},
			asNavForMain: [],
			asNavForThumb: [],
			scale: 1,
			rotate: 0,
			infoRows: [
				{
					label: '文件名',
					desc: 'IMG_7076.JPG'
				},
				{
					label: '所属文件夹',
					desc: '根目录'
				},
				{
					label: '时间',
					desc: '2021年11月23日 周二，上午10:31'
				},
				{
					label: '大小',
					desc: '1440 x 1920 336KB'
				}
			]
		}
	},

	methods: {
		handleAfterChange(currentSlide) {
			this.changeImgInfo(currentSlide.currentSlide)
		},
		toggleThumb() {
			this.thumbShow = !this.thumbShow
		},
		handleOpen() {
			this.$nextTick(() => {
				this.asNavForMain.push(this.$refs.thumbnails)
				this.asNavForThumb.push(this.$refs.main)

				this.$refs['main'].goTo(this.initialSlide)
				this.$refs['thumbnails'].goTo(this.initialSlide)

				const thumsLength = this.slides.length >= 10? 10: this.slides.length
				this.$set(this.optionThumb, 'slidesToShow', thumsLength)
				this.changeImgInfo(this.initialSlide)
			})
		},
		changeImgInfo(index) {
			const currentImgInfo = this.slides[index]
			this.infoRows = [
				{
					label: '文件名',
					desc: currentImgInfo.fileName + '.' + currentImgInfo.fileType
				},
				{
					label: '所属网盘',
					desc: currentImgInfo.diskType || currentImgInfo.formType
				},
				{
					label: '所属文件夹',
					desc: currentImgInfo.folderParentName
				},
				{
					label: '创建时间',
					desc: currentImgInfo.createTime || currentImgInfo.collectTime
				},
				{
					label: '大小',
					desc: getFormatFileSize(currentImgInfo.fileSize)
				}
			]
		},
		toggleInfo() {
			const index = this.$refs['main'].getCurrentSlide()
			this.changeImgInfo(index)
			this.infoShow = !this.infoShow
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
	},
}
</script>
<style lang="scss">
	.img-previewClass {

		.el-dialog__body {
			display: flex;
			justify-content: space-between;
		}


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

		.pic-info {
			height: 100vh;
			background-color: #191919;
			transition: width .3s ease;
			box-sizing: border-box;
			overflow: hidden;

			.info-title {
				padding: 20px;
				color: #fff;
				font-size: 1.2rem;
			}

			.info-row {
				font-size: 12px;
				width: 100%;
				padding: 10px 20px;
				line-height: 25px;
				color: #fff;
				display: flex;
				justify-content: space-between;
				flex-wrap: nowrap;

				.info-label {
					width: 30%;
				}
				.info-desc {
					flex: 1;
					color: #999;
				}
			}
		}
		.b-preview-body{
			padding: 20px;


			height: 100vh;
			background: #000;
			color: #fff;
			position: relative;
			overflow: hidden;
			transition: width .3s ease;
			.preview-header {
				text-align: right;
				padding: 10px 0px;
				font-size: 1.5rem;
				.close-class {
					cursor: pointer;
				}
			}

			.preview-body {
				width: 100%;
				height: 600px;

				.agile-main {
					margin: 0 auto;
					width: 70%;

					.agile__nav-button {
						position: absolute;
						top: 50%;
						transform: translateY(-50%);
					}
					.agile__nav-button--prev {
						left: -15%;
					}
					.agile__nav-button--next {
						right: -15%;
					}
				}
			}

			.slide {
				align-items: center;
				box-sizing: border-box;
				color: #fff;
				display: flex;
				height: 600px;
				width: 100%;
				justify-content: center;

				img {
					height: 100%;
					width: 100%;
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					object-position: center;
				}
			}

			.preview-operation {
				width: 100%;
				height: 60px;
				text-align: center;
				padding: 10px 0;
				box-sizing: border-box;
				font-size: 0;
				position: absolute;
				right: 0;
				bottom: 140px;
				transition: bottom .5s ease;
				z-index: 999;

				.image-view__nav-bottom {
					display: inline-block;
					padding: 0 30px;
					position: relative;

					.image-view__nav-bottom-icon {
						display: inline-block;
						width: 40px;
						height: 40px;
						cursor: pointer;
						overflow: hidden;

						&::before {
							content: '';
							position: absolute;
							left: 0;
							top: 13px;
							width: 1px;
							height: 14px;
							opacity: .6;
							background: #fff;
						}

						.image-view__nav-bottom-icon-button {
							width: 100%;
							height: 100%;
							display: inline-block;
							background-position: center;
							background-repeat: no-repeat;
							background-size: 50%;
						}
						.img-container__printer {
							background-image: url("../../../assets/images/operation-icons/print.png");
						}
						.img-container__larger {
							background-image: url("../../../assets/images/operation-icons/scale-larger.png");
						}
						.img-container__smaller {
							background-image: url("../../../assets/images/operation-icons/scale-smaller.png");
						}
						.img-container__rotate {
							background-image: url("../../../assets/images/operation-icons/rotateX.png");
						}
						.img-container__download {
							background-image: url("../../../assets/images/operation-icons/download.png");
						}
						.img-container__delete {
							background-image: url("../../../assets/images/operation-icons/delete.png");
						}
						.img-container__info {
							background-image: url("../../../assets/images/operation-icons/info.png");
						}
						.img-container__thumb {
							background-image: url("../../../assets/images/operation-icons/thumb.png");
						}
						.img-container__thumb-open {
							background-image: url("../../../assets/images/operation-icons/thumb-open.png");
						}
					}
				}
			}

			.preview-thumb {
				user-select: none;
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 120px;
				background: #000;
				overflow: hidden;

				.img-no-active {
					filter: brightness(50%);
				}

				.agile-thumbnails {
					box-sizing: border-box;
					width: 70%;
					margin: 0 auto;

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
						border: 3px solid #fff;
					}
				}
			}
		}
	}

</style>
