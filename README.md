## geocodemany

given an array of objects and a transform into a geocodable string, geocode
them if possible.

### example

```js
var data = [{
    city: 'Chester',
    state: 'New Jersey'
}, {
    city: 'Washington',
    state: 'DC'
}];

function transform(obj) {
    return obj.city + ', ' + obj.state;
}

function progress() {
    console.log(arguments);
}

function done() {
    console.log(arguments);
}

var geocoder = geocodemany('tmcw.map-u4ca5hnt');

geocoder(data, transform, progress, done);
```
