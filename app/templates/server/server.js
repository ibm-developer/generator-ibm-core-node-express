// Uncomment following to enable zipkin tracing, tailor to fit your network configuration:
// var appzip = require('appmetrics-zipkin')({
//     host: 'localhost',
//     port: 9411,
//     serviceName:'frontend'
// });

require('appmetrics-dash').attach();
require('appmetrics-prometheus').attach();
const appName = require('./../package').name;
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const localConfig = require('./config/local.json');
const path = require('path');

const logger = log4js.getLogger(appName);
logger.level = process.env.LOG_LEVEL || 'info';
const app = express();
const server = http.createServer(app);

app.use(log4js.connectLogger(logger, { level: logger.level }));
const serviceManager = require('./services/service-manager');
require('./services/index')(app);
require('./routers/index')(app, server);

// req.body will be available for Content-Type=application/json
app.use(bodyParser.json());

// Add your code here

const port = process.env.PORT || localConfig.port;
server.listen(port, function(){
  logger.info(`{{name}} listening on http://localhost:${port}/appmetrics-dash`);
    {{#if genSwagger}}
  logger.info(`OpenAPI (Swagger) spec is available at http://localhost:${port}/swagger/api`);
  logger.info(`Swagger UI is available at http://localhost:${port}/explorer`);
    {{else}}
  logger.info(`{{name}} listening on http://localhost:${port}`);
    {{/if}}
});

app.use(function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public', '404.html'));
});

app.use(function (err, req, res, next) {
	res.sendFile(path.join(__dirname, '../public', '500.html'));
});

module.exports = server;
