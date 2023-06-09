<template>
	<el-dialog title="分享文件" :visible.sync="visible" width="40%" >
		<div class="b-share-body">
			<b-share-link :id="id" :link-obj="linkObj" @share-success="handleSuccess"></b-share-link>
		</div>
		<span slot="footer">配合净网行动，严厉打击不良信息的传播行为</span>
	</el-dialog>
</template>
<script>

import BShareLink from './b-share-link.vue'

export default {
	name: 'b-link-share',
	props: {
		id: { type: String, default: '' },
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
		BShareLink,
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
<style lang="scss">
.b-share-body {
	// height: 450px;
}
</style>
