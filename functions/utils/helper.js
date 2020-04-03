const { fetch } = require("fetchier");

module.exports.success = success
module.exports.fail = fail
module.exports.sendSMS = sendSMS
module.exports.parseEvent = parseEvent

let {
  debug,
  MEKONG_SMS_ENDPOINT,
  MEKONG_SMS_USER,
  MEKONG_SMS_HASH,
  MEKONG_SMS_SENDER,
} = require('../../config.js')

function success(body, message) {
  return result(200, body, message);
}

function fail(error, body, code = 500) {
  if (typeof error !== 'string') {
    code = error.statusCode && error.statusCode || code
    body = error.data
    error = error.message && error.message || error.status
  }

  return result(code, body, error);
}

function result(code, body, error) {

  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      statusCode: code,
      version: 'v' + process.env && process.env.npm_package_version,
      message: typeof error === 'object' ? (error.message || error) : error,
      data: body
    })
  }
}