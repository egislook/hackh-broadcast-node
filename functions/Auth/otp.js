const { fail, success, extract } = require("../utils");
const { firebaseAuthRegister, firebaseVerify } = require("./firebase");

module.exports.handler = async event => {
  const { body } = extract(event);
  let { phone = "", verifyCode = '' } = body;

  const uid = phone.replace(/^\+855|^0/, '')

  try {
    if (!!phone && !!verifyCode) {
      const token = await firebaseVerify({ phone, verifyCode, uid });
      return success(token)
    } else if (!!phone) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const result = await firebaseAuthRegister({ phone, verifyCode, uid });

      if (result) {
        console.log(verifyCode);
        // sendSMS(phone, `verifcation code is: ${verifyCode}`);
        return success({verifyCode});
      }
      return fail("bad request", {}, 400);
    }
    return success(200);
  } catch (error) {
    const { message, statusCode } = error || {};
    if(statusCode)
      return fail(message, {}, statusCode);

    return fail(error);
  }
}
