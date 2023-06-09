<template>
    <el-dialog :visible.sync="visible" fullscreen :show-close="false" custom-class="pdf-preview"
               :before-close="closeLoading" @open="handleOpen" destroy-on-close>
        <div class="b-pdf-preview">
            <div class="preview-header">
                <div style="flex: 1;display: flex;align-items: center">
                    <span class="text-ellipse-1" style="margin-right: 20px;max-width: 200px;">{{ pdfTitle }}</span>
                    <div style="width: 100px">
                        <el-button v-if="showHistory" type="text" @click="viewHistory">
                            <b-icon :icon="openHistory? 'fa-eye' : 'fa-eye-slash'"/>
                            版本历史
                        </el-button>
                    </div>
                </div>
                <img v-if="themeValue === '1'" class="close-class" src="../../../assets/images/operation-icons/video/close.png"
                     @click="visible = false"/>
                <img v-else-if="themeValue === '2'" class="close-class" src="../../../assets/images/operation-icons/close_green.png"
                     @click="visible = false"/>
                <img v-else class="close-class" src="../../../assets/images/operation-icons/close.png"
                     @click="visible = false"/>
            </div>
            <div v-if="!comparing" style="height: 100%;">
                <div class="preview-operation">
                    <div v-if="showHistory && openHistory" class="operation-nav">
                        <!--						<span style="margin-right: 10px;">版本历史</span>-->
                        <el-button type="text" @click="view2latestVersion">查看最新版本</el-button>
                    </div>
                    <!--仅仅为了布局不乱-->
                    <div v-else style="width: 10px;"></div>
<!--                    <div v-if="type !== 'txt'" class="operation-watch">-->
<!--                        <div style="margin-right: 15px;">-->
<!--                            <el-button size="small" plain @click="prePage" :disabled="num == 1">上一页</el-button>-->
<!--                        </div>-->
<!--                        <div style="margin-right: 15px;">-->
<!--                            <el-input style="width: 70px;" :min="1" :max="pages" size="small" v-model.number="num" @change="toNumPDF">-->
<!--                                <span slot="suffix"-->
<!--                                      style="display: flex;justify-content: center;align-items: center;height: 100%">/{{pages}}</span>-->
<!--                            </el-input>-->
<!--                        </div>-->
<!--                        <div>-->
<!--                            <el-button size="small" plain @click="nextPage" :disabled="num == pages">下一页</el-button>-->
<!--                        </div>-->
<!--                    </div>-->
                    <div v-if="canEdit" class="operation-edit">
                        <el-popover v-model="editMethodShow" placement="bottom" trigger="click">
                            <div>
                                <div style="height: 28px;line-height: 24px;border-bottom: 1px solid #e6e6e6;cursor: pointer"
                                     @click="handleOnlineEdit">打开本地编辑器编辑
                                </div>
                                <div style="height: 28px;line-height: 24px;cursor: pointer" @click="jump2Editor">在线编辑
                                </div>
                            </div>
                            <el-button slot="reference" type="text" icon="el-icon-edit">编辑</el-button>
                        </el-popover>

                        <el-button v-if="txtEdit" type="text" icon="el-icon-receiving" style="margin-left: 10px"
                                   @click="handleSaveTxt">保存
                        </el-button>
                    </div>
                </div>

                <div class="content-container" id="pdf-container">
                    <div v-if="showHistory && openHistory" class="history-list">
                        <div style="display: flex;justify-content: space-between;padding: 0 20px;">
                            <el-button disabled type="text">仅保留最近100个历史记录</el-button>
                            <div>
                                <el-button type="text" :disabled="selection.length !== 1" @click="reset2TargetHistory">
                                    恢复到当前版本
                                </el-button>
                                <el-button type="text" :disabled="selection.length !== 2" @click="handleCompare">对比
                                </el-button>
                            </div>
                        </div>
                        <div style="padding: 0 5px;">
                            <el-table
                                    @selection-change="handleHistorySelectionChange"
                                    @row-dblclick="handleViewCurrentVersion"
                                    :data="historyList"
                                    size="mini"
                                    :show-header="false">
                                <el-table-column type="selection" width="55" align="center"/>
                                <el-table-column prop="name" show-tooltip-when-overflow/>
                                <el-table-column prop="createTime" show-tooltip-when-overflow/>
                                <el-table-column width="70">
                                    <template slot-scope="scope">
                                        <el-button icon="el-icon-view" type="text"
                                                   @click="handleViewCurrentVersion(scope.row)">查看
                                        </el-button>
                                    </template>
                                </el-table-column>

                            </el-table>
                        </div>
                    </div>
                    <div style="flex: 1;margin-top: 10px;display: flex;justify-content: center;overflow: auto">
						<pre v-if="type === 'txt'"
                             style="word-wrap: break-word; white-space: pre-wrap;background-color: #fff;">
							<el-scrollbar style="height: 100%;">
								<div id="txtEdit" style="margin: 0;padding: 10px;height: 100%;box-sizing: border-box"
                                     :contentEditable="txtEdit">
									{{ txtString }}
								</div>
							</el-scrollbar>
						</pre>
                        <div id="viewPdf" @resize="handlePdfResize" :style="{width: displayPercentage + '%', height: '100%', overflow: 'auto'}"
                             @scroll="handleScroll" v-else>
