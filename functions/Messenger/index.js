const { success, fail, extract } = require('../utils')
const { fetch, POST } = require('fetchier')
const { firebaseDatabaseGet, firebaseCheckAuth } = require('../firebase')

let ACCESS_TOKEN = 'EAACHRa3jp5ABAI7Lgnx3tjymwnfcBLJuk4fz9YUGxB3QMXZAqazhLQpo1awZAoUZBFGopQs4VFnMPlOk71mJruk75G0Mfh2vvNAtCZA3FPgiZBZBGEymVxiZCOscLlMpHjhNnJfDFPpAvxv9Fn2n6KmSpm2w2Dugak4JardWgmOxwmFHdzByOSq'
//'EAACHRa3jp5ABAOUZA9PnnDTNzFaepZAvna7Ac48sIoXUZAiBGLrRCMNEmv8TmcHzCiCCh8vEuZBvUD3i7TEKeAD82lvYO3gWs4AQMdgeZA0FZC3TBAF3cW0gMCwf2LR9zvUgs16Y8CAR3J64JsuRcBBMGsS4q8m6YM2KJzqKZAZALxGeX1I1hm0V'
//'EAAqJMPEY2dEBADF7Aj9kvhCZCda6Q7D5zEzVAVCy5qpAtZCkVpukA6t5BB1dtQPCG0L5UNlUn2ubAKjsq9y1JZCh6VQBD6cYX8pePkBIelFwvRZC1cH3qpfWrvNTB8w07I0mKQIaVPKzpj29lxGqo8PqJTOxnZBOeBLE2j2fXjQZDZD';

module.exports.handler = async event => {
  let { token, query, body: eventBody } = extract(event)
  let messageId = query.messageId || eventBody.messageId || '-M50gyIvZaNHS9Muwgwj'

  if(token){
    const allow = await firebaseCheckAuth(token)
    if(!allow) return fail({ message: 'Unauthorized access'})
  }

  let subscribers = await firebaseDatabaseGet(['subscribers'])
  if (!subscribers) return fail({ message: 'No subscribers found' })

  let result
  if(!!messageId){
    result = await firebaseDatabaseGet(['messenger', messageId]) || {}
    if(!result) return fail({ message: 'Incorrect message id' })
  }

  let method = (result && result.method) || (query.method || eventBody.method || 'sendMessage').replace(/\s{2}/gm, '\n')

  const results = { successful: [], unsuccessful: [] }
  const url = `https://graph.facebook.com/v6.0/me/messages?access_token=${ACCESS_TOKEN}`

  let body = { messaging_type: 'RESPONSE'}

  switch (method) {
    case 'sendPoll':
      let question = (result && result.question) || (query.question || eventBody.question || 'Is it text meesage?').replace(/\s{2}/gm, '\n')
      let options = (result && result.options) || (query.options || eventBody.options || ["Yeah", "Absolutely"])
      body['message'] = {
        text: question,
        quick_replies: options.map(option => ({
          "content_type": "text",
          "title": option,
          "payload": JSON.stringify({ messageId: messageId || 'test', method})
        }))
      }

      break;
    default:
      let text = (result && result.text) || (query.text || eventBody.text || 'Test Message').replace(/\s{2}/gm, '\n')
      body['message'] = { text }
      break;
  }

  try{
    for (let id in subscribers){
      body["recipient"] = {id}
      await POST({
        url,
        body
      })
      .catch(err => {
        console.log(err)
        results.unsuccessful = results.unsuccessful.concat([id])
      })
      .then((res) => {

        results.successful = results.successful.concat([id])
      })

      await new Promise(res => setTimeout(res, 200))
    }
    return success(results)
  } catch(error){
    return fail({ error })
  }
}
