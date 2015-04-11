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


    // add mouse move listener
    $('body').mousemove( function() {
      this.scene.mousemove( event );
    }.bind( this ) );

  },
};