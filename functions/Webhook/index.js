const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')
const { firebaseDatabaseSet } = require('../firebase')

module.exports.handler = async event => {
  try {
    const { body } = extract(event)
    const { poll } = body

    if (poll)
      await firebaseDatabaseSet(['statistics', poll.id], poll) 
    return success(body)
  } catch (error) {
    console.log(error)
    return fail()
  }
}
