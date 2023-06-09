<template>
    <div class="bpmn-context-menu" v-if="showPopover" :style="currentPosition">
        <div class="context-menu_header">{{ contextMenuTitle }}</div>
        <div class="context-menu_body">
            <div v-for="item in currentReplaceOptions" :key="item.actionName" class="context-menu_item">
                <i :class="`context-menu_item_icon ${item.className}`"></i>
                <span @click="triggerAction(item, $event)">{{ translateCh(item.label) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import {customTranslate} from "../../additional-modules/Translate";
    import contextMenuActions from "./contextMenuActions";
    import EventEmitter from "@/utils/EventEmitter";
    import {isAppendAction} from "../../bpmn-utils/BpmnDesignerUtils";
    import BpmnReplaceOptions from "../../bpmn-utils/BpmnReplaceOptions";

    export default {
        name: "BpmnContextMenu",
        data() {
            return {
                currentReplaceOptions: [],
                contextMenuTitle: "",
                showPopover: false,
                isAppend: false,
                position: {x: 0, y: 0},
                currentPosition: {}
            };
        },
        created() {
            EventEmitter.on("show-contextmenu", this.initEventCallback);
            document.body.addEventListener("click", this.closePopover);
        },
        beforeDestroy() {
            EventEmitter.removeListener("show-contextmenu", this.initEventCallback);
            document.body.removeEventListener("click", this.closePopover);
        },
        methods: {
            translateCh(text) {
                return customTranslate(text);
            },
            triggerAction(entry, event) {
                try {
                    const {appendAction, replaceAction} = contextMenuActions();
                    this.isAppend ? appendAction(entry.target, event) : replaceAction(entry.target, this._currentElement);
                    this.showPopover = false;
                } catch (e) {
                    console.error(e)
                }
            },
            closePopover() {
                this.showPopover = false;
            },

            async initEventCallback(event, element) {
                console.log(event, this.$el.clientWidth);
                this._currentElement = element || null;
                this.isAppend = isAppendAction(element);
                this.currentReplaceOptions = BpmnReplaceOptions(element);
                this.contextMenuTitle = this.isAppend ? "创建元素" : "更改元素";
                this.showPopover = true;
                this.currentPosition = await this.resetPosition(event);
            },

            async resetPosition(event) {
                if (!this.$el) {
                    await this.$nextTick();
                    await this.resetPosition();
                }
                // 页面内容区尺寸
                const {clientWidth: pageWidth, clientHeight: pageHeight} = document.body;
                // 组件大小
                const {clientWidth: modelWidth, clientHeight: modelHeight} = this.$el;
                // 默认不靠边，边距 20 px
                const padding = 20;
                // 鼠标点击位置
                const {clientX, clientY} = event;

                // 组件位置计算
                let left = clientX,
                    top = clientY;
                if (modelWidth + padding + clientX >= pageWidth) {
                    left = clientX - modelWidth;
                }
                if (modelHeight + padding + clientY >= pageHeight) {
                    top = clientY - modelHeight;
                }
                return {left: (left += "px"), top: (top += "px")};
            }
        }
    };
</script>

<style lang="scss">
    .bpmn-context-menu {
        display: flex;
        width: 400px;
        max-height: 360px;
        overflow: hidden;
        flex-direction: column;
        position: fixed;
        z-index: 100;
        background-color: rgba(255, 255, 255, 1);
        border-radius: 2px;
        padding: 8px 14px;
        box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
        line-height: 1.6;
        .context-menu_header {
            line-height: 40px;
            font-size: 16px;
            font-weight: bold;
            border-bottom: 1px solid rgb(239, 239, 245);
        }
        .context-menu_body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .context-menu_item {
            width: 100%;
            height: 32px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 4px;
            padding: 0 4px;
            display: flex;
            align-items: center;
            &:hover {
                background-color: rgb(241, 242, 244);
            }
            .context-menu_item_icon {
                font-size: 20px;
                margin-right: 8px;
            }
        }
    }

</style>
