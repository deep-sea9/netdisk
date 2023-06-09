const getters = {
    token: state => state.user.token,
    userId: state => state.user.userId,
    userAvatar: state => state.user.userAvatar,
    userName: state => state.user.userName,
    userInfo: state => state.user.userInfo,
    spaceInfo: state => state.user.spaceInfo,
    fileMax: state => state.system.fileMax,
    perSpace: state => state.system.perSpace,
    groupSpace: state => state.system.groupSpace,
    recycleDay: state => state.system.recycleDay,
    sysName: state => state.system.sysName,
    getProcessEngine: (state) => state.bpmn.editor.processEngine,
    getModeler: (state) => state.bpmn.bpmn._modeler,
}
export default getters
