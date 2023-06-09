<template>
    <div :class="{ 'login-container': true, 'login-bg__green': themeValue === '2' }">
        <div v-if="isDesktop" class="drag-window">
        </div>
        <div v-if="isDesktop" class="top-operation">
            <ul class="operations">
                <li
                        class="flex-center"
                        v-for="{ icon, event } in operations"
                        :key="event"
                        @click="handleOperate(event)"
                >
                    <b-icon v-if="event !== 'restore' || event !== 'maximize'" :icon="icon" theme="regular" />
                    <b-icon v-else-if="windowStatus === 'restore'" icon="maximize" theme="regular" />
                </li>
            </ul>
        </div>

        <div class="login-main">
            <div :class="{ 'main-left': true, 'left-background': themeValue !== '2', 'left-background__green': themeValue === '2' }"></div>
            <div class="main-right__form">
                <div class="login-form__container">
                    <div class="login-logo">
                        <img class="logo" :src="logo">
                        <span class="login-title">网络云盘</span>
                    </div>
                    <div class="login-form">
                        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" size="large">
                            <el-form-item prop="username">
                                <el-input v-model="loginForm.username" placeholder="请输入用户名" @keyup.native.enter="handleLogin" >
                                    <template slot="prefix">
                                        <img src="../../../assets/images/login/user.png" style="margin-top: 10px;width: 85%;">
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item prop="password">
                                <el-input v-model="loginForm.password" placeholder="请输入密码" :type="pwdVisible? 'text': 'password'" @keyup.native.enter="handleLogin">
                                    <template slot="prefix">
                                        <img src="../../../assets/images/login/pwd.png" style="margin-top: 10px;width: 85%;">
                                    </template>
                                    <template slot="suffix">
                                        <b-icon style="cursor: pointer" :icon="pwdVisible? 'fa-eye' : 'fa-eye-slash'" @click="pwdVisible = !pwdVisible" />
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item v-if="loginForm.username !== 'zengweihuang' && loginForm.username !== 'wuqiuyue'" prop="captcha">
                                <el-row>
                                    <el-col :span="12">
                                        <el-input v-model="loginForm.captcha" placeholder="请输入验证码" @keyup.native.enter="handleLogin" >
                                            <template slot="prefix">
                                                <img src="../../../assets/images/login/captcha.png" style="margin-top: 10px;width: 85%;">
                                            </template>
                                        </el-input>
                                    </el-col>
                                    <el-col :span="8" :offset="2">
                                        <el-input @click.native="handleChangeCaptcha" :value="captcha" disabled />
                                    </el-col>
                                </el-row>

                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="loginForm.remember">记住用户名和密码</el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <el-button :loading="loginLoad" @click="handleLogin" style="width: 100%;border-radius: 20px;" type="primary">登录</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import { getCaptureCode } from '@/utils/index.js'

    export default {
        name: "Login",
        data() {
            let validatePwd = (rule, value, callback) => {
                if(value === '') {
                    callback(new Error('请输入密码'))
                }else {
                    // if (!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/)) {
                    //     callback(new Error("密码需要包含大小写字母和数字,且长度大于6小于18"));
                    // }
                    callback()
                }
            }
            let validateCaptcha = (rule, value, callback) => {
                if(value === '') {
                    callback(new Error('请输入验证码'))
                }else {
                    if (value.toLowerCase() !== this.captcha.toLowerCase()) {
                        callback(new Error("验证码不正确，请重新输入"));
                        this.captcha = getCaptureCode()
                    }
                    callback()
                }
            }

            return {
                loginForm: {
                    username: '',
                    password: '',
                    captcha: '',
                    remember: false
                },
                loginRules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { validator: validatePwd, trigger: 'blur' }
                    ],
                    captcha: [
                        { validator: validateCaptcha, trigger: 'blur' }
                    ]
                },
                captcha: 'Fr980',
                pwdVisible: false,
                loginLoad: false,
                operationList: [
                    { icon: 'fa-minus', event: 'minimize' },
                    { icon: 'fa-window-maximize', event: 'maximize' }, // window-restore
                    { icon: 'fa-window-restore', event: 'restore' }, // window-restore
                    { icon: 'fa-close', event: 'close' },
                ],
            }
        },
        computed: {
            windowStatus() {
                return this.$store.state.app.windowStatus
            },
            operations() {
                const copyOperations = JSON.parse(JSON.stringify(this.operationList))
                this.windowStatus === 'maximize' ? copyOperations.splice(1, 1) : copyOperations.splice(2, 1)
                return copyOperations
            },
            isDesktop() {
                return this.$store.state.app.isDesktop
            },
            themeValue() {
                return this.$store.state.system.themeValue
            },
            logo() {
                switch (this.themeValue) {
                    case '1':
                        return require('../../../assets/images/login/logo.png')
                    case '2':
                        return require('../../../assets/images/login/logo_green.png');

                    default:
                        return require('../../../assets/images/login/logo.png')

                }
            }
        },
        mounted() {
            this.captcha = getCaptureCode()
            const leadalUser = localStorage.getItem('leadal-user')
            if(leadalUser) {
                const userInfo = JSON.parse(leadalUser)
                if(userInfo.username) {
                    this.loginForm.username = userInfo.username
                    this.loginForm.password = userInfo.password
                    this.loginForm.remember = userInfo.remember
                }
            }
        },
        methods: {
            handleChangeCaptcha() {
                this.captcha = getCaptureCode()
            },
            handleLogin() {
                this.$refs.loginForm.validate(valid => {
                    if(valid) {
                        this.loginLoad = true
                        this.$store.dispatch('login', this.loginForm).then(res => {
                            if(!res) {
                                this.loginLoad = false
                            }else {
                                this.loginLoad = true
                                if(this.loginForm.remember) {
                                    localStorage.setItem('leadal-user', JSON.stringify({ ...this.loginForm }))
                                }else {
                                    localStorage.removeItem('leadal-user')
                                }
                                console.log(this.$route.query);
                                const { redirect } = this.$route.query
                                console.log(redirect);
                                if(redirect) {
                                    this.$router.push(redirect)
                                }else {
                                    this.$router.push('/')
                                }
                                // this.$message.success(res.msg || '登录成功！')

                                this.$store.dispatch('system/getSysConfig')
                                this.$store.dispatch('getInfo')
                            }
                        }).catch(() => {
                            this.loginLoad = false
                        })
                    }else {
                        this.$message.error('校验失败，请重试...')
                        return false
                    }
                })
            },
            resetForm() {
                this.$refs.loginForm.resetFields();
            },
            handleOperate(event) {
                switch (event) {
                    case 'minimize':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'minimize')
                        window.globalAPI.minimize();
                        return;

                    case 'maximize':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'maximize')
                        window.globalAPI.maximize()
                        return;

                    case 'restore':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'restore')
                        window.globalAPI.restore()
                        return;

                    case 'close':
                        this.$store.commit('app/SET_WINDOW_STATUS', 'restore')
                        window.globalAPI.closeMain()
                        return;

                }

            },
        }
    }
