var highkick = require('../lib/highkick'),
    mkdir  = require('fs').mkdir;

function clean(callback){
  mkdir('tmp', 0755, function(){
    callback();
  });
}

function run(){
  clean(function(){

    highkick({ 'name':' basic', 'module':require('./main') }, function(error, result){
      if(error) throw error;
    });

  });
}

run();
