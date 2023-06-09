<template>
	<div class="b-share-link">
		<div class="item">
			<label>分享链接:</label>
			<el-input v-model="form.linkAddress" size="small" disabled style="width:100%" />
		</div>
		<div class="item">
			<label>链接有效期:</label>
			<el-select v-model="form.expire" placeholder="请选择" size="small" style="width:100%">
				<el-option
					v-for="item in indateList"
					:key="item.value"
					:label="item.label"
					:value="item.value"
				></el-option>
			</el-select>
		</div>
		<div class="item">

			<label><el-checkbox style="width: 20px;" v-model="form.allowDown"></el-checkbox>允许下载次数:</label>
			<el-select :disabled="!form.allowDown" v-model="form.downNum" placeholder="请选择" size="small" style="width:100%">
				<el-option
					v-for="item in downloadNums"
					:key="item.value"
					:label="item.label"
					:value="item.value"
				></el-option>
			</el-select>
		</div>
		<div class="item">
			<el-input v-if="hasPwd" size="small" placeholder="文件访问密码" v-model="form.linkPassword"></el-input>
			<el-button size="small" style="margin-left:10px" type="primary" @click="handlePwd">{{ hasPwd? '取消加密': '添加访问密码' }}</el-button>
		</div>
		<div class="item">
			<el-checkbox label="允许转存到个人网盘" v-model="form.allowStore"></el-checkbox>
			<el-checkbox label="失效后删除" v-model="form.expireDel"></el-checkbox>
		</div>
<!--		<div class="item">-->
<!--			<el-checkbox label="允许打印" v-model="form.allowPrint"></el-checkbox>-->
<!--			<el-checkbox label="加阅读水印" v-model="form.addMark"></el-checkbox>-->
<!--			<el-checkbox label="失效后删除" v-model="form.expireDel"></el-checkbox>-->
<!--		</div>-->
		<div class="btns">
			<el-button :loading="sharing" size="small" type="primary" @click="saveShare">
				<i class="fal fa-paperclip"></i>
				<span style="margin-left:6px">创建并复制链接</span>
			</el-button>
		</div>
	</div>
</template>
<script>
	import { saveShare, getShareLink } from '@/api/personal/share.js'
	import copy from 'copy-to-clipboard'
export default {
	name: 'b-share-link',
	props: {
		ids: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			form: {
				shareWay: '2', // 链接共享
				userIds: [],
				linkAddress: window.location.origin + '/#/other-link-share',
				expire: 1,
				allowDown: true,
				downNum: '',
				linkPassword: '',
				allowStore: false,
				allowPrint: false,
				addMark: false,
				expireDel: true
			},
            sharing: false,
			hasPwd: false,
			indateList: [
				{
					value: -1,
					label: '永久有效',
				},
				{
					value: 30,
					label: '30天',
				},
				{
					value: 7,
					label: '7天',
				},
				{
					value: 1,
					label: '1天',
				},
			],
			downloadNums: [
				{
					value: -1,
					label: '无限制',
				},
				{
					value: 30,
					label: '30次',
				},
				{
					value: 5,
					label: '5次',
				},
				{
					value: 1,
					label: '1次',
				},
			]
		}
	},
	watch: {
		ids: {
			deep: true,
			immediate: true,
			handler() {
				getShareLink().then(res => {
					// const uId = (Math.random() * 10000000).toFixed(0)
					this.form.linkAddress = `${window.location.origin}${window.location.pathname}#/other-link-share/${res.data}`
					this.linkId = res.data
				})

			}
		},
        'form.allowDown': {
            immediate: true,
            handler(v){
                if(v) {
                    this.form.downNum = this.form.downNum ? this.form.downNum : -1
                }else {
                    this.form.downNum = ''
                }
            }
        }
	},
	methods: {
		saveShare() {
			if(!this.form.allowDown) {
				this.form.downNum = 0
			}
            if(this.hasPwd && !this.form.linkPassword) {
                this.$message.warning('未输入访问密码，请输入访问密码或取消加密')
                return
            }
            if(!/^[0-9a-zA-Z]{0,6}$/.test(this.form.linkPassword)) {
                this.$message.error('请输入6位以内数字或字母')
                return
            }
            this.sharing = true
			saveShare({...this.form, fileIds: this.ids, linkAddress: this.linkId}).then(res => {
				if(copy(this.form.linkAddress, { format: 'text/plain' })) {
					this.$message.success(res.message || '复制成功！')
				}else {
					this.$message.warning('访问剪切板失败，请重试或尝试使用其它浏览器重试')
				}
				this.$emit('share-success', this.form.linkAddress)
			}).finally(_ => {
                this.sharing = false
            })
		},
		handlePwd() {
			this.hasPwd = !this.hasPwd
			if(!this.hasPwd ) {
				this.pwdBackUp = this.form.linkPassword
			}else {
				this.form.linkPassword = this.pwdBackUp
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.b-share-link {
	// height: 400px;
	position: relative;
	box-sizing: border-box;
	padding: 20px 40px;
	.b-share-link__footer {
		width: calc(100% - 40px);
		display: flex;
		justify-content: center;
		margin-top: 30px;
		position: absolute;
		bottom: 20px;
	}
	.item {
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		label {
			width: 150px;
			font-size: 14px;
		}
	}
	.btns {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 40px;
	}
}
</style>