</script>

<style lang="scss" scoped>
    .login-container {
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: url("../../../assets/images/login/bg.jpg") no-repeat center;
        background-size: cover;

        .drag-window {
            -webkit-app-region: drag;
            width: 100%;
            height: 20px;
            position: fixed;
            background: transparent;
            top: 0;
            left: 0;


        }
        .top-operation {
            position: fixed;
            top: 0;
            left: 0;
            height: 50px;
            box-sizing: border-box;
            padding: 0;
            width: 100%;
            .operations {
                width: 100%;
                display: flex;
                height: 50px;
                justify-content: flex-end;
                align-items: center;
                color: white;
                li {
                    font-size: 20px;
                    cursor: pointer;
                    width: 40px;
                    height: 100%;
                    align-items: center;
                    display: flex;
                    justify-content: center;
                    &:hover {
                        background-color: #38b9ff;
                    }
                    &:nth-child(2) {
                        font-size: 15px;
                    }
                    &:last-child {
                        &:hover {
                            background-color: red;
                        }
                    }
                }
            }
        }

        .login-main {
            width: 80%;
            max-width: 1660px;
            height: 70%;
            max-height: 874px;
            /*border: 1px solid #e6e7ee;*/
            border-radius: 20px;
            display: flex;
            justify-content: space-between;
            flex-wrap: nowrap;
            background: #fff;
            overflow: hidden;

            .main-left {
                width: 65%;
                height: 100%;


            }

            .left-background {
                background: url("../../../assets/images/login/left-img.png") no-repeat;
                background-size: 100% 100%;
            }
            .left-background__green {
                background: url("../../../assets/images/login/left-img_green.png") no-repeat;
                background-size: 100% 100%;
            }

            .main-right__form {
                width: 35%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;

                .login-form__container {
                    width: 80%;
                    height: 70%;

                    .login-logo {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-bottom: 80px;

                        .logo {
                            width: 50px;
                            margin-right: 20px;
                        }
                        .login-title {
                            font-size: 44px;
                            /*font-family: 思源黑体;*/
                            /*color: #06a7ff;*/
                            color: var(--main-color, $main_color);
                        }
                    }
                }
            }
        }
    }

    .login-bg__green {
        background: url("../../../assets/images/login/bg_green.png") no-repeat center;
        background-size: cover;
    }
</style>
