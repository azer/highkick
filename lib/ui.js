var style     = require('style'),
    fs        = require('fs'),
    tty       = require('tty'),
    isEnabled = require('./is-enabled');

module.exports = {
  ok                 : ok,
  fail               : fail,
  format             : format,
  logger             : logger,
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

    process.stdout.write(testsuite.title);
    process.stdout.write(msg);
    process.stdout.write('\n');
  };
}

function newPrintTestResult(testsuite){
  var line = 0;

  return function printTestResult(test, caption){
    if(test.line) {
      testsuite.log(format('WARN ', 'red', 'bold') + format(test.testName, 'bold', 'yellow') + '  has run callback more than once.' );
      return;
    }

    var duration = (+(new Date) - test.startTS)/1000;

    test.line = ++line;

    testsuite.log(format(caption, 'bold')
                + '  '
                + format(test.testName, 'bold', 'yellow')
                + format(' (', 'grey')
                + format(test.line + '/' + testsuite.len, 'bold')
                + format(', ', 'grey')
                + format(( duration + 's'), 'white', 'bold')
                + format(') ', 'grey'));
  };
};

function ok(test, testsuite, callback){
  testsuite.printTestResult(test, format('OK', 'green'));
  callback();
}

function fail(test, testsuite, error, callback){
  testsuite.fail++;
  testsuite.printTestResult(test, format('FAIL', 'red'));

  if( !error || !error.stack){
    console.error(error);
    callback && callback();
    return;
  }

  printErrorStack(test, testsuite, error, callback);
}

function printErrorStack(test, testsuite, error, callback){
  var line   = error.stack.match(/\(([^\(\)]+)\)/)[1].split(':'),
      path   = line[0],
      num    = Number(line[1]),

      stack  = error.stack.split('\n'),
      message = stack[0],
      output = [ ' ', format('ERROR: ', 'bold', 'red') + message, '       ' + path + ':' + num ];

  fs.readFile(path, function(error, buffer){
    if(!error){
      buffer.toString()
        .split('\n')
        .slice(num-2, num+1)
        .forEach(function(el, ind){

          if( ind == 1 ){
            output.push( '       ' + format( num + '. ', 'bold', 'red') + format(el, 'bold') );
          } else {
            output.push( '       ' +  format( ( num + ind - 1) + '. ' + el) );
          }

        });
    };

    output.push('');
    output.push.apply(output, stack);

    output.forEach(function(line){
      ( testsuite || console ).log(line);
    });

    callback && callback();
  });
}
