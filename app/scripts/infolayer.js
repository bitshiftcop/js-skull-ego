'use strict';

function InfoLayer() {
  this.$layer = null;
  this.$canvas = null;
  this.$box = null;

  this.context = null;

  // mouse stuff
  this.mouse = null;

  // origins
  this.egoOrigin = null;
  this.boxOrigin = null;

  // init
  this.init();
  this.resize();
}


InfoLayer.prototype = {
  init: function() {
    this.$layer = $( '#info-layer' );
    this.$canvas = $( '#info-canvas' );
    this.$box = $( '#info-box' );

    this.context = this.$canvas[ 0 ].getContext( '2d' );

    this.mouse = new THREE.Vector2();
    this.egoOrigin = new THREE.Vector2();
    this.boxOrigin = new THREE.Vector2();
  },

  setOrigin: function( x, y ) {
    this.egoOrigin.x = x;
    this.egoOrigin.y = y;
  },

  mousemove: function( event ) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },

  resize: function() {
    this.$canvas.attr( 'width', $(window).width() );
    this.$canvas.attr( 'height', $(window).height() );
  },

  animate: function() {
    TweenMax.to(
      this.boxOrigin, 0.5, {
        x:( $(window).width() * 3 / 4 ) - ( this.mouse.x * 50 ),
        y:( $(window).height() / 2 ) + ( this.mouse.y * 50 ),
        ease:Power3.easeOut
      }
    );
  },

  render: function() {

    this.$box.css({'left': this.boxOrigin.x, 'top':this.boxOrigin.y});

    this.context.clearRect( 0, 0, this.$canvas.width(), this.$canvas.height() );
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.strokeStyle = 'white';
    this.context.moveTo( this.egoOrigin.x, this.egoOrigin.y );
    this.context.lineTo( this.boxOrigin.x, this.boxOrigin.y );
    this.context.stroke();
  }
};