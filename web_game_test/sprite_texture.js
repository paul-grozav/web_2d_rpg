// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
class sprite_texture {
// -------------------------------------------------------------------------- //
constructor(id, url) {
  this.id = id;
  this.url = url;
  this.textures = {};
}
// -------------------------------------------------------------------------- //
add_texture_coordinates(id, coordinates)
{
  var texture_id = this.id + // sprite id
    "_" + id; // + texture id
  this.textures[texture_id] = new texture(texture_id, coordinates);
}
// -------------------------------------------------------------------------- //
get_textures()
{
  return this.textures;
}
// -------------------------------------------------------------------------- //
get_url()
{
  return this.url;
}
// -------------------------------------------------------------------------- //
} // class sprite_texture
// -------------------------------------------------------------------------- //
