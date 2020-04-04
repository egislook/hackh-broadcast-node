const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseVerify } = require('./firebase')

const TWILIO_SID = 'AC9af09c4f76d8c7762ebee7680ead372f' || 'ACe0795b2cb3bff67717e01c6a94b12d68'
const TWILIO_TOKEN = '3f3ea60fa7b8eb601ec12c5eb034104d' || '11fa748e9e449d37f8438d22fba4b9d1'
const TWILIO_FROM = '+18506331535' || '+12029157522'

module.exports.handler = async event => {
  const { body } = extract(event)

  try {
    let { phone = '', code = '' } = body
    if(!phone.includes('+855')) 
      return fail('incorrect phone format. Use following format +855********')
    
    const uid = phone.replace(/^\+855|^0/, '855')

    if(Boolean(phone) && Boolean(!code)){
      code = Math.floor(100000 + Math.random() * 900000).toString()
      const result = await firebaseAuthRegister({ phone, code, uid })
      return result ? sendCode(phone, code).then(() => success({ message: 'OTP delivered successfully' })).catch(fail) : fail('bad request', {}, 400)
    }

    if (Boolean(phone) && Boolean(code))
      return firebaseVerify({ phone, code, uid })
        .then(customToken => success({ customToken }))
        .catch(fail)

    return fail()
  } catch (error) {
    const { message, statusCode } = error || {}
    return statusCode ? fail(message, {}, statusCode) : fail(error)
  }
}

function sendCode(to, code) {
  const client = require('twilio')(TWILIO_SID, TWILIO_TOKEN)
  return client.messages.create({
     body: `HACKH Broadcasting verification code is: ${code}`,
     from: TWILIO_FROM,
     to,
  })
}
