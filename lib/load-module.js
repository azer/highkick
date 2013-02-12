var vm          = require('vm'),
    fs          = require('fs'),
    path        = require('path'),
    chai        = require('chai'),
    requireLike = require('require-like'),
    bdd         = require('./bdd'),
    mocks       = {};

module.exports = loadModule;

function it(module){
  return function self(title, fn){
    var fullTitle = (self.caller.title && (self.caller.title + ' ') || '') + title;
    bdd.it(module, fullTitle, fn);
  };
}

function kick(relative){
  return function(a, r, g, s){
    var args = arguments;
    args[0] = resolveModule(relative, args[0]);
    return require('./index').apply(null, arguments);
  };
}

function loadModule(filename){
  var context = newContext(filename);
  vm.runInNewContext(read(filename), context, filename);
  return context.module.exports;
};

function mockRequire(relative){
  var relativeRequire = requireLike(relative);

  return function(module){
    return mocks[module] || relativeRequire(module);
  };
}

function newContext(filename){
  var exports = {},
      module  = { exports: exports };

  return {
    process       : process,
    console       : console,
    Buffer        : Buffer,
    __filename    : filename,
    __dirname     : path.dirname(filename),
    setTimeout    : setTimeout,
    clearTimeout  : clearTimeout,
    setInterval   : setInterval,
    clearInterval : clearInterval,

    exports       : exports,
    require       : mockRequire(filename),
    module        : module,

    highkick      : kick(filename),
    kick          : kick(filename),
    chai          : chai,
    expect        : chai.expect,
    should        : chai.should,
    assert        : chai.assert,

    describe      : bdd.describe,
    it            : it(module)
  };
}

function read(filename){
  if(!/\.js$/.test(filename))
    filename += '.js';

  return fs.readFileSync(filename);
}

function resolveModule(relative, module) {
  if (module.charAt(0) !== '.') return module;
  return path.resolve(path.dirname(relative), module);
};
