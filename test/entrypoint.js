'use strict';
describe('Index', function() {
	it('Should expose Onion constructor', function() {
		var index = require('../');
		(typeof index).should.eql('function');
	});
});
