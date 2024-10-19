const NotFoundError = require("../../exceptions/NotFountError");
const ValidationError = require("../../exceptions/ValidationError");
const { phoneNumberValidation, getOperator } = require("../../helpers/utility");

module.exports = {
    ObjExists: (keys, obj, flag = "") => {
        // console.log(keys, obj)
        let message = [];
        for (let i = 0; i < keys.length; i++) {
            if (!obj.hasOwnProperty(keys[i]))
                message.push(
                    `${keys[i]} field is required ${flag && flag}.`
                );
        }

        if (message.length > 0) {
            throw new NotFoundError(message);
        } else {
            return true;
        }
    },

    isEmpty: (body, flag = "") => {
        // data= Object.values(object1) parameter values
        let data = Object.values(body);
        let keys = Object.keys(body);
        let message = [];
        for (let i = 0; i < data.length; i++) {
            if (!data[i]) message.push(`${flag} ${keys[i]} required`);
            else if (data[i].length === 0)
                message.push(
                    `${keys[i]} field is required${flag && flag}`
                );
        }

        if (message.length > 0) {
            throw new NotFoundError(message);
        } else {
            return true;
        }
    },

    phoneValidation: (phone) => {
        if (phone.length !== 11) throw new ValidationError("Invalid Phone Number. The phone number should be exactly 11 digits long.");

        // => validation 2: required to valid number 
        if (phoneNumberValidation(phone)) throw new ValidationError("Please provide a valid number without any characters.")

        // => validation 4: check phone operator
        let operator = getOperator(phone);
        if (!operator) throw new ValidationError("Please provide a valid Bangladesh phone number operator")

        return true

    },

    nameValidation: (name) => {
        let regEx = /^[A-Za-z\s]+$/;
        if (!regEx.test(name)) throw new ValidationError("Invalid Name. Name should contain only characters (letters).")

    },

    emailValidation: (e) => {
        var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
        return (String(e).search(filter) != -1)
    },

    isSameDay: (date1 = new Date("2023-08-10T00:00:00Z"), date2) => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    },

    duplicateUserValidation: (users, userId = null, phone = null, email = null) => {
        if (users.length > 0) {

            const phoneListOfExistUser = [];
            const emailListOfExistUser = [];
            for (let user of users) {
                if (user.phone) {
                    phoneListOfExistUser.push(user.phone)
                }
                if (user.email) {
                    emailListOfExistUser.push(user.email)

                }
            }

            // console.log("phoneListOfExistUser: ", phoneListOfExistUser, emailListOfExistUser)

            let message = '';

            if (phoneListOfExistUser.includes(phone?.toString()) && emailListOfExistUser.includes(email))
                message = `Email and Phone Number Already exist. Please login now`;
            else if (phoneListOfExistUser.includes(phone?.toString()))
                message = `Phone Number already exists.Please login now`
            else {
                message = `Email already exists.Please login now`
            }

            return {
                isInvalid: true,
                message: message,
            }
        }

        return {
            isInvalid: false,
            message: null
        }
    }
}