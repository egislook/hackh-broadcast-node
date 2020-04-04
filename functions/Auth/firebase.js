const admin = require('firebase-admin')
const certificate = require('../firebase.json')

module.exports.firebaseAuthRegister = firebaseAuthRegister
module.exports.firebaseVerify = firebaseVerify
module.exports.firebaseCheckAuth = firebaseCheckAuth

!admin.apps.length &&
  admin.initializeApp({
    credential: admin.credential.cert(certificate),
    databaseURL: 'https://covid-test-287ac.firebaseio.com'
  })

async function firebaseAuthRegister({ phone, code, uid }) {
  let result = await firebaseCheckUser(uid)
  
  if (!result)
    result = await admin.auth().createUser({
      uid,
      password: code,
      displayName: code,
      email: `${phone}@example.com`,
      emailVerified: true
    })
  else 
    result = await admin
     .auth()
     .updateUser(uid, { password: code, displayName: code })

  if (result) return true

  return false
}

async function firebaseVerify({ phone, code, uid }) {
  const result = await firebaseCheckUser(uid)

  if(!result)
    throw { message: 'user does not exist', statusCode: 401}
    
  const { displayName } = result

  if (displayName !== code)
    throw { message: 'wrong verifaction code.', statusCode: 401 }

  const token =  await admin.auth().createCustomToken(uid, { phone })

  code = Math.floor(100000 + Math.random() * 900000).toString()
  admin
    .auth()
    .updateUser(uid, { password: code, displayName: code })

  return token
}

async function firebaseCheckUser(uid) {
  try {
    return await admin.auth().getUser(uid)
  } catch (error) {
    return false
  }
}

async function firebaseCheckAuth(token){
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    return !!decodedToken.uid
  } catch (error) {
    return false
  }
}