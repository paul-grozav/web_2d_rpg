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
  this.render_timestamps = []; // timestamps when frame was drawn
}
// -------------------------------------------------------------------------- //
resize_canvas_handler()
{
  var canvas = document.getElementById("canvas");
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
  // const sense_x = config.settings.sense_x;
  // const sense_y = config.settings.sense_y;
  // const move_increment_x = config.settings.move_increment_x;
  // const move_increment_y = config.settings.move_increment_y;
  e = e || window.event;
  if (e.keyCode == '38') { // up
    this.move_player_up();
  }
  else if (e.keyCode == '40') { // down
    this.move_player_down();
  }
  else if (e.keyCode == '37') { // left
    this.move_player_left();
  }
  else if (e.keyCode == '39') { // right
    this.move_player_right();
  }
  else if (e.keyCode == '13') { // enter
    console.log(data);
  }
}
// -------------------------------------------------------------------------- //
move_player_up()
{
  this.data.square_position_y += this.config.settings.sense_y *
    this.config.settings.move_increment_y;
  this.config.world.players[this.config.world.players.length-1].y += 1;
  this.update_buffers();
}
// -------------------------------------------------------------------------- //
move_player_down()
{
  this.data.square_position_y -= this.config.settings.sense_y *
    this.config.settings.move_increment_y;
  this.config.world.players[this.config.world.players.length-1].y -= 1;
  this.update_buffers();
}
// -------------------------------------------------------------------------- //
move_player_left()
{
  this.data.square_position_x += this.config.settings.sense_x *
    this.config.settings.move_increment_x;
  this.config.world.players[this.config.world.players.length-1].x -= 1;
  this.update_buffers();
}
// -------------------------------------------------------------------------- //
move_player_right()
{
  this.data.square_position_x -= this.config.settings.sense_x *
    this.config.settings.move_increment_x;
  this.config.world.players[this.config.world.players.length-1].x += 1;
  this.update_buffers();
}
// -------------------------------------------------------------------------- //
update_buffers()
{
  var ots = this.wrld.get_objects_and_textures();
  this.gl.init_buffers(this.data, ots.objects, ots.textures);
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
  wrld.init_static_map();

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
  //var then = 0;
  var self = this;
  function render(now)
  {
    self.render_graphics(now);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
// -------------------------------------------------------------------------- //
render_graphics(now) // called after
{
  //console.log(now);
  const current_timestamp = Date.now();
  const one_second_ago = current_timestamp - 1000;
  //const current_timestamp = performance.now();
  this.render_timestamps.push(current_timestamp);
  this.render_timestamps = this.render_timestamps.filter(function(timestamp){
    return timestamp > one_second_ago;
  });
  this.set_status("FPS: " + this.render_timestamps.length);

  //now *= 0.001;  // convert to seconds
  //const delta_time = now - then;
  //then = now;

  this.gl.draw_scene(this.data);
}
// -------------------------------------------------------------------------- //
set_status(status)
{
  document.getElementsByTagName("div")[0].innerHTML = status;
}
// -------------------------------------------------------------------------- //
get_status(status)
{
  return document.getElementsByTagName("div")[0].innerHTML;
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
  this.set_status("Loading...");
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
      self.handle_key_press(e, data, self.config);
    };
  }

  // start app's main()
  this.show_controls();
  this.main(self.config, data);
}
// -------------------------------------------------------------------------- //
show_controls()
{
  var self = this;

  // UP
  var up_btn = document.createElement("input");
  up_btn.type = "button";
  up_btn.value = "UP";
  up_btn.style.position = "absolute";
  up_btn.style.top = "15px";
  up_btn.style.left = "65px";
  up_btn.onclick = function(){
    console.log("up");
    self.move_player_up();
  };
  document.body.appendChild(up_btn);

  // DOWN
  var down_btn = document.createElement("input");
  down_btn.type = "button";
  down_btn.value = "DOWN";
  down_btn.style.position = "absolute";
  down_btn.style.top = "75px";
  down_btn.style.left = "65px";
  down_btn.onclick = function(){
    console.log("down");
    self.move_player_down();
  };
  document.body.appendChild(down_btn);

  // LEFT
  var left_btn = document.createElement("input");
  left_btn.type = "button";
  left_btn.value = "LEFT";
  left_btn.style.position = "absolute";
  left_btn.style.top = "45px";
  left_btn.style.left = "5px";
  left_btn.onclick = function(){
    console.log("left");
    self.move_player_left();
  };
  document.body.appendChild(left_btn);

  // RIGHT
  var right_btn = document.createElement("input");
  right_btn.type = "button";
  right_btn.value = "RIGHT";
  right_btn.style.position = "absolute";
  right_btn.style.top = "45px";
  right_btn.style.left = "100px";
  right_btn.onclick = function(){
    console.log("right");
    self.move_player_right();
  };
  document.body.appendChild(right_btn);
}
// -------------------------------------------------------------------------- //
} // class app
// -------------------------------------------------------------------------- //
var app_instance = new app(init_config);
//app_instance.pre_main(); // started from HTML
// -------------------------------------------------------------------------- //
