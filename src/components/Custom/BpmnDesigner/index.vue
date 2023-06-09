<template>
    <div class="main-content">
        <div :class="['bpmn-designer', bgClass]" ref="designerRef"></div>
        <bpmn-panel v-if="getEditorConfig.penalMode === 'custom'"/>
        <div v-else class="camunda-panel" id="camunda-panel"></div>

        <context-menu/>
    </div>

</template>

<script>
    import BpmnPanel from './components/Panel'
    import ContextMenu from "./components/ContextMenu";

    import {debounce} from "lodash";
    import {mapGetters} from "vuex";
    import {createNewDiagram} from "@/utils/xml";
    import {downloadFile, setEncoded} from "@/utils/files";
    import moduleAndExtensions from "./moduleAndExtensions";
    import initModeler from "./initModeler";
    import 'bpmn-js/dist/assets/diagram-js.css'
    import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
    import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
    import 'bpmn-js-properties-panel/dist/assets/element-templates.css'
    import 'bpmn-js-properties-panel/dist/assets/properties-panel.css'
    import 'bpmn-js-connectors-extension/dist/connectors-extension.css'
    import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css'
    import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css'

    export default {
        name: "BpmnDesigner",
        props: {
            xml: {
                type: String,
                default: undefined
            }
        },
        components: {BpmnPanel, ContextMenu},
        computed: {
            ...mapGetters({
                'getEditor': "bpmn/getEditor",
                'getModeler': "bpmn/getModeler",
                'getModeling': "bpmn/getModeling",
                'getEditorConfig': 'bpmn/getEditorConfig'

            }),
            bgClass() {
                const bg = this.getEditor.bg;
                if (bg === "grid-image") return "designer-with-bg";
                if (bg === "image") return "designer-with-image";
                return "";
            }
        },
        mounted() {
            document.body.addEventListener("contextmenu", function (ev) {
                ev.preventDefault();
            });
        },
        methods: {
            reloadProcess: debounce(async function (setting, oldSetting) {
                const modelerModules = moduleAndExtensions(setting);

                await this.$nextTick();
                const modeler = initModeler(this.$refs.designerRef, modelerModules, this);
                if (!oldSetting || setting.processEngine !== oldSetting.processEngine) {
                    await createNewDiagram(modeler);
                } else {
                    await createNewDiagram(modeler, this.xml, setting);
                }
            }, 100),
            mockSimulationToggle() {
                this.getModeler && this.getModeler.get("toggleMode") && this.getModeler.get("toggleMode").toggleMode();
            },
            lintToggle() {
                this.getEditorConfig.useLint && this.getModeler && this.getModeler.get("linting") && this.getModeler.get("linting").toggle();
            },
            async downloadProcess(fileName, type, name = "diagram") {
                try {
                    if (!this.getModeler) return this.$message.error("流程图引擎初始化失败");
                    const modeler = this.getModeler;
                    // 按需要类型创建文件并下载
                    if (type === "xml" || type === "bpmn") {
                        const {err, xml} = await modeler.saveXML();
                        // 读取异常时抛出异常
                        if (err) {
                            console.error(`[Process Designer Warn ]: ${err.message || err}`);
                        }
                        const {href, filename} = setEncoded(type.toUpperCase(), name, xml);
                        downloadFile(href, fileName || filename);
                    } else {
                        const {err, svg} = await modeler.saveSVG();
                        // 读取异常时抛出异常
                        if (err) {
                            return console.error(err);
                        }
                        const {href, filename} = setEncoded("SVG", name, svg);
                        downloadFile(href, fileName || filename);
                    }
                } catch (e) {
                    console.error(`[Process Designer Warn ]: ${e.message || e}`);
                }
            },
            downloadAsBpmn(fileName) {
                this.downloadProcess(fileName, "bpmn");
            },
            downloadAsXml(fileName) {
                this.downloadProcess(fileName, "xml");
            },
            downloadAsSvg(fileName) {
                this.downloadProcess(fileName, "svg");
            },
            mockSimulationToggle() {
                this.getModeler && this.getModeler.get("toggleMode") && this.getModeler.get("toggleMode").toggleMode();
            },
            lintToggle() {
                this.getEditorConfig.useLint && this.getModeler && this.getModeler.get("linting") && this.getModeler.get("linting").toggle();
            },
            getCommand() {
                return this.getModeler && this.getModeler.get("commandStack");
            },
            redo() {
                const command = this.getCommand();
                command && command.canRedo() && command.redo();
            },
            undo() {
                const command = this.getCommand();
                command && command.canUndo() && command.undo();
            },
            restart() {
                const command = this.getCommand();
                command && command.clear();
                this.getModeler && createNewDiagram(this.getModeler);
            }
        },
        watch: {
            getEditor: {
                immediate: true,
                deep: true,
                handler: async function (value, oldValue) {
                    try {
                        this.reloadProcess(value, oldValue);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .main-content {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;

        .designer {
            flex: 1;
        }

        .bpmn-designer {
            flex: 1;
            height: 100%;
            overflow: hidden;

            &.designer-with-bg {
                background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+') repeat !important;
            }
        }
    }

</style>

<style>
    .bjs-powered-by {
        display: none !important;
    }

    .bts-toggle-mode {
        display: none !important;
    }

    .djs-overlay-linting {
        display: none;
    }
</style>
