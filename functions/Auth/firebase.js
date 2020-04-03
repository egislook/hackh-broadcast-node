var admin = require("firebase-admin");
var serviceAccount = require("../utils/covid-test.json");

module.exports.firebaseAuthRegister = firebaseAuthRegister;

!admin.apps.length &&
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://covid-test-287ac.firebaseio.com"
  });;

async function firebaseAuthRegister({ phone, verifyCode}) {
  // let result = await firebaseCheckUser(phone);
  // console.log(result);
  // if (!result)
  //   result = await admin
  //     .auth()
  //     .createUser({ uid: phone, emailVerified: true, password });

  const fireAuthToken = await admin
    .auth()
    .createCustomToken(phone, { verifyCode });

    console.log(fireAuthToken);

  return true;
}

async function firebaseCheckUser(uid){
  try {
    return await admin.auth().getUser(uid)
  } catch (error) {
    return  
  }
}