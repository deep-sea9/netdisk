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
			<el-input v-if="hasPwd" size="small" placeholder="文件提取码" v-model="form.linkPassword"></el-input>
			<el-button size="small" style="margin-left:10px" type="primary" @click="handlePwd">{{ hasPwd? '取消加密': '添加访问密码' }}</el-button>
		</div>
		<div class="item">
			<el-checkbox label="允许转存到个人网盘" v-model="form.allowStore"></el-checkbox>
		</div>
		<div class="item">
			<el-checkbox label="允许打印" v-model="form.allowPrint"></el-checkbox>
			<el-checkbox label="加阅读水印" v-model="form.addMark"></el-checkbox>
			<el-checkbox label="失效后删除" v-model="form.expireDel"></el-checkbox>
		</div>
		<div class="btns">
			<el-button size="small" type="primary" @click="saveShare">
				<i class="fal fa-paperclip"></i>
				<span style="margin-left:6px">修改并复制链接</span>
			</el-button>
		</div>
	</div>
</template>
<script>
	import { saveShare } from '@/api/personal/share.js'
	import copy from 'copy-to-clipboard'
export default {
	name: 'b-share-link',
	props: {
		id: { type: String },
		linkObj: { type: Object, default: () => new Object() }
	},
	data() {
		return {
			form: {
				shareWay: '2', // 链接共享
				linkAddress: 'http://share.leadal.com/DnxDesda',
				expire: 1,
				allowDown: true,
				downNum: '',
				linkPassword: '',
				allowStore: false,
				allowPrint: false,
				addMark: false,
				expireDel: true
			},
			hasPwd: true,
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
					value: 7,
					label: '7次',
				},
				{
					value: 1,
					label: '1次',
				},
			]
		}
	},
	watch: {
		// id: {
		// 	immediate: true,
		// 	handler() {
		// 		const uId = (Math.random() * 10000000).toFixed(0)
		// 		this.form.linkAddress = `https://share.weiyun.com/${uId}`
		// 	}
		// },
		linkObj: {
			deep: true,
			immediate: true,
			handler(val) {
				console.log(val);
				this.form = { ...val }
			}
		}
	},
	methods: {
		saveShare() {
			if(!this.form.allowDown) {
				this.form.downNum = 0
			}
			saveShare({...this.form}).then(res => {
				if(copy(this.form.linkAddress, { format: 'text/plain' })) {
					this.$message.success(res.message || '复制成功！')
				}else {
					this.$message.warning('链接复制失败，请手动选择后复制')
				}
				this.$emit('share-success', this.form.linkAddress)
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
