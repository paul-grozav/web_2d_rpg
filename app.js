// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
class app {
// -------------------------------------------------------------------------- //
constructor(config) {
  this.config = config;
  this.data = {};
  this.gl = new webgl();
  this.txs = new textures();
  this.wrld = new world(this.config, this.txs);
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
  console.log("handle_key_press_B");
  const sense_x = config.settings.sense_x;
  const sense_y = config.settings.sense_y;
  const move_increment_x = config.settings.move_increment_x;
  const move_increment_y = config.settings.move_increment_y;
  e = e || window.event;
  if (e.keyCode == '38') { // up
    data.square_position_y += sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y += 1;
  }
  else if (e.keyCode == '40') { // down
    data.square_position_y -= sense_y*move_increment_y;
    config.world.tiles[config.world.tiles.length-1].y -= 1;
  }
  else if (e.keyCode == '37') { // left
    data.square_position_x += sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x -= 1;
  }
  else if (e.keyCode == '39') { // right
    data.square_position_x -= sense_x*move_increment_x;
    config.world.tiles[config.world.tiles.length-1].x += 1;
  }
  else if (e.keyCode == '13') { // enter
    console.log(data);
    return; // don't redraw
  }
  else {
    return; // don't redraw
  }
  console.log("handle_key_press_M1");
  var ots = this.wrld.get_objects_and_textures();
  console.log("handle_key_press_M2");
  this.gl.init_buffers(this.data, ots.objects, ots.textures);
  console.log("handle_key_press_E");
}
// -------------------------------------------------------------------------- //
//
// Start here
//
main(config, data)
{
  var gl = this.gl;
  var txs = this.txs;
  var wrld = this.wrld;

  const canvas = document.querySelector('#canvas');
  gl.init(canvas);
  txs.load_config(config);
//  console.log(txs);

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
  gl.init_shader_program(vs_source, fs_source);

  gl.get_program_info();
  var ots = wrld.get_objects_and_textures();
  gl.init_buffers(data, ots.objects, ots.textures);
//  console.log(data);
  data.textures = gl.load_sprite_textures( txs.get_sprite_textures() );

  // Draw the scene repeatedly
  // var last_timestamp = performance.now();
  var timestamps = []; // timestamps when frame was drawn
  //var then = 0;
  function render(now) // called after
  {
    // console.log(now);
    const current_timestamp = Date.now();
    const one_second_ago = current_timestamp - 1000;
    //const current_timestamp = performance.now();
    timestamps.push(current_timestamp);
    timestamps = timestamps.filter(function(timestamp){
      return timestamp > one_second_ago;
    });
    document.getElementsByTagName("div")[0].innerHTML = timestamps.length;
    //now *= 0.001;  // convert to seconds
    //const delta_time = now - then;
    //then = now;

    gl.draw_scene(data);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
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
//    "square_rotation": 0.0,
    "square_position_x": 0.0,
    "square_position_y": 0.0,
  };
  this.data = data;

  // Set canvas size to full body
  var canvas = document.getElementsByTagName("canvas")[0];
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.right = '0';
  canvas.style.bottom = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  document.onresize = this.resize_canvas_handler;
  this.resize_canvas_handler();

  // Handle keyboard (up, down, left, right) key press
  {
    var self = this;
    document.onkeydown = function(e){
      console.log("onkeydown_B");
      self.handle_key_press(e, data, self.config);
      console.log("onkeydown_E");
    };
  }

  // start app's main()
  this.main(self.config, data);
}
// -------------------------------------------------------------------------- //
} // class app
// -------------------------------------------------------------------------- //
var app_instance = new app(init_config);
//app_instance.pre_main();
// -------------------------------------------------------------------------- //
