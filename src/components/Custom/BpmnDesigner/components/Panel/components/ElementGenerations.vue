<template>
    <el-collapse-item name="base-info">
        <template #title>
            <collapse-title title="常规信息">
                <z-svg-icon icon-class="info"/>
            </collapse-title>
        </template>

        <edit-item label="ID">
            <el-input size="small" v-model="elementId" maxlength="32" @change="updateElementId"/>
        </edit-item>

        <edit-item label="Name">
            <el-input size="small" v-model="elementName" maxlength="20" @change="updateElementName"/>
        </edit-item>

        <template v-if="isProcess">
            <edit-item key="version" label="Version">
                <el-input size="small" v-model="elementVersion" maxlength="20" @change="updateElementVersion"/>
            </edit-item>

            <edit-item key="executable" label="Executable">
                <el-switch size="small" v-model="elementExecutable" @change="updateElementExecutable"/>
            </edit-item>
        </template>
    </el-collapse-item>
</template>

<script>
    import {getNameValue, setNameValue} from "@/components/Custom/BpmnDesigner/bo-utils/nameUtil";
    import {
        getProcessExecutable,
        getProcessVersionTag,
        setProcessExecutable,
        setProcessVersionTag
    } from "@/components/Custom/BpmnDesigner/bo-utils/processUtil";
    import {setIdValue} from "@/components/Custom/BpmnDesigner/bo-utils/idUtil";
    import EventEmitter from "@/utils/EventEmitter";
    import {getActive} from "@/components/Custom/BpmnDesigner/bpmn-utils/BpmnDesignerUtils";

    import EditItem from '../../EditItem'
    import CollapseTitle from '../../CollapseTitle'

    export default {
        name: "ElementGenerations",
        components: {
            EditItem,
            CollapseTitle
        },
        data() {
            return {
                elementId: "",
                elementName: "",
                elementVersion: "",
                elementExecutable: true,
                isProcess: false
            };
        },

        mounted() {
            this.reloadGenerationData();
            EventEmitter.on("element-update", this.reloadGenerationData);
        },
        methods: {
            reloadGenerationData() {
                this.isProcess = !!getActive() && getActive().type === "bpmn:Process";
                this.elementId = getActive().id;
                this.elementName = getNameValue(getActive()) || "";
                if (this.isProcess) {
                    this.elementExecutable = getProcessExecutable(getActive());
                    this.elementVersion = getProcessVersionTag(getActive()) || "";
                }
            },
            updateElementName(value) {
                setNameValue(getActive(), value);
            },
            updateElementId(value) {
                setIdValue(getActive(), value);
            },
            updateElementVersion(value) {
                const reg = /((\d|([1-9](\d*))).){2}(\d|([1-9](\d*)))/;
                if (reg.test(value)) {
                    setProcessVersionTag(getActive(), value);
                } else {
                    console.error("版本号必须符合语义化版本2.0.0 要点")
                }
            },
            updateElementExecutable(value) {
                setProcessExecutable(getActive(), value);
            }
        }
    };
</script>
