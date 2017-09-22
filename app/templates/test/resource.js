var expect = require('chai').expect;
var http = require('http');

before(function(done){
  require(process.cwd() + '/server/server');
  setTimeout(done, 5000); // Waiting 5 seconds for server to start
  this.timeout(10000);
});

<% if (routes) {  %>
<%  routes.forEach(function (route) { -%> 
<%   if (route.method === 'get') { -%>
<%     if(basepath) { -%>
      describe('Testing <%- basepath %><%- route.route%>',function(){
<%     } else { -%>
      describe('Testing <%- route.route%>',function(){
<%     } -%>
        it('Testing GET for <%- route.route%> route',function(done){
          var responseString = '';

          var options = {
            host: 'localhost',
            port: process.env.PORT || 3000,
            <% if (basepath) { -%>
            path: '<%- basepath %><%- route.route%>'
            <% } else {-%>
            path: '<%- route.route%>'
            <% } -%>
          };

          var callback = function(response){
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
<%   } -%>
<%  }); -%>
<% } %>

