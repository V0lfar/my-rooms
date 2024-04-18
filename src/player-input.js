import {entity} from "./entity.js";
import {passes} from './passes.js';
import {THREE} from './three-defs.js';

export const player_input = (() => {

  const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
    'SPACE': 32,
    'SHIFT_L': 16,
    'CTRL_L': 17,
  };

  const raycaster = new THREE.Raycaster();

  class PlayerInput extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    InitEntity() {
      this.current_ = {
        leftButton: false,
        rightButton: false,
        mouseXDelta: 0,
        mouseYDelta: 0,
        mouseX: 0,
        mouseY: 0,
      };
      this.previous_ = null;
      this.keys_ = {};
      this.previousKeys_ = {};
      this.target_ = document;
      this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
      this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
      this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
      this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
      this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
      this.target_.addEventListener('click', (e) => this.onDocumentClick_(e), false);

      this.Parent.Attributes.Input = {
        Keyboard: {
          Current: this.keys_,
          Previous: this.previousKeys_
        },
        Mouse: {
          Current: this.current_,
          Previous: this.previous_
        },
      };

      this.SetPass(passes.INPUT);

    }

    onDocumentClick_(event) {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const mouse = new THREE.Vector2();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
      // Update the picking ray with the camera and mouse position
      const camera = this.FindEntity('threejs').GetComponent('ThreeJSController').getCamera()
      raycaster.setFromCamera(mouse, camera);
      
      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.params_.scene.children);
    
      // Check if the PDF mesh is intersected
      for (let i = 0; i < intersects.length; i++) {
        console.log(intersects[i].object)
      }
    }

    onMouseMove_(e) {
      const newMouseX = e.pageX - window.innerWidth / 2;
      const newMouseY = e.pageY - window.innerHeight / 2;
    
      if (this.previous_ === null) {
        this.previous_ = {...this.current_};
      }
    
      if (this.current_.leftButton) {
        this.current_.mouseXDelta = newMouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = newMouseY - this.previous_.mouseY;
      } else {
        this.current_.mouseXDelta = 0;
        this.current_.mouseYDelta = 0;
      }
    
      this.current_.mouseX = newMouseX;
      this.current_.mouseY = newMouseY;
    }

    onMouseDown_(e) {
      this.onMouseMove_(e);

      switch (e.button) {
        case 0: {
          this.current_.leftButton = true;
          break;
        }
        case 2: {
          this.current_.rightButton = true;
          break;
        }
      }
    }

    onMouseUp_(e) {
      this.onMouseMove_(e);

      switch (e.button) {
        case 0: {
          this.current_.leftButton = false;
          break;
        }
        case 2: {
          this.current_.rightButton = false;
          break;
        }
      }
    }

    onKeyDown_(e) {
      this.keys_[e.keyCode] = true;
    }

    onKeyUp_(e) {
      this.keys_[e.keyCode] = false;
    }

    key(keyCode) {
      return !!this.keys_[keyCode];
    }

    mouseLeftReleased(checkPrevious=true) {
      return (!this.current_.leftButton && this.previous_.leftButton);
    }

    isReady() {
      return this.previous_ !== null;
    }

    Update(_) {
      if (this.previous_ == null) {
        return;
      }
      if (this.current_.leftButton) {
        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
      } else {
        this.current_.mouseXDelta = 0;
        this.current_.mouseYDelta = 0;
      }
      this.previous_ = {...this.current_};
      this.previousKeys_ = {...this.keys_};
    }
  };

  return {
    PlayerInput: PlayerInput,
    KEYS: KEYS,
  };

})();