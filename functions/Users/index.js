const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseCheckUser, firebaseCheckAuth } = require('../firebase')
const admin = require('firebase-admin')

module.exports.handler = async event => {
  const { token } = extract(event)

  try {
    const uid = await firebaseCheckAuth(token)

    if (!uid) return fail({ message: 'Unauthorized access' })

    // const user = await firebaseCheckUser(uid)
    // if (!user || (user && user.customClaims && user.customClaims.role))

    let {users} = await admin.auth().listUsers()

    users = users.map(user => {
      const { phoneNumber, uid, customClaims, displayName = 'user', photoUrl } = user
      return {
        uid, phoneNumber, displayName, photoUrl,
        role: customClaims && customClaims.role || 'viewer'
      }
    })

    return success(users)

  } catch (error) {
    const { message, statusCode } = error || {}
    return statusCode ? fail(message, {}, statusCode) : fail(error)
  }
}
