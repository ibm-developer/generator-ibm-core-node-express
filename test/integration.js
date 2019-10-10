/*
 © Copyright IBM Corp. 2017, 2018
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * Tests here do not stub out the subgenerators, so for the app generator
 * the real build and refresh subgenerators get called.
 */
'use strict';
const common = require('./common.js');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');
const PROJECT_NAME = "ProjectName";

describe('core-node-express:app integration test with custom spec', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        bluemix: JSON.stringify({
          name: PROJECT_NAME
        }),
        spec: JSON.stringify({
          appname: 'testApp',
          port: common.defaultPort
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure test', function () {
    // Files which we assert are created each time the app generator is run.
    // Takes an array of files, converted from obj by Object.values().
    const expected = Object.keys(common.file).map((key) => common.file[key]);

    it('generates the expected application files', function () {
      assert.file(expected);
    });

  });

  describe('has a public directory', function () {
    // Files which we assert are created each time the app generator is run.
    // Takes an array of files, converted from obj by Object.values().
    it('creates public route', function () {
      assert.fileContent('server/routers/index.js', 'require(\'./public\')(app);');
    })
  });

  describe(common.file.local, function () {
    it('contains the custom port', function () {
      assert.jsonFileContent(common.file.local, {
        port: common.defaultPort
      });
    });
  });

  describe(common.file.package_json, function () {
    it('check package.json', function () {
      assert.jsonFileContent(common.file.package_json, {
        "version": "1.0.0",
        "description": "A generated IBM Cloud application",
        "private": true,
        "engines": {
          "node": "^8.11.1"
        },
        "scripts": {
          "start": "node $npm_package_config_entrypoint",
          "debug": "node --inspect=0.0.0.0:9229 $npm_package_config_entrypoint",
          "test": "nyc mocha --exit"
        },
        "dependencies": {
          "body-parser": "^1.18.3",
          "express": "^4.16.4",
          "log4js": "^4.0.2"
        },
        "devDependencies": {
          "chai": "^4.2.0",
          "mocha": "^6.0.0",
          "nyc": "^13.3.0"
        }
      });
    });
  });

  describe(common.file.README_md, function () {
    it('contains default project name', function () {
      assert.fileContent(common.file.README_md, PROJECT_NAME);
    });

    it('contains IBM Cloud badge', function () {
      assert.fileContent(common.file.README_md,
        '[![](https://img.shields.io/badge/IBM_Cloud-powered-blue.svg)](https://cloud.ibm.com)');
    });
  });

  describe(common.file.server_js, () => {
    it('contains default app name', () => {
      assert.fileContent(common.file.server_js, 'logger.info(`ProjectName listening on http://localhost:${port}`);')
    });
  });

  describe(common.file.gitignore, function () {
    it('contains node_modules', function () {
      assert.fileContent(common.file.gitignore, 'node_modules');
    });
  });
});

describe('core-node-express:app integration test with custom bluemix.fromYo flag', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        bluemix: JSON.stringify({
          name: PROJECT_NAME,
          fromYo: true
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure test', function () {
    // Files which we assert are created each time the app generator is run.
    // Takes an array of files, converted from obj by Object.values().
    const expected = Object.keys(common.file).map((key) => common.file[key]);

    it('generates the expected application files', function () {
      assert.file(expected);
      assert.file('idt.js');
    });
  });

  describe(common.file.local, function () {
    it('contains the default port', function () {
      assert.jsonFileContent(common.file.local, {
        port: 3000
      });
    });

  });

  describe(common.file.package_json, function () {
    it('check package.json', function () {
      assert.jsonFileContent(common.file.package_json, {
        "version": "1.0.0",
        "description": "A generated IBM Cloud application",
        "private": true,
        "engines": {
          "node": "^8.11.1"
        },
        "scripts": {
          "start": "node $npm_package_config_entrypoint",
          "test": "nyc mocha --exit",
          "start:cluster": "sl-run server/server.js",
          "build": "npm run build:idt",
          "idt:build": "node idt.js build",
          "idt:test": "node idt.js test",
          "idt:debug": "node idt.js debug",
          "idt:run": "node idt.js run",
          "idt:deploy": "node idt.js deploy",
          "idt:install": "node idt.js install"
        },
        "dependencies": {
          "body-parser": "^1.18.3",
          "express": "^4.16.4",
          "log4js": "^4.0.2",
          "strong-supervisor": "^6.2.0"
        },
        "devDependencies": {
          "chai": "^4.2.0",
          "mocha": "^6.0.0",
          "nyc": "^13.3.0"
        }
      });
    });
  });

  describe(common.file.README_md, function () {
    it('contains custom project name', function () {
      assert.fileContent(common.file.README_md, PROJECT_NAME);
    });

    it('contains IBM Cloud badge', function () {
      assert.fileContent(common.file.README_md,
        '[![](https://img.shields.io/badge/IBM_Cloud-powered-blue.svg)](https://cloud.ibm.com)');
    });
  });

  describe(common.file.server_js, () => {
    it('contains custom app name', () => {
      assert.fileContent(common.file.server_js, 'logger.info(`ProjectName listening on http://localhost:${port}`);')
    });
  });

  describe(common.file.gitignore, function () {
    it('contains node_modules', function () {
      assert.fileContent(common.file.gitignore, 'node_modules');
    });
  });
});

