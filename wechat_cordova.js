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
  var scope = (options && options.requestPermissions) || ['snsapi_userinfo'];
  scope = _.map(scope, encodeURIComponent).join(',');
  var loginStyle = OAuth._loginStyle('wechat', config, options);
  //var state = OAuth._stateParam(loginStyle, credentialToken);
  var state = credentialToken;

  if (!Wechat) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new Meteor.Error("unsupported", "WeChat corodova plugin is not found.")
    );
    return;
  }

  Wechat.isInstalled(function (installed) {
    if (!installed) {
      credentialRequestCompleteCallback && credentialRequestCompleteCallback(
        new Meteor.Error("unsupported", "WeChat is not installed.")
      );
      return;
    }

    Wechat.auth(scope, state, function(response) {
      // send the 3rd party response directly to the server for processing
      Meteor.call('handleWeChatOauthRequest', response, function(err, credentials) {
        OAuth._handleCredentialSecret(credentials.credentialToken, credentials.credentialSecret);
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(
          credentialToken
        );
      });
    }, function(reason) {
      credentialRequestCompleteCallback && credentialRequestCompleteCallback(
        new Meteor.Error("unauthroized", "WeChat authorization failed: " + reason)
      );
    });
  }, function (reason) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new Meteor.Error("unsupported", "Cannot detect whether WeChat is installed or not: " + reason)
    );
    return;
  });
};

MeteorWeChat.appInstalled = function(callback) {
  if (!Wechat) {
    callback && callback(
      new Meteor.Error("unsupported", "WeChat corodova plugin is not found.")
    );
    return;
  }

  Wechat.isInstalled(function (installed) {
    callback && callback(null, installed);
  }, function(reason) {
    callback && callback(
      new Meteor.Error("unsupported", "Cannot detect whether WeChat is installed or not: " + reason)
    );
  });
};
