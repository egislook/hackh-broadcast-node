const { success, fail, extract } = require('../utils')
const { POST } = require('fetchier')
const { firebaseDatabaseUpdate, firebaseDatabaseGet } = require('../firebase')

const VERIFY_TOKEN = 'rj2QZKoIMqpCfE8Q4lEv4Vaf' //paste new token here to verify fb webhook. NO SYMBOL!
const ACCESS_TOKEN = 'EAACHRa3jp5ABAI7Lgnx3tjymwnfcBLJuk4fz9YUGxB3QMXZAqazhLQpo1awZAoUZBFGopQs4VFnMPlOk71mJruk75G0Mfh2vvNAtCZA3FPgiZBZBGEymVxiZCOscLlMpHjhNnJfDFPpAvxv9Fn2n6KmSpm2w2Dugak4JardWgmOxwmFHdzByOSq'
//'EAACHRa3jp5ABAOUZA9PnnDTNzFaepZAvna7Ac48sIoXUZAiBGLrRCMNEmv8TmcHzCiCCh8vEuZBvUD3i7TEKeAD82lvYO3gWs4AQMdgeZA0FZC3TBAF3cW0gMCwf2LR9zvUgs16Y8CAR3J64JsuRcBBMGsS4q8m6YM2KJzqKZAZALxGeX1I1hm0V'
//'EAAqJMPEY2dEBADF7Aj9kvhCZCda6Q7D5zEzVAVCy5qpAtZCkVpukA6t5BB1dtQPCG0L5UNlUn2ubAKjsq9y1JZCh6VQBD6cYX8pePkBIelFwvRZC1cH3qpfWrvNTB8w07I0mKQIaVPKzpj29lxGqo8PqJTOxnZBOeBLE2j2fXjQZDZD';

module.exports.handler = async event => {
  const { query, body, method } = extract(event);
  
  // GET verify webhook
  if(method === 'GET') {
    let [mode, challenge, token] = [query['hub.mode'], query['hub.challenge'], query['hub.verify_token']]
    return mode === 'subscribe' && token === VERIFY_TOKEN
      ? { statusCode: 200, body: challenge }
      : fail('Failed to verify token');
  }

  // POST request
  const { entry } = body

  const { sender: { id }, message = {} } = entry[0].messaging[0] || {}

  let { quick_reply, text } = message || {}

  if (quick_reply){
    let { messageId, method } = JSON.parse(quick_reply.payload)
    await updatePollStatistic({ messageId, text, statisticId: entry[0].id})
    return success()
  }

  return await subscribeUser(id)
}

const updatePollStatistic = async ({ messageId, text, statisticId}) => {
  let result = await firebaseDatabaseGet(['messages', messageId]) || {}
  let statistics = {}

  if (!result.statistics)
    statistics = {
      id: statisticId,
      question: result.question,
      options: result.options.map(option => ({
        text: option,
        voter_count: text === option ? 1 : 0
      })),
      total_voter_count: 1
    }
  else
    statistics = {
      ...result.statistics,
      options: result.statistics.options.map(option => ({ ...option, voter_count: option.text === text ? option.voter_count + 1 : 0})),
      total_voter_count: result.statistics.total_voter_count + 1
    }

  
  const update = await firebaseDatabaseUpdate(['messages', messageId], { statistics })
}

const subscribeUser = async (id) => {
  const result = await firebaseDatabaseGet(['subscribers', id])
  if (result) return success({ message: 'User already subscribed' })

  const update = await firebaseDatabaseUpdate(['subscribers', id], { timestamp: new Date().getTime() })
  if (!update) return fail({ message: 'Incorrect message id' })

  return POST({
    url: `https://graph.facebook.com/v6.0/me/messages?access_token=${ACCESS_TOKEN}`,
    body: {
      messaging_type: 'RESPONSE', recipient: { id }, message: {
        text: 'Thank you for subscribing the the official Covid-19 channel for Cambodia! We will send you all the official information regarding the Covid- 19 virus so you can stay up to date!'
      }
    }
  }).then(success).catch(fail)
}
