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
  this.data = {};
  this.gl = new webgl();
  this.txs = new textures();
  this.wrld = new world(this.config, this.txs);
//  return `${this.config} says hello.`;
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
    var ots = this.wrld.get_objects_and_textures();
    this.gl.init_buffers(this.data, ots.objects, ots.textures);
  }
  else if (e.keyCode == '40') { // down
    data.square_position_y -= sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y -= 1;
    var ots = this.wrld.get_objects_and_textures();
    this.gl.init_buffers(this.data, ots.objects, ots.textures);
  }
  else if (e.keyCode == '37') { // left
    data.square_position_x += sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x -= 1;
    var ots = this.wrld.get_objects_and_textures();
    this.gl.init_buffers(this.data, ots.objects, ots.textures);
  }
  else if (e.keyCode == '39') { // right
    data.square_position_x -= sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x += 1;
    var ots = this.wrld.get_objects_and_textures();
    this.gl.init_buffers(this.data, ots.objects, ots.textures);
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
  var gl = this.gl;
  gl.init(canvas);

  var txs = this.txs;
  txs.load_config(config);
//  console.log(txs);

  var wrld = this.wrld;

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

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
  gl.get_program_info();

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  var ots = wrld.get_objects_and_textures();
  gl.init_buffers(data, ots.objects, ots.textures);
//  console.log(data);

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
get_data()
{
  return this.data;
}
// -------------------------------------------------------------------------- //
//
// Runs before main - to load dependencies
//
pre_main()
{
  var data = {
    "textures": [],
    "buffers": {},
    "square_rotation": 0.0,
    "square_position_x": 0.0,
    "square_position_y": 0.0,
  };
  this.data = data;

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
