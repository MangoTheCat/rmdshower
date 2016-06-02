'use strict';

var expect = require('chai').expect;
var rsync = require('../rsync');

var AssertionError = require('assert').AssertionError;

require('mocha');

describe('gulp-rsync rsync command generator', function() {
  it('should throw with no config', function() {
    expect(function() {return rsync();}).to.throw();
  });

  it('should throw with no sources', function() {
    expect(function() {return rsync({});}).to.throw();
  });

  it('should work with a single source', function() {
    expect(
      rsync({source: 'source with spaces'}).command()
    ).to.equal('rsync "source with spaces"');
  });

  it('should work with a single source and a destination', function() {
    expect(
      rsync({source: 'src', destination: 'destination with spaces'}).command()
    ).to.equal('rsync src "destination with spaces"');
  });

  it('should work with multiple sources and a destination', function() {
    expect(
      rsync({source: ['src1', 'src2'], destination: 'dest'}).command()
    ).to.equal('rsync src1 src2 dest');
  });

  it('should throw with invalid sources', function() {
    expect(function() {return rsync({source: true});}).to.throw();
    expect(function() {return rsync({source: [1, 2]});}).to.throw();
  });

  it('should throw with multiple sources and no destination', function() {
    expect(function() {return rsync({source: ['src1', 'src2']});}).to.throw();
  });

  it('should work with basic options', function() {
    expect(
      rsync({
        options: {
          'r': true,
          'v': true,
          'delete': true
        },
        source: 'src',
        destination: 'dest'
      }).command()
    ).to.equal('rsync -rv --delete src dest');
  });

  it('should work with options with values', function() {
    expect(
      rsync({
        options: {
          'r': true,
          'e': 'ssh',
          'exclude': ['.git', 'name with spaces'],
        },
        source: 'src',
        destination: 'dest'
      }).command()
    ).to.equal('rsync -r -e ssh --exclude=.git --exclude="name with spaces" src dest');
  });

  it('should accept a working directory as a string only', function() {
    expect(rsync({source: 'src', cwd: 'cwd'}).command()).to.equal('rsync src');
    expect(function() {
      return rsync({source: 'src', cwd: []});
    }).to.throw();
  });

  it('should accept a stdout/stderr handlers as functions only', function() {
    expect(
      rsync({
        source: 'src',
        stdoutHandler: function() {},
        stderrHandler: function() {}
      }).command()).to.equal('rsync src');

    expect(function() {
      return rsync({source: 'src', stdoutHandler: true});
    }).to.throw();

    expect(function() {
      return rsync({source: 'src', stderrHandler: true});
    }).to.throw();
  });

});
