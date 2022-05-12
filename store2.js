import axios from "axios";
import i18n from "@/plugins/i18n";
import { API_CONVERSATION_ALL, API_CONVERSATION_MESSAGES } from "@/http/urls";

export const state = {
    conversations: [],
    listSearch: [],
    listConversation: [],
    conversationId: "",
    conversationNameUser: "",
    listMessages: [],
    loading: false,
    loadingListConversation: false,
    loadingListMessages: true,
    selectedUser: 0,
    modalOffer: false,
    archivedMessages: false,
};

export const getters = {
    getConversations: state => state.conversations,
    getListSearch: state => state.listSearch,
    getListConversation: state => state.listConversation,
    getConversationId: state => state.conversationId,
    getConversationNameUser: state => state.conversationNameUser,
    getListMessages: state => state.listMessages,
    loading: state => state.loading,
    loadingListConversation: state => state.loadingListConversation,
    loadingListMessages: state => state.loadingListMessages,
    getSelectedUser: state => state.selectedUser,
    getModalOffer: state => state.modalOffer,
    getArchivedMessages: state => state.archivedMessages,
};

export const mutations = {
    setConversations(state, payload) {
        state.conversations = payload;
    },

    setListSearch(state, payload) {
        const loggedUserId = this.getters["auth/user"].id;
        let arrayFind = [];

        payload.forEach(item => {
            const find = item.participants.filter(user => user.user_id !== loggedUserId);
            arrayFind = find.map(item => {
                const { name, full_name, ...data } = item.user;
                return {
                    conversation_id: item.conversation_id,
                    name: full_name ? full_name : name,
                    ...data
                };
            });
        });
        state.listSearch = arrayFind;
    },

    setListConversation(state, payload) {
        state.listConversation = [];
        let arrayFind = [];

        payload.forEach(item => {
            const userId = item.last_message.user_id;
            const find = item.participants.filter(user => user.user_id === userId);

            arrayFind = find.map(item => {
                const { name, full_name, ...data } = item.user;

                return {
                    conversation_id: item.conversation_id,
                    name: full_name ? full_name : name,
                    ...data
                };
            });
            state.listConversation.push({
                user: arrayFind[0],
                ...item.last_message
            });
        });

        if (state.listConversation[state.selectedUser] !== undefined) state.conversationId = state.listConversation[state.selectedUser].conversation_id;
    },

    toggleConversationId(state, payload) {
        state.conversationId = payload;
    },

    toggleConversationNameUser(state, payload) {
        state.conversationNameUser = payload;
    },

    setListMessages(state, payload) {
        state.listMessages = payload;
    },

    setLoading(state, payload) {
        state.loading = payload;
    },

    setLoadingListConversation(state, payload) {
        state.loadingListConversation = payload;
    },

    setLoadingListMessages(state, payload) {
        state.loadingListMessages = payload;
    },

    toggleSelectedUser(state, payload) {
        state.selectedUser = payload;
    },

    toggleModalOffer(state, payload) {
        state.modalOffer = payload;
    },

    toggleArchivedMessages(state, payload) {
        state.archivedMessages = payload;
    },

    showToast(state, payload) {
        this.commit("toast/addToast", {
            show: true,
            text: i18n.t(payload),
            type: "error"
        });
    },
};

export const actions = {
    async getConversations({ commit }, payload) {
        try {
            if (payload !== undefined) {
                if (!payload.search) commit("setLoadingListConversation", true);

                const url = new URL(`${window.location.protocol}//api.${window.location.hostname}${API_CONVERSATION_ALL}`);
                url.search = new URLSearchParams(payload);

                const { data: { data } } = await axios.get(url);

                if (payload.search) commit("setListSearch", data);
                else {
                    commit("setLoadingListConversation", true);
                    commit("setListConversation", data);
                }
            } else {
                commit("setLoadingListConversation", true);
                const { data: { data } } = await axios.get(API_CONVERSATION_ALL);
                commit("setConversations", data);
                commit("setListSearch", data);
            }

            commit("setLoadingListConversation", false);
        } catch (e) {
            const { status, data: { message } } = e.response;
            commit("setLoadingListConversation", false);

            switch (status) {
                case 401:
                    commit("showToast", message.slice(0, -1));
                    break;
                case 422:
                    commit("showToast", message);
                    break;
            }
        }
    },

    async getListMessages({ commit, state }, payload) {
        commit("setLoadingListMessages", true);
        try {
            if (state.conversationId) {
                const { data: { data } } = await axios.get(API_CONVERSATION_MESSAGES, {
                    params: {
                        conversation_id: state.conversationId,
                        paginate: payload
                    }
                });

                commit("setListMessages", data);
                commit("setLoadingListMessages", false);
            } else {
                commit("setListMessages", []);
                commit("setLoadingListMessages", false);
            }
        } catch (e) {
            commit("setLoadingListMessages", false);

            const { status, data: { message, errors } } = e.response;

            switch (status) {
                case 401:
                    commit("showToast", message.slice(0, -1));
                    break;
                case 422:
                    Object.keys(errors).forEach(itemKey => {
                        errors[itemKey].forEach(item => {
                            commit("showToast", item);
                        });
                    });
                    break;
            }
        }
    }
};
