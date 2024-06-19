import {
  World,
  Vector,
  MATERIALS,
  EMaterial,
  Block,
  Chunk,
  IRenderer,
} from '@acid-info/webcave-core/src'
import { mat4 } from "gl-matrix"
import { WEB_GL_SOURCE } from './shared/webgl'

import {
  WebGl,
  WebGLBufferWithVertices,
  WebGLObject,
  WebGLTextureWithImage
} from "./types/gl"

class Renderer implements IRenderer {
  public readonly canvas: HTMLCanvasElement;
  public readonly gl: WebGl;
  public program: WebGLProgram;

  public projMatrix: mat4;
  public viewMatrix: mat4;
  public modelMatrix: mat4;

  public textCanvas: HTMLCanvasElement;
  public textContext: CanvasRenderingContext2D;

  public texTerrain: WebGLTextureWithImage;
  public texPlayer: WebGLTextureWithImage;
  public texWhite: WebGLTextureWithImage;

  public uSampler: WebGLUniformLocation;
  public uModelMat: WebGLUniformLocation;
  public uProjMat: WebGLUniformLocation;
  public uViewMat: WebGLUniformLocation;

  public aPos: GLuint;
  public aColor: GLuint;
  public aTexCoord: GLuint;

  // Vertical field of view in radians
  public fov: number;
  // Near bound of the frustum (where the view in front starts)
  public min: number;
  // Far bound of the frustum (where the view in front ends)
  public max: number;
  public world: World;
  public camPos: number[];
  public chunkSize: number;
  public chunks: Chunk[];

  public playerHead: WebGLBufferWithVertices;
  public playerBody: WebGLBufferWithVertices;
  public playerLeftArm: WebGLBufferWithVertices;
  public playerRightArm: WebGLBufferWithVertices;
  public playerLeftLeg: WebGLBufferWithVertices;
  public playerRightLeg: WebGLBufferWithVertices;

  constructor(canvasRef: HTMLCanvasElement) {
    this.canvas = canvasRef;

    this.canvas.width = canvasRef.clientWidth;
    this.canvas.height = canvasRef.clientHeight;

    try {
      this.gl = this.canvas.getContext( "webgl" );
    } catch ( e ) {
      throw "Your browser doesn't support WebGL!";
    }

    this.gl.viewportWidth = this.canvas.width;
    this.gl.viewportHeight = this.canvas.height;

    this.gl.clearColor(0.62, 0.81, 1.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // Load shaders
    this.loadShaders();

    // Load player model
    this.loadPlayerHeadModel();
    this.loadPlayerBodyModel();

    // Create projection and view matrices
    this.projMatrix = mat4.create();
    this.viewMatrix = mat4.create();

    // Create dummy model matrix
    this.modelMatrix = mat4.create();
    mat4.identity(this.modelMatrix);
    this.gl.uniformMatrix4fv(this.uModelMat, false, this.modelMatrix);

    // Create 1px white texture for pure vertex color operations (e.g. picking)
    this.texWhite = this.gl.createTexture();
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texWhite);

    let white = new Uint8Array( [ 255, 255, 255, 255 ] );

    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, white);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.uniform1i(  this.uSampler, 0 );

    // Load player texture
    this.texPlayer = this.gl.createTexture();
    this.texPlayer.image = new Image();

