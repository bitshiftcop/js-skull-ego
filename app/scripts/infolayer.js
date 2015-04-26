'use strict';

function InfoLayer( colorScheme ) {

  // delegate
  this.delegate = null;

  // color
  this.colorScheme = colorScheme;

  // elements
  this.$layer = null;
  this.$canvas = null;
  this.$box = null;

  // canvas stuff
  this.context = null;

  // mouse stuff
  this.mouse = null;

  // origins
  this.egoOrigin = null;
  this.boxOrigin = null;

  // index
  this.index = 0;

  // data
  this.data = [{
    title: '"Title 1"',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eleifend turpis mi, ut imperdiet mi posuere nec. Vestibulum finibus tempor gravida. Aenean lacinia odio et gravida luctus. Nulla posuere vel felis blandit varius.',
    link: 'http://google.com'
  }, {
    title: '"Title 2"',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eleifend turpis mi, ut imperdiet mi posuere nec. Vestibulum finibus tempor gravida. Aenean lacinia odio et gravida luctus. Nulla posuere vel felis blandit varius.',
    link: 'http://google.com'
  }, {
    title: '"Title 3"',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eleifend turpis mi, ut imperdiet mi posuere nec. Vestibulum finibus tempor gravida. Aenean lacinia odio et gravida luctus. Nulla posuere vel felis blandit varius.',
    link: 'http://google.com'
  }];

  // init
  this.init();
}


InfoLayer.prototype = {
  init: function() {
    this.$layer = $( '#info-layer' );
    this.$canvas = $( '#info-canvas' );
    this.$box = $( '#info-box' );

    // set colors
    var filmColor = this.parseColor(this.colorScheme.film);
    var wireColor = this.parseColor(this.colorScheme.wire);

    //this.$box.css('background-color', this.convertHexToRgba(filmColor, 75));
    //this.$box.css('border-color', this.convertHexToRgba(filmColor, 85));
    //this.$box.css('color', 'rgba(255, 255, 255, 0.5)');


    // get canvas context
    this.context = this.$canvas[ 0 ].getContext( '2d' );

    // positioning stuff
    this.mouse = new THREE.Vector2();
    this.egoOrigin = new THREE.Vector2();
    this.boxOrigin = new THREE.Vector2();

    // next click handler
    this.$box.find( '#next' ).click( function() {
      this.triggerNextInfo();
    }.bind( this ) );
  },

  parseColor: function(color) {
    if (typeof color === 'number')
      color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
    return color;
  },

  convertHexToRgba: function(hex, opacity){
    hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity/100 + ')';
  },

  triggerNextInfo:function() {
    if(this.delegate && this.delegate.onInfoLayerShowNext)
      this.delegate.onInfoLayerShowNext();

    TweenMax.to(
      this.$layer, 0.25, {
        alpha:0,
        onComplete:function() {
          this.index += 1;
          this.updateInfo();
        }.bind( this )
      }
    );

    TweenMax.to(
      this.$layer, 1, {
        delay:1.5,
        alpha:1,
        ease:Power3.easeOut
      }
    );
  },

  updateInfo: function() {
    var data = this.data[this.index % this.data.length];

    this.$box.find('h1').html(data.title);
    this.$box.find('#desc').html(data.desc);
    this.$box.find('a').attr('href', data.link);
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
        x:( $(window).width() * 2 / 3 ) - ( this.mouse.x * 50 ),
        y:( $(window).height() * 2 / 5 ) + ( this.mouse.y * 50 ),
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