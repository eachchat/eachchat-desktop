


const state = () => ({
    matrixSync: false
})

const actions = {
    syncPrepare({commit, state}) {
        console.log('action syncPrepare');
        commit('syncPrepare');
    }
}

const mutations = {
    syncPrepare(state) {
        console.log('mutations prepared');
        state.matrixSync = true;
    }
}

export default {
    state,
    mutations,
    actions
}