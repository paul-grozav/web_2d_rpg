// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
const init_config = {
  "settings": {
    "sense_x": -1, // move the opposite way
    "sense_y": -1, // move the opposite way
    "move_increment_x": 0.5,
    "move_increment_y": 0.5,
    "size_x": 2,
    "size_y": 2,
    "size": 0.25,
  },
  "texture_sprites": [
    {
      "id": "s1",
      "url": "sprite1_character_ground.png",
      "textures": [
        {
          "id": "character",
          "coordinates": [0.5, -1.0, 0.0, -1.0, 0.5,  0.0, 0.0,  0.0],
        },
        {
          "id": "ground",
          "coordinates": [-0.007, -1.0, -0.5, -1.0, -0.007,  0.0, -0.48,  0.0],
        },
      ],
    },
  ],
  "world": {
    "tiles": [
      {
        "x": 0,
        "y": 0,
        "texture": "s1_ground",
      },
      {
        "x": 0,
        "y": 1,
        "texture": "s1_ground",
      },
      {
        "x": 0,
        "y": 2,
        "texture": "s1_ground",
      },
      {
        "x": 1,
        "y": 0,
        "texture": "s1_ground",
      },
      {
        "x": 1,
        "y": 1,
        "texture": "s1_ground",
      },
      {
        "x": 1,
        "y": 2,
        "texture": "s1_ground",
      },
      {
        "x": 0,
        "y": 1,
        "texture": "s1_character",
      },
    ],
  },
};
//var config = init_config; // might change in time
// -------------------------------------------------------------------------- //
function get_sprite_texture_coordinates_by_id(config,id)
{
  const ids = id.split("_");
  const sprite_id = ids[0];
  const texture_id = ids[1];
  for(var i=0; i<config.texture_sprites.length; i++)
  {
    const sprite = config.texture_sprites[i];
    if(sprite.id == sprite_id)
    {
      for(var j=0; j<sprite.textures.length; j++)
      {
        const texture = sprite.textures[j];
        if(texture.id == texture_id)
        {
          return texture.coordinates;
        }
      }
    }
  }
  return [];// not found
}
// -------------------------------------------------------------------------- //
function tile_to_vertex_coordinates(tile, settings)
{
  // tile size
  const size = settings.size;
  const size_x = settings.size_x;
  const size_y = settings.size_y;

  var vertex_points = [];
  // one tile/square is defined by 4 points:
  // D--------C
  // |        |
  // B--------A
  var A = [size*size_x*(tile.x+1), size*size_y*(tile.y+1)];
  var B = [size*size_x*tile.x    , size*size_y*(tile.y+1)];
  var C = [size*size_x*(tile.x+1), size*size_y*tile.y];
  var D = [size*size_x*tile.x    , size*size_y*tile.y];
//  console.log("A=("+A[0]+","+A[1]+")");
//  console.log("B=("+B[0]+","+B[1]+")");
//  console.log("C=("+C[0]+","+C[1]+")");
//  console.log("D=("+D[0]+","+D[1]+")");
  vertex_points = vertex_points.concat(A, B, C, D);
  return vertex_points;
}
// -------------------------------------------------------------------------- //
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
// -------------------------------------------------------------------------- //
function resize_canvas_handler()
{
  canvas = document.getElementById("canvas");
  if (canvas.width  < window.innerWidth)
  {
    canvas.width  = window.innerWidth;
  }
  if (canvas.height < window.innerHeight)
  {
    canvas.height = window.innerHeight;
  }
};
// -------------------------------------------------------------------------- //
function handle_key_press(e, data, config)
{
  const sense_x = config.settings.sense_x;
  const sense_y = config.settings.sense_y;
  const move_increment_x = config.settings.move_increment_x;
  const move_increment_y = config.settings.move_increment_y;
  e = e || window.event;
  if (e.keyCode == '38') { // up
    data.square_position_y += sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y += 1;
    initBuffers(config, data);
  }
  else if (e.keyCode == '40') { // down
    data.square_position_y -= sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y -= 1;
    initBuffers(config, data);
  }
  else if (e.keyCode == '37') { // left
    data.square_position_x += sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x -= 1;
    initBuffers(config, data);
  }
  else if (e.keyCode == '39') { // right
    data.square_position_x -= sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x += 1;
    initBuffers(config, data);
  }
  else if (e.keyCode == '13') { // enter
    console.log(data);
  }
}
// -------------------------------------------------------------------------- //
//
// Runs before main - to load dependencies
//
function pre_main(config, callback)
{
  var data = {
    "gl": null,
    "textures": [],
    "ground": [],
    "buffers": {},
    "square_rotation": 0.0,
    "square_position_x": 0.0,
    "square_position_y": 0.0,
  };

  // load JS dependencies
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'gl-matrix.js';
  document.head.appendChild(script);
  script.onreadystatechange = function(){
    callback(config, data);
  };
  script.onload = function(){
    callback(config, data);
  };

  // Set canvas size to full body
  document.getElementsByTagName("canvas")[0].style.display = 'block';
  document.getElementsByTagName("canvas")[0].style.position = 'absolute';
  document.getElementsByTagName("canvas")[0].style.top = '0';
  document.getElementsByTagName("canvas")[0].style.left = '0';
  document.getElementsByTagName("canvas")[0].style.right = '0';
  document.getElementsByTagName("canvas")[0].style.bottom = '0';
  document.getElementsByTagName("canvas")[0].style.width = '100%';
  document.getElementsByTagName("canvas")[0].style.height = '100%';
  document.onresize = resize_canvas_handler;
  resize_canvas_handler();

  // Handle keyboard (up, down, left, right) key press
  document.onkeydown = function(e){
    handle_key_press(e, data, config);
  };
}
// -------------------------------------------------------------------------- //
// https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
function load_textures(gl, config){
  var textures = [];
  for(var i=0; i<config.texture_sprites.length; i++)
  {
    var texture_sprite = config.texture_sprites[i];
    textures.push(loadTexture(gl, texture_sprite.url));
  }
  return textures;
}
// -------------------------------------------------------------------------- //
//
// Start here
//
function main(config, data)
{
//  var config = const_config
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  data.gl = gl;

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program
  var fsSource = "";
  fsSource += "precision mediump float;\n";
  fsSource += "varying highp vec2 vTextureCoord;\n";
  for(var i=0; i<config.texture_sprites.length; i++)
  {
    var sprite = config.texture_sprites[i];
    for(var j=0; j<sprite.textures.length; j++)
    {
      var texture = sprite.textures[j];
      fsSource += "uniform sampler2D "+sprite.id+"_"+texture.id+";\n";
    }
  }
  fsSource += `
    void main(void) {
  `;
  for(var i=0; i<config.texture_sprites.length; i++)
  {
    var sprite = config.texture_sprites[i];
    for(var j=0; j<sprite.textures.length; j++)
    {
      var texture = sprite.textures[j];
      fsSource += "vec4 pixel_color_"+i+"_"+j+" = texture2D("+
        sprite.id+"_"+texture.id+", vTextureCoord);\n";
    }
  }
  fsSource += `
      gl_FragColor = pixel_color_0_0; // ???
    }
  `;
//  console.log(fsSource);

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  var textures_ul = [];
//  for(var i=0; i<config.texture_sprites.length; i++)
//  {
//    var texture = config.texture_sprites[i];
//    textures_ul.push(gl.getUniformLocation(shaderProgram, texture.id));
//  }

  for(var i=0; i<config.texture_sprites.length; i++)
  {
    var sprite = config.texture_sprites[i];
    for(var j=0; j<sprite.textures.length; j++)
    {
      var texture = sprite.textures[j];
      textures_ul.push(gl.getUniformLocation(shaderProgram,
        sprite.id+"_"+texture.id));
    }
  }

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      textures: textures_ul,
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  initBuffers(config, data);

  data.textures = load_textures(gl, config);
  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, deltaTime, data);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
