<template>
    <div class="header_logo" @click="toDashboard">
        <img :src="logo">
        <span>{{netDiskName}}</span>
    </div>
</template>
<script>
    export default {
        name: "Login",
        computed: {
            netDiskName() {
                return this.$store.state.system.sysName
            },
            logo() {
                return this.$store.state.system.logo
            }
        },
        methods: {
            toDashboard() {
                if(this.$route.fullPath.indexOf('admin')>-1) {
                    this.$router.replace('/admin/personal')
                }else {
                    this.$router.replace('/')
                }
            }
        }
    };
</script>
<style lang="scss" scoped>
    .header_logo {
        width: $side_width;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
            width: 26px;
            max-height: 36px;
			margin-right: 6px;
        }
    }
</style>