describe('core-node-express:app integration test with custom bluemix', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        bluemix: JSON.stringify({
          name: PROJECT_NAME
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure test', function () {
    // Files which we assert are created each time the app generator is run.
    // Takes an array of files, converted from obj by Object.values().
    const expected = Object.keys(common.file).map((key) => common.file[key]);

    it('generates the expected application files', function () {
      assert.file(expected);
    });
  });

  describe(common.file.local, function () {
    it('contains the default port', function () {
      assert.jsonFileContent(common.file.local, {
        port: 3000
      });
    });
  });

  describe(common.file.package_json, function () {
    it('check package.json', function () {
      assert.jsonFileContent(common.file.package_json, {
        "version": "1.0.0",
        "description": "A generated IBM Cloud application",
        "private": true,
        "engines": {
          "node": "^8.11.1"
        },
        "scripts": {
          "start": "node $npm_package_config_entrypoint",
          "test": "nyc mocha --exit"
        },
        "dependencies": {
          "body-parser": "^1.18.3",
          "express": "^4.16.4",
          "log4js": "^4.0.2"
        },
        "devDependencies": {
          "chai": "^4.2.0",
          "mocha": "^6.0.0",
          "nyc": "^13.3.0"
        }
      });
    });
  });

  describe(common.file.README_md, function () {
    it('contains custom project name', function () {
      assert.fileContent(common.file.README_md, PROJECT_NAME);
    });

    it('contains IBM Cloud badge', function () {
      assert.fileContent(common.file.README_md,
        '[![](https://img.shields.io/badge/IBM_Cloud-powered-blue.svg)](https://cloud.ibm.com)');
    });
  });

  describe(common.file.server_js, () => {
    it('contains custom app name', () => {
      assert.fileContent(common.file.server_js, 'logger.info(`ProjectName listening on http://localhost:${port}`);')
    });
  });

  describe(common.file.gitignore, function () {
    it('contains node_modules', function () {
      assert.fileContent(common.file.gitignore, 'node_modules');
    });
  });
});

describe('core-node-express:app integration test with custom bluemix and spec', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        bluemix: JSON.stringify({
          name: PROJECT_NAME
        }),
        spec: JSON.stringify({
          port: common.defaultPort
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure test', function () {
    // Files which we assert are created each time the app generator is run.
    // Takes an array of files, converted from obj by Object.values().
    const expected = Object.keys(common.file).map((key) => common.file[key]);

    it('generates the expected application files', function () {
      assert.file(expected);
    });
  });

  describe(common.file.local, function () {
    it('contains the custom port', function () {
      assert.jsonFileContent(common.file.local, {
        port: common.defaultPort
      });
    });
  });

  describe(common.file.package_json, function () {
    it('check package.json', function () {
      assert.jsonFileContent(common.file.package_json, {
        "version": "1.0.0",
        "description": "A generated IBM Cloud application",
        "private": true,
        "engines": {
          "node": "^8.11.1"
        },
        "scripts": {
          "start": "node $npm_package_config_entrypoint",
          "test": "nyc mocha --exit"
        },
        "dependencies": {
          "body-parser": "^1.18.3",
          "express": "^4.16.4",
          "log4js": "^4.0.2"
        },
        "devDependencies": {
          "chai": "^4.2.0",
          "mocha": "^6.0.0",
          "nyc": "^13.3.0"
        }
      });
    });
  });

  describe(common.file.README_md, function () {
    it('contains custom project name', function () {
      assert.fileContent(common.file.README_md, PROJECT_NAME);
    });

    it('contains IBM Cloud badge', function () {
      assert.fileContent(common.file.README_md,
        '[![](https://img.shields.io/badge/IBM_Cloud-powered-blue.svg)](https://cloud.ibm.com)');
    });
  });

  describe(common.file.server_js, () => {
    it('contains custom app name', () => {
      assert.fileContent(common.file.server_js, 'logger.info(`ProjectName listening on http://localhost:${port}`);')
    });

  });

  describe(common.file.gitignore, function () {
    it('contains node_modules', function () {
      assert.fileContent(common.file.gitignore, 'node_modules');
    });
  });
});

