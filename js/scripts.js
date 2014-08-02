/*
 * Type.js - 0.2.0
 * Author: Gabin Aureche @Zhouzi
 */

var typejs;

( function ( w, d, undef ) {
  'use strict';
  
  typejs = function ( selector ) {
    
    // Selector is supposed to be a string
    // Otherwise it is considered as an element
    var element = typeof selector === 'string' ? d.querySelector( selector ) : selector;
    
    var options = {
      typeOut : { speed : 100 },
      typeIn  : { speed : 100, random : false }
    };
    
    // Modify the options
    function config ( options ) {
      var _defaults = this.options;
      
      if( options.typeOut !== undef ) {
        for( var key in options.typeOut )
          _defaults.typeOut[ key ] = options.typeOut[ key ];
      }
      
      if( options.typeIn !== undef ) {
        for( var key in options.typeIn )
          _defaults.typeIn[ key ] = options.typeIn[ key ];
      }
      
      this.options = _defaults;
      
      return this;
    };
    
    // Return a random number between min and max
    function rand ( min, max ) {
      return Math.floor( Math.random() * ( max - min + 1 ) ) + min; 
    };
    
    // Return the element's inner text
    function text ( element, textToSet ) {
      if( typeof textToSet === 'string' ) {
        if( element.textContent )     element.textContent = textToSet;
        else if( element.innerText )  element.innerText   = textToSet;
        else                          element.innerHTML   = textToSet;
        
        return text( element );
      }
      
      return element.textContent || element.innerText || element.innerHTML;
    }
    
    // typeOut delete the current text
    function typeOut ( callback ) {
      var element   = this.element,
          speed     = this.options.typeOut.speed,
          _intervalId;
      
      // Remember the element's text since it is going to be erased
      element.setAttribute( 'data-typejs-oldtext', text( element ) );
      
      // Remove a char every 'speed' time
      _intervalId = setInterval( function () {
        var currentText = text( element ),
            textLength  = currentText.length,
            newText     = currentText.substr( 0, textLength - 1 );
        
        text( element, newText );
        
        // If the text is fully erased
        if( newText.length <= 0 ) {
          clearInterval( _intervalId );
          
          // Call user's callback
          if( typeof callback === 'function' )
            callback( element );
        }
      }, speed );
      
      return this;
    };
    
    // Type the new text
    function typeIn ( callback ) {
      var element       = this.element,
          speed         = this.options.typeIn.speed,
          oldText       = element.getAttribute( 'data-typejs-oldtext' ),
          textList      = element.getAttribute( 'data-typejs' ).split( ';' ),
          newText, _intervalId;
      
      if( this.options.typeIn.random ) {
        newText = textList[ rand( 0, textList.length - 1 ) ];
      } else {
        var oldTextIndex  = textList.indexOf( oldText );
        newText       = textList[ oldTextIndex + 1 ] === undef ? textList[ 0 ] : textList[ oldTextIndex + 1 ];
      }
      
      // Remove the old text attribute
      element.removeAttribute( 'data-typejs-oldtext' );
      
      // Remember what is the text it is supposed to type
      element.setAttribute( 'data-typejs-newtext', newText );
      
      _intervalId = setInterval( function () {
        var currentText = text( element ),
            fullText    = element.getAttribute( 'data-typejs-newtext' ),
            newText     = fullText.substr( 0, currentText.length + 1 );
        
        text( element, newText );
        
        // If the new text is done typing in
        if( newText === fullText ) {
          clearInterval( _intervalId );
          
          // Clear the next text attribute
          element.removeAttribute( 'data-typejs-newtext' );
          
          // Call user's callback
          if( typeof callback === 'function' )
            callback( element );
        }
      }, speed );
      
      return this;
    };
    
    // first typeOut and then typeIn
    function toggle ( callback ) {
      var _this = this;
      
      _this.typeOut( function () {
        _this.typeIn( callback );
      } );
      
      return this;
    };
    
    return {
      options   : options,
      config    : config,
      element   : element,
      toggle    : toggle,
      typeOut   : typeOut,
      typeIn    : typeIn
    };
  };
} )( this, document );
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
(function ( w, d, $, undef ) {
  'use strict';
  
  function isEmail ( email ) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test( email );
  }
  
  $( '#newsletter-button' ).on( 'click', function () {
    var email = $( '#newsletter-email' ).html(),
        firstname = $( '#newsletter-firstname' ).html(),
        lastname = $( '#newsletter-lastname' ).html();
    
    if( !isEmail( email ) ) {
      // shit happens (not an email)
      return false;
    }
    
    $.ajax({
        type: 'GET',
        url: 'http://api.gabinaureche.com/newsletter/subscribe.php',
        data: { email: email, firstname: firstname, lastname: lastname },
        crossDomain: true
      })
      .success( function ( data ) {
        if( data === 'nope' )
          // shit happens
          
        data = $.parseJSON( data );
        if( data.error_count > 0 ) {
          // shit happens
        } else {
          // yay!
          alert( 'it\s okay!' );
        }
      } )
      .fail( function () {
        // shit happens
      } );
    
    return false;
  } );
  
  /*function selectContent ( element ) {
    var range;
    
    if( range = d.createRange() ) {
      range.selectNodeContents( element );
      w.getSelection().addRange( range );
    } else {
      range = d.body.createTextRange();
      range.moveToElementText( element );
    }
    
    return range;
  }*/
  
  // ChattyBar
  ChattyBar.say( [ 'Bonjour!', 'My name is Gabin.', '(a.k.a Zhouzi)', 'I\'m a young french', 'Front-End Developer', 'Focussed on UX', 'So to make it short...', 'Gabin Aureche, UX Front-End Developer' ] );
  
  // TypeJS
  var tjs = typejs( d.getElementById( 'typejs' ) );
  tjs.toggle();
  
  function stripSpaces ( str ) {
    return str.replace( /\s|&nbsp;|<br>/gi, '' );
  }
  
  function checkElementValue ( $element ) {
    if( stripSpaces( $element.html() ).length > 0 ) {
      $element
        .removeClass( 'js-show-placeholder' )
        .removeClass( 'js-pristine' )
        .addClass( 'js-animate' )
        .css( { minWidth: '' } );
    }
    
    return $element;
  }
  
  var $contentEditables = $( '.e-content-editable' );
  
  $contentEditables
    .addClass( 'js-pristine' )
    .each( function () {
      var $this = $( this ),
          placeholder = $this.attr( 'data-placeholder' );
      
      $this.html( placeholder );
    } )
    .on( 'focus', function ( evt ) {
      var $this = $( this ),
          html = $this.html();
      
      if( html === $this.attr( 'data-placeholder' ) || stripSpaces( html ).length <= 0 ) {
        $this
          .addClass( 'js-show-placeholder' )
          .css( { minWidth: $this.width() } )
          .html( '' );
      }
    } )
    .on( 'blur', function ( evt ) {
      var $this = $( this );
      
      if( stripSpaces( $this.html() ).length <= 0 ) {
        var placeholder = $this.attr( 'data-placeholder' );
        
        $this
          .removeClass( 'js-show-placeholder' )
          .removeClass( 'js-animate' )
          .addClass( 'js-pristine' )
          .html( placeholder )
          .css( { minWidth: '' } );
      }
    } )
    .on( 'keydown', function ( evt ) {
      checkElementValue( $( this ) );
    } )
    .on( 'keyup', function ( evt ) {
      checkElementValue( $( this ) );
    } );
}( window, document, $ ))