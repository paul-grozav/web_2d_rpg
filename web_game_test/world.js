// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
class world {
// -------------------------------------------------------------------------- //
constructor(config, textures)
{
  this.config = config;
  this.textures = textures;
//  console.log(id, coordinates);
}
// -------------------------------------------------------------------------- //
get_objects_and_textures()
{
  var data = {
    "objects": [],
    "textures": [],
  };

  // objects to be drawn later
  const tiles = this.config.world.tiles;
  for(var i=0; i<tiles.length; i++)
  {
    data.objects = data.objects.concat(
      this.tile_to_vertex_coordinates(tiles[i], this.config.settings)
    );
  }

  // textures to be used to draw the objects above
  for(var i=0; i<this.config.world.tiles.length; i++)
  {
    const tile = this.config.world.tiles[i];
    const tile_texture_coordinates =
      this.textures.get_texture(tile.texture).get_coordinates();
    data.textures = data.textures.concat(tile_texture_coordinates);
  }

//  console.log(data);
  return data;
}
// -------------------------------------------------------------------------- //
tile_to_vertex_coordinates(tile, settings)
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
get_sprite_texture_coordinates_by_id(config, id)
{
  const ids = id.split("_");
  const sprite_id = ids[0];
  const texture_id = ids[1];
  for(var i=0; i<this.config.sprite_textures.length; i++)
  {
    const sprite = this.config.texture_sprites[i];
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
} // class world
// -------------------------------------------------------------------------- //
