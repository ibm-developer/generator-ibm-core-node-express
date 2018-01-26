/*
 Copyright 2017 IBM Corp.
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

'use strict';
const Generator = require('yeoman-generator');
const Bundle = require("./../package.json");
const Log4js = require('log4js');
const logger = Log4js.getLogger("generator-core-node-express");
const helpers = require('../lib/helpers');
const swaggerize = require('ibm-openapi-support');
const OPTION_BLUEMIX = "bluemix";
const OPTION_SPEC = "spec";
const process= require('process');
const fs= require('fs');

const REGEX_LEADING_ALPHA = /^[^a-zA-Z]*/;
const REGEX_ALPHA_NUM = /[^a-zA-Z0-9]/g;

const extraScriptForYoGenerated = {
  "start:cluster": "sl-run server/server.js",
  "build": "npm run build:idt",
  "idt:build": "node idt.js build",
  "idt:test": "node idt.js test",
  "idt:debug": "node idt.js debug",
  "idt:run": "node idt.js run",
  "idt:deploy": "node idt.js deploy",
  "idt:install": "node idt.js install"
};

const extraDependenciesForYoGenerated = {
  "strong-supervisor": "^6.2.0"
};

const extraDevDependenciesForYoGenerated = {
  "request": "^2.82.0",
  "chalk": "^1.1.3",
  "prompt-confirm": "^1.2.0"
};

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    // bluemix option for YaaS integration
    this.argument(OPTION_BLUEMIX, {
      desc: 'Option for deploying with Bluemix. Stringified JSON.',
      required: false,
      hide: true,
      type: String
    });

    // spec as json
    this.argument(OPTION_SPEC, {
      desc: 'The generator specification. Stringified JSON.',
      required: false,
      hide: true,
      type: String
    });
  }

  initializing() {
    this.skipPrompt = true;
    let bluemix_ok= this._sanitizeOption(this.options, OPTION_BLUEMIX);
    let spec_ok= this._sanitizeOption(this.options, OPTION_SPEC);
    if ( ! (bluemix_ok || spec_ok )) throw ("Must specify either bluemix or spec parameter");

    if ( typeof this.options.bluemix.quiet == "undefined" || ! this.options.bluemix.quiet ) {
      logger.info("Package info ::", Bundle.name, Bundle.version);
    }

    let appName = this.options.bluemix.name || this.options.spec.appname;
    this.options.sanitizedAppName = this._sanitizeAppName(appName);
    this.options.genSwagger= false;
    this.options.openApiFileType= "yaml"; // default

    this.options.parsedSwagger = undefined;
    let formatters = {
      'pathFormatter': helpers.reformatPathToNodeExpress,
      'resourceFormatter': helpers.resourceNameFromPath
    };

    // Define metadata for all services that
    // require custom logic in Dockerfiles
    const services = require('./resources/services.json');

    // Get array with all the keys for the services objects
    const servKeys = Object.keys(services);
    const servicesPackages = [];

    // Iterate over service keys to search for provisioned services
    for (let index in servKeys) {
      const servKey = servKeys[index];
      if (this.options.bluemix.hasOwnProperty(servKey)) {
        if (services[servKey].package) {
          servicesPackages.push(services[servKey].package);
        }
      }
    }

    this.options.servicesPackages = servicesPackages;

    if (this.options.bluemix && this.options.bluemix.openApiServers && this.options.bluemix.openApiServers[0].spec) {
      let openApiDocumentBytes = typeof this.options.bluemix.openApiServers[0].spec === 'object'
        ? JSON.stringify(this.options.bluemix.openApiServers[0].spec)
        : this.options.bluemix.openApiServers[0].spec;
      return swaggerize.parse(openApiDocumentBytes, formatters)
      .then(response => {
        this.options.loadedApi = response.loaded;
        this.options.parsedSwagger = response.parsed;
        this.options.openApiFileType= response.type;
        this.options.genSwagger= true;
      })
      .catch(err => {
        err.message = 'failed to parse document from bluemix.openApiServers ' + err.message;
        throw err;
      })
    }

    // micro service always gets swagger ui and no public
    if(this.options.spec && this.options.spec.applicationType === 'MS') {
      this.options.genSwagger= true;
    }

  }

  writing() {

    this.fs.copyTpl(this.templatePath('server'), this.destinationPath('server'), this.options);

    if (this.options.parsedSwagger) {
      Object.keys(this.options.parsedSwagger.resources).forEach(function(resource) {
        let context = {
          'resource': resource,
          'routes': this.options.parsedSwagger.resources[resource],
          'basepath': this.options.parsedSwagger.basepath
        };
        this.fs.copyTpl(this.templatePath('fromswagger/routers/router.js'), this.destinationPath(`server/routers/${resource}.js`), context);
        this.fs.copyTpl(this.templatePath('test/resource.js'), this.destinationPath(`test/${resource}.js`), context);
      }.bind(this));
    }

    this.fs.copyTpl(this.templatePath('test/test-server.js'), this.destinationPath('test/test-server.js'), this.options);
    this.fs.copyTpl(this.templatePath('test/test-demo.js'), this.destinationPath('test/test-demo.js'), this.options);
    this.fs.copyTpl(this.templatePath('_gitignore'), this.destinationPath('.gitignore'), this.options);
    this.fs.copyTpl(this.templatePath('_dockerignore'), this.destinationPath('.dockerignore'), this.options);
    this.fs.copyTpl(this.templatePath('cli-config.yml'), this.destinationPath('cli-config.yml'), this.options);
    this.fs.copyTpl(this.templatePath('Dockerfile'), this.destinationPath('Dockerfile'), this.options);
    this.fs.copyTpl(this.templatePath('Dockerfile-tools'), this.destinationPath('Dockerfile-tools'), this.options);
    this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), this.options);
    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), this.options);
    this.fs.copyTpl(this.templatePath('run-dev'), this.destinationPath('run-dev'), this.options);
    this.fs.copyTpl(this.templatePath('run-debug'), this.destinationPath('run-debug'), this.options);

    // if project will have swagger doc, ensure swagger ui and api route
    if ( this.options.genSwagger ) {
      this.fs.copy(this.templatePath('public/swagger-ui'), this.destinationPath('public/swagger-ui'));
      // if open api doc provided, write it else write default

      if ( this.options.loadedApi ) {
        let yaml= this.options.bluemix.openApiServers[0].spec;
        //this.fs.writeJSON('public/swagger.'+this.options.openApiFileType, this.options.loadedApi);
        this.fs.write('public/swagger.'+this.options.openApiFileType, yaml);
      }
      else {
        this.fs.copyTpl(this.templatePath('public/swagger.yaml'), this.destinationPath('public/swagger.yaml'), this.options);
      }
    }
    else {
      this.fs.delete(this.destinationPath('server/routers/swagger.js'));
    }

    // if there is swagger, there is no index page
    if( this.options.genSwagger ) {
      this.fs.delete(this.destinationPath('server/routers/public.js'));
    }

    // Additional scripts for generation via yo
    if(this.options.bluemix.fromYo) {
      this.fs.copyTpl(this.templatePath('idt.js'), this.destinationPath('idt.js'), this.options);
      let packageJSON = this.fs.readJSON(this.destinationPath('package.json'), require('./templates/package.json'));
      Object.assign(packageJSON.scripts, extraScriptForYoGenerated);
      Object.assign(packageJSON.dependencies, extraDependenciesForYoGenerated);
      Object.assign(packageJSON.devDependencies, extraDevDependenciesForYoGenerated);
      this.fs.writeJSON(this.destinationPath('package.json'), packageJSON);
    }

    // Create node_modules_linux, which is used as 
    // a docker mount point source folder. By creating
    // it now, we avoid permission problem later for 
    // 'idt build'. 
    let dir = process.cwd() + '/node_modules_linux';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0o755);
    }
  }

  _sanitizeAppName(name) {
    name = name || 'appname';
    return name.toLowerCase().replace(REGEX_LEADING_ALPHA, '').replace(REGEX_ALPHA_NUM, '');
  }

  // return true if 'sanitized', false if missing, exception if bad data
  _sanitizeOption(options, name) {
    let optionValue = options[name];
    if (!optionValue) {
      logger.error("Missing", name, "parameter");
      return false;
    }

    if (typeof optionValue === "string" && optionValue.indexOf("file:") === 0) {
      let fileName = optionValue.replace("file:", "");
      let filePath = this.destinationPath("./" + fileName);
      logger.info("Reading", name, "parameter from local file", filePath);
      this.options[name] = this.fs.readJSON(filePath);
      return true;
    }

    try {
      this.options[name] = typeof(this.options[name]) === "string" ?
      JSON.parse(this.options[name]) : this.options[name];
      return true;
    } catch (e) {
      logger.error(e);
      throw name + " parameter is expected to be a valid stringified JSON object";
    }
  }
};
