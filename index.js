'use strict';

var xhr = require('xhr');
var queue = require('d3-queue').queue;

module.exports = geocodemany;

function geocodemany(accessToken, throttle) {
  throttle = (throttle === undefined) ? 200 : throttle;
  return function(list, transform, progress, callback) {

    var q = queue(1),
      todo = list.length,
      statuses = range(todo).map(function() {
        return undefined;
      }),
      done = 0;

    function range(n) {
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(i);
      return arr;
    }

    function error(err, callback) {
      statuses[done] = false;
      progress({
        todo: todo,
        done: ++done,
        status: 'error',
        statuses: statuses
      });
      setTimeout(function() {
        callback(null, err);
      }, throttle);
    }

    // forgive me
    function copy(o) {
      return JSON.parse(JSON.stringify(o));
    }

    function run(obj, callback) {
      var str = transform(obj);
      var output = copy(obj);

      var options = {
        uri: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(str) + '.json?access_token=' + accessToken,
        method: 'GET',
        withCredentials: false
      };

      xhr(options, function(err, res) {
        if (err) {
          error({
            error: new Error('Location not found'),
            __iserror__: true,
            data: output
          }, callback);
        }

        var data = JSON.parse(res.body);
        if (data && data.features && data.features.length) {

          var ll = data.features[0];
          output.longitude = ll.center[0];
          output.latitude = ll.center[1];
          statuses[done] = true;
          progress({
            todo: todo,
            data: data ? data : {},
            done: ++done,
            status: 'success',
            statuses: statuses
          });
          setTimeout(function() {
            callback(null, output);
          }, throttle);

        } else {
          error({
            error: new Error('Location not found'),
            __iserror__: true,
            data: output
          }, callback);
        }
      });
    }

    function enqueue(obj) {
      q.defer(run, obj);
    }

    list.forEach(enqueue);

    q.awaitAll(function(err, res) {
      if (err) return callback(err);
      callback(res
        .filter(function(r) {
          return r.__iserror__;
        })
        .map(function(r) {
          delete r.__iserror__;
          return r;
        }),
        res.filter(function(r) {
          return !r.__iserror__;
        }));
    });
  };
}
