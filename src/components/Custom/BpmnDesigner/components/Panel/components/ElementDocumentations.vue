<template>
    <el-collapse-item name="element-documentations">
        <template #title>
            <collapse-title title="附加文档">
                <z-svg-icon icon-class="document"/>
            </collapse-title>
        </template>
        <edit-item label="Documentation" :label-width="120">
            <el-input size="small" v-model="elementDoc" type="textarea" @change="updateElementDoc"/>
        </edit-item>
    </el-collapse-item>
</template>

<script>
    import {getDocumentValue, setDocumentValue} from "@/components/Custom/BpmnDesigner/bo-utils/documentationUtil";
    import EventEmitter from "@/utils/EventEmitter";
    import {getActive} from "@/components/Custom/BpmnDesigner/bpmn-utils/BpmnDesignerUtils";

    import EditItem from '../../EditItem'
    import CollapseTitle from '../../CollapseTitle'

    export default {
        name: "ElementDocumentations",
        components: { EditItem, CollapseTitle },
        data() {
            return {
                elementDoc: ""
            };
        },

        watch: {
            getActive: {
                immediate: true,
                handler() {
                    this.elementDoc = getDocumentValue(getActive()) || "";
                }
            }
        },
        mounted() {
            this.elementDoc = getDocumentValue(getActive()) || "";
            EventEmitter.on("element-update", () => {
                this.elementDoc = getDocumentValue(getActive()) || "";
            });
        },
        methods: {
            updateElementDoc(value) {
                setDocumentValue(getActive(), value);
            }
        }
    };
</script>
