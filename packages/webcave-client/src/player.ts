import {
  World,
  Vector,
  EMaterial,
  Material,
  MATERIALS,
  EMouseEvent,
  lineRectCollide,
  rectRectCollide,
  IPlayer,
  Collision,
  DirectedLine,
  Rectangle,
  Square,
} from "@acid-info/webcave-core/src"

import { EChatActions, ACTION_TO_KEYBOARD_KEY_MAP, EKeyboardActions, EActions } from './shared/controls'
import { CanvasPosition } from './shared/webgl'
import Renderer from './renderer'
import { SELECTOR_WIDTH_PX } from './shared/ui'
import { DynamicObject } from './types/util'

import {
  WebGLObject,
} from "./types/gl"

class Player implements IPlayer {
  public world: World;

  public canvas: HTMLCanvasElement;
  public renderer: Renderer;

  public pos: Vector;
  public velocity: Vector;
  public angles: number[];
  public falling: boolean;
  public keys: DynamicObject<boolean>;
  public buildMaterial: Material;
  public eventHandlers: DynamicObject<Function, EActions>;

  public dragStart: CanvasPosition;
  public mouseDown: boolean;
  public yawStart: number;
  public targetYaw: number;
  public pitchStart: number;
  public targetPitch: number;
  public dragging: boolean;

  public lastUpdate: number;

  public prevSelector: HTMLTableCellElement;

  public moving: boolean;
  public aniframe: number;
  public pitch: number;

  public x: number;
  public y: number;
  public z: number;
  public yaw: number;

  public nametag: WebGLObject;
  public nick: string;

  /*
  * Assign the local player to a world.
  * */
  public setWorld(world: World) {
    this.world = world;
    this.world.setLocalPlayer(this);
    this.pos = world.spawnPoint;
    this.velocity = new Vector( 0, 0, 0 );
    this.angles = [ 0, Math.PI, 0 ];
    this.falling = false;
    this.keys = {};
    this.buildMaterial = MATERIALS[EMaterial.DIRT];
    this.eventHandlers = {};
  }

  public setMaterialSelector(selectorContainerRef: HTMLDivElement) {
    let tableRow = selectorContainerRef.getElementsByTagName( "tr" )[0];

    let texOffset = 0;
    let numberOfElements = 16;
    let widthOfElement = SELECTOR_WIDTH_PX;
    tableRow.innerHTML = '';

    for ( let mat in MATERIALS ) {
      if (MATERIALS[mat].spawnable == true ) {
        let selector = document.createElement( "td" );
        selector.style.backgroundPosition = texOffset + "px 0px";
        selector.style.backgroundSize = `${widthOfElement * numberOfElements}px ${widthOfElement}px`

        selector.onclick = () => {
          selector.style.opacity = "1.0";

          this.prevSelector.style.opacity = "";
          this.prevSelector = selector;

          this.buildMaterial = MATERIALS[mat];
        }

        if ( MATERIALS[mat].id == EMaterial.DIRT ) {
          this.prevSelector = selector;
          selector.style.opacity = "1.0";
        }

        tableRow.appendChild( selector );
        texOffset -= SELECTOR_WIDTH_PX;
      }
    }
  }

  /*
  * Set the canvas the renderer uses for some input operations.
  * */
  public setInputCanvas(containerRef: HTMLDivElement, canvasRef: HTMLCanvasElement) {
    this.canvas = canvasRef;

    document.onkeydown = (e: KeyboardEvent) => {
      if ( (e.target as Element).tagName != "INPUT" ) {
        this.onKeyEvent( e.key, true );
      }
    }

    document.onkeyup = (e: KeyboardEvent) => {
      if ( (e.target as Element).tagName != "INPUT" ) {
        this.onKeyEvent( e.key, false );
      }
    }

    this.canvas.onmousedown = (e: MouseEvent) => {
      this.onMouseEvent(
        e.clientX - this.canvas.getBoundingClientRect().left,
        e.clientY - this.canvas.getBoundingClientRect().top,
        EMouseEvent.DOWN,
        e.button === 2
      );
      return false;
    }

    this.canvas.onmouseup = (e: MouseEvent) => {
      this.onMouseEvent(
        e.clientX - this.canvas.getBoundingClientRect().left,
        e.clientY - this.canvas.getBoundingClientRect().top,
        EMouseEvent.UP,
        e.button === 2
      );
      return false;
    }

    this.canvas.onmousemove = (e) => {
      this.onMouseEvent(
        e.clientX - this.canvas.getBoundingClientRect().left,
        e.clientY - this.canvas.getBoundingClientRect().top,
        EMouseEvent.MOVE,
        e.button === 2
      );
      return false;
    }
  }

  public setRenderer(renderer: Renderer) {
    this.renderer = renderer;
  }

