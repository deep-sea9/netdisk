<template>
    <div class="bpmn-panel" ref="panel">
        <div class="panel-header">
            <z-svg-icon class="bpmn-icon" :icon-class="bpmnIconName"/>
            <p>{{ bpmnElementName }}</p>
            <p>{{ customTranslate(currentElementType || "Process") }}</p>
        </div>
        <el-collapse>
            <component v-for="cp in this.renderComponents" :key="cp.name" :is="cp"/>
        </el-collapse>
    </div>
</template>

<script>
    import {debounce} from "lodash";

    import EventEmitter from "@/utils/EventEmitter";
    import bpmnIcons from "@/icons/svg/bpmn-icons";
    import getBpmnIconType from "@/icons/svg/bpmn-icons/getIconType";
    import {customTranslate} from "../../additional-modules/Translate";
    import {isCanbeConditional} from "../../bo-utils/conditionUtil";
    import {isJobExecutable} from "../../bo-utils/jobExecutionUtil";
    import {isExecutable} from "../../bo-utils/executionListenersUtil";
    import {isAsynchronous} from "../../bo-utils/asynchronousContinuationsUtil";
    import {isStartInitializable} from "../../bo-utils/initiatorUtil";
    import {getModeler} from "../../bpmn-utils/BpmnDesignerUtils";
    import ElementGenerations from "./components/ElementGenerations";
    import ElementDocumentations from "./components/ElementDocumentations";
    import ElementConditional from "./components/ElementConditional";
    import ElementJobExecution from "./components/ElementJobExecution";
    import ElementExtensionProperties from "./components/ElementExtensionProperties";
    import ElementExecutionListeners from "./components/ElementExecutionListeners";
    import ElementAsyncContinuations from "./components/ElementAsyncContinuations";
    import ElementStartInitiator from "./components/ElementStartInitiator";

    export default {
        name: "BpmnPanel",
        components: {
            ElementGenerations,
            ElementDocumentations,
            ElementConditional,
            ElementJobExecution,
            ElementExtensionProperties,
            ElementExecutionListeners,
            ElementAsyncContinuations,
            ElementStartInitiator
        },
        data() {
            return {
                bpmnElementName: "Process",
                bpmnIconName: "Process",
                currentElementType: undefined,
                currentElementId: undefined,
                customTranslate,
                renderComponents: []
            };
        },
        created() {
            EventEmitter.on("modeler-init", (modeler) => {
                // 导入完成后默认选中 process 节点
                modeler.on("import.done", () => {
                    this.setCurrentElement(null);
                });
                // 监听选择事件，修改当前激活的元素以及表单
                modeler.on("selection.changed", ({newSelection}) => {
                    this.setCurrentElement(newSelection[0] || null);
                });
                modeler.on("element.changed", ({element}) => {
                    // 保证 修改 "默认流转路径" 等类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
                    if (element && element.id === this.currentElementId) {
                        this.setCurrentElement(element);
                    }
                });
            });
        },
        mounted() {
            !this.currentElementId && this.setCurrentElement();
        },
        methods: {
            //
            setCurrentElement: debounce(function (element) {
                let activatedElement = element,
                    activatedElementTypeName = "";
                if (!activatedElement) {
                    const modeler = getModeler();
                    activatedElement =
                        (modeler.get("elementRegistry") && modeler.get("elementRegistry").find((el) => el.type === "bpmn:Process")) ||
                        (modeler.get("elementRegistry") && modeler.get("elementRegistry").find((el) => el.type === "bpmn:Collaboration"));

                    if (!activatedElement) {
                        return console.error("No Element found!");
                    }
                }
                activatedElementTypeName = getBpmnIconType(activatedElement);

                this.$store.commit("bpmn/setElement", {element: activatedElement, id: activatedElement.id});
                this.currentElementId = activatedElement.id;
                this.currentElementType = activatedElement.type.split(":")[1];

                this.bpmnIconName = bpmnIcons[activatedElementTypeName];
                this.bpmnElementName = activatedElementTypeName;

                this.setCurrentComponents(activatedElement);
                EventEmitter.emit("element-update", activatedElement);

                console.log("Selected element changed", `ID: ${activatedElement.id} , type: ${activatedElement.type}`);
                console.log("Selected element businessObject", activatedElement.businessObject);

            }, 100),
            //
            setCurrentComponents(element) {
                this.renderComponents.splice(0, this.renderComponents.length); // 清空
                // 重设
                this.renderComponents.push(ElementGenerations);
                this.renderComponents.push(ElementDocumentations);
                isCanbeConditional(element) && this.renderComponents.push(ElementConditional);
                isJobExecutable(element) && this.renderComponents.push(ElementJobExecution);
                this.renderComponents.push(ElementExtensionProperties);
                isExecutable(element) && this.renderComponents.push(ElementExecutionListeners);
                isAsynchronous(element) && this.renderComponents.push(ElementAsyncContinuations);
                isStartInitializable(element) && this.renderComponents.push(ElementStartInitiator);
            }
        }
    };
</script>

<style lang="scss">
    .bpmn-panel {
        display: flex;
        width: 480px;
        height: 100%;
        box-sizing: border-box;
        padding: 0 8px;
        border-left: 1px solid #eee;
        box-shadow: 0 0 8px #ccc;
        flex-direction: column;
        overflow: hidden;
        .n-collapse .el-collapse-item {
            border-top: none;
            margin: 0;
            border-bottom: 1px solid var(--n-divider-color);
            &:first-child {
                border-top: 1px solid var(--n-divider-color);
            }

            .el-collapse-item__header {
                padding: 16px 0;
            }

            .el-collapse-item__content-wrapper .el-collapse-item__content-inner {
                padding:  0 0 16px 0;
            }
        }

        .inline-large-button {
            margin-top: 16px;
            width: 100%;
        }

        .panel-header {
            display: grid;
            padding: 8px;
            grid-template-columns: 40px auto;
            grid-template-rows: 1fr 1fr;
            grid-column-gap: 16px;
            align-items: center;
            background: #f5f5f7;
            .bpmn-icon {
                width: 40px;
                height: 40px;
                grid-row-start: 1;
                grid-row-end: 3;
            }
            p {
                margin: 0;
                padding: 0;
                font-size: 14px;
                font-weight: bolder;
            }
        }

        .el-collapse {
            flex: 1;
            overflow-y: auto;
        }

        .need-filled {
            &.el-form {
                height: 520px;
            }
        }
    }
</style>
