const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/cartics',
    createProxyMiddleware({
      target: 'http://192.168.100.98:1313',
      changeOrigin: true,
    })
  );
};
