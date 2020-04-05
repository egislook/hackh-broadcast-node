const { success, fail, extract } = require('../utils')
const { fetch, POST } = require('fetchier')

let VERIFY_TOKEN = 'rj2QZKoIMqpCfE8Q4lEv4Vaf'; //paste new token here to verify fb webhook. NO SYMBOL!
let ACCESS_TOKEN = 'EAAqJMPEY2dEBADF7Aj9kvhCZCda6Q7D5zEzVAVCy5qpAtZCkVpukA6t5BB1dtQPCG0L5UNlUn2ubAKjsq9y1JZCh6VQBD6cYX8pePkBIelFwvRZC1cH3qpfWrvNTB8w07I0mKQIaVPKzpj29lxGqo8PqJTOxnZBOeBLE2j2fXjQZDZD';

module.exports.handler = async event => {
  const { query, body, method } = extract(event);
  // verify webhook
  if(method === 'GET') {
    let [mode, challenge, token] = [query['hub.mode'], query['hub.challenge'], query['hub.verify_token']];
    return mode === 'subscribe' && token === VERIFY_TOKEN
      ? { statusCode: 200, body: challenge }
      : fail('Failed to verify token');
  }

  // POST request
  const { entry } = body
  const { sender: { id } } = entry[0].messaging[0] || {}
   const notificationReq = {
    recipient: {
      id
    },
    message: {
      attachment: {
        type: 'template',
        payload:  {
          template_type: 'one_time_notif_req',
          title: 'this is title',
          payload: 'this is payload'
        }
      }
    }
  }
  console.log('EVENT', body, id, JSON.stringify(notificationReq));
  POST({
    url: `https://graph.facebook.com/v6.0/me/messages?access_token=${ACCESS_TOKEN}`,
    // body: notificationReq
    body: { messaging_type: 'RESPONSE', recipient: { id }, message: { text: 'example message' } }
  }).then(success).catch(fail)
}
