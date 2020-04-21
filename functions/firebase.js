const admin = require('firebase-admin')
const certificate = require('./firebase.json')

const FIREBASE_DB = 'https://hackh-broadcast.firebaseio.com'

module.exports.firebaseAuthRegister = firebaseAuthRegister
module.exports.firebaseVerify = firebaseVerify
module.exports.firebaseCheckAuth = firebaseCheckAuth
module.exports.firebaseDatabaseGet = firebaseDatabaseGet
module.exports.firebaseDatabaseUpdate = firebaseDatabaseUpdate
module.exports.firebaseDatabaseSet = firebaseDatabaseSet

!admin.apps.length &&
  admin.initializeApp({
    credential: admin.credential.cert(certificate),
    databaseURL: FIREBASE_DB
  })

async function firebaseAuthRegister({ phoneNumber, code, uid }) {
  
  try {
    let result = await firebaseCheckUser(uid)
    if (!result) {
      result = await admin.auth().createUser({
        uid,
        phoneNumber,
        // email: `${phone}@example.com`,
        emailVerified: true,
      })
      await admin.auth().setCustomUserClaims(uid, { verifyCode: code, invalidCount: 0 })
    }else {
      // const { photoURL } = result

      // let invalidCount = photoURL && Number(photoURL.replace(/http:\/\/|\.com/ig, '')) || 0

      // if (invalidCount > 5)
      //   throw { message: 'attemp exceeded limitation', statusCode: 401 }

      await admin.auth().setCustomUserClaims(uid, { verifyCode: code, invalidCount: 0 })
    }
    return true
  } catch (error) {
    
    return false
  }

}

async function firebaseVerify({ phoneNumber, code, uid }) {
  const result = await firebaseCheckUser(uid)
  if(!result)
    throw { message: 'user does not exist', statusCode: 401}
    
  const { customClaims: { verifyCode, invalidCount = 0} } = result

  if (invalidCount > 5) 
    throw { message: 'attemp exceeded limitation', statusCode: 401 }

  if (verifyCode !== code){
    await admin.auth().setCustomUserClaims(uid, { verifyCode, invalidCount: invalidCount + 1})
    throw { message: 'wrong verifaction code.', statusCode: 401 }
  }

  const token = await admin.auth().createCustomToken(uid)
  code = Math.floor(100000 + Math.random() * 900000).toString()
  await admin.auth().setCustomUserClaims(uid, { phoneNumber, role: 'admin', invalidCount })
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
    const decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken.uid
  } catch (error) {
    return false
  }
}

async function firebaseDatabaseGet(refs = []){
  return new Promise((resolve, reject) => admin.database().ref(refs.join('/')).once('value', snap => {
    const value = snap && snap.val && snap.val()
    return resolve(value)
  }))
}

async function firebaseDatabaseUpdate(refs = [], data){
  return new Promise((resolve, reject) => admin.database().ref(refs.join('/')).update(data, err => {
    console.log(err)
    return resolve(err ? null : data)
  }))
}

async function firebaseDatabaseSet(refs = [], data) {
  return new Promise((resolve, reject) => admin.database().ref(refs.join('/')).set(data, err => {
    console.log(err)
    return resolve(err ? null : data)
  }))
}