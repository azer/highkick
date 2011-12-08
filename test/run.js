var highkick = require('../lib/highkick'),
    puts = require('sys').puts;

highkick({ 'name':' basic', 'module':require('./main') }, function(error, result){
  if(error) throw error;
});
