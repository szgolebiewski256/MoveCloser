import axios from "axios";
import VueCookies from "vue-cookies";
import router from "../../router";
import { API_LOGOUT, API_USER } from "@/http/urls";

export const state = {
    token: VueCookies.get("token"),
    expiresIn: VueCookies.get("expiresIn"),
    user: VueCookies.get("user") || null,
    userAvatar: null,
};

export const getters = {
    token: state => state.token,
    expiresIn: state => state.expiresIn,
    user: state => state.user,
    userAvatar: state =>  state.userAvatar,
    isLogged: state => state.user !== null,
    roles: state => state.user !== null ? state.user.roles : [],
    isUser: state => !!(state.user !== null && state.user.roles.find(n => n.name === "User") && state.user.roles.length === 1),
    isProvider: state => !!(state.user !== null && state.user.roles.find(n => n.name === "Provider")),
    isAdmin: state => !!(state.user !== null && state.user.roles.find(n => n.name === "Admin")),
    isVerifiedProvider: state => !!(state.user !== null && state.user.roles.find(n => n.name === "Provider") && state.user.is_verified_provider),
    isCompany: state => !!(state.user !== null && state.user.company),
};

export const mutations = {
    saveToken(state, { token, expires_in }) {
        state.token = token;
        state.expiresIn = expires_in;

        VueCookies.set("token", token, `${expires_in}s`);
        VueCookies.set("expiresIn", expires_in, `${expires_in}s`);
    },

    fetchUserSuccess(state, { user }) {
        state.user = user;
        state.userAvatar = user.avatar;

        const { avatar, ...userCookie } = user;
        VueCookies.set("user", JSON.stringify(userCookie), `${this.getters["auth/expiresIn"]}s`);
    },

    fetchUserFailure() {
        this.commit("auth/clearAuth");
    },

    logout() {
        this.commit("auth/clearAuth");
        router.push({ name: "Login" }).catch(() => {});

        setTimeout(() => {
            window.location.reload();
        }, 100);
    },

    clearAuth(state) {
        state.token = null;
        state.expiresIn = null;
        state.user = null;

        VueCookies.remove("token");
        VueCookies.remove("expiresIn");
        VueCookies.remove("user");
    }
};

export const actions = {
    saveToken({ commit, dispatch }, payload) {
        commit("saveToken", payload);
    },

    async fetchUser({ commit }) {
        try {
            const { data } = await axios.get(API_USER);
            commit("fetchUserSuccess", { user: data.data.user });
        } catch (e) {
            commit("fetchUserFailure");
        }
    },

    async logout({ commit }) {
        try {
            await axios.post(API_LOGOUT);
        } catch (e) {}

        commit("logout");
    }
};
