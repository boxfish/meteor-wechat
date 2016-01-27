MeteorWeChat = {};
MeteorWeChat.whitelistedFields = ['nickname', 'sex', 'province', 'city', 'country',
  'headimgurl', 'privilege'];

var OAuth = Package.oauth.OAuth;

var serviceName = 'wechat';
var serviceVersion = 2;
var serviceUrls = null;
var serviceHandler = function(query) {
  var response = getTokenResponse(query);

  var expiresAt = (+new Date) + (1000 * parseInt(response.expiresIn, 10));
  var accessToken = response.accessToken;
  var scope = response.scope;
  var openId = response.openId;
  var unionId = response.unionId;

  var serviceData = {
    accessToken: accessToken,
    expiresAt: expiresAt,
    openId: openId,
    unionId: unionId,
    scope: scope,
    id: openId  // id is required by Meteor, using openId since it's not given by WeChat
  };

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;


  var identity = getIdentity(accessToken, openId);
  var fields = _.pick(identity, MeteorWeChat.whitelistedFields);
  _.extend(serviceData, fields);

  return {
    serviceData: serviceData,
    options: {
      profile: fields
    }
  };
};

var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'wechat'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    //Request an access token
    response = HTTP.get(
      "https://api.weixin.qq.com/sns/oauth2/access_token", {
        params: {
          code: query.code,
          appid: config.appId,
          secret: OAuth.openSecret(config.secret),
          grant_type: 'authorization_code'
        }
      }
    );
    if (response.error) // if the http response was an error
        throw response.error;
    if (typeof response.content === "string")
        response.content = JSON.parse(response.content);
    if (response.content.error)
        throw response.content;

  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with WeChat. " + err.message),
      {response: err.response});
  }

  return {
    accessToken: response.content.access_token,
    expiresIn: response.content.expires_in,
    refreshToken: response.content.refresh_token,
    openId: response.content.openid,
    scope: response.content.scope,
    unionId: response.content.unionid
  };
};

var getIdentity = function (accessToken, openId) {
  try {
    var response = HTTP.get("https://api.weixin.qq.com/sns/userinfo", {
      params: {access_token: accessToken, openid: openId, lang: 'en'}}
    );
    if (response.error) // if the http response was an error
        throw response.error;
    if (typeof response.content === "string")
        return JSON.parse(response.content);
    if (response.content.error)
        throw response.content;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from WeChat. " + err.message),
      {response: err.response});
  }
};


// register OAuth service
OAuth.registerService(serviceName, serviceVersion, serviceUrls, serviceHandler);

// retrieve credential
MeteorWeChat.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};

Meteor.methods({
  handleWeChatOauthRequest: function(query) {
    // allow the client with 3rd party authorization code to directly ask server to handle it
    check(query.code, String);
    var oauthResult = serviceHandler(query);
    var credentialSecret = Random.secret();

    //var credentialToken = OAuth._credentialTokenFromQuery(query);
    var credentialToken = query.state;
    // Store the login result so it can be retrieved in another
    // browser tab by the result handler
    OAuth._storePendingCredential(credentialToken, {
      serviceName: serviceName,
      serviceData: oauthResult.serviceData,
      options: oauthResult.options
    }, credentialSecret);

    // return the credentialToken and credentialSecret back to client
    return {
      'credentialToken': credentialToken,
      'credentialSecret': credentialSecret
    };
  }
});
