const { fail, success, extract } = require('../utils')
const { firebaseAuthRegister, firebaseCheckUser, firebaseCheckAuth } = require('../firebase')
const admin = require('firebase-admin')

module.exports.handler = async event => {
  const { body, token } = extract(event)

  try {
    let { displayName, phone, role = 'user', uid, photoUrl} = body

    let auth = firebaseCheckAuth(token)
    if (!auth) return fail({ message: 'Unauthorized access' })
    
    if (!displayName && !phone) return fail({ message: 'you need provide displayName and phone.' })
    
    // if (uid){
    //   result = await updateUser({ uid, displayName})
    //   console.log(result)
    //   return success(result)
    // }
    uid = phone.replace(/^\+855|^0/, '855')
    // const user = await firebaseCheckUser(uid)
    // if (!user || (user && user.customClaims && user.customClaims.role))
    let object = {
      uid,
      phoneNumber: phone,
      displayName,
      emailVerified: true,
    }
    if (photoUrl)
      object['photoUrl'] = photoUrl

    result = await admin.auth().createUser(object)

    await admin.auth().setCustomUserClaims(uid, { role })

    result = { uid, phoneNumber: phone, displayName, role }

    return success(result)
  } catch (error) {
    const { message, statusCode } = error || {}
    return statusCode ? fail(message, {}, statusCode) : fail(error)
  }
}

const updateUser = async ({ uid, displayName}) => {
  try {
    admin.auth().updateUser(uid, { displayName })
      .then(async function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        const user = await userRecord.toJSON() || {}
        console.log(userRecord.toJSON())
        return { uid: uid, displayName, phoneNumber: user.phoneNumber, role: user.customClaims.role }
      })
      .catch(function (error) {
        throw error
      });
  } catch (error) {
    throw error
  }

}

