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