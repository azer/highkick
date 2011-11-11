var highkick = require('../lib/highkick'),
    tests = require('./tests'),
    puts = require('sys').puts;

highkick({ 'name':' basic', 'module':tests }, function(error, result){
  if(error) throw error;
});
