const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseCheckUser, firebaseCheckAuth } = require('../firebase')
const admin = require('firebase-admin')

module.exports.handler = async event => {
  const { body, token } = extract(event)

  try {
    let { uid } = body

    let auth = await firebaseCheckAuth(token)
    if (!auth) return fail({ message: 'Unauthorized access' })

    uid = uid.replace(/^\+855|^0/, '855')

    return await admin.auth().deleteUser(uid).then(res =>  {return success()}).catch(err => { return fail()})
  } catch (error) {
    const { message, statusCode } = error || {}
    return statusCode ? fail(message, {}, statusCode) : fail(error)
  }
}
