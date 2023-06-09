<template>
	<v-contextmenu ref="contextmenu">
		<v-contextmenu-item>
			<i class="far fa-folder-open"></i>
			<span>打开(B)</span>
		</v-contextmenu-item>
		<v-contextmenu-item>
			<i class="far fa-arrow-alt-from-top"></i>
			<span>下载</span>
		</v-contextmenu-item>
		<v-contextmenu-item>
			<i class="far fa-clone"></i>
			<span>复制到</span>
		</v-contextmenu-item>
		<v-contextmenu-item>
			<i class="far fa-eraser"></i>
			<span>重命名</span>
		</v-contextmenu-item>
		<v-contextmenu-item>
			<i class="far fa-trash-alt"></i>
			<span>删除</span>
		</v-contextmenu-item>
	</v-contextmenu>
</template>  
<script>
export default {
	name: "b-context-menu",
};
</script>
