var ChattyBar;

(function ( w, d, undef ) {
  // This is the recursive function used to add a character
  function addCharacter( _this, str, speed, callback, index, userCallback ) {
    var titleValue = _this.get(),
        titleLength = titleValue.length;
    
    // Setting the d.title to 'How ' would result in 'How'
    // So spaces would create a infinite loop
    var isBlankSpace = str.charAt( titleLength ) === ' ',
        stripAt = isBlankSpace ? titleLength + 2 : titleLength + 1,
        newValue = str.substr( 0, stripAt );
    
    //console.log( str.substr( 0, titleValue.length + 1 ) );
    //console.log( titleValue.length + 1 );
    
    _this.set( newValue );
    if( newValue.length < str.length ) {
      // If the word is not completly typed
      setTimeout( function () {
        addCharacter( _this, str, speed, callback, index, userCallback );
      }, speed );
    } else {
      // Otherwise call the callback function
      if( typeof callback === 'function' ) {
        callback( _this );
      }
    }
  }
  
  ChattyBar = {
    defaults: {
      speed: 300
    },
    
    set: function ( str ) {
      d.title = str;
      
      return this;
    },
    
    get: function () {
      return d.title;
    },
    
    say: function ( str, speed, callback, index, userCallback ) {
      var _this = this,
          defaults = _this.defaults;
      
      if( typeof speed === 'function' ) {
        callback = speed;
        speed = defaults.speed;
      }
      
      if( typeof speed !== defaults.speed ) {
        speed = defaults.speed;
      }
      
      if( str instanceof Array ) {
        if( !index ) index = 0;
        
        var arrayOfStr = str;
        str = arrayOfStr[ index ];
        
        if( !str ) {
          if( typeof userCallback === 'function' )
             userCallback( _this );
          else
            return _this;
        }
        
        index++;
        callback = function () {
          setTimeout( function () {
            _this.say( arrayOfStr, speed, callback, index, userCallback );
          }, speed * 4 );
        };
      }
      
      // Empty the current title to init
      _this.set( '' );
      
      // Call the recursive function
      addCharacter( _this, str, speed, callback, index, userCallback );
      
      return _this;
    }
  }
}( window, document ));