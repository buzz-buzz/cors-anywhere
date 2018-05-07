/* eslint-env mocha */
require('./setup');

var createServer = require('../').createServer;
var request = require('supertest');
var path = require('path');
var http = require('http');
var fs = require('fs');
var assert = require('assert');

request.Test.prototype.expectJSON = function (json, done) {
    this.expect(function (res) {
        // Assume that the response can be parsed as JSON (otherwise it throws).
        var actual = JSON.parse(res.text);
        assert.deepEqual(actual, json);
    });
    return done ? this.end(done) : this;
};

request.Test.prototype.expectNoHeader = function (header, done) {
    this.expect(function (res) {
        if (header.toLowerCase() in res.headers) {
            return 'Unexpected header in response: ' + header;
        }
    });
    return done ? this.end(done) : this;
};

var cors_anywhere;
var cors_anywhere_port;

function stopServer(done) {
    cors_anywhere.close(function () {
        done();
    });
    cors_anywhere = null;
}

describe('basic auth', function () {
    before(function () {
        cors_anywhere = createServer();
        cors_anywhere_port = cors_anywhere.listen(0).address().port;
    });

    after(stopServer);

    it('proxy with basic auth', function (done) {
        console.log('-------------------------')
        console.log(process.env.BASIC_PASS)
        console.log(process.env.BASIC_NAME)
        request(cors_anywhere)
            .get('/basic.auth.com')
            .auth(process.env.BASIC_NAME, process.env.BASIC_PASS)
            .expect(200, 'success', done);
    });

    it('proxy with basic auth set in url', function (done) {
        request(cors_anywhere)
            .get('/' + process.env.BASIC_NAME + ':' + process.env.BASIC_PASS + '@basic.auth.com')
            .expect(200, 'success', done);
    });
});
