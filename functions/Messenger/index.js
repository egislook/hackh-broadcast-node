const { success, fail, extract } = require('../utils')
const { fetch, POST } = require('fetchier')
const { firebaseDatabaseGet, firebaseCheckAuth } = require('../firebase')

let ACCESS_TOKEN = 'EAACHRa3jp5ABAI7Lgnx3tjymwnfcBLJuk4fz9YUGxB3QMXZAqazhLQpo1awZAoUZBFGopQs4VFnMPlOk71mJruk75G0Mfh2vvNAtCZA3FPgiZBZBGEymVxiZCOscLlMpHjhNnJfDFPpAvxv9Fn2n6KmSpm2w2Dugak4JardWgmOxwmFHdzByOSq'
//'EAACHRa3jp5ABAOUZA9PnnDTNzFaepZAvna7Ac48sIoXUZAiBGLrRCMNEmv8TmcHzCiCCh8vEuZBvUD3i7TEKeAD82lvYO3gWs4AQMdgeZA0FZC3TBAF3cW0gMCwf2LR9zvUgs16Y8CAR3J64JsuRcBBMGsS4q8m6YM2KJzqKZAZALxGeX1I1hm0V'
//'EAAqJMPEY2dEBADF7Aj9kvhCZCda6Q7D5zEzVAVCy5qpAtZCkVpukA6t5BB1dtQPCG0L5UNlUn2ubAKjsq9y1JZCh6VQBD6cYX8pePkBIelFwvRZC1cH3qpfWrvNTB8w07I0mKQIaVPKzpj29lxGqo8PqJTOxnZBOeBLE2j2fXjQZDZD';

module.exports.handler = async event => {
  const { token, query, body, method } = extract(event)

  if(token){
    const allow = await firebaseCheckAuth(token)
    if(!allow) return fail({ message: 'Unauthorized access'})
  }

  const result = await firebaseDatabaseGet(['subscribers'])
  if(!result) return fail({ message: 'No subscribers found' })

  const messageId = query.messageId || body.messageId

  let text = (query.text || body.text || 'Test Message').replace(/\s{2}/gm, '\n')
  
  if(!!messageId){
    const result = await firebaseDatabaseGet(['messenger', messageId]) || {}
    if(!result) return fail({ message: 'Incorrect message id' })
    text = result.message
  }

  const results = { successful: [], unsuccessful: [] }

  try{
    for(let id in result){
      await POST({
        url: `https://graph.facebook.com/v6.0/me/messages?access_token=${ACCESS_TOKEN}`,
        body: { messaging_type: 'RESPONSE', recipient: { id }, message: { text } }
      })
      .catch(err => {
        console.log(err)
        results.unsuccessful = results.unsuccessful.concat([id])
      })
      .then(() => {
        results.successful = results.successful.concat([id])
      })

      await new Promise(res => setTimeout(res, 200))
    }
    return success(results)
  } catch(error){
    return fail({ error })
  }
}
