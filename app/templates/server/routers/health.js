var express = require('express');

module.exports = function(app) {
  var router = express.Router();

  router.get('/', function (req, res, next) {
    res.json({status: 'UP'});
  });

  app.use("/health", router);
  {{#ifCond appType '===' 'MS'}}
  app.use("/", router);
  {{/ifCond}}
  {{#ifCond appType '===' 'BLANK'}}
  app.use("/", router);
  {{/ifCond}}
}