<!--                            <embed :src="src" type="application/pdf" width="100%" height="100%">-->
<!--                            <pdf v-for="i in pages" :key="i" :id="'viewPdf' + i" :ref="'viewPdf' + i" :src="src"-->
<!--                                 :style="{ width: '100%', marginBottom: '10px' }" :page="i"-->
<!--                                 @page-loaded="handlePageLoaded"/>-->
                            <iframe :src="`./js/pdfjs-2.0.943-dist/web/viewer.html?file=${this.src}`" width="100%" height="100%" frameborder="0"></iframe>
                        </div>
                    </div>

                </div>
<!--                <div class="bottom-operation" v-if="type !== 'txt'">-->
<!--                    <i class="el-icon-minus" style="cursor: pointer;" @click="handleZoomOut()"></i>-->
<!--                    <el-dropdown trigger="click" @command="command => handleCommand(command)">-->
<!--                        <span class="percentage">{{ displayPercentage }} %</span>-->
<!--                        <el-dropdown-menu slot="dropdown">-->
<!--                            <el-dropdown-item v-for="percentage in percentages" :key="percentage" :command="percentage">-->
<!--                                {{ percentage }} %-->
<!--                            </el-dropdown-item>-->
<!--                        </el-dropdown-menu>-->
<!--                    </el-dropdown>-->
<!--                    <i class="el-icon-plus" style="cursor: pointer" @click="handleZoomIn()"></i>-->
<!--                </div>-->
            </div>
            <div v-else>
                <div class="compare-header">
                    <div class="history-name">{{ leftPDFControl.title }}</div>
                    <div class="compare-title">
                        对比 <i class="el-icon-close" style="cursor: pointer" @click="cancelCompare"/>
                    </div>
                    <div class="history-name">
                        {{ rightPDFControl.title }}
                    </div>
                </div>

                <div class="compare-content">
                    <div style="width: 50%;border-right: 1px solid rgba(0,0,0, 0.1)">
                        <div style="overflow: auto;height: calc(100% - 30px)">
                            <div style="display: flex;justify-content: center;align-items: center;">
								<pre v-if="type === 'txt'"
                                     style="word-wrap: break-word; white-space: pre-wrap;padding: 8px;background-color: #fff">
									<el-scrollbar style="height: 100%;">
										{{ leftPDFControl.src }}
									</el-scrollbar>
								</pre>
                                <pdf v-else ref="left-history" :src="leftPDFControl.src"
                                     :style="{ width: leftPDFControl.displayPercentage + '%' }"
                                     :page="parseInt(leftPDFControl.num)"/>
                            </div>
                        </div>

                        <div v-if="type !== 'txt'" class="bottom-operation">
                            <div class="left-operation">
                                <div style="margin-right: 15px;">
                                    <el-button size="mini" type="text" @click="leftPDFControl.num -= 1"
                                               :disabled="leftPDFControl.num === 1">上一页
                                    </el-button>
                                </div>
                                <div style="margin-right: 15px;">
                                    <el-input style="width: 70px;" size="mini" v-model.number="leftPDFControl.num"
                                              @change="toNumPDF">
                                        <span slot="suffix"
                                              style="display: flex;justify-content: center;align-items: center;height: 100%">/{{leftPDFControl.pages}}</span>
                                    </el-input>
                                </div>
                                <div>
                                    <el-button size="mini" type="text" @click="leftPDFControl.num += 1"
                                               :disabled="leftPDFControl.num === leftPDFControl.pages">下一页
                                    </el-button>
                                </div>
                            </div>
                            <div class="right-operation">
                                <i class="el-icon-minus" style="cursor: pointer;"
                                   @click="handleZoomOut(leftPDFControl)"></i>
                                <el-dropdown trigger="click"
                                             @command="command => { handleCommand(command, leftPDFControl) }">
                                    <span class="percentage">{{ leftPDFControl.displayPercentage }} %</span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item v-for="percentage in percentages" :key="percentage"
                                                          :command="percentage">{{ percentage }} %
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <i class="el-icon-plus" style="cursor: pointer"
                                   @click="handleZoomIn(leftPDFControl)"></i>
                            </div>
                        </div>
                    </div>
                    <div style="width: 50%;">
                        <div style="overflow: auto;height: calc(100% - 30px)">
                            <div style="display: flex;justify-content: center;align-items: center;">
								<pre v-if="type === 'txt'"
                                     style="word-wrap: break-word; white-space: pre-wrap;padding: 8px;background-color: #fff">
									<el-scrollbar style="height: 100%;">
										{{ rightPDFControl.src }}
									</el-scrollbar>
								</pre>
                                <pdf v-else ref="left-history" :src="rightPDFControl.src"
                                     :style="{ width: rightPDFControl.displayPercentage + '%' }"
                                     :page="parseInt(rightPDFControl.num)"/>
                            </div>
                        </div>

                        <div v-if="type !== 'txt'" class="bottom-operation">
                            <div class="left-operation">
                                <div style="margin-right: 15px;">
                                    <el-button size="mini" type="text" @click="rightPDFControl.num -= 1"
                                               :disabled="rightPDFControl.num === 1">上一页
                                    </el-button>
                                </div>
                                <div style="margin-right: 15px;">
                                    <el-input style="width: 70px;" size="mini" v-model.number="rightPDFControl.num"
                                              @change="toNumPDF">
                                        <span slot="suffix"
                                              style="display: flex;justify-content: center;align-items: center;height: 100%">/{{rightPDFControl.pages}}</span>
                                    </el-input>
                                </div>
                                <div>
                                    <el-button size="mini" type="text" @click="rightPDFControl.num += 1"
                                               :disabled="rightPDFControl.num === rightPDFControl.pages">下一页
                                    </el-button>
                                </div>
                            </div>
                            <div class="right-operation">
                                <i class="el-icon-minus" style="cursor: pointer;"
                                   @click="handleZoomOut(rightPDFControl)"></i>
                                <el-dropdown trigger="click"
                                             @command="command=> { handleCommand(command, rightPDFControl) }">
                                    <span class="percentage">{{ rightPDFControl.displayPercentage }} %</span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item v-for="percentage in percentages" :key="percentage"
                                                          :command="percentage">{{ percentage }} %
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <i class="el-icon-plus" style="cursor: pointer"
                                   @click="handleZoomIn(rightPDFControl)"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>
