module.exports.success = success
module.exports.fail = fail
module.exports.result = result
module.exports.extract = extract

function success(body, message){
  return result(200, body, message);
}

function fail(error, body, code = 500){

  if(typeof error !== 'string'){
    code  = error.statusCode && error.statusCode || code
    body  = error.data
    error = error.message && error.message || error.status
  }

  return result(code, body, error);
}

function result(code, body, error){

  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials' : true,
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

function extract(event){
  const authorization = event.headers.authorization || event.headers.Authorization
  return {
    token: !!authorization && authorization.replace(/Bearer\s/igm, ''),
    body: event.body && JSON.parse(event.body) || {},
    query: event.queryStringParameters || {},
    path: event.pathParameters || {},
    method: event.requestContext.httpMethod
  }
}