<template>
    <el-collapse-item name="element-start-initiator">
        <template #title>
            <collapse-title title="启动器">
                <z-svg-icon icon-class="play"/>
            </collapse-title>
        </template>
        <div class="element-start-initiator">
            <edit-item label="Initiator">
                <el-input size="small" v-model="initiator" @change="setElementInitiator"/>
            </edit-item>
        </div>
    </el-collapse-item>
</template>

<script>
    import {getInitiatorValue, setInitiatorValue} from "@/components/Custom/BpmnDesigner/bo-utils/initiatorUtil";
    import EventEmitter from "@/utils/EventEmitter";
    import {getActive} from "@/components/Custom/BpmnDesigner/bpmn-utils/BpmnDesignerUtils";

    import EditItem from '../../EditItem'
    import CollapseTitle from '../../CollapseTitle'

    export default {
        name: "ElementStartInitiator",
        components: {
            EditItem,
            CollapseTitle
        },
        data() {
            return {
                initiator: ""
            };
        },

        mounted() {
            this.getElementInitiator();

            EventEmitter.on("element-update", this.getElementInitiator);
        },
        methods: {
            getElementInitiator() {
                getInitiatorValue(getActive());
            },
            setElementInitiator(value) {
                setInitiatorValue(getActive(), value);
            }
        }
    };
</script>
