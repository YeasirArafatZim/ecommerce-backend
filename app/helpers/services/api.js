const { default: axios } = require("axios");


module.exports = {
  otpSender: async (phone, otp) => {
    try {
      let text = `${otp} is your One-Time Password (OTP) for campaign. The OTP expires in ${process.env.OTP_EXPIRED_AT} ${process.env.OTP_EXPIRED_AT == 1 ? "minute" : "minutes"}.`


      let url =  `https://smsplus.sslwireless.com/api/v3/send-sms?api_token=${process.env.SMS_APIKEY}&sid=${process.env.SMS_SENDERID}&sms=${text}&msisdn=88${phone}&csms_id=${otp}`
      console.log("------------otp---------", url)

      const response = await axios.get(url)

      console.log(response.data, "--------------res----------------")

      return response?.data?.Data[0] ? response?.data?.Data[0] : null;
    } catch (error) {

      console.log(error, "====================error===========");

      return null;
    }
  },
  captchaVerify: async (token) => {
    try {


      let url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${token}`

      const response = await axios.post(url)

      console.log(response.data, "------------CAPTCHA_SECRET --res----------------")

      return response.data.success;
    } catch (error) {

      console.log(error, "=================CAPTCHA_SECRET===error===========");

      return null;
    }
  },
}