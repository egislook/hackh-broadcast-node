const { fail, success, parseEvent, sendSMS } = require("../utils/helper");
const { firebaseAuthRegister } = require('./firebase')

module.exports.handler = async event => {
  const {body} = parseEvent(event)
  let { phone = "", verifyCode = '' } = body;

  phone = phone.replace(/^\+855|^0/, '')

  if (!!phone && !!verifyCode) {
  } else if (!!phone) {
    verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await firebaseAuthRegister({phone, verifyCode});

    if (result) {
      sendSMS(phone, `verifcation code is: ${verifyCode}`);
      return success(200);
    }
     return fail("bad request", {}, 400);
  }
  return success(200);
}
