'use strict';
var async = require('async');
var _ = require('lodash');

var Onion = function(onionName) {
	var SimpleOnionWrapper = function(service, name) {
		var handler = function() {
			service.handle.apply(null, arguments);
		};
		Object.defineProperty(handler, 'serviceName', {
			value: name
		});
		return handler;
	};

	var self = {};
	var actions = [];
	var debug = require('debug')('onion:' + onionName);
	debug('Onion created');

	// Handler should have the signiture of
	// handler(msg, next, exit);
	self.add = function(handler, name) {
		debug(name, 'added');
		Object.defineProperty(handler, 'serviceName', {
			value: name
		});
		actions.push(handler);
		return self;
	};

	// This method is to wrap older service which expose .handle
	self.addSimple = function(service, name) {
		self.add(new SimpleOnionWrapper(service, name), name);
	};

	self.handle = function(originalMsg, exit) {
		debug('Peeling the Onion', originalMsg);

		// Wrap exit in some debug messages
		var exitHandler = exit;
		exit = function() {
			debug('Peeling Complete, however exited early');
			exitHandler.apply(null, arguments);
		};
		var mappedActions = _.map(actions, function(action) {
			return function() {
				// This receives N number of arguments, plus next() and exit()
				debug(action.serviceName, 'calling handler');
				// The last argument here, is next, which is appended by async.waterfall
				// We want to append our exit
				[].push.call(arguments, exit);

				// Now we want to override the next, and exit functions
				// to add our logging capability
				var nextHandler = arguments[arguments.length - 2];
				var exitHandler = arguments[arguments.length - 1];

				arguments[arguments.length - 2] = function() {
					if (arguments[0]) {
						debug(action.serviceName, arguments[0]);
					} else {
						debug(action.serviceName, 'next called');
					}
					nextHandler.apply(null, arguments);
				};

				arguments[arguments.length - 1] = function() {
					if (arguments[0]) {
						debug(action.serviceName, arguments[0]);
					} else {
						debug(action.serviceName, 'exit called');
					}
					exitHandler.apply(null, arguments);
				};

				try {
					action.apply(null, arguments);
				} catch (ex) {
					debug(action.serviceName, 'caught error', ex.stack);
					exit(ex, null);
				}
			};
		});

		async.waterfall([
			function(next) {
				next(null, originalMsg);
			}
		].concat(mappedActions), function(err, result) {
			if (!err) {
				debug('Peeling Complete');
			} else {
				debug('Onion is rotten: ' + err.stack);
			}
			exit(err, result);
		});
	};

	return self;
};

module.exports = {
	Onion: Onion
};
