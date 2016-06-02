'use strict';

var assert = require('better-assert');
var every = require('lodash.every');
var isString = require('lodash.isstring');
var spawn = require('child_process').spawn;

function rsync(config) {
  if (!(this instanceof rsync)) {
    return new rsync(config);
  }

  assert(typeof config === 'object');
  assert(!config.options || typeof config.options === 'object');
  this._options = config.options || {};
  var sources = config.source;
  if (!Array.isArray(sources)) {
    sources = [sources];
  }
  assert(sources.length > 0 && every(sources, isString));
  assert(sources.length === 1 || config.destination);
  this._sources = sources;
  assert(!config.destination || typeof config.destination === 'string');
  this._destination = config.destination;
  assert(!config.cwd || typeof config.cwd === 'string');
  this._cwd = config.cwd;
  assert(!config.stdoutHandler || typeof config.stdoutHandler === 'function');
  this._stdout = config.stdoutHandler;
  assert(!config.stderrHandler || typeof config.stderrHandler === 'function');
  this._stderr = config.stderrHandler;

  return this;
}

rsync.prototype = {
  command: function() {
    var args = [];

    var shortOptions = [];
    var longOptions = [];

    for (var key in this._options) {
      var value = this._options[key];
      if (typeof value !== 'undefined' && value !== false) {
        if (key.length === 1 && value === true) {
          shortOptions.push(key);
        } else {
          var values = Array.isArray(value) ? value : [value];
          for (var i = 0, l = values.length; i < l; i++) {
            longOptions.push({key: key, value: values[i]});
          }
        }
      }
    }

    if (shortOptions.length > 0) {
      args.push('-' + shortOptions.join(''));
    }

    if (longOptions.length > 0) {
      args = args.concat(longOptions.map(function(option) {
        var single = option.key.length === 1;
        var output = (single ? '-' : '--') + option.key;
        if (typeof option.value !== 'boolean') {
          output += (single ? ' ' : '=') + escapeShellArg(option.value);
        }
        return output;
      }));
    }

    args = args.concat(this._sources.map(escapeShellArg));

    if (this._destination) {
      args.push(escapeShellArg(this._destination));
    }

    return 'rsync ' + args.join(' ');
  },

  execute: function(callback) {
    var command = this.command();

    var childProcess;
    if (process.platform === 'win32') {
      childProcess = spawn('cmd.exe', ['/s', '/c', '"' + command + '"'], {
        cwd: this._cwd,
        stdio: [process.stdin, 'pipe', 'pipe'],
        env: process.env,
        windowsVerbatimArguments: true
      });
    } else {
      childProcess = spawn('/bin/sh', ['-c', command], {
        cwd: this._cwd,
        stdio: 'pipe',
        env: process.env
      });
    }

    if (this._stdout) {
      childProcess.stdout.on('data', this._stdout);
    }

    if (this._stderr) {
      childProcess.stderr.on('data', this._stderr);
    }

    childProcess.on('close', function(code) {
      var error = null;
      if (code !== 0) {
        error = new Error('rsync exited with code ' + code);
      }

      if (typeof callback === 'function') {
        callback(error, command);
      }
    });

    return childProcess;
  }
};

function escapeShellArg(arg) {
  if (!/(["'`\\ ])/.test(arg)) {
    return arg;
  }
  arg = arg.replace(/([\\])/g, '/');
  return '"' + arg.replace(/(["'`\\])/g, '\\$1') + '"';
}

module.exports = rsync;