<script>
    import pdf from 'vue-pdf'
    import {getFileHistoryById, getHistoryFile, rollup2CurrentVersion} from '@/api/file/index'
    import {previewOffice} from "@/api/common.js"
    import {uploadFileForUpdateHistory} from "@/api/file";
    import {onlineNetiler} from "@/components/Base/B-Pdf-Preview/onlineEditToNetiler";

    export default {
        name: 'b-pdf-preview',
        props: {
            pdfTitle: {type: String, default: '一只小青蛙'},
            // src: { type: [String, Object], default: '' },
            fileId: {type: String},
            shareId: {type: String},
            file: {type: Object, default: () => ({})},
            canEdit: {type: Boolean, default: true},
            type: {type: String, default: 'pdf'},
            showHistory: {type: Boolean, default: true}
        },
        components: {pdf},
        data() {
            return {
                isLatestVersion: true,
                txtString: '',
                src: '',
                pages: 1,
                num: 1,
                displayPercentage: 100,
                percentages: [10, 20, 30, 50, 75, 100],
                historyList: [],
                comparing: false,
                editMethodShow: false,
                leftPDFControl: {
                    pages: 1,
                    num: 1,
                    displayPercentage: 100,
                    title: '左版本',
                    src: ''
                },
                rightPDFControl: {
                    pages: 1,
                    num: 1,
                    displayPercentage: 100,
                    title: '右版本',
                    src: ''
                },
                selection: [],
                openHistory: false,
                txtEdit: false,
                pageToPdf: {
                    0: {
                        clientHeight: 0,
                        scrollTop: 0
                    }
                }
            }
        },

        methods: {
            closeLoading() {
                console.log('close',this.loadingInstance);
                if (this.loadingInstance) {
                    this.loadingInstance.close()
                }
            },
            handleOpen() {
                this.openHistory = false
                getFileHistoryById(this.fileId).then(res => {
                    this.historyList = res.data
                })
                this.loadingInstance = this.$loading({
                    lock: true,
                    text: '正在打开文档请稍后',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, .7)'
                })
                previewOffice({
                    fileId: this.fileId,
                    shareId: this.shareId
                }).then(res => {
                    let blob = new Blob([res], {
                        type: "application/pdf",
                    });
                    if (this.type === 'txt') {
                        this.readTXTFromBlob(blob).then(res => {
                            this.txtString = res
                            this.loadingInstance.close()
                            this.loadingInstance = null
                        })
                    } else {
                        this.src = URL.createObjectURL(blob)
                        this.getPDFPages()
                        this.loadingInstance.close()
                        this.loadingInstance = null
                    }
                }).catch(e => {
                    // console.log(e);
                    this.$message.error(e.message)
                    this.loadingInstance.close()
                    this.loadingInstance = null
                    // this.src = null
                })
                this.$_EB.$on('open-edit', (data) => {
                    this.editLoading.close()
                    // this.$message.info(data.msg)
                })
            },
            view2latestVersion() {
                previewOffice({
                    fileId: this.fileId
                }).then(res => {
                    this.isLatestVersion = true
                    let blob = new Blob([res], {
                        type: "application/pdf",
                    });
                    if (this.type === 'txt') {
                        this.readTXTFromBlob(blob).then(res => {
                            this.txtString = res
                        })
                    } else {
                        this.src = URL.createObjectURL(blob)
                        this.getPDFPages()
                    }
                })
            },
            handleZoomIn(target) {
                if (target) {
                    if (target.displayPercentage <= 90) {
                        target.displayPercentage += 10
                    } else {
                        target.displayPercentage = 100
                    }
                } else {
					if (this.displayPercentage <= 90) {
                        this.displayPercentage += 10
                    } else {
                        this.displayPercentage = 100
                    }
                }
            },
            handleZoomOut(target) {
                if (target) {
                    if (target.displayPercentage >= 20) {
                        target.displayPercentage -= 10
                    } else {
                        target.displayPercentage = 10
                    }
                } else {
                    if (this.displayPercentage >= 20) {
                        this.displayPercentage -= 10
                    } else {
                        this.displayPercentage = 10
                    }
                }

            },
            handleCommand(command, target) {
                if (target) {
                    target.displayPercentage = command
                } else {
                    this.displayPercentage = command
                }

            },
            toNumPDF(num) {
				const target = document.getElementById('viewPdf' + num)
				target.scrollIntoView(false)
            },
			prePage() {
            	if(this.num <= 1) return
				this.num -= 1
				this.toNumPDF(this.num)
			},
			nextPage(){
            	if(this.num >= this.pages) return
            	this.num = 1*this.num + 1
            	this.toNumPDF(this.num)
			},
            getPDFPages() {
                let loadingTask = pdf.createLoadingTask(this.src)
                return loadingTask.promise.then(pdf => {
                    this.pages = pdf.numPages
                }).catch(err => {
                    console.log(err);
                    this.$message.info(err.message || '文档转换未完成，请耐心等待...')
                })
            },
            setPDFPages(src, target) {
                let loadingTask = pdf.createLoadingTask(src)
                loadingTask.promise.then(_pdf => {
                    if (target) {
                        target.pages = _pdf.numPages
                    } else {
                        this.pages = _pdf.numPages
                    }
                }).catch(err => {
                    console.log(err);
                    this.$message.info('文档转换未完成，请耐心等待...')
                })
            },
            handlePageLoaded(e) {
				console.log(e);
				let scrollTop = 0;
                for (const key in this.pageToPdf) {
                    if (this.pageToPdf.hasOwnProperty(key)) {
                        scrollTop += (this.pageToPdf[key].clientHeight + 10)
                    }
                }
                const pageToPdf = {
                    [e]: {
                        clientHeight: this.$refs['viewPdf' + e][0].$el.clientHeight,
                        scrollTop: scrollTop
                    }
                }
                this.pageToPdf = Object.assign(this.pageToPdf, pageToPdf)
            },
			recalculatePageToPdf() {
				const copyPageToPdf = JSON.parse(JSON.stringify(this.pageToPdf))
				const totalPages = Object.keys(copyPageToPdf)
				totalPages.forEach((page, index) => {
					if(index === 0) {
						copyPageToPdf[index] = {
							clientHeight: 0,
							scrollTop: 0
						}
					}else {
						copyPageToPdf[index] = {
							clientHeight: document.getElementById('viewPdf' + index).clientHeight,
							scrollTop: copyPageToPdf[index - 1].clientHeight + copyPageToPdf[index - 1].scrollTop + 10
						}
					}
				})

				console.log(this.pageToPdf, copyPageToPdf);

				this.pageToPdf = copyPageToPdf
			},
			viewHistory() {
				this.openHistory = !this.openHistory
				let timer = setTimeout(() => {
					this.recalculatePageToPdf()
					clearTimeout(timer)
				}, 500)
			},
            cancelCompare() {
                this.comparing = false
            },
            handleHistorySelectionChange(selection) {
                this.selection = selection
            },
            reset2TargetHistory() {
                rollup2CurrentVersion(this.fileId, this.selection[0].id).then(res => {
                    this.$message.success(res.message || '回滚版本成功，请重新打开该文件查看')
                })

            },
            handleCompare() {
                const loadingInstance = this.$loading({
                    lock: true,
                    text: '正在加载版本文件，请稍后...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0,0,0, 0.7)'
                })
                Promise.all([getHistoryFile(this.fileId, this.selection[0].id), getHistoryFile(this.fileId, this.selection[1].id)]).then(res => {
                    let leftBlob = new Blob([res[0]], {
                        type: "application/pdf",
                    });
                    let rightBlob = new Blob([res[1]], {
                        type: "application/pdf",
                    });

                    if (this.type === 'txt') {
                        Promise.all([this.readTXTFromBlob(leftBlob), this.readTXTFromBlob(rightBlob)]).then(res => {
                            this.leftPDFControl.src = res[0]
                            this.leftPDFControl.title = this.selection[0].name
                            this.rightPDFControl.src = res[1]
                            this.rightPDFControl.title = this.selection[1].name
                            loadingInstance.close()
                        })
                    } else {
                        let leftSrc = URL.createObjectURL(leftBlob);
                        this.leftPDFControl.src = leftSrc
                        this.setPDFPages(leftSrc, this.leftPDFControl)
                        this.leftPDFControl.title = this.selection[0].name

                        let rightSrc = URL.createObjectURL(rightBlob);
                        this.rightPDFControl.src = rightSrc
                        this.setPDFPages(rightSrc, this.rightPDFControl)
                        this.rightPDFControl.title = this.selection[1].name

                        loadingInstance.close()
                    }
                    this.comparing = true
                }).catch(err => {
                    loadingInstance.close()
                    this.$message.error(err.message || '获取版本文件失败，请重试...')
                })
            },
            handleViewCurrentVersion(row) {
                const loadingInstance = this.$loading({
                    lock: true,
                    text: '正在加载版本文件，请稍后...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0,0,0, 0.7)'
                })
                getHistoryFile(this.fileId, row.id).then(res => {
                    this.isLatestVersion = false
                    let blob = new Blob([res], {
                        type: "application/pdf",
                    });
                    if (this.type === 'txt') {
                        this.readTXTFromBlob(blob).then(res => {
                            this.txtString = res
                            loadingInstance.close()
                        })
                    } else {
                        this.src = URL.createObjectURL(blob)
                        this.getPDFPages()
                        loadingInstance.close()
                    }
                })
            },
            readTXTFromBlob(blob) {
                let reader = new FileReader()
                reader.readAsText(blob, this.file.charset || 'urf8')
                return new Promise(resolve => {
                    reader.onload = (e) => {
                        resolve(e.target.result)
                    }
                })
            },
            jump2Editor() {
                this.editMethodShow = false
                const {origin, pathname, search} = window.location
                console.log(this.file);
                if (this.file.fileType === 'xlsx') {
                    if(window.globalAPI) {
                        globalAPI.newWindow({
                            title: this.pdfTitle,
                            url: `${origin}${pathname}${search ? search + '&' : '?'}fileId=${this.fileId}&fileName=${this.pdfTitle}#/xlsx-edit`
                        })
                    }else {
                        window.open(`${origin}${pathname}${search ? search + '&' : '?'}fileId=${this.fileId}&fileName=${this.pdfTitle}#/xlsx-edit`)
                    }
                } else if (this.file.fileType === 'docx') {
                    this.$message.warning('暂未实现该类型文件的在线编辑功能，如要继续编辑请选择本地编辑')
                    // window.open(`${origin}${pathname}${search ? search + '&' : '?'}fileId=${this.fileId}&fileName=${this.pdfTitle}#/word-edit`)
                } else if (this.file.fileType === 'txt') {
                    this.txtEdit = true
                } else {
                    this.$message.warning('暂未实现该类型文件的在线编辑功能，如要继续编辑请选择本地编辑')
                }
            },
            handleOnlineEdit() {
                this.editMethodShow = false
                console.log(this.file);
                if (['doc', 'docx', 'xls', 'xlsx'].includes(this.file.fileType)) {
                    let embed = document.createElement("embed");
                    embed.setAttribute('id','word');
                    embed.setAttribute('type','application/top-word-plugin');
                    embed.setAttribute('style','width:1px;height:1px;visibility: hidden;');
                    document.body.appendChild(embed);

                    if(typeof embed.OpenWord !== 'undefined') {
                        onlineNetiler(this.file, this)
                        return
                    }
                }
                if (this.ws) {
                    this.editLoading = this.$loading({
                        lock: true,
                        text: '正在查找本地程序打开文档，请稍后...',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0 , 0, 0, 0.7)'
                    })
                    this.ws.send(JSON.stringify({
                        cmd: 'edit',
                        fileId: this.file.id,
                        fileName: this.file.fileName + '.' + this.file.fileType,
                        userId: this.userId
                    }))
                } else {
                    this.$message.warning('未检测到编辑服务开启，请检查本机编辑服务端口20997是否开启或刷新页面重试...')
                }
            },
            handleSaveTxt() {
                const htmlText = document.getElementById('txtEdit').innerText

                const file = new File([htmlText], this.pdfTitle, {type: 'text/*;charset=utf-8'})

                const formData = new FormData()
                formData.append('fileId', this.fileId)
                formData.append('userId', this.userId)
                formData.append('uploadFile', file)
                uploadFileForUpdateHistory(formData).then(res => {
                    this.$message.success(res.message || '文档更新成功！')
                    this.txtEdit = false
                })
            },
            handleScroll(e) {
                // const singlePdfHeight = this.$refs['viewPdf1'][0].$el.clientHeight
                // const nums = Object.keys(this.pageToPdf)
                // console.log(this.pageToPdf);
                let delta = 0
                for (const key in this.pageToPdf) {
                    if (this.pageToPdf.hasOwnProperty(key)) {
                        delta = Math.abs(e.target.scrollTop - this.pageToPdf[key].scrollTop)

                        if (0 < delta && delta < 100) {
                            console.log(key, delta);
                            this.num = key
                        }
                    }
                }
                // this.num = Math.ceil(e.target.scrollTop / (singlePdfHeight + 10))
            },
            handlePdfResize(e) {
                console.log(e);
            }
        },
        computed: {
            visible: {
                get() {
                    return this.$attrs.visible
                },
                set(value) {
                    this.$emit('update:visible', value)
                },
            },
            ws() {
                return this.$store.state.app.ws
            },
            userId() {
                return this.$store.state.user.userId
            },
            themeValue() {
                return this.$store.state.system.themeValue
            }
        },
		watch: {
			displayPercentage() {
				let timer = setTimeout(() => {
					this.recalculatePageToPdf()
					clearTimeout(timer)
				}, 500)
			}
		}
    }
