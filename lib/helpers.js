/*
 * Copyright IBM Corporation 2016-2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'


// take a swagger path and convert the parameters to express format.
// i.e. convert "/path/to/{param1}/{param2}" to "/path/to/:param1/:param2"
exports.reformatPathToNodeExpress = (path) => path.replace(/{/g, ':').replace(/}/g, '')

exports.resourceNameFromPath = function (path) {
	// grab the first valid element of a path (or partial path) and return it.
	return path.match(/^\/*([^/]+)/)[1]
}
