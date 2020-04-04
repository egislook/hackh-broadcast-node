var admin = require("firebase-admin");
var serviceAccount = require("../covid-test.json");

module.exports.firebaseAuthRegister = firebaseAuthRegister;
module.exports.firebaseVerify = firebaseVerify;
module.exports.firebaseCheckAuth = firebaseCheckAuth;

!admin.apps.length &&
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://covid-test-287ac.firebaseio.com"
  });;

async function firebaseAuthRegister({ phone, verifyCode, uid }) {
  let result = await firebaseCheckUser(uid);
  
  if (!result)
    result = await admin.auth().createUser({
      uid,
      password: verifyCode,
      displayName: verifyCode,
      email: `${phone}@example.com`,
      emailVerified: true
    });
  else result = await admin
         .auth()
         .updateUser(uid, { password: verifyCode, displayName: verifyCode });

  if (result) return true;

  return false;
}

async function firebaseVerify({ phone, verifyCode, uid }) {
  const result = await firebaseCheckUser(uid);

  if(!result)
    throw { message: 'user does not exist', statusCode: 401}
    
  const { displayName } = result;

  if (displayName !== verifyCode)
    throw { message: "wrong verifaction code.", statusCode: 401 };

  const token =  await admin.auth().createCustomToken(uid, { phone });

  verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  admin
    .auth()
    .updateUser(uid, { password: verifyCode, displayName: verifyCode });

  return token
}

async function firebaseCheckUser(uid) {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    return;
  }
}

async function firebaseCheckAuth(token){
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    if (decodedToken.uid) 
      return true;
    return false
  } catch (error) {
    return false;
  }
}