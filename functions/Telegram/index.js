const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')
const { firebaseCheckAuth, firebaseDatabaseGet, firebaseDatabaseUpdate } = require('../firebase')

const BOT_TOKEN = '1042446704:AAHmZ2vprLeF_o6p3vGdNjUP2ygigRLxHg0'
const CHAT_ID = '@hackh_broadcast'

module.exports.handler = async event => {
  const { token, body, query } = extract(event)
  const messageId = query.messageId || body.messageId

  if(token){
    const allow = await firebaseCheckAuth(token)
    if(!allow) return fail({ message: 'unauthorized access'})
  }


  let method = (query.method || body.method || 'sendMessage').replace(/\s{2}/gm, '\n')

  if(!!messageId){
    result = await firebaseDatabaseGet(['telegram', messageId]) || {}
    if(!result) return fail({ message: 'Incorrect message id' })
  }

  try {
    let url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}?chat_id=${CHAT_ID}`

    switch (method) {
      case 'sendPoll':
        let question = (query.question || body.question || 'Is it text meesage?').replace(/\s{2}/gm, '\n') || result.question
        let options = (query.options || body.options || ["Yeah", "Absolutely"]) || result.options

        url += `&question=${question}&options=${JSON.stringify(options)}`
        break;
      default:
        let text = (query.text || body.text || 'Test Message').replace(/\s{2}/gm, '\n') || result.text 
        url += `&text=${encodeURI(text)}&parse_mode=Markdown`

        break;
    }

    // const { result: { poll }} =  GET({ url }).then(success).catch(error => fail({ message: error }))
    result =  GET({ url }).then(success).catch(error => fail({ message: error }))
    console.log({ result})
    // if (poll && messageId){
    //   await firebaseDatabaseUpdate(['telegram', messageId], { statisticId: poll.id})
    // }

    return result
  } catch (error) {
    console.log(error)
  }
}
