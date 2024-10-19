const jwt = require("jsonwebtoken");

const getOTP = () => {

    const otp = Math.floor(Math.random() * 10000).toString();
    if (otp.length > 3) {
        return otp;
    } else {
        return getOTP();
    }
};

module.exports = {
    getToken: (content = "") => {
        const getRandomIndex = () => {
            const index = Math.floor(Math.random() * 63);
            if (index < 61) {
                return index;
            } else {
                return getRandomIndex();
            }
        };

        const numberToken = () => {
            const characters =
                "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let stToken = "";
            for (let i = 0; i < 16; i++) {
                if (i % 4 === 0 && i > 1) stToken += "-";
                stToken += characters[getRandomIndex()];
            }
            return stToken;
        };

        return content + numberToken();
    },
    getOTP,
    getAccessToken: (data) => {
        console.log(process.env.JWT_KEY);
        return jwt.sign(data, process.env.JWT_KEY, { expiresIn: "10days" });
    },
    getDateWithTime: (data, time) => {
        let eventDate = new Date(data);
        let times = time.split(" ");
        let hours = parseInt(times[0].split(":")[0]),
            minutes = parseInt(times[0].split(":")[1]);
        if (hours == 12) {
            hours = 0;
        }
        if (times[1] === "pm" || times[1] === "PM") {
            hours = hours + 12;
        }
        eventDate.setHours(hours);
        eventDate.setMinutes(minutes);
        // console.log("time and events1 ", eventDate)
        return eventDate;
    },
    phoneNumberValidation: (num) => {
        var re = /^[0-9]+$/;
        if (re.test(num))
            return false;
        else
            return true;
    },

    getOperator: (num) => {
        const USSDCode = num.slice(0, 3);
        switch (USSDCode) {
            case "019":
            case "014":
                return "Banglalink"

            case "017":
            case "013":
                return "GrameenPhone "
            case "018":
                return "Robi"

            case "016":
                return "Airtel"
            case "015":
                return "Teletalk"
            default:
                return false;
        }
    },

    calculateMatchSummary: (questions = []) => {

        let totalNeededTime = 0;
        let totalScore = 0;
        let totalRightAnswerCount = 0;
        let bonusScore = 0;

        for (let q = 0; q < questions.length; q++) {
            let { isRight, askedAt, answeredAt, score } = questions[q];
            totalScore += score ? score : 0;
            if (answeredAt) {
                totalNeededTime += answeredAt - askedAt;
            } else {
                totalNeededTime += 15000
            }
            if (isRight) {
                totalRightAnswerCount += 1;
            }
        }
        if (totalRightAnswerCount === parseInt(process.env.MATCH_QUESTION_COUNT)) {
            bonusScore = parseInt(process.env.BONUS_SCORE);
        }

        return {
            totalNeededTime,
            score: totalScore + bonusScore,
            totalRightAnswerCount: totalRightAnswerCount,
            bonusScore: bonusScore,
        }
    },
    getWeekNumber: (startDate, givenDate) => {
        // get the difference between the two dates
        const diff = givenDate - startDate;
        // get the number of days between the two dates
        const days = diff / (1000 * 60 * 60 * 24);
        // get the number of weeks between the two dates
        const weeks = days / 7;
        // get the number of weeks between the two dates without the decimal part
        const weeksWithoutDecimal = Math.floor(weeks);

        // get the start date and the end date of the week from the given date and the number of weeks between the two dates without the decimal part
        const startDateOfWeek = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + weeksWithoutDecimal * 7,
            0,
            0,
            0,
            0
        );
        const endDateOfWeek = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + weeksWithoutDecimal * 7 + 6,
            23,
            59,
            59,
            999
        );

        return { weeksWithoutDecimal: weeksWithoutDecimal + 1, startDateOfWeek, endDateOfWeek };
    },
    getWeekDateByWeekNumber: (startDate, numberOfWeek) => {

        let weeksWithoutDecimal = parseInt(numberOfWeek) - 1
        const startDateOfWeek = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + weeksWithoutDecimal * 7,
            0,
            0,
            0,
            0
        );
        const endDateOfWeek = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + weeksWithoutDecimal * 7 + 6,
            23,
            59,
            59,
            999
        );

        return { weeksWithoutDecimal: weeksWithoutDecimal + 1, startDateOfWeek, endDateOfWeek };
    },

};