describe('core-node-express:app integration test with openApiServices', function () {

  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    let swagger = JSON.parse(fs.readFileSync(path.join(__dirname, '../test/resources/person_dino.json'), 'utf8'));

    let swagStr = JSON.stringify(swagger);
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({
          appname: 'testApp',
          port: common.defaultPort,
          isDeployableContainer: true
        }),
        bluemix: JSON.stringify({
          name: PROJECT_NAME,
          openApiServers: [{
            spec: swagStr
          }]
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  it('created expected endpoints', function () {
    assert.file('server/routers/persons.js');
    assert.fileContent('server/routers/persons.js', 'router.get(\'/persons\', function (req, res, next) {');
    assert.file('server/routers/dinosaurs.js');
    assert.fileContent('server/routers/dinosaurs.js', 'router.get(\'/dinosaurs\', function (req, res, next) {');
    assert.file('test/dinosaurs.js');
    assert.fileContent('test/dinosaurs.js', 'it(\'Testing GET for /dinosaurs route\',function(done)');
    assert.fileContent('server/routers/index.js', 'require(\'./persons\')(app, basepath);');
    assert.fileContent('server/routers/swagger.js', './public/swagger.json');
  });

  it('did not create swagger.yaml', function () {
    assert.noFile('public/swagger.yaml');
  })

  it('public route', function () {
    assert.fileContent('server/routers/index.js', 'require(\'./public\')(app);');
  })

  it('Error parsing openApiServices', function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({
          appname: 'testApp',
          port: common.defaultPort,
          isDeployableContainer: true
        }),
        bluemix: JSON.stringify({
          name: PROJECT_NAME,
          openApiServers: [{
            spec: 'not-a-real-json'
          }]
        })
      })
      .toPromise()
      .then(() => done('Invalid openApiServices specs'))
      .catch(() => done());
  });
});

describe('core-node-express:app integration test as microservice', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);
  before(function () {
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({
          appname: 'testApp',
          port: common.defaultPort,
          applicationType: 'MS'
        }),
        bluemix: JSON.stringify({
          name: PROJECT_NAME
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  it('creates health route', function () {
    assert.fileContent('server/routers/index.js', 'require(\'./health\')(app);');
  })

  it('create swagger.yaml', function () {
    assert.file('public/swagger.yaml');
  })

});

describe('core-node-express:app microservice integration test with openApiServices', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);
  before(function () {
    let swagger = JSON.parse(fs.readFileSync(path.join(__dirname, '../test/resources/person_dino.json'), 'utf8'));
    let swagStr = JSON.stringify(swagger);
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({
          appname: 'testApp',
          port: common.defaultPort,
          isDeployableContainer: true,
          applicationType: 'MS'
        }),
        bluemix: JSON.stringify({
          name: PROJECT_NAME,
          openApiServers: [{
            spec: swagStr
          }]
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  it('public route', function () {
    assert.fileContent('server/routers/index.js', 'require(\'./public\')(app);');
  })
});

describe('core-node-express:app blank integration test with openApiServices', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    let swagger = JSON.parse(fs.readFileSync(path.join(__dirname, '../test/resources/person_dino.json'), 'utf8'));
    let swagStr = JSON.stringify(swagger);
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({
          appname: 'testApp',
          port: common.defaultPort,
          isDeployableContainer: true,
          applicationType: 'BLANK'
        }),
        bluemix: JSON.stringify({
          name: PROJECT_NAME,
          openApiServers: [{
            spec: swagStr
          }]
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  it('public route', function () {
    assert.fileContent('server/routers/index.js', 'require(\'./public\')(app);');
  })

});

describe('core-node-express:app invalid  parameters', function () {
  this.timeout(150000);
  it('Invalid json in bluemix parameter', function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        bluemix: '{"name": "batman", "not-a-valid-json": {}'
      })
      .toPromise()
      .then(() => done('Invalid parameters error ignored'))
      .catch(() => done());
  });
  it('Missing bluemix parameter', function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .withOptions({})
      .toPromise()
      .then(() => done('Invalid parameters error ignored'))
      .catch(() => done());
  });
});