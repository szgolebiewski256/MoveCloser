<template>
    <div class="chat-panel__body__text">
        <v-textarea
            v-model="textMess"
            :label="`${$t('Write a message')}...`"
            outlined
            :single-line="true"
            no-resize
            class="chat-value"
            rows="2"
            maxlength="1000"
            @keydown.enter.exact.prevent
            @keyup.enter.exact="sendMessage"
        >
            <template #append>
                <div class="chat-btn">
                    <VueChatEmoji
                        icon="mdi mdi-emoticon-happy-outline"
                        class="emoji-custom m2-1 mr-md-2"
                        :searchLabel="$t('Search')"
                        @click="selectedEmoji"
                    />
                    <label for="attachmentLogged" class="attachment cursor-pointer">
                        <v-icon>
                            attach_file
                        </v-icon>
                    </label>
                    <input
                        id="attachmentLogged"
                        type="file"
                        class="d-none"
                        accept=".pdf,.jpg,.jpeg,.png"
                        @change="getFiles($event)"
                    >
                    <v-btn
                        icon
                        type="button"
                        class="v-btn__dark send ml-1 ml-md-2"
                        @click="sendMessage"
                    >
                        <v-icon>
                            send
                        </v-icon>
                    </v-btn>
                </div>
            </template>
        </v-textarea>
    </div>
</template>

<script>
import { VueChatEmoji } from "vue-chat-emoji";

export default {
    name: "ChatText",

    components: {
        VueChatEmoji
    },

    data(){
        return {
            textMess: "",
            fileInput: ""
        };
    },

    methods: {
        clearEmit() {
            this.textMess = "";
            this.fileInput = "";
        },

        selectedEmoji(args) {
            const last = this.textMess.slice(-1);

            last === " " ? this.textMess += args.emoji : this.textMess += " " + args.emoji + " ";
        },

        getFiles(e){
            this.fileInput = e.target.files[0];
            this.$store.commit("toast/addToast", {
                show: true,
                text: this.$t("Attachment added"),
                type: "success",
            });
        },

        sendMessage() {
            this.$emit("emit-send-message", this.textMess, this.fileInput);
        }
    }
};
</script>
