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