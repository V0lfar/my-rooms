import {THREE} from './three-defs.js';

import {entity} from './entity.js';

import {user_input} from './user-input.js';
import {first_person_camera} from './first-person-camera.js';
import {kinematic_character_controller} from './kinematic-character-controller.js';
import {level_builder} from './level-builder.js';

export const spawners = (() => {

  class PlayerSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn() {
      const player = new entity.Entity();
      player.SetPosition(new THREE.Vector3(-89, 2, -85));
      player.AddComponent(new user_input.PlayerInput(this.params_));
      player.AddComponent(new first_person_camera.FirstPersonCamera(this.params_));
      player.AddComponent(new kinematic_character_controller.KinematicCharacterController(this.params_));

      this.Manager.Add(player, 'player');

      return player;
    }
  };

  class LevelSpawner extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn() {
      const e = new entity.Entity();
      e.SetPosition(new THREE.Vector3(0, 0, 0));
      e.AddComponent(new level_builder.LevelBuilder(this.params_));

      this.Manager.Add(e, 'levelBuilder');

      return e;
    }
  };

  return {
    PlayerSpawner: PlayerSpawner,
    LevelSpawner: LevelSpawner,
  };
})();