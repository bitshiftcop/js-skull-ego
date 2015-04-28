'use strict';

function Application( options ) {

  // setting default values
  this.defaults = {
    debug: true
  };

  // merge with constructor
  this.settings = _.extend(this.defaults, options);

  // variables
  this.seamlessLoop = null;
  this.infoLayer = null;
  this.scene = null;

  // load statusses
  this.seamlessLoopLoaded = false;
  this.sceneLoaded = false;

  // colors
  this.activeColorScheme = null;
  this.colorSchemes = [
    { film: 0x4d00a7, wire: 0x00b3ff, ego: 0xff8700 }, // purple, light blue, orange
    { film: 0xe85f00, wire: 0x0000ff, ego: 0xffffff }, // orange, blue, white
    { film: 0x18cf00, wire: 0x6900ff, ego: 0xd2ff00 }  // geen, purple, yellow-greenish
  ];

  // wait for dom ready event
  $(document).ready( this.init.bind( this ) );
}

Application.prototype = {
  init: function() {

    // active color scheme
    this.activeColorScheme = this.colorSchemes[Math.round(Math.random() * (this.colorSchemes.length - 1))];

    // loop
    this.seamlessLoop = new SeamlessLoop();
    this.seamlessLoop.addUri('audio/crackle.wav', 13586, 'crackle');
    this.seamlessLoop.callback(function(){
      this.seamlessLoopLoadComplete();
    }.bind( this ));

    // create info layer
    this.infoLayer = new InfoLayer( this.settings, this.activeColorScheme );
    this.infoLayer.delegate = this;

    // create scene
    this.scene = new Scene( this.settings, this.activeColorScheme );
    this.scene.delegate = this;

    // window resize
    $(window).resize( this.resize.bind(this) );
  },

  seamlessLoopLoadComplete: function() {
    this.seamlessLoopLoaded = true;
    this.verifyAssetLoad();
  },

  verifyAssetLoad: function() {
    if( this.seamlessLoopLoaded &&
          this.sceneLoaded )
      this.start();
  },

  start: function() {

    // resize once to trigger sizing logic
    this.resize();

    // start sound
    if(!this.settings.debug)
      this.seamlessLoop.start('crackle');

    // trigger next info logic once
    this.infoLayer.triggerNextInfo();

    // add mouse move listener
    $('body').mousemove( function() {
      event.preventDefault();
      this.scene.mousemove( event );
      this.infoLayer.mousemove( event );
    }.bind( this ) );

    // init animation ticker
    TweenMax.ticker.fps(60);
    TweenMax.ticker.addEventListener( 'tick', this.tick.bind( this ) );
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

  onInfoLayerShowNext: function() {
    this.scene.next();
  },

  onSceneLoadComplete: function() {
    this.sceneLoaded = true;
    this.verifyAssetLoad();
  },

  onSceneEgoPositionUpdate: function(position) {
    this.infoLayer.setOrigin( position.x, position.y );
  }
};