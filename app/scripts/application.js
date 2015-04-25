'use strict';

function Application( options ) {
  this.infoLayer = null;
  this.scene = null;

  this.defaults = {
  };

  this.settings = _.extend(this.defaults, options);

  $(document).ready( this.init.bind( this ) );
}

Application.prototype = {
  init: function() {

    // create info layer
    this.infoLayer = new InfoLayer();

    // create scene
    this.scene = new Scene();
    this.scene.delegate = this;

    // window resize
    $(window).resize( this.resize.bind(this) );
  },

  resize: function() {
    if(this.infoLayer)
      this.infoLayer.resize();
  },

  tick: function() {
    this.scene.animate();
    this.infoLayer.animate();

    this.scene.render();
    this.infoLayer.render();
  },

  onSceneLoadComplete: function() {

    // add mouse move listener
    $('body').mousemove( function() {
      event.preventDefault();
      this.scene.mousemove( event );
      this.infoLayer.mousemove( event );
    }.bind( this ) );

    // click handler
    $('#info-box #info-next').click( function() {
      this.scene.next();
    }.bind( this ) );

    // init animation ticker
    TweenMax.ticker.fps(60);
    TweenMax.ticker.addEventListener( 'tick', this.tick.bind( this ) );
  },

  onSceneEgoPositionUpdate: function(position) {
    this.infoLayer.setOrigin( position.x, position.y );
  }
};