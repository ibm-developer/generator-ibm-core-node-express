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




describe('error thrown when bluemix parameter is missing', function () {

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({}) // No parameters!!
      .on('error', function () {
        assert(true);
      })
      .toPromise( function() { // Should never return a promise
        assert(false)
      })
  });
});

describe('core-node-express:app integration test with custom spec', function () {
  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({ appname: 'testApp', port: common.defaultPort }),
        bluemix: JSON.stringify({ name: PROJECT_NAME })
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
      assert.jsonFileContent(common.file.local, { port: common.defaultPort });
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
          "start": "node server/server.js",
          "debug": "chmod +x run-debug && ./run-debug",
          "test": "nyc mocha"
        },
        "dependencies": {
          "appmetrics-dash": "^4.0.0",
          "appmetrics-prometheus": "^2.0.0",
          "body-parser": "^1.17.2",
          "express": "^4.15.3",
          "log4js": "^1.1.1"
        },
        "devDependencies": {
          "chai": "^4.0.0",
          "mocha": "^3.4.2",
          "nyc": "^10.3.2"
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
        '[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)');
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
        bluemix: JSON.stringify({ name: PROJECT_NAME, fromYo: true })
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
      assert.jsonFileContent(common.file.local, { port: 3000 });
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
          "start": "node server/server.js",
          "test": "nyc mocha",
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
          "appmetrics-dash": "^4.0.0",
          "appmetrics-prometheus": "^2.0.0",
          "body-parser": "^1.17.2",
          "express": "^4.15.3",
          "log4js": "^1.1.1",
          "strong-supervisor": "^6.2.0"
        },
        "devDependencies": {
          "chai": "^4.0.0",
          "mocha": "^3.4.2",
          "nyc": "^10.3.2"
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
        '[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)');
    });
  });

  describe(common.file.server_js, () => {
    it('contains custom app name', () => {
      assert.fileContent(common.file.server_js, 'logger.info(`ProjectName listening on http://localhost:${port}`);')
    });
  });

  describe(common.file.server_js, () => {
    it('contains appmetrics-dash attach', () => {
      assert.fileContent(common.file.server_js, "require('appmetrics-dash').attach();")
    });
  });

  describe(common.file.server_js, () => {
    it('contains appmetrics-prometheus attach', () => {
      assert.fileContent(common.file.server_js, "require('appmetrics-prometheus').attach();")
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
        bluemix: JSON.stringify({ name: PROJECT_NAME })
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
      assert.jsonFileContent(common.file.local, { port: 3000 });
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
          "start": "node server/server.js",
          "test": "nyc mocha"
        },
        "dependencies": {
          "appmetrics-dash": "^4.0.0",
          "appmetrics-prometheus": "^2.0.0",
          "body-parser": "^1.17.2",
          "express": "^4.15.3",
          "log4js": "^1.1.1"
        },
        "devDependencies": {
          "chai": "^4.0.0",
          "mocha": "^3.4.2",
          "nyc": "^10.3.2"
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
        '[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)');
    });
  });

  describe(common.file.server_js, () => {
    it('contains custom app name', () => {
      assert.fileContent(common.file.server_js, 'logger.info(`ProjectName listening on http://localhost:${port}`);')
    });
  });

  describe(common.file.server_js, () => {
    it('contains appmetrics-dash attach', () => {
      assert.fileContent(common.file.server_js, "require('appmetrics-dash').attach();")
    });
  });

  describe(common.file.server_js, () => {
    it('contains appmetrics-prometheus attach', () => {
      assert.fileContent(common.file.server_js, "require('appmetrics-prometheus').attach();")
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
        bluemix: JSON.stringify({ name: PROJECT_NAME }),
        spec: JSON.stringify({ port: common.defaultPort })
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
      assert.jsonFileContent(common.file.local, { port: common.defaultPort });
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
          "start": "node server/server.js",
          "test": "nyc mocha"
        },
        "dependencies": {
          "appmetrics-dash": "^4.0.0",
          "appmetrics-prometheus": "^2.0.0",
          "body-parser": "^1.17.2",
          "express": "^4.15.3",
          "log4js": "^1.1.1"
        },
        "devDependencies": {
          "chai": "^4.0.0",
          "mocha": "^3.4.2",
          "nyc": "^10.3.2"
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
        '[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)');
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
        spec: JSON.stringify({ appname: 'testApp', port: common.defaultPort, isDeployableContainer: true }),
        bluemix: JSON.stringify({ name: PROJECT_NAME, openApiServers: [{ spec: swagStr }] })
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
    assert.fileContent('server/routers/index.js', 'require(\'./public\')(app)');
    assert.fileContent('server/routers/swagger.js', './public/swagger.json');
  });

  it('did not create swagger.yaml', function () {
    assert.noFile('public/swagger.yaml');
  })

});

describe('core-node-express:app integration test as microservice', function () {

  // Express build is slow so we need to set a longer timeout for the test
  this.timeout(150000);

  before(function () {
    //let swagger = JSON.parse(fs.readFileSync(path.join(__dirname, '../test/resources/person_dino.json'), 'utf8'));

    // let swagStr = JSON.stringify(swagger);
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        spec: JSON.stringify({ appname: 'testApp', applicationType: 'MS' }),
        bluemix: JSON.stringify({ name: PROJECT_NAME })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  it('create swagger.yaml', function () {
    assert.file('public/swagger.yaml');
  })

});

