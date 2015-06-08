# lib-onion 

Pipelining with early exit option.  Similar to async.waterfall however with the ability to exit out of the waterfall at any point.

The key features are:
  * The ability to exit out of the pipeline early, without error, by calling exit.
  * Clear debugging ability as to which service is being executed with `DEBUG=onion:*`
  * A dynamic number of arguments can flow down the pipeline, next and exit will just be appended to the end.


## Getting Started
Install the module with: `npm install lib-onion`

From there, define your pipeline:
```javascript
var Onion = require('lib-onion');
var onion = new Onion('my-onion');

onion.add(function(msg, next, exit) {
	msg.touchedByService1 = true;
	next(null, msg);
}, 'service1');

onion.add(function(msg, next, exit) {
	console.log(msg.touchedbyservice1); // === true
	exit(null, msg);
}, 'service2');

onion.add(function(msg, next, exit) {
	console.log('Ill never get called in this example');	
}, 'service3');

```
And finally, execute it:
```javascript
onion.handle(yourInputObject, function(err, result) {
	console.log(result); // === true
});
```

There are a bunch more examples in the tests/ folder.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 Initial Release
0.1.1 Simplified the entry point

## License
Copyright (c) 2015 Hewlett-Packard 
Licensed under the MIT license.
