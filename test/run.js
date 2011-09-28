var highkick = require('../lib/highkick'),
    tests = require('./tests'),
    puts = require('sys').puts;

highkick({ 'module':tests }, function(error, result){
  if(error) throw error;
  puts('====');
  puts('Ran '+result.len+' tests '  + ( result.fail ? 'with ' + result.fail + ' fail.' : 'without any error.') );
});
