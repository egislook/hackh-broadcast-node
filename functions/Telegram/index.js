const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')

const BOT_TOKEN = '1042446704:AAHmZ2vprLeF_o6p3vGdNjUP2ygigRLxHg0'
const CHAT_ID = '@hackh_broadcast'

module.exports.handler = async event => {
  const { token, body } = extract(event)
  const text = body.text.replace(/\s{2}/gm, '\n')
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}&parse_mode=Markdown`
  
  return GET({ url }).then(success).catch(error => fail({ message: error }))
}