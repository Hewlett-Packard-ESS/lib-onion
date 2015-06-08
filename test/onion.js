'use strict';
var Onion = require('../lib/onion');
var should = require('should');

describe('Onion', function() {

	it('Should chain one services result to the next', function(done) {
		var onion = new Onion.Onion('test-onion');
		onion.add(function(msg, next, exit) {
			should.exist(msg);
			should.exist(next);
			should.exist(exit);

			msg.should.eql({
				msg: 'hi'
			});
			msg.msg = 'hi again';
			next(null, msg);
		}, 'service1');

		onion.add(function(msg, next, exit) {
			should.exist(msg);
			should.exist(next);
			should.exist(exit);
			msg.should.eql({
				msg: 'hi again'
			});
			next(null, msg);
		}, 'service2');

		onion.handle({
			msg: 'hi'
		}, function(err, result) {
			should(err).eql(null);
			result.should.eql({
				msg: 'hi again'
			});
			done();
		});
	});

	it('Should not go to the next service if current calls exit', function(done) {
		var onion = new Onion.Onion('test-onion');
		onion.add(function(msg, next, exit) {
			should.exist(msg);
			should.exist(next);
			should.exist(exit);
			msg.should.eql({
				msg: 'hi'
			});
			msg.msg = 'hi again';
			exit(null, msg);
		}, 'service1');

		onion.add(function() {
			done(new Error('This service should never be called!'));
		}, 'service2');

		onion.handle({
			msg: 'hi'
		}, function(err, result) {
			should(err).eql(null);
			result.should.eql({
				msg: 'hi again'
			});
			done();
		});
	});

	it('Should not go to the next service if current returns an error to next', function(done) {
		var onion = new Onion.Onion('test-onion');
		onion.add(function(msg, next, exit) {
			should.exist(msg);
			should.exist(next);
			should.exist(exit);
			next(new Error('omg its all broken'), null);
		}, 'service1');

		onion.add(function() {
			done(new Error('This service should never be called!'));
		}, 'service2');

		onion.handle({
			msg: 'hi'
		}, function(err, result) {
			should(err).not.eql(null);
			should(result).eql(null);
			err.message.should.eql('omg its all broken');
			done();
		});
	});

	it('Should not go to the next service if current returns an error to exit', function(done) {
		var onion = new Onion.Onion('test-onion');
		onion.add(function(msg, next, exit) {
			should.exist(msg);
			should.exist(next);
			should.exist(exit);
			exit(new Error('omg its all broken'), null);
		}, 'service1');

		onion.add(function() {
			done(new Error('This service should never be called!'));
		}, 'service2');

		onion.handle({
			msg: 'hi'
		}, function(err, result) {
			should(err).not.eql(null);
			should(result).eql(null);
			err.message.should.eql('omg its all broken');
			done();
		});
	});

	it('Should not go to the next service if current throws an error', function(done) {
		var onion = new Onion.Onion('test-onion');
		onion.add(function(msg, next, exit) {
			should.exist(msg);
			should.exist(next);
			should.exist(exit);
			throw new Error('omg its all broken');
		}, 'service1');

		onion.add(function() {
			done(new Error('This service should never be called!'));
		}, 'service2');

		onion.handle({
			msg: 'hi'
		}, function(err, result) {
			should(err).not.eql(null);
			should(result).eql(null);
			err.message.should.eql('omg its all broken');
			done();
		});
	});


});
