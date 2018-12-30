// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
class textures {
// -------------------------------------------------------------------------- //
constructor()
{
  this.textures = {};
  this.sprite_textures = [];
}
// -------------------------------------------------------------------------- //
add_sprite_texture(sprite_texture)
{
  this.sprite_textures.push(sprite_texture);
  // add textures from within the sprite ito the textures list
  Object.assign(this.textures, sprite_texture.get_textures());
}
// -------------------------------------------------------------------------- //
load_config(config)
{
  for(var i=0; i<config.sprite_textures.length; i++)
  {
    const sprite_texture_data = config.sprite_textures[i];
    var st = new sprite_texture(
      sprite_texture_data.id, sprite_texture_data.url);
    for (let [texture_name, texture_data] of
      Object.entries(sprite_texture_data.textures))
    {
      st.add_texture_coordinates(
        texture_name, texture_data.coordinates);
    }
    this.add_sprite_texture(st);
  }
}
// -------------------------------------------------------------------------- //
fragment_shader_texture_declarations()
{
  var fs_source = "";
  for (var texture_name in this.textures)
  {
//    console.log(texture_name);
    fs_source += "uniform sampler2D "+texture_name+";\n";
  }
  return fs_source;
}
// -------------------------------------------------------------------------- //
fragment_shader_texture_definitions()
{
  var fs_source = "";
  var index = 0;
  for (var texture_name in this.textures)
  {
    fs_source += "  vec4 pixel_color_"+index+" = texture2D("+
        texture_name+", vTextureCoord);\n";
    index += 1;
  }
  return fs_source;
}
// -------------------------------------------------------------------------- //
get_texture(id)
{
  return this.textures[id];
}
// -------------------------------------------------------------------------- //
get_sprite_textures()
{
  return this.sprite_textures;
}
// -------------------------------------------------------------------------- //
} // class textures
// -------------------------------------------------------------------------- //
