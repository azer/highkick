describe('foo', function(){
  describe('Oo', function(){
    it('bar', function(done){
      done();
    });

    it('qux', function(done){
      done();
    });
  });
});

it('should pass', function(){});

it('doesnt fail', function(done){
  setTimeout(done, 1000);
});

it('fails', function(done){
  done(new Error('fail'));
});

it('timeouts', function(done){
});
