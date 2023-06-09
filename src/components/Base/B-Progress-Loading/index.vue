<template>
    <div class="loading-progress" :style="{height: height + 'px'}">
        <div class="progress" :style="{height: height + 'px'}"></div>
    </div>
</template>

<script>
    export default {
        name: "b-progress-loading",
        props: {
            height: { type: Number, default: 6 }
        }
    }
</script>

<style scoped>
    .loading-progress {
        width: 100%;
        overflow: hidden;
        background-color: #409eff;
        margin: auto;
        border-radius: 10px;
    }
    .progress {
        background-color: #E0E5EE;
        margin-top: 0;
        margin-left: 100%;
        animation-name: bounce_loading_progress;
        animation-duration: 1.5s;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
        width: 100%;
    }

    @keyframes bounce_loading_progress {
        0% {
            margin-left: -100%;
        }
        100% {
            margin-left: 100%;
        }
    }


</style>
