import axios from "axios";
import { mapActions, mapGetters } from "vuex";
import base64 from "@/mixins/base64";
import searchInput from "@/mixins/Chat/searchInput";
import { API_CONVERSATION_MESSAGE } from "@/http/urls";
import { WS_CONVERSATION_MESSAGE } from "@/http/websockets";

export default {
    mixins: [
        base64,
        searchInput
    ],

    computed: {
        ...mapGetters({
            listConversation: "chat/getListConversation",
            loadingListConversation: "chat/loadingListConversation",
            loadingListMessages: "chat/loadingListMessages",
            listMessages: "chat/getListMessages",
            conversationId: "chat/getConversationId",
        }),

        selectedUser: {
            get() {
                return this.$store.getters["chat/getSelectedUser"];
            },

            set(v) {
                this.$store.commit("chat/toggleSelectedUser", v);
            }
        },
    },

    data() {
        return {
            vueCustomScrollbarSettingsList: {
                suppressScrollX: true
            },
            paginateUsers: 10,
            paginateMessages: 10,
            isFirstVisit: true,
        };
    },

    watch: {
        search(val) {
            if (val) {
                this.getConversations({
                    search: val
                });
            }
        },

        selectConversation(nv) {
            if (nv) {
                this.$store.commit("chat/toggleConversationId", nv.conversation_id);
                const index = this.listConversation.findIndex(item => item.conversation_id === nv.conversation_id);
                this.$store.commit("chat/toggleSelectedUser", index);
                this.paginateMessages = 10;
                this.getListMessages(this.paginateMessages);
            }
        },

        listConversation(nv) {
            if (!nv.length) this.$store.commit("chat/toggleConversationId", "");
            this.getListMessages(this.paginateMessages);
        },

        conversationId(nv) {
            if (nv) {
                const conversation = this.listConversation[this.selectedUser];
                this.$store.commit("chat/toggleConversationNameUser", conversation.user.name);

                this.isFirstVisit = true;
                this.$nextTick(() => {
                    this.$echo.private(`conversation.${this.conversationId}`).listen(WS_CONVERSATION_MESSAGE, (payload) => {
                        const { name, full_name, ...data } = payload.user;

                        const replaceUser = {
                            name: full_name ? full_name : name,
                            ...data
                        };

                        const index = this.listConversation.findIndex(n => parseInt(n.conversation_id) === parseInt(this.conversationId));

                        const newPayload = {
                            user: replaceUser,
                            ...payload
                        };

                        this.listConversation[index] = newPayload;
                        this.listMessages.push(newPayload);

                        this.chatScrollBottom();
                    });
                });
            }
        },

        listMessages() {
            this.$nextTick(() => {
                if (this.isFirstVisit) this.chatScrollBottom();
                else {
                    const cScroll = document.querySelector(".c-scroll");
                    cScroll.scrollTop = 200;
                }
            });
        }
    },

    mounted() {
        this.getConversations({
            paginate: this.paginateUsers
        });
    },

    methods: {
        changeConversation(item) {
            this.$store.commit("chat/toggleConversationId", this.listConversation[item].conversation_id);
            this.paginateMessages = 10;
            this.getListMessages(this.paginateMessages);
        },

        async sendMessage(textMess, fileInput) {
            if (this.conversationId === "" || this.conversationId === undefined || this.conversationId === " " || this.conversationId === null) {
                this.showToast(this.$t("You need to select a recipient to send a message"), "error");
            } else {
                const config = {
                    headers: {
                        "content-type": "multipart/form-data",
                    }
                };
                let sendData = new FormData();
                sendData.append("conversation_id", this.conversationId);
                sendData.append("message", textMess);
                if (fileInput) sendData.append("file", fileInput);

                if (textMess.length) {
                    try {
                        const { data: { data } } = await axios.post(API_CONVERSATION_MESSAGE, sendData, config);

                        if (data) {
                            this.$refs.chatText.clearEmit();
                            this.chatScrollBottom();
                        }
                    } catch (e) {
                        const { status, data: { errors } } = e.response;

                        switch (status) {
                            case 422:
                                Object.keys(errors).forEach(itemKey => {
                                    errors[itemKey].forEach(item => {
                                        this.showToast(item, "error");
                                    });
                                });
                                break;
                            case 500:
                                this.showToast(this.$t("An unexpected error has occurred"), "error");
                                break;
                            default:
                                this.showToast(this.$t("An unexpected error has occurred"), "error");
                        }
                    }
                }
            }
        },

        getMoreMess() {
            const cScroll = document.querySelector(".c-scroll");
            this.isFirstVisit = false;
            if (cScroll.scrollTop < 150) {
                if (this.listMessages.length === this.paginateMessages) {
                    this.paginateMessages += 10;
                    this.getListMessages(this.paginateMessages);
                }
            }
        },

        chatScrollBottom(){
            const cScroll = document.querySelector(".c-scroll");

            if (cScroll !== null) {
                cScroll.scrollTop = cScroll.scrollHeight;
            }
        },

        ...mapActions({
            getConversations: "chat/getConversations",
            getListMessages: "chat/getListMessages",
        }),

        showToast(message, type, textColor, closeColor) {
            this.$store.commit("toast/addToast", {
                show: true,
                text: message,
                type: type,
                textColor: textColor,
                closeColor: closeColor,
            });
        }
    }
};
