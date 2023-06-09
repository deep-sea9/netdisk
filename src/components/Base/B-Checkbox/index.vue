<template>
	<div class="b-checkbox" :class="{ checked: value }">
		<i class="fas fa-check" @click="handle"></i>
	</div>
</template>
<script>
export default {
	name: 'b-checkbox',
	props: {
		value: Boolean,
	},
	methods: {
		handle() {
			const value = !this.value
			this.$emit('input', value)
			this.$emit('change', value)
		},
	},
}
</script>
<style lang="scss" scoped>
.b-checkbox {
	display: inline-block;
	width: 14px;
	height: 14px;
	border-radius: 2px;
	border: 1px solid #888;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
	i {
		color: #fff;
		transform: scale(0.8);
		position: relative;
		// top: 1px;
	}
	&.checked {
		/*border: 1px solid #06a7ff;*/
		border: 1px solid var(--main-color, $main_color);
		/*background-color: #06a7ff;*/
		background-color: var(--main-color, $main_color);
	}
}
</style>
