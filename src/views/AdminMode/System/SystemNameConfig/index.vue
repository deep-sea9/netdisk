<template>
    <div class="config-container">
        <div class="name-config">
            <h4 style="color: #000">提示</h4>
            <p class="name-tips">系统名称中英文均可，最多12个字符：LOGO：50*40像素，大小不超过72kb</p>

            <div class="name-input">
                <div style="width: 20%;margin-right: 15px;">网盘名称：</div>
                <div>
                    <el-input v-model="netDistName" placeholder="请输入系统名称" maxlength="12" @input="inputHandler"/>
                </div>
            </div>

            <div class="logo-config">
                <div style="width: 20%;margin-right: 15px;">LOGO：</div>
                <div>
                    <el-upload ref="uploadLogo" action="#" :multiple="false" accept="image/*" :http-request="uploadLogo" :on-change="handleImgChange" :on-remove="handleRemoveFile" :auto-upload="false" :limit="1" :show-file-list="false">
                        <el-button size="small" type="primary">浏览</el-button>
                    </el-upload>
                </div>
            </div>

            <div class="submit-btn">
                <el-button :loading="saving" style="width: 100px;" size="small" type="primary" @click="submitName">提交</el-button>
<!--                <el-button style="width: 100px;" size="small" type="warning">预览</el-button>-->
            </div>
        </div>
        <div class="name-preview">
            <div class="preview-container">
                <img style="width: 50px;margin-right: 10px;max-height: 80px" :src="realLog">
                <div class="preview-name">
                    {{netDistName}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { saveDiskConfig } from '@/api/common.js'
    import {uploadLogo} from "@/api/common";

    export default {
        name: "SystemNameConfig",
        data() {
            return {
                netDistName: '',
                logo: require('../../../../assets/images/logo.png'),
                maxlength: 12,
                saving: false
            }
        },
        computed: {
            realLog() {
                return this.logo
            }
        },
        created() {
            console.log(this.$store.state);
            this.netDistName = this.$store.state.system.sysName
            this.logo = this.$store.state.system.logo
        },
        methods: {
            uploadLogo(params) {
                let formData = new FormData()
                formData.append('file', params.file)
                uploadLogo(formData).then(res => {
                    if(res) {
                        // this.$message({
                        //     message: res.message || 'logo更新成功',
                        //     showClose: true,
                        //     type: 'success'
                        // })
                        this.$store.commit('system/SET_LOGO', this.logo)

                    }
                })
            },
            handleImgChange(e) {
                console.log(e);
                const fileReader = new FileReader()
                fileReader.onload = (e)=> {
                    this.logo = e.target.result
                }
                fileReader.readAsDataURL(e.raw)
            },
            handleRemoveFile(file, fileList) {
                this.logo = ''
                console.log(file, fileList);
            },
            submitName() {
                if(this.netDistName) {
                    this.saving = true
                    saveDiskConfig([{ code: 'sys_name', value: this.netDistName }]).then(res => {
                        this.saving = false
                        this.$message.success(res.message || '修改成功')
                        this.$store.commit('system/SET_SYS_NAME', this.netDistName)
                    }).catch(_ => this.saving = true)
                }else {
                    this.$message.warning('请输入网盘名称')
                }
                if(this.logo) {
                    this.$refs['uploadLogo'].submit()
                }
            },
            inputHandler(value){
               let len = 0,j = 0
               for(let i = 0 ; i < value.length; i++) {
                    if(value.charCodeAt(i) > 127 || value.charCodeAt(i) == 94) {
                        len += 2
                        j++
                    }else {
                        len++
                        j++
                    }
                    if(len > 12) {
                        this.netDistName = value.substring(0,j-1)
                        break
                    }
               }

            }
        }
    }
</script>

<style lang="scss" scoped>
    .config-container {
        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        padding: 40px;

        .name-config {
            width: 40%;
            color: #666;

            .name-tips {
                margin: 20px 0;
            }

            .name-input {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex-wrap: nowrap;
                margin: 20px 0;
            }

            .logo-config {
                display: flex;
                justify-content: flex-start;
                /*align-items: center;*/
                flex-wrap: nowrap;
                margin: 20px 0;
            }

            .submit-btn {
                display: flex;
                justify-content: center;
                margin: 40px 0;
            }
        }

        .name-preview {
            flex: 1;
            padding: 40px;
            .preview-container {
                width: 380px;
                height: 120px;
                border-radius: 5px;
                color: #fff;
                /*background-color: #06A7FF;*/
                background-color: var(--main-color, $main_color);
                display: flex;
                justify-content: center;
                align-items: center;

                .preview-name {
                    font-size: 2rem;
                }
            }
        }
    }
</style>
