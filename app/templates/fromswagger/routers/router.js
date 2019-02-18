var express = require('express');

module.exports = function(app, basepath) {
  var router = express.Router();

{{#if routes}}
	{{#each routes}}
  router.{{method}}('{{route}}', function (req, res, next) {
    res.json({});
  })

	{{/each}}
{{#if basepath}}
  app.use(basepath, router);
{{else}}
  app.use(router);
{{/if}}
{{/if}}
}
