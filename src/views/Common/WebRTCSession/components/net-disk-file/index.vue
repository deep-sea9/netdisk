<template>
    <el-dialog title="分享文件" :visible.sync="visible" width="550px" append-to-body destroy-on-close>
        <div class="b-share-body">
            <file-transfer ref="file-transfer" />
        </div>
        <span slot="footer">
			<el-button size="small" type="primary" @click="handleConfirm">确定</el-button>
			<el-button size="small" @click="visible = false">取消</el-button>
		</span>
    </el-dialog>
</template>
<script>
    import FileTransfer from '../file-transfer'

    export default {
        name: 'net-disk-file',
        components: { FileTransfer },
        data() {
            return {
                selections: []
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

        methods: {
            handleClick() {},
            handleSuccess() {
                this.visible = false
            },
            handleConfirm() {
                const selectFile = this.$refs['file-transfer'].getRightData()
                this.$emit('confirm-select', selectFile)
            }
        },
    }
</script>
<style scoped lang="scss">
    .b-share-body {
        height: 600px;
        padding: 20px;
    }
</style>
