const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseCheckUser, firebaseCheckAuth } = require('../firebase')
const admin = require('firebase-admin')

module.exports.handler = async event => {
  const { body, token } = extract(event)

  try {
    let { displayName, phoneNumber, role = 'user', uid, photoUrl} = body

    let auth = await firebaseCheckAuth(token)
    if (!auth) return fail({ message: 'Unauthorized access' })

    if (uid){
      result = await updateUser({ uid, displayName, role, photoUrl })
      return success(result)
    }

    if (!displayName && !phoneNumber) return fail({ message: 'you need provide displayName and phone.' })

    uid = phoneNumber.replace(/^\+855|^0/, '855')
    // const user = await firebaseCheckUser(uid)
    // if (!user || (user && user.customClaims && user.customClaims.role))
    let object = {
      uid,
      phoneNumber: phoneNumber,
      displayName,
      emailVerified: true,
    }
    if (photoUrl)
      object['photoUrl'] = photoUrl

    result = await admin.auth().createUser(object)

    await admin.auth().setCustomUserClaims(uid, { role })

    result = { uid, phoneNumber, displayName, role, photoUrl: photoUrl || null }

    return success(result)
  } catch (error) {
    const { message, statusCode } = error || {}
    return statusCode ? fail(message, {}, statusCode) : fail(error)
  }
}

const updateUser = async ({ uid, displayName, role, photoUrl }) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role })
    return admin.auth().updateUser(uid, { displayName, photoUrl })
      .then(async function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        const user = await userRecord.toJSON() || {}
        return { uid: uid, displayName, phoneNumber: user.phoneNumber, role: user.customClaims.role, photoUrl }
      })
      .catch(function (error) {
        throw error
      });
  } catch (error) {
    throw error
  }

}
