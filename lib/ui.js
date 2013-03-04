var style     = require('style'),
    fs        = require('fs'),
    tty       = require('tty'),
    basename = require('path').basename,
    isEnabled = require('./is-enabled');

module.exports = {
  ok                 : ok,
  fail               : fail,
  format             : format,
  logger             : logger,
  multiple           : multiple,
  newPrintTestResult : newPrintTestResult
};

function format(text/*, styles */){
  if( !tty.isatty(2) ) {
    return text;
  }

  var out = String(text),
      i = 0;

  while( ++i < arguments.length ){
    out = style[ arguments[i] ](out);
  }

  return out;
};

function logger(testsuite){
  return function log(msg){
    if(testsuite.options.silent && !isEnabled(testsuite.options.name, process.env.VERBOSE)) {
      return;
    };

    process.stdout.write('    ' + msg);
    process.stdout.write('\n');
  };
}

function newPrintTestResult(testsuite){
  return function printTestResult(test, caption){
    var duration = (+(new Date) - test.startTS)/1000;

    testsuite.log(format(caption, 'bold')
                + '  '
                + format(test.testName, 'bold', 'yellow')
                + format(' (', 'grey')
                + format(testsuite.title, 'bold')
                + format(', ', 'grey')
                + format(test.line + '/' + testsuite.len, 'bold')
                + format(', ', 'grey')
                + format(( duration + 's'), 'white', 'bold')
                + format(') ', 'grey'));
  };
};

function ok(test, testsuite, callback){
  testsuite.endTest(test);
  callback();
}

function fail(test, testsuite, error, callback){
  error.skipEnding || testsuite.endTest(test);

  testsuite.fail++;
  testsuite.log('');
  testsuite.log(format(test.prettyName || test.testName, 'bold'));

  if( !error || !error.stack){
    console.error(error);
    callback && callback();
    return;
  }

  if(error.skipErrorStack){
    printErrorSummary(test, testsuite, error);
    callback && callback();
    return;
  }

  printErrorStack(test, testsuite, error, callback);
}

function multiple(test, testsuite){
  var err = new Error('done() called multiple times');
  err.skipErrorStack = true;
  err.skipEnding = true;
  fail(test, testsuite, err);
}

function printErrorSummary(test, testsuite, error){
  testsuite.log(format(error.message, 'bold', 'red'));
}

function printErrorStack(test, testsuite, error, callback){
  var line   = error.stack.match(/\(([^\(\)]+)\)/)[1].split(':'),
      path   = line[0],
      num    = Number(line[1]),

      stack  = error.stack.split('\n'),
      message = stack[0],
      output = [ format(message, 'bold', 'red') + format(' ' + basename(path) + ':' + num, 'grey') ];

  fs.readFile(path, function(error, buffer){
    if(!error){
      buffer.toString()
        .split('\n')
        .slice(num-2, num+1)
        .forEach(function(el, ind){

          if( ind == 1 ){
            output.push( '  ' + format( num + '. ' + el, 'white', 'bold') );
          } else {
            output.push( '  ' +  format( ( num + ind - 1) + '. ' + el) );
          }

        });
    };

    output.push('');
    output.push.apply(output, stack);

    output.forEach(function(line){
      ( testsuite || console ).log('  '+format(line, 'grey'));
    });

    callback && callback();
  });
}
