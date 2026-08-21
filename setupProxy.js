const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/cartics',
    createProxyMiddleware({
      target: 'http://localhost:1313',
      changeOrigin: true,
    })
  );
};
