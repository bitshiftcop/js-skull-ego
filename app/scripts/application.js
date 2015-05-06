'use strict';

function Application( options ) {

  // setting default values
  this.defaults = {
    debug: true
  };

  // merge with constructor
  this.settings = _.extend(this.defaults, options);

  // variables
  this.sound = null;
  this.infoLayer = null;
  this.scene = null;

  // audioprocess nodes
  this.audioScriptNode = null;

  // load statusses
  this.soundLoaded = false;
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

    if (!Detector.webgl) {
      $('html').addClass('no-advanced-webgl');
      return;
    }

    // active color scheme
    this.activeColorScheme = this.colorSchemes[Math.round(Math.random() * (this.colorSchemes.length - 1))];

    this.sound = new buzz.sound("audio/crackle.mp3", {preload:true, autoplay:false, loop:true, volume:100});
    this.sound.bind('loadeddata', function(){
      this.soundLoadComplete();
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

  soundLoadComplete: function() {
    this.soundLoaded = true;
    this.verifyAssetLoad();
  },

  verifyAssetLoad: function() {
    if( this.soundLoaded && this.sceneLoaded )
      this.start();
  },

  start: function() {

    // resize once to trigger sizing logic
    this.resize();

    // start sound
    this.sound.play();
    if(this.settings.debug)
      this.sound.mute();

    // create analyzers
    this.monitorVolume();

    // trigger next info logic once
    this.infoLayer.triggerNextInfo();

    // add mouse move listener
    $('body').mousemove( function() {
      event.preventDefault();
      this.scene.mousemove( event );
      this.infoLayer.mousemove( event );
    }.bind( this ) );

    // add windows focus/blur listener
    $(window).on("blur focus", function(e) {
      var prevType = $(this).data("prevType");

      if (prevType != e.type) {   //  reduce double fire issues
        switch (e.type) {
          case "focus":
            if(this.sound)
              this.sound.fadeTo(100, 500);
            break;
        }
      }

      $(this).data("prevType", e.type);
    }.bind( this ));

    // init animation ticker
    TweenMax.ticker.fps(60);
    TweenMax.ticker.addEventListener( 'tick', this.tick.bind( this ) );
  },

  resize: function() {
    if(this.infoLayer)
      this.infoLayer.resize();
  },

  monitorVolume: function() {

    var AudioContext = (window.AudioContext ||
      window.webkitAudioContext ||
      window.mozAudioContext ||
      window.oAudioContext ||
      window.msAudioContext);

    var context = new AudioContext();

    // setup a javascript node
    this.audioScriptNode = context.createScriptProcessor(2048, 1, 1);
    this.audioScriptNode.connect(context.destination);

    // setup a analyzer
    var analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    analyser.connect(this.audioScriptNode);

    var sourceNode = context.createMediaElementSource(this.sound.sound);
    sourceNode.connect(analyser);
    sourceNode.connect(context.destination);

    this.audioScriptNode.onaudioprocess = function() {
      this.processAudioFrame(analyser);
    }.bind( this );
  },

  processAudioFrame: function(analyser) {

    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    var average = this.getAverageVolume(array)
    this.scene.updateOpacity(average / 100);
  },

  getAverageVolume: function(array) {
    var values = 0,
      average,
      length = array.length;
    for (var i = 0; i < length; i++)
      values += array[i];
    return values / length;
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

  onInfoLayerLinkClicked: function() {
    if(this.sound)
      this.sound.fadeTo(0, 250);
  },

  onSceneLoadComplete: function() {
    this.sceneLoaded = true;
    this.verifyAssetLoad();
  },

  onSceneEgoPositionUpdate: function(position) {
    this.infoLayer.setOrigin( position.x, position.y );
  }
};