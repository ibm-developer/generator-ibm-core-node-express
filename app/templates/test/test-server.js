var expect = require('chai').expect;
var http = require('http');

// Below code demonstrates using various methods of testing
describe('Testing Server', function() {
  let test_server;
  this.timeout(0);

  before(done => {
    let app = require(process.cwd() + '/server/server');
    test_server = app.listen(process.env.PORT || 3000, done);
  });

  it('Health endpoint shows status up', function(done){
    var responseString = '';

    var options = {
      host: 'localhost',
      port: process.env.PORT || 3000,
      path: '/health'
    };

    var callback = function(response){
      response.on('data', function (chunk) {
        responseString += chunk;
      });

      response.on('end', function () {
        expect(responseString).to.equal('{"status":"UP"}');
        done();
      });
    };

    http.request(options, callback).end();
  });

  after(done => {
    test_server.close(done);
  });
});
