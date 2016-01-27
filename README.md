## meteor-wechat
A OAuth2 wrapper for the WeChat API

## Installation
```
meteor add boxfish:meteor-wechat
```

## Cordova Integration
This package uses Cordova plugin (https://github.com/xu-li/cordova-plugin-wechat) on mobile devices to fetch the authorization code.

AppId needs to be set in the mobile.config

```
App.configurePlugin('cordova-plugin-wechat', {
    WECHATAPPID: '<WECHATAPPID>'
});
```

License
-----------
[MIT](https://github.com/boxfish/meteor-wechat/blob/master/LICENSE)

Contributors
-----------
See [current package contributors](https://github.com/boxfish/meteor-wechat/graphs/contributors)
