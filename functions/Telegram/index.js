const { success, fail, extract } = require('../utils')
const { fetch, GET } = require('fetchier')
const { firebaseCheckAuth, firebaseDatabaseGet, firebaseDatabaseUpdate } = require('../firebase')

const BOT_TOKEN = '1042446704:AAHmZ2vprLeF_o6p3vGdNjUP2ygigRLxHg0'
const CHAT_ID = '@hackh_broadcast'

module.exports.handler = async event => {
  const { token, body, query } = extract(event)
  let messageId = query.messageId || body.messageId

  if(token){
    const allow = await firebaseCheckAuth(token)
    if(!allow) return fail({ message: 'unauthorized access'})
  }

  let result

  if(!!messageId){
    result = await firebaseDatabaseGet(['telegram', messageId]) || {}
    if(!result) return fail({ message: 'Incorrect message id' })
  }

  let method = (result && result.method) || (query.method || body.method || 'sendMessage').replace(/\s{2}/gm, '\n')

  try {
    let url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}?chat_id=${CHAT_ID}`

    switch (method) {
      case 'sendPoll':
        let question = (result && result.question) || (query.question || body.question || 'Is it text meesage?').replace(/\s{2}/gm, '\n')
        let options = (result && result.options) || (query.options || body.options || ["Yeah", "Absolutely"])
        let imageUrl = (result && result.imageUrl) || (query.imageUrl || body.imageUrl)

        imageUrl && await sendPhoto(imageUrl)
        url += `&question=${question}&options=${JSON.stringify(options)}`
        break;
      default:
        let text = (result && result.message ) || (query.text || body.text || 'Test Message').replace(/\s{2}/gm, '\n')
        url += `&text=${encodeURI(text)}&parse_mode=Markdown`
        break;
    }

    const newResult =  await GET({ url }).then(res => res).catch(error => {throw error})

    const { result: { poll } } = newResult

    if (poll && messageId){
      await firebaseDatabaseUpdate(['telegram', messageId], { statisticId: poll.id})
    }

    return success(newResult)
  } catch (error) {
    console.log(error)
    fail({ message: error })
  }
}

const sendPhoto = async (imageUrl) => {
  let url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto?chat_id=${CHAT_ID}` + `&photo=${imageUrl}`
  return await GET({ url }).then(res => res).catch(error => { throw error })
}
