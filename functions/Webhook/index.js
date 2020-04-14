const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')
const { firebaseCheckAuth, firebaseDatabaseGet } = require('../firebase')

module.exports.handler = async event => {
  try {
    console.log(event)
    // const { token, body, query } = extract(event)
    return success()
  } catch (error) {
    console.log(error)
    return fail()
  }
}
