// Author: Tancredi-Paul Grozav <paul@grozav.info>
// -------------------------------------------------------------------------- //
// Game configuration file
// -------------------------------------------------------------------------- //
const init_config = {
  "settings": {
    "sense_x": -1, // move the opposite way
    "sense_y": -1, // move the opposite way
    "move_increment_x": 0.30, // size * size_x
    "move_increment_y": 0.30, // size * size_y
    "size_x": 2,
    "size_y": 2,
    "size": 0.15,
  },
  "sprite_textures": [
    {
      "id": "s1",
      "url": "sprite1_character_ground.png", // nice characters
      // "url": "sprite1_character_ground_plain.png", // simple squares
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
    "players": [
/*      {
        "x": 0,
        "y": 0,
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
*/      {
        "x": 0,
        "y": 1,
        "texture": "s1_character",
      },
    ],
    "static_map": [
    ],
  },
};
const square_length=10;
for(var x=0; x<square_length; x++)
  for(var y=0; y<square_length; y++)
    init_config.world.static_map.unshift({x:x, y:y, texture: "s1_ground"});
// -------------------------------------------------------------------------- //