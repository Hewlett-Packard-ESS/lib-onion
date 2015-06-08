'use strict';
describe('Index', function() {
	it('Should expose Onion constructor', function() {
		var index = require('../');
		index.should.have.property('Onion');
		(typeof index.Onion).should.eql('function');
	});
});