  public on(event: EActions, callback: Function) {
    this.eventHandlers[event] = callback;
  }

  public onKeyEvent(unicodeKey: string, pressedState: boolean) {
    this.keys[unicodeKey] = pressedState;

    if (unicodeKey.toLowerCase() === ACTION_TO_KEYBOARD_KEY_MAP[EChatActions.OPEN_CHAT].toLowerCase()) {
      if (!pressedState && this.eventHandlers[EChatActions.OPEN_CHAT]) {
        this.eventHandlers[EChatActions.OPEN_CHAT]();
      }
    }
  }

  public onMouseEvent(x: number, y: number, type: EMouseEvent, rmb: boolean) {
    if ( type == EMouseEvent.DOWN ) {
      this.dragStart = { x: x, y: y };
      this.mouseDown = true;
      this.yawStart = this.targetYaw = this.angles[1];
      this.pitchStart = this.targetPitch = this.angles[0];
    } else if ( type == EMouseEvent.UP ) {
      if ( Math.abs( this.dragStart.x - x ) + Math.abs( this.dragStart.y - y ) < 4 ) {
        this.doBlockAction( x, y, !rmb );
      }

      this.dragging = false;
      this.mouseDown = false;
      this.canvas.style.cursor = "default";
    } else if ( type == EMouseEvent.MOVE && this.mouseDown ) {
      this.dragging = true;
      this.targetPitch = this.pitchStart - ( y - this.dragStart.y ) / 200;
      this.targetYaw = this.yawStart + ( x - this.dragStart.x ) / 200;

      this.canvas.style.cursor = "move";
    }
  }

  public doBlockAction(x: number, y: number, destroy: boolean) {
    let bPos = new Vector(
      Math.floor( this.pos.x ),
      Math.floor( this.pos.y ),
      Math.floor( this.pos.z )
    );
    let block = this.renderer.pickAt(
      new Vector( bPos.x - 4, bPos.y - 4, bPos.z - 4 ),
      new Vector( bPos.x + 4, bPos.y + 4, bPos.z + 4 ),
      x,
      y
    );

    if ( block != false ) {
      if ( destroy ) {
        this.world.setBlock(block.x, block.y, block.z, MATERIALS[EMaterial.AIR] );
      } else {
        this.world.setBlock( block.x + block.n.x, block.y + block.n.y, block.z + block.n.z, this.buildMaterial );
      }
    }
  }

  public getEyePos() {
    return this.pos.add(new Vector( 0.0, 0.0, 1.7 ));
  }

