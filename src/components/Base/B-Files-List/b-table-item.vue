<template>
	<ul class="row-item" :class="{ checked: checked }" @contextmenu.prevent="onContextmenu">
		<li>
			<b-checkbox v-model="checked" @change="change" />
		</li>
		<li>
			<img :src="fetchFileIcon(file.name)" alt="fileIcon" />
			<span>{{ file.name }}</span>
		</li>
		<li>{{ file.size }}</li>
		<li>{{ file.modifyTime }}</li>
	</ul>
</template>
<script>
import { mutations } from '../B-Files/store'
import fileItemMixins from '@/mixins/fileItem.js'
export default {
	name: 'b-table-item',
	mixins: [fileItemMixins],
	methods: {
		change(check) {
			if (check) {
				mutations.addItem(this.file)
			} else {
				mutations.removeItem(this.file)
			}
		},
	}
}
</script>
<style lang="scss" scoped></style>
