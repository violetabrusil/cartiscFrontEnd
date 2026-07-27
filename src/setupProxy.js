const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/cartics',
    createProxyMiddleware({
      target: 'http://192.168.100.31:1313',
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('origin', 'http://localhost:3000');
        proxyReq.setHeader('host', 'localhost:1313');
      },
    })
  );
};