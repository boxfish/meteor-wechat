Package.describe({
  name: "boxfish:wechat",
  summary: "WeChat OAuth flow",
  version: "0.8.0",
  git: "https://github.com/boxfish/meteor-wechat.git"
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use(['underscore', 'service-configuration'], ['client', 'server']);
  api.use(['random', 'templating'], 'client');

  api.export('MeteorWeChat');

  api.addFiles('wechat_server.js', 'server');
  api.addFiles('wechat_browser.js', 'web.browser');
  api.addFiles('wechat_cordova.js', 'web.cordova');
  api.addFiles(['wechat_configure.html', 'wechat_configure.js'], 'client');
});

Cordova.depends({
  'cordova-plugin-wechat': '1.1.2'
});
