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
    "size": 0.15,
  },
  "sprite_textures": [
    {
      "id": "s1",
      "url": "sprite1_character_ground.png",
      "textures": {
        "character": {
          "coordinates": [0.492, -1.0, 0.007, -1.0, 0.492,  0.0, 0.007,  0.0],
        },
        "ground": {
          "coordinates": [-0.01, -1.0, -0.492, -1.0, -0.007,  0.0, -0.492,  0.0],
        },
      },
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
// -------------------------------------------------------------------------- //
class app {
// -------------------------------------------------------------------------- //
constructor(config) {
  this.config = config;
//  return `${this.config} says hello.`;
}
// -------------------------------------------------------------------------- //
get_sprite_texture_coordinates_by_id(config,id)
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
is_power_of_two(value) {
  return (value & (value - 1)) == 0;
}
// -------------------------------------------------------------------------- //
resize_canvas_handler()
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
handle_key_press(e, data, config)
{
  const sense_x = config.settings.sense_x;
  const sense_y = config.settings.sense_y;
  const move_increment_x = config.settings.move_increment_x;
  const move_increment_y = config.settings.move_increment_y;
  e = e || window.event;
  if (e.keyCode == '38') { // up
    data.square_position_y += sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y += 1;
    this.init_buffers(config, data);
  }
  else if (e.keyCode == '40') { // down
    data.square_position_y -= sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y -= 1;
    this.init_buffers(config, data);
  }
  else if (e.keyCode == '37') { // left
    data.square_position_x += sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x -= 1;
    this.init_buffers(config, data);
  }
  else if (e.keyCode == '39') { // right
    data.square_position_x -= sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x += 1;
    this.init_buffers(config, data);
  }
  else if (e.keyCode == '13') { // enter
    console.log(data);
  }
}
// -------------------------------------------------------------------------- //
// Load JavaScript file:
load_file(url, callback)
{
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  document.head.appendChild(script);
  script.onreadystatechange = function(){
    callback();
  };
  script.onload = function(){
    callback();
  };
}
// -------------------------------------------------------------------------- //
//
// Start here
//
main(config, data)
{
  const canvas = document.querySelector('#canvas');
  var gl = new webgl();
  gl.init(canvas);
  data.gl = gl;

  var txs = new textures();
  txs.load_config(config);
//  console.log(txs);

  var wrld = new world(config, txs);

  // Vertex shader program
  const vs_source = `
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
  var fs_source = "";
  fs_source += "precision mediump float;\n";
  fs_source += "varying highp vec2 vTextureCoord;\n";
  fs_source += txs.fragment_shader_texture_declarations();
  fs_source += "\nvoid main(void)\n{\n";
  fs_source += txs.fragment_shader_texture_definitions();
  fs_source += "\n  gl_FragColor = pixel_color_0; // ???\n}";
//  console.log(fs_source);

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  gl.init_shader_program(vs_source, fs_source);

//  var textures_ul = [];
//  for(var i=0; i<config.texture_sprites.length; i++)
//  {
//    var texture = config.texture_sprites[i];
//    textures_ul.push(gl.getUniformLocation(shaderProgram, texture.id));
//  }
/*
  for(var i=0; i<config.sprite_textures.length; i++)
  {
    var sprite = config.sprite_textures[i];
    for(var j=0; j<sprite.textures.length; j++)
    {
      var texture = sprite.textures[j];
      textures_ul.push(gl.getUniformLocation(shaderProgram,
        sprite.id+"_"+texture.id));
    }
  }
*/
  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
/*  const programInfo = {
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
*/
  gl.get_program_info();

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  var ots = wrld.get_objects_and_textures();
  gl.init_buffers(data, ots.objects, ots.textures);

//  data.textures = this.load_textures(gl, config);
  data.textures = gl.load_sprite_textures( txs.get_sprite_textures() );
  var then = 0;

  // Draw the scene repeatedly
  {
    var self = this;
    function render(now) {
      now *= 0.001;  // convert to seconds
      const deltaTime = now - then;
      then = now;

//      self.draw_scene(gl, programInfo, deltaTime, data);
      gl.draw_scene(0, data);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
}
// -------------------------------------------------------------------------- //
dependencies_loaded_handler()
{
  console.log(this);
  this.main(this.config, this.data);
}
// -------------------------------------------------------------------------- //
//
// Runs before main - to load dependencies
//
pre_main()
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
  {
    var self = this;
    this.load_file('gl-matrix.js', function(){ self.main(self.config, data); });
  }

  // Set canvas size to full body
  document.getElementsByTagName("canvas")[0].style.display = 'block';
  document.getElementsByTagName("canvas")[0].style.position = 'absolute';
  document.getElementsByTagName("canvas")[0].style.top = '0';
  document.getElementsByTagName("canvas")[0].style.left = '0';
  document.getElementsByTagName("canvas")[0].style.right = '0';
  document.getElementsByTagName("canvas")[0].style.bottom = '0';
  document.getElementsByTagName("canvas")[0].style.width = '100%';
  document.getElementsByTagName("canvas")[0].style.height = '100%';
  document.onresize = this.resize_canvas_handler;
  this.resize_canvas_handler();

  // Handle keyboard (up, down, left, right) key press
  {
    var self = this;
    document.onkeydown = function(e){
      self.handle_key_press(e, data, self.config);
    };
  }
}
// -------------------------------------------------------------------------- //
} // class app
// -------------------------------------------------------------------------- //
var app_instance = new app(init_config);
app_instance.pre_main();
// -------------------------------------------------------------------------- //
