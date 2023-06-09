import {mapGetters} from "vuex";

export default {
    data() {
        return {
            layout: ['upload', 'create', 'download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy'],
            layoutNoCreate: ['upload', 'download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy'],
            layoutNoPermission: ['download', 'fav', 'unfav']
        }
    },
    computed: {
        ...mapGetters(['groupMenus']),
        currentGroupMenu() {
            const group = this.groupMenus.find(group => group.id + '' === this.$route.meta.groupId + '')
            if(group) {
                const targetMenu = group.child.find(menu => (menu.id === this.$route.meta.diskId))
                return { ...targetMenu, groupName: group.name }
            }else {
                return undefined
            }
        },
        layoutOfOperation() {
            if(this.currentGroupMenu) {
                if(this.selection.findIndex(file => !file.allowKeep) > -1) {
                    return this.layoutNoPermission
                }else {
                    if(this.currentGroupMenu.diskAuth === '2') {
                        return ['upload', 'create', 'download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                    }else {
                        return ['download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                    }
                }
            }else {
                return []
            }

        },
        layoutOfNoCreateOperation() {
            if(this.currentGroupMenu) {
                if(this.selection.findIndex(file => !file.allowKeep) > -1) {
                    return this.layoutNoPermission
                }else {
                    if(this.currentGroupMenu.diskAuth === '2') {
                        return ['upload', 'download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                    }else {
                        return ['download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                    }
                }
            }else {
                return []
            }
        }
    }
}
