(function ( w, d, $, undef ) {
  'use strict';
  
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
  
  function stripSpaces ( str ) {
    return str.replace( /\s|&nbsp;|<br>/gi, '' );
  }
  
  function checkElementValue ( $element ) {
    if( stripSpaces( $element.html() ).length > 0 ) {
      $element
        .removeClass( 'js-show-placeholder' )
        .removeClass( 'js-pristine' );
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