<template>
	<el-dialog title="分享文件" :visible.sync="visible" width="550px" append-to-body>
		<div class="b-share-body">
			<el-tabs v-model="activeName" @tab-click="handleClick">
				<el-tab-pane label="通讯录分享" name="friend">
					<b-share-friend :ids="ids" @share-success="handleSuccess"></b-share-friend>
				</el-tab-pane>
				<el-tab-pane label="链接分享" name="share">
					<b-share-link :ids="ids" @share-success="handleSuccess"></b-share-link>
				</el-tab-pane>
			</el-tabs>
		</div>
		<span slot="footer">配合净网行动，严厉打击不良信息的传播行为</span>
	</el-dialog>
</template>
<script>
import BShareFriend from './b-share-friend.vue'
import BShareLink from './b-share-link.vue'

export default {
	name: 'b-share',
	props: {
		ids: { type: Array, default: () => [] }
	},
	data() {
		return {
			activeName: 'friend',
		}
	},
    computed: {
        visible: {
            get(){
                return this.$attrs.visible
            },
            set(value){
                this.$emit("update:visible",value)
            }
        }
    },
    components: {
		BShareFriend,
		BShareLink,
	},
	methods: {
		handleClick() {},
		handleSuccess() {
			this.visible = false
		}
	},
}
</script>
<style lang="scss">
.b-share-body {
	// height: 450px;
	.el-tabs__header {
		background-color: #fff;
		padding: 0 20px;
		border-bottom: 1px solid #e4e7ed;
		user-select: none;
		margin-bottom: 0px;
		.el-tabs__nav-wrap::after {
			display: none;
		}
	}
}
</style>
