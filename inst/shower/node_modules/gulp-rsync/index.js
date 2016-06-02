/*jshint strict: false*/

'use strict';

var gutil = require('gulp-util');
var log = require('./log.js');
var path = require('path');
var rsync = require('./rsync.js');
var through = require('through2');

var PluginError = gutil.PluginError;

module.exports = function(options) {
  if (typeof options !== 'object') {
    this.emit(
      'error',
      new PluginError('gulp-rsync', 'options must be an object')
    );
  }

  if (typeof options.destination !== 'string') {
    throw new PluginError(
      'gulp-rsync',
      'destination must be a string to a desired path'
    );
  }

  var sources = [];

  var cwd = options.root ? path.resolve(options.root) : process.cwd();

  return through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit(
        'error',
        new PluginError('gulp-rsync', 'Streams are not supported!')
      );
    }

    if (path.relative(cwd, file.path).indexOf('..') === 0) {
      this.emit(
        'error',
        new PluginError('gulp-rsync', 'Source contains paths outside of root')
      );
    }

    sources.push(file);
    cb(null, file);
  }, function(cb) {
    sources = sources.filter(function(source) {
      return !source.isNull() ||
        options.emptyDirectories ||
        (source.path === cwd && options.recursive);
    });

    if (sources.length === 0) {
      cb();
      return;
    }

    var shell = options.shell;
    if (options.port) {
      shell = 'ssh -p ' + options.port;
    }

    var destination = options.destination;
    if (options.hostname) {
      destination = options.hostname + ':' + destination;
      if (options.username) {
        destination = options.username + '@' + destination;
      }
    } else {
      destination = path.relative(cwd, path.resolve(process.cwd(), destination));
    }

    var config = {
      options: {
        'a': options.archive,
        'n': options.dryrun,
        'R': options.relative !== false,
        'c': options.incremental,
        'd': options.emptyDirectories,
        'e': shell,
        'r': options.recursive && !options.archive,
        't': options.times && !options.archive,
        'u': options.update,
        'v': !options.silent,
        'z': options.compress,
        'chmod': options.chmod,
        'exclude': options.exclude,
        'include': options.include,
        'progress': options.progress,
        'links': options.links
      },
      source: sources.map(function(source) {
        return path.relative(cwd, source.path) || '.';
      }),
      destination: destination,
      cwd: cwd
    };

    if (options.clean) {
      if (!options.recursive && !options.archive) {
        this.emit(
          'error',
          new PluginError('gulp-rsync', 'clean requires recursive or archive option')
        );
      }
      config.options['delete'] = true;
    }

    if (!options.silent) {
      var handler = function(data) {
        data.toString().split('\r').forEach(function(chunk) {
          chunk.split('\n').forEach(function(line, j, lines) {
            log('gulp-rsync:', line, (j < lines.length - 1 ? '\n' : ''));
          });
        });
      };
      config.stdoutHandler = handler;
      config.stderrHandler = handler;

      gutil.log('gulp-rsync:', 'Starting rsync to ' + destination + '...');
    }

    rsync(config).execute(function(error, command) {
      if (error) {
        this.emit('error', new PluginError('gulp-rsync', error.stack));
      }
      if (options.command) {
        gutil.log(command);
      }
      if (!options.silent) {
        gutil.log('gulp-rsync:', 'Completed rsync.');
      }
      cb();
    }.bind(this));
  });
};
