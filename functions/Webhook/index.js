const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')
const { firebaseCheckAuth, firebaseDatabaseGet } = require('../firebase')

module.exports.handler = async event => {
  try {
    const { body } = extract(event)
    console.log(body)
    return success(body)
  } catch (error) {
    console.log(error)
    return fail()
  }
}
