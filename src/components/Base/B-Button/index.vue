<template>
	<el-button size="small" :type="color" v-on="$listeners" >
		<i class="b-button-icon" :class="iconName" v-show="iconName"></i>
		<span v-if="iconText">{{ iconText }}</span>
		<span v-else>
			<slot></slot>
		</span>
	</el-button>
</template>
<script>
import button_type from './button_type'
export default {
	name: 'b-button',
	props: {
		type: String,
		color: {
			type: String,
			default: '',
		},
	},
	computed: {
		iconName() {
			return button_type[this.type]?.icon || null
		},
		iconText() {
			return button_type[this.type]?.text || null
		},
	},
}
</script>
<style lang="scss" scoped>
.b-button-icon {
	margin-right: 6px;
}
</style>