// -------------------------------------------------------------------------- //
//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(config, data) {
  // create ground
  data.ground = [];
  const tiles = config.world.tiles;
  for(var i=0; i<tiles.length; i++)
  {
    data.ground = data.ground.concat(
      tile_to_vertex_coordinates(tiles[i], config.settings)
    );
  }

  const gl = data.gl;
  // Create a buffer for the cube's vertex positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  if(data.ground.length == 0)
  {
    alert('no tiles to show');
  }
  var positions = data.ground;
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  var textureCoordinates = [];
  for(var i=0; i<config.world.tiles.length; i++)
  {
    const tile = config.world.tiles[i];
    const tile_texture_coordinates =
      get_sprite_texture_coordinates_by_id(config, tile.texture);
    textureCoordinates = textureCoordinates.concat(tile_texture_coordinates);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  data.buffers = {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}
// -------------------------------------------------------------------------- //
//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime, data) {
  const square_position_x = data.square_position_x;
  const square_position_y = data.square_position_y;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = glMatrix.mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  glMatrix.mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = glMatrix.mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  glMatrix.mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-square_position_x, square_position_y, -6.0]);  // amount to translate
//  glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
//              modelViewMatrix,  // matrix to rotate
//              data.square_rotation,     // amount to rotate in radians
//              [0, 0, 1]);       // axis to rotate around (Z)
//  glMatrix.mat4.rotate(modelViewMatrix,  // destination matrix
//              modelViewMatrix,  // matrix to rotate
//              cubeRotation * .7,// amount to rotate in radians
//              [0, 1, 0]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, data.buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, data.buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  // Specify the texture to map onto the faces.
  for(var i=0; i<data.textures.length; i++)
  {
    gl.uniform1i(programInfo.uniformLocations.textures[i], i);
    gl.activeTexture(gl.TEXTURE0+i);
    gl.bindTexture(gl.TEXTURE_2D, data.textures[i]);
  }
  // Tell WebGL we want to affect texture unit 0
//  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
//  gl.bindTexture(gl.TEXTURE_2D, textures[0]);

  // Tell the shader we bound the texture to texture unit 0
//  gl.uniform1i(programInfo.uniformLocations.textures[0], 0);

  {
//    const vertexCount = 36;
//    const type = gl.UNSIGNED_SHORT;
//    const offset = 0;
//    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

    var offset = 0;
    const vertexCount = 4;
//    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
//    offset = 4 ; // draw second square
//    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    for(var offset=0; offset<data.ground.length/2; offset+=vertexCount)
    {
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  // Update the rotation for the next draw
  data.square_rotation += deltaTime;
}
// -------------------------------------------------------------------------- //
//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}
// -------------------------------------------------------------------------- //
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
// -------------------------------------------------------------------------- //
//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
//  image.setAttribute('src', 'data:image/png;base64,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');
//  image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
//  console.log(image.src);

  return texture;
}
// -------------------------------------------------------------------------- //
pre_main(init_config, main);
// -------------------------------------------------------------------------- //
