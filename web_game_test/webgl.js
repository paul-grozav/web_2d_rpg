// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
class webgl {
// -------------------------------------------------------------------------- //
constructor()
{
  this.gl = null;
  this.program_info = {};
  this.shader_program = null;
  this.last_init_number_objects = 0;
}
// -------------------------------------------------------------------------- //
init(canvas)
{
  this.gl = canvas.getContext('webgl', {
    alpha: false,
  });

  // If we don't have a GL context, give up now
  if (!this.gl) {
    alert('Unable to initialize WebGL.' +
      ' Your browser or machine may not support it.');
    return;
  }
}
// -------------------------------------------------------------------------- //
// Initialize a shader program; this is where all the lighting
// for the vertices and so forth is established.
// Initialize a shader program, so WebGL knows how to draw our data
init_shader_program(vs_source, fs_source)
{
  var gl = this.gl;
  const vertex_shader = this.load_shader(gl.VERTEX_SHADER, vs_source);
  const fragment_shader = this.load_shader(gl.FRAGMENT_SHADER, fs_source);

  // Create the shader program
  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS))
  {
    alert('Unable to initialize the shader program: '+
      gl.getProgramInfoLog(shader_program));
    return null;
  }
  this.shader_program = shader_program;
}
// -------------------------------------------------------------------------- //
// creates a shader of the given type, uploads the source and compiles it.
load_shader(type, source) {
  var gl = this.gl;
  const shader = gl.createShader(type);

  // Send the source to the shader object
  this.gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
// -------------------------------------------------------------------------- //
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
init_buffers(data, objects, textures) {
  const gl = this.gl;
  // Create a buffer for the cube's vertex positions.
  const position_buffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

  // Now create an array of positions for the square.
  this.last_init_number_objects = objects.length;
  if(objects.length == 0)
  {
    alert('Error: no objects to show');
  }
//  console.log(objects);
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objects), gl.STATIC_DRAW);




  // Now set up the texture coordinates for the faces.
  const texture_coord_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texture_coord_buffer);

  if(textures.length == 0)
  {
    alert('Error: no textures to show');
  }
//  console.log(textures);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);




  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

  data.buffers = {
    position: position_buffer,
    textureCoord: texture_coord_buffer,
    indices: index_buffer,
  };
}
// -------------------------------------------------------------------------- //
is_power_of_two(value)
{
  return (value & (value - 1)) == 0;
}
// -------------------------------------------------------------------------- //
// When the image finished loading copy it into the texture.
load_texture(url)
{
  var gl = this.gl;
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internal_format = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const src_format = gl.RGBA;
  const src_type = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internal_format, width, height, border,
    src_format, src_type, pixel);

  const image = new Image();
  {
    var self = this;
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internal_format,
        src_format, src_type, image);

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (self.is_power_of_two(image.width) && self.is_power_of_two(image.height)) {
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
  }
  image.src = url;
//  image.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAABlCAYAAABQif3yAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic5Z1ZcBzXee9/p7tnHwwG62AnQYAbSIKLQHERKcnaV8u$
//  image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
//  console.log(url);

  return texture;
}
// -------------------------------------------------------------------------- //
// https://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
load_sprite_textures(sprite_textures){
  var textures = [];
  for(var i=0; i<sprite_textures.length; i++)
  {
    var sprite = sprite_textures[i];
//    console.log(sprite.get_url());
    textures.push(this.load_texture(sprite.get_url()));
  }
  return textures;
}
// -------------------------------------------------------------------------- //
// Collect all the info needed to use the shader program.
// Look up which attributes our shader program is using for aVertexPosition,
// aTextureCoord and also look up uniform locations.
get_program_info()
{
  var gl = this.gl;
  var shader_program = this.shader_program;
  var textures_ul = [];
  textures_ul.push(gl.getUniformLocation(shader_program, 's1_character'));
  textures_ul.push(gl.getUniformLocation(shader_program, 's1_ground'));


  this.program_info =
  {
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shader_program, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shader_program, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shader_program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(
        shader_program, 'uModelViewMatrix'),
      textures: textures_ul,
    },
  };
}
// -------------------------------------------------------------------------- //
// Draw the scene.
draw_scene(data)
{
  var gl = this.gl;
  var program_info = this.program_info;
  const square_position_x = data.square_position_x;
  const square_position_y = data.square_position_y;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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
        program_info.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        program_info.attribLocations.vertexPosition);
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
        program_info.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        program_info.attribLocations.textureCoord);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(this.shader_program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      program_info.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      program_info.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  // Specify the texture to map onto the faces.
  for(var i=0; i<data.textures.length; i++)
  {
//    console.log(program_info.uniformLocations.textures[i]);
    gl.uniform1i(program_info.uniformLocations.textures[i], i);
    gl.activeTexture(gl.TEXTURE0+i);
    gl.bindTexture(gl.TEXTURE_2D, data.textures[i]);
//    gl.uniform1i(program_info.uniformLocations.textures[i], i);
//    console.log(data.textures[i]);
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
    for(var offset=0; offset<this.last_init_number_objects/2; offset+=vertexCount)
    {
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  // Update the rotation for the next draw
  //data.square_rotation += delta_time;
}
// -------------------------------------------------------------------------- //
} // class webgl
// -------------------------------------------------------------------------- //
