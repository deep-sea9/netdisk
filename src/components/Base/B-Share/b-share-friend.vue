<template>
    <div class="b-share-friend">
        <div class="item-column">
            <div style="margin-bottom:10px">请选择人员:</div>
            <b-staff-transfer ref="staffTrans" style="height:240px"></b-staff-transfer>
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
            <label>
                <el-checkbox style="width: 24px;" v-model="form.allowDown" />允许下载次数:
            </label>
            <el-select :disabled="!form.allowDown" v-model="form.downNum" placeholder="请选择" size="small"
                       style="width:100%">
                <el-option
                        v-for="item in downloadNums"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                ></el-option>
            </el-select>
        </div>
        <div class="item">
            <el-checkbox label="允许转存到个人网盘" v-model="form.allowStore"></el-checkbox>
            <el-checkbox label="失效后删除" v-model="form.expireDel"></el-checkbox>
        </div>
<!--        <div class="item">-->
<!--            <el-checkbox label="允许打印" v-model="form.allowPrint"></el-checkbox>-->
<!--            <el-checkbox label="加阅读水印" v-model="form.addMark"></el-checkbox>-->
<!--            <el-checkbox label="失效后删除" v-model="form.expireDel"></el-checkbox>-->
<!--        </div>-->
        <div class="btns">
            <el-button :loading="sharing" style="width:100px" size="small" type="primary" @click="shareTo">
                <i class="fal fa-share-all"></i>
                <span style="margin-left:6px">分享</span>
            </el-button>
        </div>
    </div>
</template>
<script>
    import {saveShare} from '@/api/personal/share.js'

    export default {
        name: 'b-share-friend',
        props: {
            ids: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                form: {
                    shareWay: '1', // 链接共享
                    userIds: [],
                    linkAddress: '',
                    expire: 1,
                    allowDown: true,
                    downNum: '',
                    linkPassword: '',
                    allowStore: false,
                    allowPrint: false,
                    addMark: false,
                    expireDel: true

                },
                sharing: false,
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
                        value: 5,
                        label: '5次',
                    },
                    {
                        value: 1,
                        label: '1次',
                    },
                ],
                selectedUsers: []
            }
        },
        methods: {
            getStaffSelections() {
                return this.$refs['staffTrans'].getRightData()
            },
            shareTo() {
                if (!this.form.allowDown) {
                    this.form.downNum = 0
                }
                this.form.userIds = this.getStaffSelections().map(user => user.id)
                if (this.form.userIds.length < 1) {
                    this.$message.info('请选择要分享的对象')
                    return
                }
                this.sharing = true
                saveShare({...this.form, fileIds: this.ids}).then(res => {
                    this.$message.success(res.message || '复制成功！')
                    this.$emit('share-success')
                }).finally(_ => {
                    this.sharing = false
                })
            }
        },
		watch: {
            'form.allowDown': {
                immediate: true,
                handler(v){
                    if(v) {
                        this.form.downNum = this.form.downNum ? this.form.downNum : -1
                    }else {
                        this.form.downNum = ''
                    }
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    .b-share-friend {
        // height: 400px;
        padding: 20px 40px;

        .b-share-link__footer {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 30px;
            position: absolute;
            bottom: 20px;
        }

        .item {
            margin-top: 15px;
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
