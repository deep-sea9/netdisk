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
        ...mapGetters(['publicMenus']),
        currentPublicMenu() {
            return this.publicMenus.find(menu => menu.id === this.$route.meta.diskId)
        },
        layoutOfOperation() {
            if(this.selection.findIndex(file => !file.allowKeep) > -1) {
                return this.layoutNoPermission
            }else {
                if(this.currentPublicMenu.diskAuth === '2') {
                    return ['upload', 'create', 'download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                }else {
                    return ['download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                }
            }
        },
        layoutOfNoCreateOperation() {
            if(this.selection.findIndex(file => !file.allowKeep) > -1) {
                return this.layoutNoPermission
            }else {
                if(this.currentPublicMenu.diskAuth === '2') {
                    return ['upload', 'download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                }else {
                    return ['download', 'fav', 'unfav', 'rename', 'delete', 'move', 'copy']
                }
            }
        }
    }
}
