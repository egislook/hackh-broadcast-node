const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')
const { firebaseCheckAuth, firebaseDatabaseMessage } = require('../Auth/firebase')

const BOT_TOKEN = '1042446704:AAHmZ2vprLeF_o6p3vGdNjUP2ygigRLxHg0'
const CHAT_ID = '@hackh_broadcast'

module.exports.handler = async event => {
  const { token, body, query } = extract(event)
  const messageId = query.messageId || body.messageId

  if(token){
    const allow = await firebaseCheckAuth(token)
    if(!allow) return fail({ message: 'unauthorized access'})
  }

  let text = (query.text || body.text || 'Test Message').replace(/\s{2}/gm, '\n')
  
  if(!!messageId){
    text = await firebaseDatabaseMessage(['telegram', messageId])
    if(!text) return fail({ message: 'Incorrect message id' })
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURI(text)}&parse_mode=Markdown`

  return GET({ url }).then(success).catch(error => fail({ message: error }))
}
