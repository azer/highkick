module.exports = isEnabled;

function isEnabled(testName, field){
  var name;

  if(!field){
    return false;
  }

  if(field == '*'){
    return true;
  }

  field = field.toLowerCase();
  testName = testName.toLowerCase();
  name  = testName.replace(/^test_?/,'');

  if( field == name || field == testName ){
    return true;
  }

  field = field.split(',');

  return field.indexOf( name ) > -1 || field.indexOf( testName ) > -1;
};
