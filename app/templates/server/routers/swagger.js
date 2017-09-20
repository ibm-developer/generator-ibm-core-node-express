var express = require('express');

module.exports = function(app){
  var router = express.Router();
  app.use("/swagger/api", express.static("./public/swagger.<%- openApiFileType %>"));
  app.use("/explorer", express.static("./public/swagger-ui"));
  app.use(router);
}