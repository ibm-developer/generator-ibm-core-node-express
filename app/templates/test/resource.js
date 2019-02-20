const expect = require('chai').expect;
const http = require('http');

before(function(done){
  require(process.cwd() + '/server/server');
  setTimeout(done, 5000); // Waiting 5 seconds for server to start
  this.timeout(10000);
});

{{#if routes}}
    {{#each routes}}
{{#testing route method ../basepath}}
	{{/testing}}
    it('Testing GET for {{route}} route',function(done){
      let responseString = '';

       const options = {
          host: 'localhost',
          port: process.env.PORT || 3000,
          {{#path route ../basepath}}{{/path}}
       };

       const callback = function(response){
         response.on('data', function (chunk) {
         responseString += chunk;
       });

       response.on('end', function () {
         expect(responseString).to.equal('{}');
         done();

       });
      };

      http.request(options, callback).end();
    });
  });
    {{/each}}
{{/if}}