    this.texPlayer.image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texPlayer);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.texPlayer.image );
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
    };
    this.texPlayer.image.src = "webcave/player.png";

    // Load terrain texture
    this.texTerrain = this.gl.createTexture();
    this.texTerrain.image = new Image();
    this.texTerrain.image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texTerrain);
      this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.texTerrain.image );
      this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
      this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
    };
    this.texTerrain.image.src = "webcave/terrain.png";

    // Create canvas used to draw name tags
    let textCanvas = this.textCanvas = document.createElement( "canvas" );
    textCanvas.width = 256;
    textCanvas.height = 64;
    textCanvas.style.display = "none";
    let ctx = this.textContext = textCanvas.getContext( "2d" );
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "24px Minecraftia";
    document.getElementsByTagName( "body" )[0].appendChild( textCanvas );
  }

  public draw() {
    // Initialise view
    this.updateViewport();
    this.gl.viewport( 0, 0, this.gl.viewportWidth, this.gl.viewportHeight );
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

    // Draw level chunks
    let chunks = this.chunks;

    this.gl.bindTexture( this.gl.TEXTURE_2D, this.texTerrain );

    if ( chunks != null ) {
      for ( let i = 0; i < chunks.length; i++ ) {
        if ( chunks[i].buffer != null )
          this.drawBuffer( chunks[i].buffer );
      }
    }

    // Draw players
    let players = this.world.players;

    this.gl.enable( this.gl.BLEND );

    for ( let p in players ) {
      let player = players[p];
      let aniangle: number;

      if(player.moving || Math.abs(player.aniframe) > 0.1) {
        player.aniframe += 0.15;

        if (player.aniframe > Math.PI) {
          player.aniframe  = -Math.PI;
        }

        aniangle = Math.PI/2 * Math.sin(player.aniframe);
        if (!player.moving && Math.abs(aniangle) < 0.1 ) {
          player.aniframe = 0;
        }
      } else {
        aniangle = 0;
      }

      // Draw head
      let pitch = player.pitch;
      if ( pitch < -0.32 ) pitch = -0.32;
      if ( pitch > 0.32 ) pitch = 0.32;

      mat4.identity( this.modelMatrix );
      mat4.translate( this.modelMatrix, this.modelMatrix, [ player.x, player.y, player.z + 1.7 ] );
      mat4.rotateZ( this.modelMatrix, this.modelMatrix, Math.PI - player.yaw );
      mat4.rotateX( this.modelMatrix, this.modelMatrix, -pitch );
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );

      this.gl.bindTexture( this.gl.TEXTURE_2D, this.texPlayer );
      this.drawBuffer( this.playerHead );

      // Draw body
      mat4.identity( this.modelMatrix );
      mat4.translate( this.modelMatrix, this.modelMatrix, [ player.x, player.y, player.z + 0.01 ] );
      mat4.rotateZ( this.modelMatrix, this.modelMatrix, Math.PI - player.yaw );
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );
      this.drawBuffer( this.playerBody );

      mat4.translate( this.modelMatrix, this.modelMatrix, [ 0, 0, 1.4 ] );
      mat4.rotateX( this.modelMatrix, this.modelMatrix, 0.75* aniangle);
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );
      this.drawBuffer( this.playerLeftArm );

      mat4.rotateX( this.modelMatrix, this.modelMatrix, -1.5*aniangle);
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );
      this.drawBuffer( this.playerRightArm );
      mat4.rotateX( this.modelMatrix, this.modelMatrix, 0.75*aniangle);

      mat4.translate( this.modelMatrix, this.modelMatrix, [ 0, 0, -0.67 ] );

      mat4.rotateX( this.modelMatrix, this.modelMatrix, 0.5*aniangle);
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );
      this.drawBuffer( this.playerRightLeg );

      mat4.rotateX( this.modelMatrix, this.modelMatrix, -aniangle);
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );
      this.drawBuffer( this.playerLeftLeg );

      // Draw player name
      if ( !player.nametag ) {
        player.nametag = this.buildPlayerName( player.nick );
      }

      // Calculate angle so that the nametag always faces the local player
      let ang = -Math.PI/2 + Math.atan2( this.camPos[1] - player.y, this.camPos[0] - player.x );

      mat4.identity( this.modelMatrix );
      mat4.translate( this.modelMatrix, this.modelMatrix, [ player.x, player.y, player.z + 2.05 ] );
      mat4.rotateZ( this.modelMatrix, this.modelMatrix, ang );
      mat4.scale( this.modelMatrix, this.modelMatrix, [ 0.005, 1, 0.005 ] );
      this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );

      this.gl.bindTexture( this.gl.TEXTURE_2D, player.nametag.texture );
      this.drawBuffer( player.nametag.model );
    }

    this.gl.disable( this.gl.BLEND );

    mat4.identity( this.modelMatrix );
    this.gl.uniformMatrix4fv( this.uModelMat, false, this.modelMatrix );
  }

  /*
  * Returns the texture and vertex buffer for drawing the name
  * tag of the specified player.
  * */
  public buildPlayerName(nickname: string): WebGLObject {
    let gl = this.gl;
    let canvas = this.textCanvas;
    let ctx = this.textContext;

    nickname = nickname
        .replace( /&lt;/g, "<" )
        .replace( /&gt;/g, ">" )
        .replace( /&quot;/, "\"" );

    let w = ctx.measureText( nickname ).width + 16;
    let h = 45;

    // Draw text box
    ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, w, 45 );

    ctx.fillStyle = "#fff";
    ctx.fillText( nickname, 10, 20 );

    // Create texture
    let tex = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, tex );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

    // Create model
    let vertices = [
      -w/2, 0, h, w/256, 0, 1, 1, 1, 0.7,
      w/2, 0, h, 0, 0, 1, 1, 1, 0.7,
      w/2, 0, 0, 0, h/64, 1, 1, 1, 0.7,
      w/2, 0, 0, 0, h/64, 1, 1, 1, 0.7,
      -w/2, 0, 0, w/256, h/64, 1, 1, 1, 0.7,
      -w/2, 0, h, w/256, 0, 1, 1, 1, 0.7
    ];

    let buffer: WebGLBufferWithVertices = gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

    return {
      texture: tex,
      model: buffer
    };
  }

  /*
  * Returns the block at mouse position mx and my.
  * The blocks that can be reached lie between min and max.
  * Each side is rendered with the X, Y and Z position of the
  * block in the RGB color values and the normal of the side is
  * stored in the color alpha value. In that way, all information
  * can be retrieved by simply reading the pixel the mouse is over.
  * WARNING: This implies that the level can never be larger than
  * 254x254x254 blocks! (Value 255 is used for sky.)
  * */
  public pickAt(min: Vector, max: Vector, mx: number, my: number) {
    // Create framebuffer for picking render
    let fbo = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);

    let bt = this.gl.createTexture();
    this.gl.bindTexture( this.gl.TEXTURE_2D, bt );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
    this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, 512, 512, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null );

    let renderbuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer( this.gl.RENDERBUFFER, renderbuffer );
    this.gl.renderbufferStorage( this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, 512, 512 );

    this.gl.framebufferTexture2D( this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, bt, 0 );
    this.gl.framebufferRenderbuffer( this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer );

    // Build buffer with block pick candidates
    let vertices = [];

    for ( let x = min.x; x <= max.x; x++ ) {
      for ( let y = min.y; y <= max.y; y++ ) {
        for ( let z = min.z; z <= max.z; z++ ) {
          if ( this.world.getBlock( x, y, z ) != MATERIALS[EMaterial.AIR] )
            Block.pushPickingVertices( vertices, x, y, z );
        }
      }
    }

    let buffer: WebGLBufferWithVertices = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.STREAM_DRAW);

    // Draw buffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texWhite);

    this.gl.viewport( 0, 0, 512, 512 );
    this.gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

    this.drawBuffer( buffer );

    // Read pixel
    let pixel = new Uint8Array( 4 );
    this.gl.readPixels(mx / this.gl.viewportWidth*512, (1-my/this.gl.viewportHeight)*512, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel );

    // Reset states
    this.gl.bindTexture( this.gl.TEXTURE_2D, this.texTerrain );
    this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
    this.gl.clearColor( 0.62, 0.81, 1.0, 1.0 );

    // Clean up
    this.gl.deleteBuffer( buffer );
    this.gl.deleteRenderbuffer( renderbuffer );
    this.gl.deleteTexture( bt );
    this.gl.deleteFramebuffer( fbo );

    // Build result
    if ( pixel[0] != 255 ) {
      let normal: Vector;

      if ( pixel[3] == 1 ) {
        normal = new Vector( 0, 0, 1 );
      } else if ( pixel[3] == 2 ) {
        normal = new Vector( 0, 0, -1 );
      } else if ( pixel[3] == 3 ) {
        normal = new Vector( 0, -1, 0 );
      } else if ( pixel[3] == 4 ) {
        normal = new Vector( 0, 1, 0 );
      } else if ( pixel[3] == 5 ) {
        normal = new Vector( -1, 0, 0 );
      } else if ( pixel[3] == 6 ) {
        normal = new Vector( 1, 0, 0 );
      }

      return {
        x: pixel[0],
        y: pixel[1],
        z: pixel[2],
        n: normal
      }
    } else {
      return false;
    }
  }

  /*
  * Check if the viewport is still the same size and update
  * the render configuration if required.
  * */
  public updateViewport() {
    if (
      this.canvas.clientWidth != this.gl.viewportWidth ||
      this.canvas.clientHeight != this.gl.viewportHeight
    ) {
      this.gl.viewportWidth = this.canvas.clientWidth;
      this.gl.viewportHeight = this.canvas.clientHeight;

      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;

      // Update perspective projection based on new w/h ratio
      this.setPerspective( this.fov, this.min, this.max );
    }
  }

  /*
  * Takes care of loading the shaders.
  * */
  public loadShaders() {
    // Create shader program
    this.program = this.gl.createProgram();

    // Compile vertex shader
    let vertexShader = this.gl.createShader( this.gl.VERTEX_SHADER );
    this.gl.shaderSource( vertexShader, WEB_GL_SOURCE.VERTEX );
    this.gl.compileShader( vertexShader );
    this.gl.attachShader( this.program, vertexShader );

    if ( !this.gl.getShaderParameter( vertexShader, this.gl.COMPILE_STATUS ) ) {
      throw "Could not compile vertex shader!\n" + this.gl.getShaderInfoLog( vertexShader );
    }
    // Compile fragment shader
    let fragmentShader = this.gl.createShader( this.gl.FRAGMENT_SHADER );
    this.gl.shaderSource( fragmentShader, WEB_GL_SOURCE.FRAGMENT );
    this.gl.compileShader( fragmentShader );
    this.gl.attachShader( this.program, fragmentShader );

    if ( !this.gl.getShaderParameter( fragmentShader, this.gl.COMPILE_STATUS ) )
      throw "Could not compile fragment shader!\n" + this.gl.getShaderInfoLog( fragmentShader );

    // Finish program
    this.gl.linkProgram( this.program );

    if ( !this.gl.getProgramParameter( this.program, this.gl.LINK_STATUS ) )
      throw "Could not link the shader program!";

    this.gl.useProgram( this.program );

    // Store variable locations
    this.uProjMat = this.gl.getUniformLocation( this.program, "uProjMatrix" );
    this.uViewMat= this.gl.getUniformLocation( this.program, "uViewMatrix" );
    this.uModelMat= this.gl.getUniformLocation( this.program, "uModelMatrix" );
    this.uSampler = this.gl.getUniformLocation( this.program, "uSampler" );
    this.aPos = this.gl.getAttribLocation( this.program, "aPos" );
    this.aColor = this.gl.getAttribLocation( this.program, "aColor" );
    this.aTexCoord = this.gl.getAttribLocation( this.program, "aTexCoord" );

    // Enable input
    this.gl.enableVertexAttribArray( this.aPos );
    this.gl.enableVertexAttribArray( this.aColor );
    this.gl.enableVertexAttribArray( this.aTexCoord );
  }

  /*
  * Makes the renderer start tracking a new world and set up the chunk structure.
  *
  * world - The world object to operate on.
  * chunkSize - X, Y and Z dimensions of each chunk, doesn't have to fit exactly inside the world.
  * */
  public setWorld(world: World, chunkSize: number) {
    this.world = world;
    world.renderer = this;
    this.chunkSize = chunkSize;

    // Create chunk list
    this.chunks = this.chunks || [];
    for (let x = 0; x < world.sx; x += chunkSize) {
      for (let y = 0; y < world.sy; y += chunkSize) {
        for (let z = 0; z < world.sz; z += chunkSize) {
          this.chunks.push({
            start: [x, y, z],
            end: [Math.min(world.sx, x + chunkSize), Math.min(world.sy, y + chunkSize), Math.min(world.sz, z + chunkSize)],
            dirty: true
          });
        }
      }
    }
  }

  /*
  * Callback from world to inform the renderer of a changed block
  * */
  public onBlockChanged(x: number, y: number, z: number) {
    let chunks = this.chunks;

    for (let i = 0; i < chunks.length; i++ ) {
      // Neighbouring chunks are updated as well if the block is on a chunk border
      // Also, all chunks below the block are updated because of lighting
      if ( x >= chunks[i].start[0] && x < chunks[i].end[0] && y >= chunks[i].start[1] && y < chunks[i].end[1] && z >= chunks[i].start[2] && z < chunks[i].end[2] )
        chunks[i].dirty = true;
      else if ( x >= chunks[i].start[0] && x < chunks[i].end[0] && y >= chunks[i].start[1] && y < chunks[i].end[1] && ( z >= chunks[i].end[2] || z == chunks[i].start[2] - 1 ) )
        chunks[i].dirty = true;
      else if ( x >= chunks[i].start[0] && x < chunks[i].end[0] && z >= chunks[i].start[2] && z < chunks[i].end[2] && ( y == chunks[i].end[1] || y == chunks[i].start[1] - 1 ) )
        chunks[i].dirty = true;
      else if ( y >= chunks[i].start[1] && y < chunks[i].end[1] && z >= chunks[i].start[2] && z < chunks[i].end[2] && ( x == chunks[i].end[0] || x == chunks[i].start[0] - 1 ) )
        chunks[i].dirty = true;
    }
  }

  public buildChunks(count: number) {
    let gl = this.gl;
    let chunks = this.chunks;
    let world = this.world;

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];

      if (chunk.dirty) {
        let vertices = [];

        // Create map of lowest blocks that are still lit
        let lightmap = {};
        for (let x = chunk.start[0] - 1; x < chunk.end[0] + 1; x++) {
          lightmap[x] = {};

          for (let y = chunk.start[1] - 1; y < chunk.end[1] + 1; y++) {
            for (let z = world.sz - 1; z >= 0; z--) {
              lightmap[x][y] = z;
              if (!world.getBlock(x, y, z).transparent) break;
            }
          }
        }

        // Add vertices for blocks
        for (let x = chunk.start[0]; x < chunk.end[0]; x++) {
          for (let y = chunk.start[1]; y < chunk.end[1]; y++) {
            for (let z = chunk.start[2]; z < chunk.end[2]; z++) {
              if (world.blocks[x][y][z] == MATERIALS[EMaterial.AIR]) {
                continue;
              }
              Block.pushVertices(vertices, world, lightmap, x, y, z);
            }
          }
        }

        // Create WebGL buffer
        if (chunk.buffer) {
          gl.deleteBuffer(chunk.buffer);
        }

        let buffer: WebGLBufferWithVertices = chunk.buffer = gl.createBuffer();
        buffer.vertices = vertices.length / 9;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        chunk.dirty = false;
        count--;
      }

      if (count == 0) {
        break;
      }
    }
  }

  /*
  * Sets the properties of the perspective projection.
  * */
  public setPerspective(fov: number, min: number, max: number) {
    // Vertical field of view in radians
    this.fov = fov;
    // Near bound of the frustum (where the view in front starts)
    this.min = min;
    // Far bound of the frustum (where the view in front ends)
    this.max = max;

    mat4.perspective( this.projMatrix, fov, this.gl.viewportWidth / this.gl.viewportHeight, min, max );
    this.gl.uniformMatrix4fv( this.uProjMat, false, this.projMatrix );
  }

  /*
  * Sets the properties of the perspective projection.
  * */
  public setCamera(pos: number[], ang: number[]) {
    this.camPos = pos;

    mat4.identity( this.viewMatrix );

    mat4.rotate( this.viewMatrix, this.viewMatrix, -ang[0] - Math.PI / 2, [ 1, 0, 0 ] );
    mat4.rotate( this.viewMatrix, this.viewMatrix, ang[1], [ 0, 0, 1 ] );
    mat4.rotate( this.viewMatrix, this.viewMatrix, -ang[2], [ 0, 1, 0 ] );

    mat4.translate( this.viewMatrix, this.viewMatrix, [ -pos[0], -pos[1], -pos[2] ] );

    this.gl.uniformMatrix4fv(this.uViewMat, false, this.viewMatrix);
  }

  public drawBuffer(buffer: WebGLBufferWithVertices) {
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );

    this.gl.vertexAttribPointer( this.aPos, 3, this.gl.FLOAT, false, 9*4, 0 );
    this.gl.vertexAttribPointer( this.aColor, 4, this.gl.FLOAT, false, 9*4, 5*4 );
    this.gl.vertexAttribPointer( this.aTexCoord, 2, this.gl.FLOAT, false, 9*4, 3*4 );

    this.gl.drawArrays( this.gl.TRIANGLES, 0, buffer.vertices );
  }

  public loadPlayerHeadModel() {
    // Player head
    let vertices = [
      // Top
      -0.25, -0.25, 0.25, 8/64, 0, 1, 1, 1, 1,
      0.25, -0.25, 0.25, 16/64, 0, 1, 1, 1, 1,
      0.25, 0.25, 0.25, 16/64, 8/32, 1, 1, 1, 1,
      0.25, 0.25, 0.25, 16/64, 8/32, 1, 1, 1, 1,
      -0.25, 0.25, 0.25, 8/64, 8/32, 1, 1, 1, 1,
      -0.25, -0.25, 0.25, 8/64, 0, 1, 1, 1, 1,

      // Bottom
      -0.25, -0.25, -0.25, 16/64, 0, 1, 1, 1, 1,
      -0.25, 0.25, -0.25, 16/64, 8/32, 1, 1, 1, 1,
      0.25, 0.25, -0.25, 24/64, 8/32, 1, 1, 1, 1,
      0.25, 0.25, -0.25, 24/64, 8/32, 1, 1, 1, 1,
      0.25, -0.25, -0.25, 24/64, 0, 1, 1, 1, 1,
      -0.25, -0.25, -0.25, 16/64, 0, 1, 1, 1, 1,

      // Front
      -0.25, -0.25, 0.25, 8/64, 8/32, 1, 1, 1, 1,
      -0.25, -0.25, -0.25, 8/64, 16/32, 1, 1, 1, 1,
      0.25, -0.25, -0.25, 16/64, 16/32, 1, 1, 1, 1,
      0.25, -0.25, -0.25, 16/64, 16/32, 1, 1, 1, 1,
      0.25, -0.25, 0.25, 16/64, 8/32, 1, 1, 1, 1,
      -0.25, -0.25, 0.25, 8/64, 8/32, 1, 1, 1, 1,

      // Rear
      -0.25, 0.25, 0.25, 24/64, 8/32, 1, 1, 1, 1,
      0.25, 0.25, 0.25, 32/64, 8/32, 1, 1, 1, 1,
      0.25, 0.25, -0.25, 32/64, 16/32, 1, 1, 1, 1,
      0.25, 0.25, -0.25, 32/64, 16/32, 1, 1, 1, 1,
      -0.25, 0.25, -0.25, 24/64, 16/32, 1, 1, 1, 1,
      -0.25, 0.25, 0.25, 24/64, 8/32, 1, 1, 1, 1,

      // Right
      -0.25, -0.25, 0.25, 16/64, 8/32, 1, 1, 1, 1,
      -0.25, 0.25, 0.25, 24/64, 8/32, 1, 1, 1, 1,
      -0.25, 0.25, -0.25, 24/64, 16/32, 1, 1, 1, 1,
      -0.25, 0.25, -0.25, 24/64, 16/32, 1, 1, 1, 1,
      -0.25, -0.25, -0.25, 16/64, 16/32, 1, 1, 1, 1,
      -0.25, -0.25, 0.25, 16/64, 8/32, 1, 1, 1, 1,

      // Left
      0.25, -0.25, 0.25, 0, 8/32, 1, 1, 1, 1,
      0.25, -0.25, -0.25, 0, 16/32, 1, 1, 1, 1,
      0.25, 0.25, -0.25, 8/64, 16/32, 1, 1, 1, 1,
      0.25, 0.25, -0.25, 8/64, 16/32, 1, 1, 1, 1,
      0.25, 0.25, 0.25, 8/64, 8/32, 1, 1, 1, 1,
      0.25, -0.25, 0.25, 0, 8/32, 1, 1, 1, 1
    ];

    let buffer: WebGLBufferWithVertices = this.playerHead = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.DYNAMIC_DRAW );
  }

  public loadPlayerBodyModel() {
    let vertices = [
      // Player torso

      // Top
      -0.30, -0.125, 1.45, 20/64, 16/32, 1, 1, 1, 1,
      0.30, -0.125, 1.45, 28/64, 16/32, 1, 1, 1, 1,
      0.30, 0.125, 1.45, 28/64, 20/32, 1, 1, 1, 1,
      0.30, 0.125, 1.45, 28/64, 20/32, 1, 1, 1, 1,
      -0.30, 0.125, 1.45, 20/64, 20/32, 1, 1, 1, 1,
      -0.30, -0.125, 1.45, 20/64, 16/32, 1, 1, 1, 1,

      // Bottom
      -0.30, -0.125, 0.73, 28/64, 16/32, 1, 1, 1, 1,
      -0.30, 0.125, 0.73, 28/64, 20/32, 1, 1, 1, 1,
      0.30, 0.125, 0.73, 36/64, 20/32, 1, 1, 1, 1,
      0.30, 0.125, 0.73, 36/64, 20/32, 1, 1, 1, 1,
      0.30, -0.125, 0.73, 36/64, 16/32, 1, 1, 1, 1,
      -0.30, -0.125, 0.73, 28/64, 16/32, 1, 1, 1, 1,

      // Front
      -0.30, -0.125, 1.45, 20/64, 20/32, 1, 1, 1, 1,
      -0.30, -0.125, 0.73, 20/64, 32/32, 1, 1, 1, 1,
      0.30, -0.125, 0.73, 28/64, 32/32, 1, 1, 1, 1,
      0.30, -0.125, 0.73, 28/64, 32/32, 1, 1, 1, 1,
      0.30, -0.125, 1.45, 28/64, 20/32, 1, 1, 1, 1,
      -0.30, -0.125, 1.45, 20/64, 20/32, 1, 1, 1, 1,

      // Rear
      -0.30, 0.125, 1.45, 40/64, 20/32, 1, 1, 1, 1,
      0.30, 0.125, 1.45, 32/64, 20/32, 1, 1, 1, 1,
      0.30, 0.125, 0.73, 32/64, 32/32, 1, 1, 1, 1,
      0.30, 0.125, 0.73, 32/64, 32/32, 1, 1, 1, 1,
      -0.30, 0.125, 0.73, 40/64, 32/32, 1, 1, 1, 1,
      -0.30, 0.125, 1.45, 40/64, 20/32, 1, 1, 1, 1,

      // Right
      -0.30, -0.125, 1.45, 16/64, 20/32, 1, 1, 1, 1,
      -0.30, 0.125, 1.45, 20/64, 20/32, 1, 1, 1, 1,
      -0.30, 0.125, 0.73, 20/64, 32/32, 1, 1, 1, 1,
      -0.30, 0.125, 0.73, 20/64, 32/32, 1, 1, 1, 1,
      -0.30, -0.125, 0.73, 16/64, 32/32, 1, 1, 1, 1,
      -0.30, -0.125, 1.45, 16/64, 20/32, 1, 1, 1, 1,

      // Left
      0.30, -0.125, 1.45, 28/64, 20/32, 1, 1, 1, 1,
      0.30, -0.125, 0.73, 28/64, 32/32, 1, 1, 1, 1,
      0.30, 0.125, 0.73, 32/64, 32/32, 1, 1, 1, 1,
      0.30, 0.125, 0.73, 32/64, 32/32, 1, 1, 1, 1,
      0.30, 0.125, 1.45, 32/64, 20/32, 1, 1, 1, 1,
      0.30, -0.125, 1.45, 28/64, 20/32, 1, 1, 1, 1,

    ];

    let buffer: WebGLBufferWithVertices = this.playerBody = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.DYNAMIC_DRAW );

    vertices = [
      // Left arm

      // Top
      0.30, -0.125, 0.05, 44/64, 16/32, 1, 1, 1, 1,
      0.55, -0.125, 0.05, 48/64, 16/32, 1, 1, 1, 1,
      0.55,  0.125, 0.05, 48/64, 20/32, 1, 1, 1, 1,
      0.55,  0.125, 0.05, 48/64, 20/32, 1, 1, 1, 1,
      0.30,  0.125, 0.05, 44/64, 20/32, 1, 1, 1, 1,
      0.30, -0.125, 0.05, 44/64, 16/32, 1, 1, 1, 1,

      // Bottom
      0.30, -0.125, -0.67, 48/64, 16/32, 1, 1, 1, 1,
      0.30,  0.125, -0.67, 48/64, 20/32, 1, 1, 1, 1,
      0.55,  0.125, -0.67, 52/64, 20/32, 1, 1, 1, 1,
      0.55,  0.125, -0.67, 52/64, 20/32, 1, 1, 1, 1,
      0.55, -0.125, -0.67, 52/64, 16/32, 1, 1, 1, 1,
      0.30, -0.125, -0.67, 48/64, 16/32, 1, 1, 1, 1,

      // Front
      0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,
      0.30, -0.125, -0.67, 48/64, 32/32, 1, 1, 1, 1,
      0.55, -0.125, -0.67, 44/64, 32/32, 1, 1, 1, 1,
      0.55, -0.125, -0.67, 44/64, 32/32, 1, 1, 1, 1,
      0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,
      0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,

      // Rear
      0.30, 0.125,  0.05, 52/64, 20/32, 1, 1, 1, 1,
      0.55, 0.125,  0.05, 56/64, 20/32, 1, 1, 1, 1,
      0.55, 0.125, -0.67, 56/64, 32/32, 1, 1, 1, 1,
      0.55, 0.125, -0.67, 56/64, 32/32, 1, 1, 1, 1,
      0.30, 0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      0.30, 0.125,  0.05, 52/64, 20/32, 1, 1, 1, 1,

      // Right
      0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,
      0.30,  0.125,  0.05, 52/64, 20/32, 1, 1, 1, 1,
      0.30,  0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      0.30,  0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      0.30, -0.125, -0.67, 48/64, 32/32, 1, 1, 1, 1,
      0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,

      // Left
      0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,
      0.55, -0.125, -0.67, 44/64, 32/32, 1, 1, 1, 1,
      0.55,  0.125, -0.67, 40/64, 32/32, 1, 1, 1, 1,
      0.55,  0.125, -0.67, 40/64, 32/32, 1, 1, 1, 1,
      0.55,  0.125,  0.05, 40/64, 20/32, 1, 1, 1, 1,
      0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,

    ];

    buffer = this.playerLeftArm = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.DYNAMIC_DRAW );

    vertices = [
      // Right arm

      // Top
      -0.55, -0.125, 0.05, 44/64, 16/32, 1, 1, 1, 1,
      -0.30, -0.125, 0.05, 48/64, 16/32, 1, 1, 1, 1,
      -0.30,  0.125, 0.05, 48/64, 20/32, 1, 1, 1, 1,
      -0.30,  0.125, 0.05, 48/64, 20/32, 1, 1, 1, 1,
      -0.55,  0.125, 0.05, 44/64, 20/32, 1, 1, 1, 1,
      -0.55, -0.125, 0.05, 44/64, 16/32, 1, 1, 1, 1,

      // Bottom
      -0.55, -0.125, -0.67, 52/64, 16/32, 1, 1, 1, 1,
      -0.55,  0.125, -0.67, 52/64, 20/32, 1, 1, 1, 1,
      -0.30,  0.125, -0.67, 48/64, 20/32, 1, 1, 1, 1,
      -0.30,  0.125, -0.67, 48/64, 20/32, 1, 1, 1, 1,
      -0.30, -0.125, -0.67, 48/64, 16/32, 1, 1, 1, 1,
      -0.55, -0.125, -0.67, 52/64, 16/32, 1, 1, 1, 1,

      // Front
      -0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,
      -0.55, -0.125, -0.67, 44/64, 32/32, 1, 1, 1, 1,
      -0.30, -0.125, -0.67, 48/64, 32/32, 1, 1, 1, 1,
      -0.30, -0.125, -0.67, 48/64, 32/32, 1, 1, 1, 1,
      -0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,
      -0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,

      // Rear
      -0.55, 0.125,  0.05, 56/64, 20/32, 1, 1, 1, 1,
      -0.30, 0.125,  0.05, 52/64, 20/32, 1, 1, 1, 1,
      -0.30, 0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      -0.30, 0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      -0.55, 0.125, -0.67, 56/64, 32/32, 1, 1, 1, 1,
      -0.55, 0.125,  0.05, 56/64, 20/32, 1, 1, 1, 1,

      // Right
      -0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,
      -0.55,  0.125,  0.05, 40/64, 20/32, 1, 1, 1, 1,
      -0.55,  0.125, -0.67, 40/64, 32/32, 1, 1, 1, 1,
      -0.55,  0.125, -0.67, 40/64, 32/32, 1, 1, 1, 1,
      -0.55, -0.125, -0.67, 44/64, 32/32, 1, 1, 1, 1,
      -0.55, -0.125,  0.05, 44/64, 20/32, 1, 1, 1, 1,

      // Left
      -0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,
      -0.30, -0.125, -0.67, 48/64, 32/32, 1, 1, 1, 1,
      -0.30,  0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      -0.30,  0.125, -0.67, 52/64, 32/32, 1, 1, 1, 1,
      -0.30,  0.125,  0.05, 52/64, 20/32, 1, 1, 1, 1,
      -0.30, -0.125,  0.05, 48/64, 20/32, 1, 1, 1, 1,

    ];

    buffer = this.playerRightArm = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.DYNAMIC_DRAW );

    vertices = [
      // Left leg

      // Top
      0.01, -0.125, 0, 4/64, 16/32, 1, 1, 1, 1,
      0.3,  -0.125, 0, 8/64, 16/32, 1, 1, 1, 1,
      0.3,   0.125, 0, 8/64, 20/32, 1, 1, 1, 1,
      0.3,   0.125, 0, 8/64, 20/32, 1, 1, 1, 1,
      0.01,  0.125, 0, 4/64, 20/32, 1, 1, 1, 1,
      0.01, -0.125, 0, 4/64, 16/32, 1, 1, 1, 1,

      // Bottom
      0.01, -0.125, -0.73,  8/64, 16/32, 1, 1, 1, 1,
      0.01,  0.125, -0.73,  8/64, 20/32, 1, 1, 1, 1,
      0.3,   0.125, -0.73, 12/64, 20/32, 1, 1, 1, 1,
      0.3,   0.125, -0.73, 12/64, 20/32, 1, 1, 1, 1,
      0.3,  -0.125, -0.73, 12/64, 16/32, 1, 1, 1, 1,
      0.01, -0.125, -0.73,  8/64, 16/32, 1, 1, 1, 1,

      // Front
      0.01, -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,
      0.01, -0.125, -0.73, 4/64, 32/32, 1, 1, 1, 1,
      0.3,  -0.125, -0.73, 8/64, 32/32, 1, 1, 1, 1,
      0.3,  -0.125, -0.73, 8/64, 32/32, 1, 1, 1, 1,
      0.3,  -0.125,     0, 8/64, 20/32, 1, 1, 1, 1,
      0.01, -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,

      // Rear
      0.01, 0.125,     0, 12/64, 20/32, 1, 1, 1, 1,
      0.3,  0.125,     0, 16/64, 20/32, 1, 1, 1, 1,
      0.3,  0.125, -0.73, 16/64, 32/32, 1, 1, 1, 1,
      0.3,  0.125, -0.73, 16/64, 32/32, 1, 1, 1, 1,
      0.01, 0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      0.01, 0.125,     0, 12/64, 20/32, 1, 1, 1, 1,

      // Right
      0.01, -0.125,     0,  8/64, 20/32, 1, 1, 1, 1,
      0.01,  0.125,     0, 12/64, 20/32, 1, 1, 1, 1,
      0.01,  0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      0.01,  0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      0.01, -0.125, -0.73,  8/64, 32/32, 1, 1, 1, 1,
      0.01, -0.125,     0,  8/64, 20/32, 1, 1, 1, 1,

      // Left
      0.3, -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,
      0.3, -0.125, -0.73, 4/64, 32/32, 1, 1, 1, 1,
      0.3,  0.125, -0.73, 0/64, 32/32, 1, 1, 1, 1,
      0.3,  0.125, -0.73, 0/64, 32/32, 1, 1, 1, 1,
      0.3,  0.125,     0, 0/64, 20/32, 1, 1, 1, 1,
      0.3, -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,
    ];

    buffer = this.playerLeftLeg = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.DYNAMIC_DRAW );

    vertices = [
      // Right leg

      // Top
      -0.3,  -0.125, 0, 4/64, 16/32, 1, 1, 1, 1,
      -0.01, -0.125, 0, 8/64, 16/32, 1, 1, 1, 1,
      -0.01,  0.125, 0, 8/64, 20/32, 1, 1, 1, 1,
      -0.01,  0.125, 0, 8/64, 20/32, 1, 1, 1, 1,
      -0.3,   0.125, 0, 4/64, 20/32, 1, 1, 1, 1,
      -0.3,  -0.125, 0, 4/64, 16/32, 1, 1, 1, 1,

      // Bottom
      -0.3,  -0.125, -0.73,  8/64, 16/32, 1, 1, 1, 1,
      -0.3,   0.125, -0.73,  8/64, 20/32, 1, 1, 1, 1,
      -0.01,  0.125, -0.73, 12/64, 20/32, 1, 1, 1, 1,
      -0.01,  0.125, -0.73, 12/64, 20/32, 1, 1, 1, 1,
      -0.01, -0.125, -0.73, 12/64, 16/32, 1, 1, 1, 1,
      -0.3,  -0.125, -0.73,  8/64, 16/32, 1, 1, 1, 1,

      // Front
      -0.3,  -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,
      -0.3,  -0.125, -0.73, 4/64, 32/32, 1, 1, 1, 1,
      -0.01, -0.125, -0.73, 8/64, 32/32, 1, 1, 1, 1,
      -0.01, -0.125, -0.73, 8/64, 32/32, 1, 1, 1, 1,
      -0.01, -0.125,     0, 8/64, 20/32, 1, 1, 1, 1,
      -0.3,  -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,

      // Rear
      -0.3,  0.125,     0, 16/64, 20/32, 1, 1, 1, 1,
      -0.01, 0.125,     0, 12/64, 20/32, 1, 1, 1, 1,
      -0.01, 0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      -0.01, 0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      -0.3,  0.125, -0.73, 16/64, 32/32, 1, 1, 1, 1,
      -0.3,  0.125,     0, 16/64, 20/32, 1, 1, 1, 1,

      // Right
      -0.3, -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,
      -0.3,  0.125,     0, 0/64, 20/32, 1, 1, 1, 1,
      -0.3,  0.125, -0.73, 0/64, 32/32, 1, 1, 1, 1,
      -0.3,  0.125, -0.73, 0/64, 32/32, 1, 1, 1, 1,
      -0.3, -0.125, -0.73, 4/64, 32/32, 1, 1, 1, 1,
      -0.3, -0.125,     0, 4/64, 20/32, 1, 1, 1, 1,

      // Left
      -0.01, -0.125,    0,   8/64, 20/32, 1, 1, 1, 1,
      -0.01, -0.125, -0.73,  8/64, 32/32, 1, 1, 1, 1,
      -0.01,  0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      -0.01,  0.125, -0.73, 12/64, 32/32, 1, 1, 1, 1,
      -0.01,  0.125,     0, 12/64, 20/32, 1, 1, 1, 1,
      -0.01, -0.125,     0,  8/64, 20/32, 1, 1, 1, 1
    ];

    buffer = this.playerRightLeg = this.gl.createBuffer();
    buffer.vertices = vertices.length / 9;
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array( vertices ), this.gl.DYNAMIC_DRAW );
  }
}

export default Renderer;