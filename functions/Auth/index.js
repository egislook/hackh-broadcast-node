const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseVerify } = require('./firebase')

const TWILIO_SID = 'AC9af09c4f76d8c7762ebee7680ead372f' || 'ACe0795b2cb3bff67717e01c6a94b12d68'
const TWILIO_TOKEN = 'f0b3a3922d29a53717e5f0cd8cd5587f' || '11fa748e9e449d37f8438d22fba4b9d1'
const TWILIO_FROM = '+18506331535' || '+12029157522'

module.exports.handler = async event => {
  const { body, query: { test = true } } = extract(event)
  try {
    let { phone = '', code = '' } = body
    if(!phone.includes('+855')) 
      return fail('incorrect phone format. Use following format +855********')
    
    const uid = phone.replace(/^\+855|^0/, '855')

    if(Boolean(phone) && Boolean(!code)){
      code = !!test ? '111111' : Math.floor(100000 + Math.random() * 900000).toString()
      const result = await firebaseAuthRegister({ phone, code, uid })
      return result 
        ? !!test ? success({ message: 'OTP delivered successfully' }) : sendCode(phone, code)
          .then(() => success({ message: 'OTP delivered successfully' }))
          .catch(error => (console.log(error) || fail(error))) 
        : fail('bad request', {}, 400)
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