  public update() {
    let velocity = this.velocity;
    let pos = this.pos;
    let bPos = new Vector(
      Math.floor( pos.x ),
      Math.floor( pos.y ),
      Math.floor( pos.z )
    );

    if (this.lastUpdate) {
      let delta = ( new Date().getTime() - this.lastUpdate ) / 1000;

      // View
      if ( this.dragging ) {
        this.angles[0] += ( this.targetPitch - this.angles[0] ) * 30 * delta;
        this.angles[1] += ( this.targetYaw - this.angles[1] ) * 30 * delta;
        if ( this.angles[0] < -Math.PI/2 ) {
          this.angles[0] = -Math.PI/2;
        }
        if ( this.angles[0] > Math.PI/2 ) {
          this.angles[0] = Math.PI/2;
        }
      }

      // Gravity
      if ( this.falling ) {
        velocity.z += -0.5;
      }

      // Jumping
      if ( this.keys[ACTION_TO_KEYBOARD_KEY_MAP[EKeyboardActions.JUMP]] && !this.falling ) {
        velocity.z = 8;
      }

      // Walking
      let walkVelocity = new Vector( 0, 0, 0 );
      if ( !this.falling ) {
        if ( this.keys[ACTION_TO_KEYBOARD_KEY_MAP[EKeyboardActions.MOVE_FORWARD]] ) {
          walkVelocity.x += Math.cos( Math.PI / 2 - this.angles[1] );
          walkVelocity.y += Math.sin( Math.PI / 2 - this.angles[1] );
        }
        if ( this.keys[ACTION_TO_KEYBOARD_KEY_MAP[EKeyboardActions.MOVE_BACKWARD]] ) {
          walkVelocity.x += Math.cos( Math.PI + Math.PI / 2 - this.angles[1] );
          walkVelocity.y += Math.sin( Math.PI + Math.PI / 2 - this.angles[1] );
        }
        if ( this.keys[ACTION_TO_KEYBOARD_KEY_MAP[EKeyboardActions.MOVE_LEFT]] ) {
          walkVelocity.x += Math.cos( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
          walkVelocity.y += Math.sin( Math.PI / 2 + Math.PI / 2 - this.angles[1] );
        }
        if ( this.keys[ACTION_TO_KEYBOARD_KEY_MAP[EKeyboardActions.MOVE_RIGHT]] ) {
          walkVelocity.x += Math.cos( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
          walkVelocity.y += Math.sin( -Math.PI / 2 + Math.PI / 2 - this.angles[1] );
        }
      }
      if ( walkVelocity.length() > 0 ) {
        walkVelocity = walkVelocity.normal();
        velocity.x = walkVelocity.x * 4;
        velocity.y = walkVelocity.y * 4;
      } else {
        velocity.x /= this.falling ? 1.01 : 1.5;
        velocity.y /= this.falling ? 1.01 : 1.5;
      }

      // Resolve collision
      this.pos = this.resolveCollision( pos, bPos, velocity.mul( delta ) );
    }

    this.lastUpdate = new Date().getTime();
  }

  public resolveCollision(pos: Vector, bPos: Vector, velocity: Vector) {
    let playerRect: Square = {
      x: pos.x + velocity.x,
      y: pos.y + velocity.y,
      size: 0.25
    };

    // Collect XY collision sides
    let collisionCandidates: DirectedLine[] = [];

    for ( let x = bPos.x - 1; x <= bPos.x + 1; x++ ) {
      for ( let y = bPos.y - 1; y <= bPos.y + 1; y++ ) {
        for ( let z = bPos.z; z <= bPos.z + 1; z++ ) {
          if ( this.world.getBlock( x, y, z ) != MATERIALS[EMaterial.AIR] ) {
            if ( this.world.getBlock( x - 1, y, z ) == MATERIALS[EMaterial.AIR] ) {
              collisionCandidates.push( { x: x, dir: -1, y1: y, y2: y + 1 } );
            }
            if ( this.world.getBlock( x + 1, y, z ) == MATERIALS[EMaterial.AIR] ) {
              collisionCandidates.push( { x: x + 1, dir: 1, y1: y, y2: y + 1 } );
            }
            if ( this.world.getBlock( x, y - 1, z ) == MATERIALS[EMaterial.AIR] ) {
              collisionCandidates.push( { y: y, dir: -1, x1: x, x2: x + 1 } );
            }
            if ( this.world.getBlock( x, y + 1, z ) == MATERIALS[EMaterial.AIR] ) {
              collisionCandidates.push( { y: y + 1, dir: 1, x1: x, x2: x + 1 } );
            }
          }
        }
      }
    }

    // Solve XY collisions
    for( let i in collisionCandidates ) {
      let side = collisionCandidates[i];

      if ( lineRectCollide( side, playerRect ) ) {
        if ( side.x != null && velocity.x * side.dir < 0 ) {
          pos.x = side.x + playerRect.size / 2 * ( velocity.x > 0 ? -1 : 1 );
          velocity.x = 0;
        } else if ( side.y != null && velocity.y * side.dir < 0 ) {
          pos.y = side.y + playerRect.size / 2 * ( velocity.y > 0 ? -1 : 1 );
          velocity.y = 0;
        }
      }
    }

    let playerFace: Rectangle = { x1: pos.x + velocity.x - 0.125, y1: pos.y + velocity.y - 0.125, x2: pos.x + velocity.x + 0.125, y2: pos.y + velocity.y + 0.125 };
    let newBZLower = Math.floor( pos.z + velocity.z );
    let newBZUpper = Math.floor( pos.z + 1.7 + velocity.z * 1.1 );

    // Collect Z collision sides
    let collisionCandidatesZ: Collision[] = [];

    for ( let x = bPos.x - 1; x <= bPos.x + 1; x++ ) {
      for ( let y = bPos.y - 1; y <= bPos.y + 1; y++ ) {
        if ( this.world.getBlock( x, y, newBZLower ) != MATERIALS[EMaterial.AIR] ) {
          collisionCandidatesZ.push( { z: newBZLower + 1, dir: 1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
        }
        if ( this.world.getBlock( x, y, newBZUpper ) != MATERIALS[EMaterial.AIR] ) {
          collisionCandidatesZ.push( { z: newBZUpper, dir: -1, x1: x, y1: y, x2: x + 1, y2: y + 1 } );
        }
      }
    }

    // Solve Z collisions
    this.falling = true;
    for ( let i in collisionCandidatesZ ) {
      let face = collisionCandidatesZ[i];

      if ( rectRectCollide( face, playerFace ) && velocity.z * face.dir < 0 ) {
        if ( velocity.z < 0 ) {
          this.falling = false;
          pos.z = face.z;
          velocity.z = 0;
          this.velocity.z = 0;
        } else {
          pos.z = face.z - 1.8;
          velocity.z = 0;
          this.velocity.z = 0;
        }

        break;
      }
    }

    // Return solution
    return pos.add( velocity );
  }
}

export default Player;