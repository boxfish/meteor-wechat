MeteorWeChat = {};

// Request WeChat credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
MeteorWeChat.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'wechat'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError()
    );
    return;
  }

  var credentialToken = Random.secret();
  var scope = (options && options.requestPermissions) || ['snsapi_login'];
  scope = _.map(scope, encodeURIComponent).join(',');
  var loginStyle = OAuth._loginStyle('wechat', config, options);
  var state = OAuth._stateParam(loginStyle, credentialToken);

  var loginUrl =
    'https://open.weixin.qq.com/connect/qrconnect' +
      '?appid=' + config.appId +
      '&response_type=code' +
      '&scope=' + scope +
      '&redirect_uri=' + OAuth._redirectUri('wechat', config) +
      '&state=' + state;

  OAuth.launchLogin({
    loginService: "wechat",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken
  });
};

MeteorWeChat.appInstalled = function(callback) {
  // for browser, it's always false
  callback && callback(null, false);
};
