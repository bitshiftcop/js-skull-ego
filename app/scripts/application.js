'use strict';

function Application( options ) {
  this.defaults = {
  };

  this.settings = _.extend(this.defaults, options);

  $(document).ready( this.init.bind( this ) );
}

Application.prototype = {
  init: function() {

    // create scene
    this.scene = new Scene();
    this.scene.delegate = this;

    // add mouse move listener
    $('body').mousemove( function() {
      this.scene.mousemove( event );
    }.bind( this ) );

    // click handler
    $('#info-box').click( function() {
      this.scene.next();
    }.bind( this ) );
  },

  onSceneEgoPositionUpdate: function(position) {
    TweenMax.to($('#info-box'), 0.1, {left:position.x, top:position.y});
  }
};