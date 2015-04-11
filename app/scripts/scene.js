'use strict';

function Scene() {

  // consts
  this.CLEAR_COLOR = 0x000000;

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

  // create scene, start cycle
  this.createScene( function(){
    this.animate();
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
      skullLoader;
      //gui;


    // create camera
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 500;
    this.camera.position.y = 25;


    // create scene
    this.scene = new THREE.Scene();


    // create ambi light
    ambiLight = new THREE.AmbientLight( 0x999999 );
    this.scene.add( ambiLight );


    // create hemi light
    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.25 );
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
      color: 0x2194ce,
      shading: THREE.SmoothShading,
      transparent:true
    });

    skullWireMaterial = new THREE.MeshLambertMaterial({
      color: 0x2194ce,
      shading: THREE.SmoothShading,
      transparent:true,
      wireframe: true
    });


    // ego geometry & material
    egoGeometry = new THREE.IcosahedronGeometry( 35, 0 );
    egoMaterial = new THREE.MeshLambertMaterial({
      color: 0xFF9100,
      shading: THREE.SmoothShading,
      wireframe: true
    });


    // load skull model
    skullLoader = new THREEx.UniversalLoader();
    skullLoader.load(skullUrls, function ( obj ) {

      // set skull
      this.skull = obj;
      this.skull.rotation.y = -0.5;

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


    // // raycaster
    // this.raycaster = new THREE.Raycaster();


    // // create gui
    // gui = new dat.GUI();

    // gui.add({
    //   dropTrees:function(){
    //     this.dropTrees(_.random(10, 30));
    //   }.bind( this )}, 'dropTrees');

    // gui.add({
    //   eraseTrees:function(){
    //     this.eraseTrees(_.random(3, 10));
    //   }.bind( this )}, 'eraseTrees');

    // gui.add({
    //   toggleCamera:function(){
    //     this.setCameraSettings(this.activeCameraSetting === this.cameraSettings.god ? this.cameraSettings.person : this.cameraSettings.god );
    //   }.bind( this )}, 'toggleCamera');
  },


  // mouse moved
  mousemove: function( event ) {
    event.preventDefault();

    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },


  // animate cycle
  animate: function() {
    requestAnimationFrame(
      this.animate.bind( this )
    );

    this.render();
  },


  // render cycle
  render: function() {

    this.ego.rotation.x += 0.075;

    this.skullFilmMesh.material.opacity = 0.25 + (Math.abs(this.mouse.x) / 5);
    this.skullWireMesh.material.opacity = 0.65 + (Math.abs(this.mouse.x) / 5);

    this.camera.lookAt( this.scene.position );

    this.renderer.render(this.scene, this.camera);
  }
};