<template>
    <div
        class="payment-p24"
    >
        <div
            v-for="(payment, index) in paymentsArray"
            :key="index"
            class="payment-item"
            @click="$store.commit('microPayment/toggleP24Token', payment.id)"
        >
            <div
                :class="['payment-item-border', p24Token === payment.id ? 'active' : '' ]"
            >
                <img
                    :src="payment.img"
                >
            </div>

            <p>
                {{ payment.name }}
            </p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "P24",

    props: {
        paymentsArray: {
            type: Array,
            default: () => [],
        },
    },

    computed: {
        ...mapGetters({
            p24Token: "microPayment/getP24Token",
        }),
    },
};
</script>
