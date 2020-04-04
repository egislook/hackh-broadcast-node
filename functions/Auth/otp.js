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
        await sendSMS({phone, verifyCode});
        return success();
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

async function sendSMS(params) {
  const accountSid = "ACe0795b2cb3bff67717e01c6a94b12d68";
  const authToken = "11fa748e9e449d37f8438d22fba4b9d1";
  const client = require("twilio")(accountSid, authToken);
  const { verifyCode, phone } = params

  try {
     const result = await client.messages.create({
       body: `verification code is: ${verifyCode}`,
       from: "+12029157522",
       to: phone,
     });
  } catch (error) {
    console.log("error", error);
    throw error
  }
}
