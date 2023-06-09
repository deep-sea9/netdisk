<template>
	<i class="b-icon" :class="className"  v-on="$listeners"></i>
</template>
<script>
export default {
	name: 'b-icon',
	props: {
		theme: {
			type: String,
			default: 'solid',
			validator: theme => {
				return ['solid', 'regular', 'light', 'duotone', 'brands'].includes(theme)
			},
		},
		icon: {
			type: String,
			default: 'fa-arrow-alt-square-down',
		},
	},
	computed: {
		className() {
			const { icon, theme } = this
			const _enum = {
				solid: 'fas',
				regular: 'far',
				light: 'fal',
				duotone: 'dad',
				brands: 'fab',
			}
			return `${_enum[theme]} ${icon}`
		},
	},
}
</script>
<style lang="scss" scoped>
.b-icon {
	color: inherit;
	font-size: inherit;
}
</style>
