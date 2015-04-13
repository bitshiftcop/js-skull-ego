'use strict';

function Scene() {

  // consts
  this.CLEAR_COLOR = 0x000000;
  this.AMBI_LIGHT_COLOR = 0xffffff;
  this.SKULL_FILM_COLOR = 0x41008c;
  this.SKULL_WIRE_COLOR = 0x00a9ff;
  this.EGO_COLOR = 0xd2ff00;

  // delegate
  this.delegate = null;

  // camera, scene, renderer
  this.camera = null;
  this.scene = null;
  this.renderer = null;

  // mouse stuff
  this.mouse = null;

  // objects
  this.skull = null;
  this.skullFilmMesh = null;
  this.skullWireMesh = null;
  this.ego = null;

  // create scene, start animation cycle
  this.createScene( function(){

    // init animation ticker
    TweenMax.ticker.fps(60);
    TweenMax.ticker.addEventListener( 'tick', this.animate.bind( this ) );

  }.bind( this ) );
}


Scene.prototype = {
  createScene: function( callback ) {
    var ambiLight,
      hemiLight,
      dirLight,
      skullFilmMaterial,
      skullWireMaterial,
      egoGeometry,
      egoMaterial,
      skullUrls = [ 'obj/skull.obj', 'obj/skull.mtl' ],
      skullLoader,
      guiParams,
      lightsFolder,
      materialFolder,
      gui;


    // create camera
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 500;
    this.camera.position.y = 25;


    // create scene
    this.scene = new THREE.Scene();


    // create ambi light
    ambiLight = new THREE.AmbientLight( this.AMBI_LIGHT_COLOR );
    //this.scene.add( ambiLight );


    // create hemi light
    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
    this.scene.add( hemiLight );


    // create directional light
    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 0.75, 0.7 );
    dirLight.position.set( 190, 190, 150 );
    this.scene.add( dirLight );


    // skull materials
    skullFilmMaterial = new THREE.MeshLambertMaterial({
      color: this.SKULL_FILM_COLOR,
      shading: THREE.SmoothShading,
      transparent:true
    });

    skullWireMaterial = new THREE.MeshLambertMaterial({
      color: this.SKULL_WIRE_COLOR,
      shading: THREE.SmoothShading,
      transparent:true,
      wireframe: true
    });


    // ego geometry & material
    egoGeometry = new THREE.IcosahedronGeometry( 35, 0 );
    egoMaterial = new THREE.MeshLambertMaterial({
      color: this.EGO_COLOR,
      shading: THREE.SmoothShading,
      wireframe: true
    });


    // load skull model
    skullLoader = new THREEx.UniversalLoader();
    skullLoader.load(skullUrls, function ( obj ) {

      // set skull
      this.skull = obj;
      this.skull.scale.set(0.75, 0.75, 0.75);
      //this.skull.position.setX(-150);
      this.skull.rotation.y = -0.25;

      // traverse skull child objects
      this.skull.traverse(function ( child ) {
        if( child instanceof THREE.Mesh) {

          // skull film (transparent layer)
          this.skullFilmMesh = child;
          this.skullFilmMesh.material = skullFilmMaterial;

          // skull wireframe mesh
          this.skullWireMesh = child.clone();
          this.skullWireMesh.material = skullWireMaterial;

          this.skull.add( this.skullWireMesh );
        }
      }.bind(this));


      // ego object
      this.ego = new THREE.Mesh( egoGeometry, egoMaterial );
      this.ego.position.y = 185;
      this.ego.position.z = 90;
      this.skull.add( this.ego );


      // add skull
      this.scene.add( this.skull );


      // callback
      if( callback ) {
        callback();
      }
    }.bind( this ));


    // renderer
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor( this.CLEAR_COLOR );


    // add renderer domelement
    document
      .getElementById( 'scene' )
      .appendChild( this.renderer.domElement );


    // init resizer
    new THREEx.WindowResize(this.renderer, this.camera);


    // mouse
    this.mouse = new THREE.Vector2();


    // create gui
    guiParams = {
      ambiLightColor: ambiLight.color.getHex(),
      skullFilmMaterialColor: skullFilmMaterial.color.getHex(),
      skullWireMaterialColor: skullWireMaterial.color.getHex(),
      egoMaterialColor: egoMaterial.color.getHex()
    };

    gui = new dat.GUI();

    lightsFolder = gui.addFolder( 'Lights' );

    lightsFolder
      .add( ambiLight, 'visible' )
      .name( 'Enable Ambient' );

    lightsFolder
      .addColor( guiParams, 'ambiLightColor' )
      .name( 'Ambient Color' )
      .onChange(function( color ){
        ambiLight.color.setHex( color );
      }.bind( this ) );

    //lightsFolder.open();

    materialFolder = gui.addFolder( 'Materials' );

    materialFolder
      .addColor( guiParams, 'skullFilmMaterialColor' )
      .name( 'Skull Film Color' )
      .onChange( function( color ){
        skullFilmMaterial.color.setHex( color );
      }.bind( this ) );

    materialFolder
      .addColor( guiParams, 'skullWireMaterialColor' )
      .name( 'Skull Wire Color' )
      .onChange( function( color ){
        skullWireMaterial.color.setHex( color );
      }.bind( this ) );

    materialFolder
      .addColor( guiParams, 'egoMaterialColor' )
      .name( 'Ego Color' )
      .onChange( function( color ){
        egoMaterial.color.setHex( color );
      }.bind( this ) );

    //materialFolder.open();
  },


  // mouse moved
  mousemove: function( event ) {
    event.preventDefault();

    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // move camera
    TweenMax.to(this.camera.position, 1, {
      x: this.mouse.x * 200,
      y: this.mouse.y * 200
    });
  },


  next: function ( ) {

    var newRotation = this.skull.rotation.y + (360 * 5 * Math.PI / 180);

    TweenMax.to(
      this.skull.rotation,
      0.65, {
        y: newRotation,
        ease:Back.easeOut.config(1)
      });

    TweenMax.to([
      this.skullFilmMesh.material,
      this.skullWireMesh.material ],
      0.3, {
        opacity:0.25,
        ease:Power3.easeIn
      }
    );

    TweenMax.to([
      this.skullFilmMesh.material,
      this.skullWireMesh.material ],
      0.5, {
        delay:0.3,
        opacity:1,
        ease: RoughEase.ease.config({
          template: Power0.easeNone,
          strength: 3,
          points: 50,
          taper: 'none',
          randomize: true,
          clamp: true
        })
      }
    );

    TweenMax.to([
      this.skullFilmMesh.material ],
      0.5, {
        delay:1.15,
        opacity:0.35,
        ease:Sine.easeInOut
      }
    );

    TweenMax.to([
      this.skullWireMesh.material ],
      0.5, {
        delay:1.15,
        opacity:0.65,
        ease:Sine.easeInOut
      }
    );
  },


  // animate cycle
  animate: function() {

    this.render();
  },


  // render cycle
  render: function() {

    this.ego.rotation.x += 0.075;

    //this.skullFilmMesh.material.opacity = 0.25 + ( Math.abs( this.mouse.x ) / 5 );
    //this.skullWireMesh.material.opacity = 0.65 + ( Math.abs( this.mouse.x ) / 5 );

    this.camera.lookAt( this.scene.position );

    // notify delegate about ego position
    if(this.delegate && this.delegate.onSceneEgoPositionUpdate) {
      this.delegate.onSceneEgoPositionUpdate(
        THREEx.ObjCoord.cssPosition(this.ego, this.camera, this.renderer)
      );
    }

    this.renderer.render( this.scene, this.camera );
  }
};