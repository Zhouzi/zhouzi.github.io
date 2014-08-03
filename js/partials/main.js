(function ( w, d, $, undef ) {
  'use strict';
  
  function isEmail ( email ) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test( email );
  }
  
  var $nEmail     = $( '#newsletter-email' ),
      $nFirstname = $( '#newsletter-firstname' ),
      $nLastname  = $( '#newsletter-lastname' ),
      $nButton    = $( '#newsletter-button' );
  
  function checkValidity ( elements, $button ) {
    var isValid = true,
        $elements = $( elements );
    
    $elements.each( function () {
      var $this = $( this );
      
      if( $this.hasClass( 'input__error' ) || $this.val().length === 0 ) {
        isValid = false;
        return false;
      }
    } );
    
    if( isValid )
      $button.attr( 'disabled', false );
    else
      $button.attr( 'disabled', true );
    
    return isValid;
  }
  
  $nEmail.on( 'keypress', function () {
    var $this = $( this );
    
    if( !isEmail( $this.val() ) ) {
      $this
        .removeClass( 'input__valid' )
        .addClass( 'input__error' );
    } else {
      $this
        .removeClass( 'input__error' )
        .addClass( 'input__valid' );
    }
    
    checkValidity( [ $nEmail, $nFirstname, $nLastname ], $nButton );
  } );
  
  $( [ $nFirstname, $nLastname ] ).each( function () {
    var $this = $( this );
    
    $this.on( 'keypress', function () {
      if( $this.val().length < 2 ) {
        $this
          .removeClass( 'input__valid' )
          .addClass( 'input__error' );
      } else {
        $this
          .removeClass( 'input__error' )
          .addClass( 'input__valid' );
      }

      checkValidity( [ $nEmail, $nFirstname, $nLastname ], $nButton );
    } );
  } );
  
  $( '#newsletter-button' ).on( 'click', function () {
    if( $( this ).attr( 'disable' ) === 'true' ) {
      return false;
    }
    
    var email = $( '#newsletter-email' ).val(),
        firstname = $( '#newsletter-firstname' ).val(),
        lastname = $( '#newsletter-lastname' ).val();
    
    function showMsg ( $element ) {
      $element.addClass( 'show' );
      
      setTimeout( function () {
        $element.removeClass( 'show' );
      }, 3000 );
    }
    
    $.ajax({
        type: 'GET',
        url: 'http://api.gabinaureche.com/newsletter/subscribe.php',
        data: { email: email, firstname: firstname, lastname: lastname },
        crossDomain: true
      })
      .success( function ( data ) {
        if( data === 'nope' ) {
          showMsg( $( '#newsletter-error' ) );
        }
        
        data = JSON.parse( data );
        if( data.error_count > 0 ) {
          showMsg( $( '#newsletter-error' ) );
        } else {
          showMsg( $( '#newsletter-success' ) );
        }
      } )
      .fail( function () {
        showMsg( $( '#newsletter-error' ) );
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
  /*
  function rand ( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min; 
  };
  
  function rollChattyBar ( wordList ) {
    if( rand( 0, 4 ) === 0 ) {
      var word = wordList[ rand( 0, wordList.length - 1 ) ];
      
      while( word === document.title )
        word = wordList[ rand( 0, wordList.length - 1 ) ];
      
      ChattyBar.say( word, 200, function () {
        setTimeout( function () {
          rollChattyBar( wordList );
        }, 1000 );
      } );
    } else {
      setTimeout( function () {
        rollChattyBar( wordList );
      }, 1000 );
    }
  }
  
  var chattybarWords = [ 'Bonjour!', 'How are you?', 'Wassup?', 'Glad to see u there', 'hello@gabinaureche.com', 'Gabin Aureche, UX Front-End Developer' ];
  rollChattyBar( chattybarWords );*/
  /*
  ChattyBar.say( [ 
    'Bonjour!', 
    'Glad to see u there :)', 
    'Gabin Aureche, UX Front-End Developer' 
  ], 200 );
  */
  
  // TypeJS
  function launchTypeJS ( tjs, speed ) {
    tjs.toggle( function () {
      
      setTimeout( function () {
        launchTypeJS( tjs, speed );
      }, speed );
      
    } );
  }
  
  var tjs = typejs( d.getElementById( 'typejs' ) ).config( {
    typeIn : { random: true }
  } );
  
  setTimeout( function () {
    launchTypeJS( tjs, 1000 );
  }, 2000 );
  
  /*
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
  */
}( window, document, $ ))