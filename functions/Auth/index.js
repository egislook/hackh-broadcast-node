const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseVerify } = require('../firebase')

const TWILIO_SID = 'AC71f5f850e396811ba8a6d27f564e2023'
const TWILIO_TOKEN = 'd48139b88445ec97b99b84fdfa4ddcfb'
const TWILIO_FROM = '+19048539184'

module.exports.handler = async event => {
  const { body, query } = extract(event)
  // const test = query.test !== 'false'
  const test = false
  try {
    let { phone = '', code = '' } = body
    if(!phone.includes('+855')) 
      return fail('incorrect phone format. Use following format +855********')
    
    const uid = phone.replace(/^\+855|^0/, '855')

    if(Boolean(phone) && Boolean(!code)){
      code = Boolean(test) ? '111111' : Math.floor(100000 + Math.random() * 900000).toString()
      const result = await firebaseAuthRegister({ phone, code, uid })
      return result 
        ? Boolean(test) ? success({ message: 'OTP delivered successfully' }) : sendCode(phone, code)
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
