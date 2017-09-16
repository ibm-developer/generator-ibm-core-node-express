if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

// Array of lines that contains locations of removed markers
var markers = [];

module.exports = {

  preprocess: function(text) {
    markers = [];
    // Break text into lines and create final lines array
    var lines = text.split(/\r?\n/);
    var finalLines = []

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Create array of marker locations and for each marker to remove
      var locations = [];
      ['<%= ', '<% ', ' %>'].forEach(function(token) {

        // Set width to the marker length
        var width = token.length
        // Start column at 0 always
        var column = 0;

        // Break line into pieces by marker
        var pieces = line.split(token);
        for (var j = 0; j < pieces.length; j++) {
          var piece = pieces[j];

          // Set column at start of marker and add to locations
          column += piece.length;
          locations.push({
            column: column,
            width: width
          });

          // Add marker to column
          column += width;
        }
      });
      // Locations neeed to be sorted by column
      locations.sort(function(left, right) {
        left.column <= right.column;
      });

      // Add locations to lines array
      markers.push(locations);

      // Create final line that removes all markers
      finalLines.push(line.split(/\<\%\= |\<\% | \%\>/).join(''));
    }

    // Join all lines back into one string that is sent in an array structure
    return [finalLines.join('\n')];
  },

  postprocess: function(nestedMessages) {
    var messages = nestedMessages[0];

    // Transform columns on all messages
    return messages.map(function(message) {
      // Get line of message
      var line = message.line;
      var copy = Object.assign({}, message);
      // If marker location is to the left of the message, then increment the
      // message column by the marker width
      markers[line].forEach(function(removed) {
        if (removed.column <= copy.column) {
          copy.column += removed.width;
        }
      });
      return copy;
    });
  }
}
