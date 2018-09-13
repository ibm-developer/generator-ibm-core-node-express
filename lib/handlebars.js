/*
 © Copyright IBM Corp. 2018
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

const Handlebars = require('handlebars');
const fs = require('fs');
const Path = require('path');

Handlebars.registerHelper('testing', function(route, method, basepath) {
   if (method === 'get') {
	   if (basepath) {
		   return `describe('Testing ${basepath + route}',function(){\n`
	   } else {
		   return `describe('Testing ${route}',function(){\n`
	   }
   }
});

Handlebars.registerHelper('path', function(route, basepath) {
	if (basepath) {
		return `path: '${basepath + route}'`
	} else {
	    return `path: '${route}'`
	}
});

Handlebars.registerHelper('genPublic', function(parsedSwagger, spec) {
	if ( !parsedSwagger &&  (typeof spec === 'undefined' || (typeof spec !== 'undefined' && spec.applicationType !== 'MS' && spec.applicationType !== 'BLANK'))) {
		return `    require('./public')(app);`
	}
});

Handlebars.registerHelper('parsedSwagger', function(parsedSwagger) {

	let finalString = '';
		Object.keys(parsedSwagger.resources).forEach(function (resource) {
			finalString+= `    require('./${resource}')(app, basepath);\n`
		});
		return finalString;

});

Handlebars.registerHelper('errorRoutes', applicationType => {
	if(applicationType !== 'BLANK') {
		return fs.readFileSync(Path.resolve(__dirname, '../app/fragments/error_routes.js'), {encoding: 'utf8'});
	}
});

module.exports = Handlebars;
