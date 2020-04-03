module.exports.debug                 = false;
module.exports.reSignUp              = true;
module.exports.env                   = process.env.ENV                                      || 'test';

module.exports.MEKONG_SMS_ENDPOINT   = process.env.MEKONG_SMS_ENDPOINT                      || 'https://mekongsms.clik.asia/api/sendsms.aspx';
module.exports.MEKONG_SMS_USER       = process.env.MEKONG_SMS_USER                          || 'clikpayment@mekongnet';
module.exports.MEKONG_SMS_HASH       = process.env.MEKONG_SMS_HASH                          || '2C9FD9C00DBAB083E1FBADD222D1535A';
module.exports.MEKONG_SMS_SENDER     = process.env.MEKONG_SMS_SENDER                        || 'Clik';