</script>
<style lang="scss">
    .pdf-preview {

        .el-dialog__header {
            display: none !important;
            padding: 0;
        }

        .b-pdf-preview {
            width: 100%;
            margin: 0 auto;
            color: #000;
            height: 100vh;
            background: #fff;
            position: relative;
            overflow: hidden;

            .preview-header {
                display: flex;
                justify-content: space-between;
                padding: 5px 20px;
                font-size: 1.2rem;
                align-items: center;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);

                .close-class {
                    cursor: pointer;
                    width: 40px;
                }
            }

            .preview-operation {
                height: 40px;
                background: #fff;
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;

                .operation-nav {
                    width: 200px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                .operation-watch {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                .operation-edit {
                    width: 100px;
                    display: flex;
                    justify-content: center;
                }
            }

            .content-container {
                width: 100%;
                height: calc(100% - 117px);
                padding: 10px;
                background: #e7e9ec;
                /*overflow: scroll;*/
                display: flex;
                /*justify-content: center;*/
                flex-wrap: nowrap;

                .history-list {
                    width: 30%;
                    min-width: 355px;
                    height: 100%;
                    overflow: auto;
                }
            }

            .bottom-operation {
                width: 100%;
                height: 30px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                box-sizing: border-box;
                padding-right: 20px;
                border-top: 1px solid rgba(0, 0, 0, .1);

                .percentage {
                    cursor: pointer;
                    margin: 0 10px;
                    width: 40px;
                    display: inline-block;
                    text-align: center;
                }
            }

            .compare-header {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 5px 20px;
                font-size: 1rem;
                height: 40px;
                /*color: #008FCC;*/
                color: var(--main-color, $main_color);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);

                .history-name {
                    flex: 1;
                    text-align: center;
                }

                .compare-title {
                    width: 80px;
                    text-align: center;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 8px;
                    border: 1px solid var(--main-color, $main_color);
                    padding: 0 5px;
                    box-sizing: border-box;

                    .el-icon-close {
                        display: none;
                    }

                    &:hover {
                        .el-icon-close {
                            display: inline-block;
                        }
                    }
                }
            }

            .compare-content {
                display: flex;
                justify-content: space-between;
                flex-wrap: nowrap;
                width: 100%;
                height: calc(100vh - 87px);
                padding-top: 10px;
                background: #e7e9ec;

                .bottom-operation {
                    width: 100%;
                    height: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-sizing: border-box;
                    padding-right: 20px;
                    border-top: 1px solid rgba(0, 0, 0, .1);

                    .left-operation {
                        flex: 1;
                        max-width: 500px;
                        display: flex;
                        justify-content: flex-start;
                    }

                    .right-operation {
                        width: 100px;

                        .percentage {
                            cursor: pointer;
                            margin: 0 10px;
                            width: 40px;
                            display: inline-block;
                            text-align: center;
                        }
                    }
                }
            }

        }
    }

</style>
