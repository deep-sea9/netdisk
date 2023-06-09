<template>
    <div class="main-layout__wrapper">
        <div class="session-comp-contain">
            <div class="im-contain flex-start">
                <div class="im-contain__left im-height">
                    <div class="im-left-cov">
                        <div class="im-l-contain">
                            <div class="im-l-contain__action flex-between">
                                <div class="im-action-bar flex-center" @click="createDataChannel">
                                    创建普通会话
                                </div>
                                <div class="im-action-bar flex-center">
                                    创建群组会话
                                </div>
                            </div>
                            <div class="im-l-contain__content">
                                <div :class="{
                                        'flex-start': true,
                                        'im-list-card': true,
                                        'active': activeSession && session.id === activeSession.id
                                    }"
                                     v-for="session in sessionList"
                                     :key="session.id"
                                    @click="changeSession(session)">
                                    <div class="im-list-card__avatar">
                                        <div class="u-avatar u-avatar--medium">
                                            <img src="../../../assets/images/avatar.png" style="object-fit: cover;display: block;height: 100%;vertical-align: middle;border: 0;">
                                        </div>
                                    </div>
                                    <div class="im-list-card__content">
                                        <div class="im-list-card__cov">
                                            <div class="im-list-card__cov--top">
                                                <p class="im-list-card__cov--title">{{ session.targetName }}</p>
                                                <p class="im-list-card__cov--time">{{ session.updateTime }}</p>
                                            </div>
                                            <div class="im-list-card__cov--bottom">
                                                <p class="im-list-card__cov--message">{{ session.lastMsg }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="activeSession && activeSession.established" class="im-contain__main im-height">
                    <div class="im-m-contain">
                        <div class="im-m-contain__header">
                            <div class="message-header">
                                <div class="title">{{ activeSession.targetName }}</div>
                            </div>
                        </div>
                        <div class="im-m-contain__message">
                            <div class="im-recycle-dom__items">
                                <div class="message-item" v-for="msg in messageList" :key="msg.id">
                                    <div class="im-message-system">
                                        <div class="im-message-system__content">{{ msg.msgTime }}</div>
                                    </div>
                                    <div class="im-message-wrapper" :style="{ flexDirection: userId === msg.sendUserId? 'row-reverse': '' }">
                                        <div class="im-message-avatar">
                                            <div class="im-person-info">
                                                <img src="../../../assets/images/avatar.png">
                                            </div>
                                        </div>
                                        <div class="im-message-body">
                                            <div class="im-message-body__name" :style="{ textAlign: msg.sendUserId === userId? 'right': 'left' }">{{ msg.sendUserName }}</div>
                                            <div class="im-message-location">
                                                <div :class="{ 'im-message-content': true, 'current-user': userId === msg.sendUserId }">
                                                    <div v-if="msg.msgType === 'text'" class="im-message-text">
                                                        <div class="im-message-text__content">{{ msg.msgContent }}</div>
                                                    </div>
                                                    <div v-else-if="msg.msgType === 'single-file' || msg.msgType === 'local-file'" class="im-message-file">
                                                        <div class="im-message-file__icon flex-center">
                                                            <img :src="fetchFileIcon(msg.fileType, msg.fileName)" style="border: 0;width: 40px;height: 40px;vertical-align: middle;display: inline-block">
                                                        </div>
                                                        <div class="im-message-file__content flex-around">
                                                            <div class="im-message-file__content-name">{{ msg.fileName }}</div>
                                                            <div class="im-message-file__content-size">{{ getFormatFileSize(msg.fileSize) }}</div>
                                                        </div>
                                                    </div>
                                                    <div v-else-if="msg.msgType === 'file'" class="im-message-file">
                                                        <div class="im-message-file__icon flex-center">
                                                            <img :src="fetchFileIcon('default')" style="border: 0;width: 40px;height: 40px;vertical-align: middle;display: inline-block">
                                                        </div>
                                                        <div class="im-message-file__content flex-around">
                                                            <div class="im-message-file__content-name">{{ msg.msgContent }}</div>
                                                            <div class="im-message-file__content-size">{{ msg.fileId.length }}个文件</div>
                                                        </div>
                                                    </div>
                                                    <div v-else class="im-message-media">
                                                        <div class="im-message-media__content">
                                                            <div class="im-message-media__content-image">
                                                                <img :src="getPreviewSrc(msg.fileId)" style="object-fit: cover;vertical-align: top;width: 100%;height: 100%;border: 0;">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="im-message-tips"></div>
                                                <div class="im-message-operation"></div>
                                            </div>
                                        </div>
                                        <div v-if="msg.msgType !== 'text'" class="im-file-operate flex-center" @click="handleLinkDownload(msg)" title="下载">
                                            <b-icon icon="fa-arrow-alt-from-top" />
                                        </div>
                                        <div v-if="msg.msgType !== 'text' && msg.sendUserId !== userId" class="im-file-operate flex-center" @click="save2Personal(msg)" title="转存">
                                            <b-icon icon="fa-window-restore" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="im-m-contain__inputbox">
                            <div class="im-input-box">
                                <div class="im-input-box__tools">
                                    <span class="im-input-box__tools--icon" @click="fileVisible = true">
                                        <b-icon icon="fa-desktop" />
                                    </span>
                                    <span class="im-input-box__tools--icon">
                                        <el-upload :show-file-list="false" :drag="false" ref="upload" action="#" :http-request="handleUpload">
                                            <b-icon icon="fa-upload" />
                                        </el-upload>
<!--                                        <b-icon icon="fa-upload" />-->
                                    </span>
                                </div>
                                <div class="im-input-box__text">
                                    <textarea @keydown.enter="sendMsg" v-model="msg" class="im-input-box__textarea" carettype="primary" autofocus type="textarea" placeholder="请输入文本内容"></textarea>
                                    <div class="im-input-box__tips">按下enter发送内容/Control+enter换行</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="activeSession && activeSession.established" class="im-contain__right im-height">
                    <div class="im-r-contain">
                        <el-tooltip content="文件库" placement="left">
                            <span class="im-r-contain__icon" @click="fileStoreVisible = !fileStoreVisible">
                                <i class="el-icon-folder" />
                            </span>
                        </el-tooltip>
                    </div>
                </div>
                <div v-if="!activeSession || !activeSession.established" style="width: 100%;height: 100%;">
                    <div style="width: 100%;height: 200px;margin: 100px auto;padding: 20px;">
                        <el-input style="width: 98%;" type="textarea" placeholder="黏贴offer信息创建应答/或黏贴answer信息创建连接" v-model="offerDescription" :rows="10" />
                        <el-button :disabled="!offerDescription" type="primary" style="width: 80px;height: 36px;margin-top: 20px;" @click="handleAnswerOffer">应答</el-button>
                        <el-button :disabled="!offerDescription" type="primary" style="width: 80px;height: 36px;margin-top: 20px;" @click="handleConnection">连接</el-button>
                    </div>
                </div>
            </div>
        </div>

        <net-disk-file :visible.sync="fileVisible" @confirm-select="handleConfirmSelect" />
        <file-store v-if="activeSession && activeSession.established" :visible.sync="fileStoreVisible" :data="fileStore[activeSession.id] || []" :user-id="userId" />
    </div>
</template>

<script>
    import fetchFileIcon from '@/utils/fetchFileIcon'
    import {getCurrentTime, getFormatFileSize, setRandomId, getRawType} from '@/utils'
    import copy from 'copy-to-clipboard'
    import NetDiskFile from './components/net-disk-file'
    import FileStore from './components/file-store'
    import {getThumnUrlOfImg} from "@/api/file";
    import {secondFile} from "@/api/common";

    const mediaEnum = ['PNG', 'JPG', 'JPEG', 'ICO', 'JPEG', 'GIF', 'WEBP', 'BMP', 'TIFF', 'MP4', 'MOV']
    const baseURL = process.env.VUE_APP_BASE_URL
    const previewURL = baseURL
    const ChunkSize = 16384

    export default {
        name: "webrtc-session",
        components: { NetDiskFile, FileStore },
        data() {
            return {
                fileVisible: false,
                fileStoreVisible: false,
                sessionList: [
                    {
                        established: false,
                        targetName: '观澜',
                        targetId: '',
                        id: '1',
                        type: 'p2p',
                        updateTime: '2023-04-05 09:44',
                        createTime: '2023-04-05 09:44',
                        lastMsg: '分享文件2.js'
                    },
                    {
                        established: false,
                        targetName: '分享群',
                        targetId: '',
                        id: '2',
                        type: 'group',
                        updateTime: '2023-04-05 10:44',
                        createTime: '2023-04-05 10:04',
                        lastMsg: '分享文件2.js'
                    }
                ],
                fileStore: {},
                activeSession: null,
                // activeSession: {
                //     established: true,
                //     targetName: '观澜',
                //     targetId: '',
                //     id: '1',
                //     type: 'p2p',
                //     updateTime: '2023-04-05 09:44',
                //     createTime: '2023-04-05 09:44',
                //     lastMsg: '分享文件2.js'
                // },
                msg: '',
                messageList: [
                    {
                        id: '1',
                        sendUserId: 'uther',
                        sendUserName: 'uther',
                        msgContent: 'hello',
                        msgType: 'text',
                        msgTime: '2023-04-06 09:44'
                    },
                    {
                        id: '2',
                        sendUserId: 'wqy',
                        sendUserName: 'qiuyue_wu',
                        msgContent: require('../../../assets/images/logo.png'),
                        fileId: 'xxx',
                        fileName: '1.png',
                        fileSize: 1024,
                        fileType: 'png',
                        msgType: 'media',
                        msgTime: '2023-04-06 09:44'
                    },
                    {
                        id: '3',
                        sendUserId: 'wqy',
                        sendUserName: 'qiuyue_wu',
                        msgContent: 'http://netdisk.leadal.com/marte.otf',
                        fileId: 'marte',
                        fileName: 'marte.otf',
                        fileSize: 1024 * 10,
                        fileType: 'otf',
                        msgType: 'single-file',
                        msgTime: '2023-04-06 09:44'
                    },
                    {
                        id: '4',
                        sendUserId: 'uther',
                        sendUserName: 'uther',
                        msgContent: require('../../../assets/images/logo.png'),
                        fileId: 'xxx',
                        fileName: '1.png',
                        fileSize: 1024 * 10,
                        fileType: 'png',
                        msgType: 'media',
                        msgTime: '2023-04-06 09:44'
                    },
                    {
                        id: '5',
                        sendUserId: 'wqy',
                        sendUserName: 'qiuyue_wu',
                        msgContent: 'http://netdisk.leadal.com/1.png',
                        fileId: 'xxx',
                        fileName: '1.png',
                        fileSize: 1024 * 100,
                        fileType: 'png',
                        msgType: 'media',
                        msgTime: '2023-04-06 09:44'
                    }
                ],
                dataChannel: null,
                pc: new RTCPeerConnection(),
                iceCandidate: null,
                describeOffer: null,
                describeAnswer: null,
                receiveChannel: null,
                remotePC: new RTCPeerConnection(),
                sendingFile: null,
                receivingFile: null,
                sendSize: 0,
                bytesPrev: 0,
                bitrateMax: 0,
                receivedSize: 0,
                receiveBuffer: [],
                offerDescription: '',
                immutableOfferDescription: {},
                immutableAnswerDescription: {},
                remoteIceCandidate: null
            }
        },
        computed: {
            userId() {
                return this.$store.state.user.userId || 'uther'
            },
            userName() {
                return this.$store.state.user.userName || 'uther'
            }
        },
        mounted() {
            console.log(getRawType(new ArrayBuffer(1)))
        },
        methods: {
            fetchFileIcon,
            getFormatFileSize,
            getPreviewSrc(fileId) {
                return getThumnUrlOfImg(fileId)
            },
            changeSession(session) {
                if(this.activeSession && session.id === this.activeSession.id) return

                this.activeSession = session
            },
            onReceiveArrayBuffer(ab) {
                this.receiveBuffer.push(ab);
                this.receivedSize += ab.byteLength;

                console.log(this.receivedSize);

                // we are assuming that our signaling protocol told
                // about the expected file size (and name, hash, etc).

                if (this.receivedSize === this.receivingFile.size) {
                    console.log(this.receivedSize, this.receivingFile);
                    const { createUserId, name, size, createUserName, localFileMsgId } = this.receivingFile
                    const received = new Blob(this.receiveBuffer);

                    const targetSession = this.sessionList.find(s => s.targetId === createUserId)

                    if(this.fileStore[targetSession.id]) {
                        this.fileStore[targetSession.id].push({
                            file: received,
                            fileName: name,
                            fileSize: size,
                            fileType: name.split('.').pop(),
                            createTime: (new Date()).toLocaleString(),
                            createUserName,
                            createUserId,
                            fileNum: 1,
                            localFileMsgId
                        })
                    }else {
                        this.fileStore[targetSession.id] = [{
                            file: received,
                            fileName: name,
                            fileSize: size,
                            fileType: name.split('.').pop(),
                            createTime: (new Date()).toLocaleString(),
                            createUserName,
                            createUserId,
                            fileNum: 1,
                            localFileMsgId
                        }]
                    }

                    this.receiveBuffer = [];
                    this.receivedSize = 0
                    this.receivingFile = null
                }
            },
            createDataChannel() {
                // 创建数据通道，默认使用in-band协商方式，即negotiated = false
                this.dataChannel = this.pc.createDataChannel('my-channel', { maxRetransmits: 3 })
                this.dataChannel.onopen = () => {
                    console.log('data channel opened!');
                    this.dataChannel.bufferedAmountLowThreshold = ChunkSize
                    const { userId, userName } = JSON.parse(this.offerDescription)
                    const activeSession = {
                        established: true,
                        id: setRandomId(8),
                        targetName: userName,
                        targetId: userId,
                        type: 'p2p',
                        updateTime: new Date().toLocaleString(),
                        createTime: new Date().toLocaleString(),
                        lastMsg: ''
                    }
                    const existedTarget = this.sessionList.find(s => s.targetId === activeSession.targetId)

                    if(existedTarget) {
                        this.activeSession = existedTarget
                        this.activeSession.established = true
                    }else {
                        this.sessionList.push(activeSession)
                        this.activeSession = activeSession
                    }
                    this.$nextTick(() => {
                        this.scroll2Bottom()
                    })

                }
                this.dataChannel.onmessage = (e) => {
                    if(getRawType(e.data) === 'arraybuffer') {
                        this.onReceiveArrayBuffer(e.data)
                    }else {
                        const msg = JSON.parse(e.data)
                        if(msg.msgType === 'local-file') {
                            this.receivingFile = {
                                name: msg.fileName,
                                size: msg.fileSize,
                                createUserName: msg.sendUserName,
                                createUserId: msg.sendUserId,
                                sessionId: msg.sessionId,
                                localFileMsgId: msg.id
                            }
                        }else if(msg.msgType !== 'text') {
                            const fileInfo = {
                                fileId: msg.fileId,
                                fileName: msg.msgContent,
                                fileSize: msg.fileSize,
                                fileType: msg.fileType,
                                createTime: (new Date()).toLocaleString(),
                                createUserName: msg.sendUserName,
                                createUserId: msg.sendUserId,
                                fileNum: msg.fileSize? 1 : 0,
                                resourceId: msg.resourceId
                            }

                            const targetSession = this.sessionList.find(s => s.targetId === msg.sendUserId)

                            if(this.fileStore[targetSession.id]) {
                                this.fileStore[targetSession.id].push(fileInfo)
                            }else {
                                this.fileStore[targetSession.id] = [fileInfo]
                            }
                        }
                        this.messageList.push(msg)
                    }

                    this.$nextTick(() => {
                        this.scroll2Bottom()
                    })
                    // receivedData.value = e.data
                    console.log('received data：', e.data);
                }
                this.dataChannel.onerror = (error) => {
                    console.log('error in data channel', error);
                }
                this.dataChannel.onclose = e => {
                    console.log('datachannel close', e);
                }
                this.dataChannel.onbufferedamountlow = (channel, e) => {
                    console.log('datachannel buffer amount low', channel, e);
                    this.readSlice(this.offset)
                }

                this.pc.onicecandidate = e => {
                    // console.log(e);
                    if(e.candidate) {
                        console.log(e.candidate);
                        this.iceCandidate = JSON.stringify(e.candidate)
                        this.immutableOfferDescription.ice = this.iceCandidate
                        if(this.immutableOfferDescription.ice && this.immutableOfferDescription.offer) {
                            this.immutableOfferDescription.userId = this.userId
                            this.immutableOfferDescription.userName = this.userName
                            if(copy(JSON.stringify(this.immutableOfferDescription), { format: 'text/plain' })) {
                                this.$message.success('复制offer成功！请将offer发送给目标对象')
                            }else {
                                this.$message.warning('复制offer失败，请重新创建')
                            }
                        }
                    }
                }

                this.pc.createOffer().then(offer => {
                    this.describeOffer = JSON.stringify(offer)
                    this.immutableOfferDescription.offer = this.describeOffer

                    console.log(offer);
                    return this.pc.setLocalDescription(offer)
                }).then(() => {
                    console.log('set description success');
                    // 将describe 发送至另一台browser
                }).catch(err => {
                    console.log('error in creating offer', err);
                })
            },
            handleAnswerOffer() {
                this.remotePC.ondatachannel = (e) => {
                    console.log('Receive Channel Callback');
                    this.receiveChannel = e.channel;
                    this.receiveChannel.onopen = () => {
                        this.receiveChannel.bufferedAmountLowThreshold = ChunkSize
                        const readyState = this.receiveChannel.readyState;
                        const { userId, userName } = JSON.parse(this.offerDescription)

                        const activeSession = {
                            established: true,
                            id: setRandomId(8),
                            targetName: userName,
                            targetId: userId,
                            type: 'p2p',
                            updateTime: new Date().toLocaleString(),
                            createTime: new Date().toLocaleString(),
                            lastMsg: ''
                        }
                        const existedTarget = this.sessionList.find(s => s.targetId === activeSession.targetId)

                        if(existedTarget) {
                            this.activeSession = existedTarget
                            this.activeSession.established = true
                        }else {
                            this.sessionList.push(activeSession)
                            this.activeSession = activeSession
                        }

                        this.$nextTick(() => {
                            this.scroll2Bottom()
                        })
                        console.log(`Receive channel state is: ${readyState}`);
                    }
                    this.receiveChannel.onmessage = (e) => {
                        if(getRawType(e.data) === 'arraybuffer') {
                            this.onReceiveArrayBuffer(e.data)
                        }else {
                            const msg = JSON.parse(e.data)
                            if(msg.msgType === 'local-file') {
                                this.receivingFile = {
                                    name: msg.fileName,
                                    size: msg.fileSize,
                                    createUserName: msg.sendUserName,
                                    createUserId: msg.sendUserId,
                                    sessionId: msg.sessionId,
                                    localFileMsgId: msg.id
                                }
                                console.log(msg);
                            }else if(msg.msgType !== 'text') {
                                const fileInfo = {
                                    fileId: msg.fileId,
                                    fileName: msg.msgContent,
                                    fileSize: msg.fileSize,
                                    fileType: msg.fileType,
                                    createTime: (new Date()).toLocaleString(),
                                    createUserName: msg.sendUserName,
                                    createUserId: msg.sendUserId,
                                    fileNum: msg.fileSize? 1 : 0
                                }

                                const targetSession = this.sessionList.find(s => s.targetId === msg.sendUserId)

                                if(this.fileStore[targetSession.id]) {
                                    this.fileStore[targetSession.id].push(fileInfo)
                                }else {
                                    this.fileStore[targetSession.id] = [fileInfo]
                                }

                            }
                            this.messageList.push(msg)
                        }

                        this.$nextTick(() => {
                            this.scroll2Bottom()
                        })
                        // receivedData.value = data
                        console.log('Received Message：', e.data);
                    }
                    this.receiveChannel.onclose = () => {
                        const readyState = this.receiveChannel.readyState;
                        console.log(`Receive channel state is: ${readyState}`);
                    }
                    this.receiveChannel.onbufferedamountlow = (channel, e) => {
                        console.log('datachannel buffer amount low', channel, e);
                        this.readSlice(this.offset)
                    }
                }

                this.remotePC.onicecandidate = e => {
                    if(e.candidate) {
                        this.remoteIceCandidate = JSON.stringify(e.candidate)
                        this.immutableAnswerDescription.ice = this.remoteIceCandidate
                        if(this.immutableAnswerDescription.ice && this.immutableAnswerDescription.answer) {
                            this.immutableAnswerDescription.userId = this.userId
                            this.immutableAnswerDescription.userName = this.userName
                            if(copy(JSON.stringify(this.immutableAnswerDescription), { format: 'text/plain' })) {
                                this.$message.success('复制answer成功！请将answer传输回发起连接的目标对象')
                            }else {
                                this.$message.warning('复制answer失败，请重新创建')
                            }
                        }
                    }
                }

                const offerDescription = this.offerDescription
                const { ice, offer } = JSON.parse(offerDescription)

                // 在另一个browser中收到offer后，将其设置为remote描述，并创建answer
                this.remotePC.setRemoteDescription(JSON.parse(offer)).then(() => {
                    return this.remotePC.createAnswer();
                }).then(answer => {
                    this.describeAnswer = JSON.stringify(answer)
                    this.immutableAnswerDescription.answer = this.describeAnswer
                    if(this.immutableAnswerDescription.ice && this.immutableAnswerDescription.answer) {
                        if(copy(JSON.stringify(this.immutableAnswerDescription), { format: 'text/plain' })) {
                            this.$message.success('复制answer成功！请将answer传输回发起连接的目标对象')
                        }else {
                            this.$message.warning('复制answer失败，请重新创建')
                        }
                    }
                    this.remotePC.addIceCandidate(JSON.parse(ice))
                    return this.remotePC.setLocalDescription(answer)
                }).then(() => {
                    console.log('create offer success!');

                    // 将answer 发送回创建offer的browser
                }).catch(err => {
                    console.log('error in setting remote description or create answer: ', err);
                })
            },
            handleConnection() {
                const answerDescription = this.offerDescription
                const { ice, answer } = JSON.parse(answerDescription)

                this.pc.setRemoteDescription(JSON.parse(answer)).then(() => {
                    console.log('connection established!');
                    this.pc.addIceCandidate(JSON.parse(ice))

                    this.dataChannel.send('hello!guys')
                }).catch(error => {
                    console.log('error setting remote description:', error);
                })
            },
            scroll2Bottom() {
                const msgBox = document.getElementsByClassName('im-m-contain__message')[0]
                if(msgBox.scrollHeight > msgBox.clientHeight) {
                    msgBox.scrollTop = msgBox.scrollHeight
                }
            },
            sendMsg(e) {
                const keyCode = e.keyCode || e.which || e.charCode
                const ctrlKey = e.ctrlKey || e.metaKey
                if(ctrlKey && keyCode === 13) {
                    this.msg = this.msg + '\n'
                }else if(keyCode === 13) {
                    e.preventDefault()
                    console.log(this.msg);
                    const msgJSON = {
                        sessionId: this.activeSession.id,
                        sendUserId: this.userId,
                        sendUserName: this.userName,
                        id: setRandomId(8),
                        msgContent: this.msg,
                        msgType: 'text',
                        msgTime: new Date().toLocaleString()
                    }
                    this.messageList.push(msgJSON)
                    this.dataChannel && this.dataChannel.send(JSON.stringify(msgJSON))
                    this.receiveChannel && this.receiveChannel.send(JSON.stringify(msgJSON))
                    this.msg = ''
                    this.$nextTick(() => {
                        this.scroll2Bottom()
                    })
                }
            },
            handleConfirmSelect(files) {
                console.log(files);
                let msgJSON, sessionFile
                if(files.length === 1) {
                    msgJSON = {
                        sendUserId: this.userId,
                        sendUserName: this.userName,
                        id: setRandomId(8),
                        sessionId: this.activeSession.id,
                        msgContent: files[0].fileName + '.' + files[0].fileType,
                        fileId: files[0].id,
                        fileSize: files[0].fileSize,
                        resourceId: files[0].resourceId,
                        fileName: files[0].fileName + '.' + files[0].fileType,
                        msgTime: new Date().toLocaleString()
                    }
                    sessionFile = {
                        fileId: files[0].id,
                        resourceId: files[0].resourceId,
                        fileName: files[0].fileName + '.' + files[0].fileType,
                        fileSize: files[0].fileSize,
                        fileType: files[0].fileType,
                        createTime: (new Date()).toLocaleString(),
                        createUserName: this.userName,
                        createUserId: this.userId,
                        fileNum: 1
                    }
                    if(mediaEnum.includes(files[0].fileType.toUpperCase())) {
                        msgJSON.msgType = 'media'
                    }else {
                        msgJSON.msgType = 'single-file'
                        msgJSON.fileType = files[0].fileType
                    }

                }else {
                    msgJSON = {
                        sessionId: this.activeSession.id,
                        sendUserId: this.userId,
                        sendUserName: this.userName,
                        id: setRandomId(8),
                        msgContent: `${files[0].fileName}等${files.length}个文件`,
                        fileId: files.map(f => f.id),
                        fileName: files.map(f => (f.fileName + '.' + f.fileType)),
                        resourceId: files.map(f => f.resourceId),
                        msgType: 'file',
                        msgTime: new Date().toLocaleString()
                    }
                    sessionFile = {
                        resourceId: files.map(f => f.resourceId),
                        fileId: files.map(f => f.id),
                        fileName: `${files[0].fileName}等${files.length}个文件`,
                        fileSize: '',
                        fileType: '',
                        createTime: (new Date()).toLocaleString(),
                        createUserName: this.userName,
                        createUserId: this.userId,
                        fileNum: files.length
                    }
                }

                this.fileVisible = false
                this.dataChannel && this.dataChannel.send(JSON.stringify(msgJSON))
                this.receiveChannel && this.receiveChannel.send(JSON.stringify(msgJSON))

                this.messageList.push(msgJSON)

                if(this.fileStore[this.activeSession.id]) {
                    this.fileStore[this.activeSession.id].push(sessionFile)
                }else {
                    this.fileStore[this.activeSession.id] = [sessionFile]
                }

                this.$nextTick(() => {
                    this.scroll2Bottom()
                })
            },
            handleLinkDownload(msg) {
                if(msg.msgType === 'file') {
                    this.handleBatchLinkDownload(msg)
                    return
                }else if(msg.msgType === 'single-file') {
                    let a = document.createElement("a");
                    a.href = `${previewURL}/files/download?fileId=${msg.fileId}`
                    if(msg.fileType) {
                        a.download = msg.fileName + '.' + msg.fileType;
                    } else {
                        a.download = msg.folderName + '.zip';
                    }

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }else {
                    // local-file
                    const file = this.fileStore[this.activeSession.id].find(f => f.localFileMsgId === msg.id)
                    const url = URL.createObjectURL(file.file)
                    let a = document.createElement("a");
                    a.href = url
                    a.download = file.fileName

                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }

            },
            handleBatchLinkDownload(msg) {
                const fileIds = msg.fileId.join(',')
                let fileName = getCurrentTime()
                let a = document.createElement("a");
                a.href = `${previewURL}/files/batchDownload?fileIds=${fileIds}`
                a.download = fileName + '.zip';

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            save2Personal(msg) {
                if(msg.msgType === 'file') {
                    const fileSet = msg.fileId.map((f, index) => ({ fileId: f, fileName: msg.fileName[index], resourceId: msg.resourceId[index] }))

                    Promise.allSettled(fileSet.map(f => secondFile({
                        fileName: f.fileName,
                        resourceId: f.resourceId
                    }))).then(res => {
                        this.$message.success('保存成功！')
                    })

                }else {
                    secondFile({
                        fileName: msg.fileName,
                        resourceId: msg.resourceId
                    }).then(_ => {
                        this.$message.success('保存成功')
                    })
                }

            },
            handleUpload(e) {
                console.log(e);
                const file = e.file
                if(!file || file.size === 0) {
                    this.$message.warning('File is empty, please select a non-empty file')
                    return
                }

                const msgJSON = {
                    sessionId: this.activeSession.id,
                    sendUserId: this.userId,
                    sendUserName: this.userName,
                    id: setRandomId(8),
                    msgContent: file.name,
                    msgType: 'local-file',
                    fileType: file.name.split('.').pop(),
                    fileName: file.name,
                    fileSize: file.size,
                    msgTime: new Date().toLocaleString()
                }
                this.messageList.push(msgJSON)
                this.dataChannel && this.dataChannel.send(JSON.stringify(msgJSON))
                this.receiveChannel && this.receiveChannel.send(JSON.stringify(msgJSON))
                this.msg = ''
                this.$nextTick(() => {
                    this.scroll2Bottom()
                })

                this.sendingFile = file

                if(this.fileStore[this.activeSession.id]) {
                    this.fileStore[this.activeSession.id].push({
                        file: this.sendingFile,
                        fileName: this.sendingFile.name,
                        fileSize: this.sendingFile.size,
                        fileType: this.sendingFile.name.split('.').pop(),
                        createTime: (new Date()).toLocaleString(),
                        createUserName: this.userName,
                        createUserId: this.userId,
                        fileNum: 1,
                        localFileMsgId: msgJSON.id
                    })
                }else {
                    this.fileStore[this.activeSession.id] = [{
                        file: this.sendingFile,
                        fileName: this.sendingFile.name,
                        fileSize: this.sendingFile.size,
                        fileType: this.sendingFile.name.split('.').pop(),
                        createTime: (new Date()).toLocaleString(),
                        createUserName: this.userName,
                        createUserId: this.userId,
                        fileNum: 1,
                        localFileMsgId: msgJSON.id
                    }]
                }

                this.timestampStart = (new Date()).getTime();
                this.timestampPrev = this.timestampStart;
                this.statsInterval = setInterval(this.displayStats, 500);
                this.displayStats();

                this.sendFile()

            },
            sendFile() {
                this.fileReader = new FileReader();
                this.fileReader.addEventListener('error', error => console.error('Error reading file:', error));
                this.fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
                this.offset = 0;
                this.fileReader.addEventListener('load', e => {
                    console.log('FileRead.onload ', e);
                    if(!this.receiveChannel) {
                        this.dataChannel.send(e.target.result);
                    }else {
                        this.receiveChannel.send(e.target.result);
                    }

                    this.offset += e.target.result.byteLength;
                    this.sendSize = this.offset;

                    if (this.offset < this.sendingFile.size) {
                        if(!this.receiveChannel) {
                            // 缓冲区趋近于或低于设置的最低阈值会触发 bufferedamountlow 事件：当缓冲区大小 + 即将发送的数据大小 > 16 * 1024  * 1024时会强制关闭datachannel
                            if(!(this.dataChannel.bufferedAmount > ChunkSize)) {
                                this.readSlice(this.offset);
                            }
                        }else {
                            if(!(this.receiveChannel.bufferedAmount > ChunkSize)) {
                                this.readSlice(this.offset);
                            }
                        }

                    }else {
                        this.offset = 0
                        this.sendSize = 0
                        this.fileReader = null

                        this.sendingFile = null

                        if (this.statsInterval) {
                            clearInterval(this.statsInterval);
                            this.statsInterval = null;
                        }
                    }
                });

                this.readSlice(0);
            },
            readSlice(startOffset) {
                console.log('readSlice ', startOffset);
                const sliceFile = this.sendingFile.slice(startOffset, startOffset + ChunkSize);
                this.fileReader.readAsArrayBuffer(sliceFile);
            },
            async displayStats() {
                let stats
                if(this.remotePC && this.remotePC.iceConnectionState === 'connected') {
                    stats = await this.remotePC.getStats();
                }else if(this.pc && this.pc.iceConnectionState === 'connected') {
                    stats = await this.pc.getStats();
                }else {
                    this.$message.warning('点对点连接未建立')
                    return
                }
                let activeCandidatePair;
                stats.forEach(report => {
                    if (report.type === 'transport') {
                        activeCandidatePair = stats.get(report.selectedCandidatePairId);
                    }
                });
                if (activeCandidatePair) {
                    if (this.timestampPrev === activeCandidatePair.timestamp) {
                        return;
                    }
                    // calculate current bitrate
                    const bytesNow = activeCandidatePair.bytesSent;
                    const bitrate = Math.round((bytesNow - this.bytesPrev) * 8 /
                        (activeCandidatePair.timestamp - this.timestampPrev));
                    this.currentBitrate = `${bitrate} kbits/sec`;
                    console.log(this.currentBitrate);
                    this.timestampPrev = activeCandidatePair.timestamp;
                    this.bytesPrev = bytesNow;
                    if (bitrate > this.bitrateMax) {
                        this.bitrateMax = bitrate;
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    * {
        margin: 0;
        box-sizing: border-box;
        padding: 0;
        border: 0;
        outline: 0;
        vertical-align: middle;
    }

    .main-layout__wrapper {
        width: 100%;
        height: 100%;
        overflow: hidden;

        .session-comp-contain {
            height: 100%;
            position: relative;

            .im-contain {
                height: 100%;
                .im-height {
                    min-height: 400px;
                    height: 100%;
                }
                .im-contain__left {
                    width: 295px;
                    .im-left-cov {
                        height: 100%;
                        .im-l-contain {
                            display: flex;
                            flex-direction: column;
                            border-right: 1px solid #f0f0f0;
                            height: 100%;
                            .im-l-contain__action {
                                padding: 0 24px;
                                height: 58px;
                                align-items: center;
                                color: var(--main-color, $main_color);

                                .im-action-bar {
                                    height: 100%;
                                    width: 50%;
                                    align-items: center;
                                    cursor: pointer;
                                }
                            }
                            .im-l-contain__content {
                                height: calc(100% - 58px);
                                background-color: #fff;
                                overflow-y: auto;
                                overflow-x: hidden;

                                .im-list-card {
                                    align-items: center;
                                    width: 100%;
                                    height: 68px;
                                    background-color: #fff;
                                    padding: 0 22px;
                                    cursor: pointer;

                                    .im-list-card__avatar {
                                        margin-right: 8px;

                                        .u-avatar {
                                            display: inline-block;
                                            box-sizing: border-box;
                                            text-align: center;
                                            overflow: hidden;
                                            color: #fff;
                                            background-color: #c0c4cc;
                                            font-size: 14px;
                                        }
                                        .u-avatar--medium {
                                            cursor: pointer;
                                            width: 48px;
                                            height: 48px;
                                            line-height: 48px;
                                            border-radius: 50%;
                                        }
                                    }

                                    .im-list-card__content {
                                        flex: 1;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        min-width: 10px;
                                        height: 100%;

                                        .im-list-card__cov--top {
                                            display: flex;
                                            justify-content: space-between;
                                            align-items: baseline;
                                            width: 100%;

                                            .im-list-card__cov--title {
                                                font-size: 14px;
                                                color: #03081a;
                                                display: block;
                                                overflow: hidden;
                                                text-overflow: ellipsis;
                                                white-space: nowrap;
                                            }
                                            .im-list-card__cov--time {
                                                margin-left: 6px;
                                                font-size: 12px;
                                                white-space: nowrap;
                                                color: #a2abbd;
                                            }
                                        }
                                        .im-list-card__cov--bottom {
                                            margin-top: 5px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: space-between;
                                            .im-list-card__cov--message {
                                                min-height: 14.5px;
                                                font-size: 12px;
                                                color: #a2abbd;
                                                text-align: left;
                                                display: block;
                                                overflow: hidden;
                                                text-overflow: ellipsis;
                                                white-space: nowrap;
                                            }
                                        }
                                    }
                                }
                                .active {
                                    background-color: #f7f9fc;
                                }
                            }
                        }
                    }
                }
                .im-contain__main {
                    width: calc(100% - 339px);
                    background: #eee;

                    .im-m-contain {
                        height: 100%;
                        background-color: #f7f9fc;
                        position: relative;

                        .im-m-contain__header {
                            height: 58px;
                            box-sizing: border-box;
                            border-bottom: 1px solid #f0f0f0;

                            .message-header {
                                width: 100%;
                                height: 100%;
                                font-size: 14px;
                                color: #03081a;
                                font-weight: 600;
                                display: flex;
                                -webkit-box-align: center;
                                align-items: center;
                                padding-left: 24px;
                                .title {
                                    font-size: 16px;
                                    width: 40%;
                                    cursor: pointer;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }
                            }
                        }
                        .im-m-contain__message {
                            height: calc(100% - 232px);
                            overflow-y: auto;
                            overflow-x: hidden;

                            .im-recycle-dom__items {
                                position: relative;
                                margin: 0;
                                padding: 0;

                                .message-item {
                                    /*position: absolute;*/
                                    width: 100%;
                                    display: flex;
                                    flex-direction: column;
                                    margin-top: 18px;
                                    .im-message-system {
                                        width: 100%;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        .im-message-system__content {
                                            max-width: 320px;
                                            line-height: 24px;
                                            font-size: 12px;
                                            color: #818999;
                                            display: flex;
                                            flex-direction: column;
                                            text-align: center;
                                            -webkit-box-orient: vertical;
                                        }
                                    }
                                    .im-message-wrapper {
                                        display: flex;
                                        padding: 0 24px;
                                        margin: 8px 0;
                                        overflow: hidden;
                                        .im-message-avatar {
                                            width: 32px;
                                        }
                                        .im-message-body {
                                            display: flex;
                                            flex-direction: column;
                                            margin: 0 12px;

                                            .im-message-body__name {
                                                font-size: 12px;
                                                color: #a2abbd;
                                                text-align: left;
                                                margin-bottom: 6px;
                                            }
                                            .im-message-location {
                                                display: flex;
                                                position: relative;
                                                .im-message-content {
                                                    border-radius: 9px;
                                                    position: relative;
                                                    color: #000;
                                                    background-color: #fff;
                                                    padding: 12px;
                                                    &.current-user {
                                                        color: #fff;
                                                        background-color: var(--main-color, $main_color);
                                                    }
                                                    &:before {
                                                        left: -6px;
                                                        border-right: 6px solid #fff;
                                                        content: "";
                                                        position: absolute;
                                                        top: 9px;
                                                        border-top: 6px solid transparent;
                                                        border-bottom: 6px solid transparent;
                                                    }
                                                    &.current-user:before {
                                                        left: unset;
                                                        border-right: none;
                                                        right: -6px;
                                                        border-left: 6px solid var(--main-color, $main_color);
                                                    }

                                                    .im-message-text {
                                                        max-width: 264px;
                                                        font-size: 14px;
                                                        line-height: 20px;
                                                        text-align: left;

                                                        .im-message-text__content {
                                                            word-break: break-word;
                                                        }
                                                    }
                                                    .im-message-file {
                                                        max-width: 264px;
                                                        border-radius: 6px;
                                                        overflow: hidden;
                                                        display: flex;
                                                        cursor: pointer;
                                                        .im-message-file__content {
                                                            flex-direction: column;
                                                            margin-left: 9px;
                                                            text-align: left;
                                                            .im-message-file__content-name {
                                                                max-width: 212px;
                                                                color: #030b1a;
                                                                font-size: 14px;
                                                                line-height: 20px;
                                                                max-height: 40px;
                                                                overflow: hidden;
                                                                text-overflow: ellipsis;
                                                                word-break: break-all;
                                                                display: -webkit-box;
                                                                -webkit-box-orient: vertical;
                                                                -webkit-line-clamp: 2;
                                                            }
                                                            .im-message-file__content-size {
                                                                margin-top: 6px;
                                                                font-size: 12px;
                                                                line-height: 12px;
                                                                color: #818999;
                                                            }
                                                        }
                                                    }
                                                    .im-message-media {
                                                        max-width: 330px;
                                                        min-width: 100px;
                                                        border-radius: 6px;
                                                        overflow: hidden;
                                                        position: relative;
                                                        cursor: pointer;
                                                        .im-message-media__content {
                                                            .im-message-media__content-image {
                                                                visibility: visible;
                                                                border: unset;
                                                                position: relative;
                                                                overflow: hidden;display: inline-block;
                                                            }
                                                        }
                                                    }
                                                }
                                                .im-message-tips {
                                                    margin: 0 4px;
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                }
                                                .im-message-operation {

                                                }
                                            }
                                        }
                                        &:hover {
                                            .im-file-operate {
                                                display: flex;
                                            }
                                        }
                                        .im-file-operate {
                                            color: #dcdfe6;
                                            width: 32px;
                                            height: 32px;
                                            margin: 5px;
                                            background-color: #fff;
                                            border-radius: 6px;
                                            align-items: center;
                                            cursor: pointer;
                                            display: none;
                                            margin-top: 20px;
                                        }
                                    }
                                }
                            }

                        }
                        .im-m-contain__inputbox {
                            height: 126px;
                            margin: 24px;
                            background-color: #fff;
                            border-radius: 6px;
                            border: 1px solid #dcdfe6;
                            .im-input-box {
                                padding: 16px 0 0;
                                position: relative;
                                height: 100%;
                                .im-input-box__tools {
                                    padding-left: 24px;
                                    .im-input-box__tools--icon {
                                        display: inline-block;
                                        color: #495366;
                                        font-size: 20px;
                                        margin-right: 8px;
                                        cursor: pointer;
                                    }
                                }
                                .im-input-box__text {
                                    height: 48px;
                                    box-sizing: border-box;
                                    padding: 16px 24px 0;
                                    .im-input-box__textarea {
                                        width: 100%;
                                        height: 100%;
                                        resize: none;
                                        overflow: auto;
                                    }
                                    .im-input-box__tips {
                                        position: absolute;
                                        right: 16px;
                                        bottom: 16px;
                                        color: #a2abbd;
                                        font-size: 14px;
                                    }
                                }
                            }
                        }
                    }
                }
                .im-contain__right {
                    width: 44px;
                    min-height: 400px;
                    height: 100%;

                    .im-r-contain {
                        padding-top: 24px;
                        height: 100%;
                        text-align: center;
                        color: #495366;
                        font-size: 20px;
                        background: linear-gradient(0deg, rgba(162, 171, 189, .2), rgba(162, 171, 189, .2), #fff);

                        .im-r-contain__icon {
                            margin-bottom: 30px;
                            height: unset;
                            line-height: 1;
                            cursor: pointer;
                            &:hover {
                                background-color: rgba(3, 8, 26, .05);
                                padding: 4px;
                                border-radius: 4px;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
