import moment from "moment";
import IBAN from "iban";

const nipValidation = (nip) => {
    const nipWithoutDashes = nip.replace(/-/g, "");
    const reg = /^[0-9]{10}$/;
    if (reg.test(nipWithoutDashes) === false) {
        return false;
    } else {
        const digits = ("" + nipWithoutDashes).split("");
        const checksum =
            (6 * parseInt(digits[0]) +
                5 * parseInt(digits[1]) +
                7 * parseInt(digits[2]) +
                2 * parseInt(digits[3]) +
                3 * parseInt(digits[4]) +
                4 * parseInt(digits[5]) +
                5 * parseInt(digits[6]) +
                6 * parseInt(digits[7]) +
                7 * parseInt(digits[8])) %
            11;

        return parseInt(digits[9]) === checksum;
    }
};

export default {
    data() {
        return {
            apiErrors: {},
            sendDataErrors: {},
            ibanIsValid: null
        };
    },

    methods: {
        ruleRequired(v) {
            return !!v || this.$t("This field is required");
        },

        ruleEmail(v) {
            return /^([-a-zA-Z0-9'_+\/]+([-'_+\/][-a-zA-Z0-9'_+\/]+|\.[a-zA-Z0-9'+\/]+)*)@(([a-zA-Z0-9]+((\.|[-]{1,2})[a-zA-Z0-9]+)*)\.[a-zA-Z]{2,6})$/.test(v) || this.$t("The e-mail address provided is invalid");
        },

        rulePassword(v) {
            return (v && v.length >= 8) || this.$t("The field must be at least 8 characters long");
        },

        ruleMin(v, m) {
            return (v.length >= m) || this.$t("The field must be at least {min} characters long", { min: m });
        },

        ruleMax(v, m) {
            return (v.length <= m) || this.$t("The field must have a maximum of {max} characters", { max: m });
        },

        ruleSameAs(v, v2, t) {
            return v === v2 || t;
        },

        ruleNumber(v) {
            if (!v.trim()) return true;
            if (!isNaN(parseFloat(v))) return true;
            return this.$t("Enter only a number");
        },

        ruleNip(v) {
            return nipValidation(v) || this.$t("Incorrect tax ID number");
        },

        ruleApi(v, n) {
            if (Object.keys(this.apiErrors).length) {
                let valuesData = Object.values(this.sendDataErrors);

                if (this.sendDataErrors.company !== undefined) valuesData = [...valuesData, ...Object.values(this.sendDataErrors.company)];

                if (n) {
                    if (!valuesData.includes(v)) return true;

                    if (this.apiErrors[n] !== undefined) return this.apiErrors[n].length === 1 ? this.apiErrors[n][0] : this.apiErrors[n].join(" ");
                }
            }

            return true;
        },

        ruleApiOauth(v, e, m) {
            if (parseInt(e)) {
                return !!v || m;
            }

            return true;
        },

        ruleMinPrice(v, price) {
            return (parseInt(v) > price) || this.$t("The price is too low");
        },

        ruleMaxPrice(v, price) {
            return (parseInt(v) <= price) || this.$t("The price is too high");
        },

        ruleCheckHours(v, v2) {
            if (v || v2) {
                let startTime = v.split(":");
                startTime = parseInt(startTime[0]);
                let endTime = v2.split(":");
                endTime = parseInt(endTime[0]);

                if (startTime > endTime) {
                    return this.$t("The start time cannot be greater than the end time");
                }

                if (startTime === endTime) {
                    return this.$t("The start time cannot be the same as the end time");
                }
            }

            return true;
        },

        ruleCheckTime(v, d) {
            const locale = this.$store.getters["schedule/getLocale"];
            const chooseDate = this.$store.getters["schedule/getChooseDate"];
            const nowDate = moment().locale(locale).format("YYYY-MM-DD");
            const nowTime = moment().locale(locale).format("HH:mm").split(":")[0];
            const dateTime = moment(d + " " + v).locale(locale).format("HH:mm").split(":")[0];

            if (v) {
                if (moment(nowDate).isSame(chooseDate) && (parseInt(nowTime) >= parseInt(dateTime))) {
                    return this.$t("The time of today must be later than the current one");
                }
            }

            return true;
        },

        ibanValidation(e) {
            if (e !== null) {
                if (IBAN.isValid(e)) {
                    this.ibanIsValid = true;
                    return true;
                } else {
                    this.ibanIsValid = false;
                    return this.$t("Wrong IBAN");
                }
            }

            return true;
        }
    }
};
