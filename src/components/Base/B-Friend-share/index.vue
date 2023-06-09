<template>
	<el-dialog title="分享文件" :visible.sync="visible" width="40%" >
		<div class="b-share-body">
			<b-share-friend :link-obj="linkObj" @share-success="handleSuccess"></b-share-friend>
		</div>
		<span slot="footer">配合净网行动，严厉打击不良信息的传播行为</span>
	</el-dialog>
</template>
<script>
import BShareFriend from './b-share-friend.vue'

export default {
	name: 'b-friend-share',
	props: {
		ids: { type: Array, default: () => [] },
		linkObj: { type: Object, default: () => new Object() }
	},
	data() {
		return {
			activeName: 'share',
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
		BShareFriend
	},
	methods: {
		handleClick() {},
		handleSuccess() {
			this.visible = false
			this.$emit('success')
		}
	},
}
</script>
