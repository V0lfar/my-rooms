import { THREE } from './three-defs.js';

import { entity } from './entity.js';

import { math } from './math.js';

import { render_component } from './render-component.js';
import { basic_rigid_body } from './basic-rigid-body.js';
import { mesh_rigid_body } from './mesh-rigid-body.js';

import { getDocument } from '../node_modules/pdfjs-dist/build/pdf.mjs';

export const level_1_builder = (() => {

  class Level1Builder extends entity.Component {
    constructor(params) {
      super();

      this.params_ = params;
      this.spawned_ = false;
      this.materials_ = {};
    }

    LoadMaterial_(albedoName, normalName, roughnessName, metalnessName) {
      const textureLoader = new THREE.TextureLoader();
      const albedo = textureLoader.load('/resources/textures/' + albedoName);
      albedo.anisotropy = this.FindEntity('threejs').GetComponent('ThreeJSController').getMaxAnisotropy();
      albedo.wrapS = THREE.RepeatWrapping;
      albedo.wrapT = THREE.RepeatWrapping;
      albedo.encoding = THREE.sRGBEncoding;

      if (metalnessName != null) {
        const metalness = textureLoader.load('/resources/textures/' + metalnessName);
        metalness.anisotropy = this.FindEntity('threejs').GetComponent('ThreeJSController').getMaxAnisotropy();
        metalness.wrapS = THREE.RepeatWrapping;
        metalness.wrapT = THREE.RepeatWrapping;
      }

      if (normalName != null) {
        const normal = textureLoader.load('/resources/textures/' + normalName);
        normal.anisotropy = this.FindEntity('threejs').GetComponent('ThreeJSController').getMaxAnisotropy();
        normal.wrapS = THREE.RepeatWrapping;
        normal.wrapT = THREE.RepeatWrapping;
      }

      if (roughnessName != null) {
        const roughness = textureLoader.load('/resources/textures/' + roughnessName);
        roughness.anisotropy = this.FindEntity('threejs').GetComponent('ThreeJSController').getMaxAnisotropy();
        roughness.wrapS = THREE.RepeatWrapping;
        roughness.wrapT = THREE.RepeatWrapping;
      }

      const material = new THREE.MeshStandardMaterial({
        map: albedo,
        color: 0x303030,
        // metalnessMap: metalness,
        // normalMap: normal,
        // roughnessMap: roughness,
      });

      // VIDEO HACK
      material.onBeforeCompile = (shader) => {
        shader.uniforms.iTime = { value: 0.0 };

        shader.vertexShader = shader.vertexShader.replace('#include <common>',
          `
        #include <common>
        varying vec4 vWorldPosition;
        varying vec3 vWorldNormal;
        `);
        shader.vertexShader = shader.vertexShader.replace('#include <fog_vertex>',
          `
        #include <fog_vertex>
        vWorldPosition = worldPosition;
        vWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <common>',
          `
        #include <common>
        varying vec4 vWorldPosition;
        varying vec3 vWorldNormal;
        uniform float iTime;

vec3 hash( vec3 p ) // replace this by something better. really. do
{
  p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
        dot(p,vec3(269.5,183.3,246.1)),
        dot(p,vec3(113.5,271.9,124.6)));

  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

// return value noise (in x) and its derivatives (in yzw)
vec4 noised( in vec3 x )
{
    // grid
    vec3 i = floor(x);
    vec3 w = fract(x);
    
    #if 1
    // quintic interpolant
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    // cubic interpolant
    vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);
    #endif    
    
    // gradients
    vec3 ga = hash( i+vec3(0.0,0.0,0.0) );
    vec3 gb = hash( i+vec3(1.0,0.0,0.0) );
    vec3 gc = hash( i+vec3(0.0,1.0,0.0) );
    vec3 gd = hash( i+vec3(1.0,1.0,0.0) );
    vec3 ge = hash( i+vec3(0.0,0.0,1.0) );
  vec3 gf = hash( i+vec3(1.0,0.0,1.0) );
    vec3 gg = hash( i+vec3(0.0,1.0,1.0) );
    vec3 gh = hash( i+vec3(1.0,1.0,1.0) );
    
    // projections
    float va = dot( ga, w-vec3(0.0,0.0,0.0) );
    float vb = dot( gb, w-vec3(1.0,0.0,0.0) );
    float vc = dot( gc, w-vec3(0.0,1.0,0.0) );
    float vd = dot( gd, w-vec3(1.0,1.0,0.0) );
    float ve = dot( ge, w-vec3(0.0,0.0,1.0) );
    float vf = dot( gf, w-vec3(1.0,0.0,1.0) );
    float vg = dot( gg, w-vec3(0.0,1.0,1.0) );
    float vh = dot( gh, w-vec3(1.0,1.0,1.0) );
  
    // interpolations
    return vec4( va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) + u.x*u.y*(va-vb-vc+vd) + u.y*u.z*(va-vc-ve+vg) + u.z*u.x*(va-vb-ve+vf) + (-va+vb+vc-vd+ve-vf-vg+vh)*u.x*u.y*u.z,    // value
                  ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) + u.x*u.y*(ga-gb-gc+gd) + u.y*u.z*(ga-gc-ge+gg) + u.z*u.x*(ga-gb-ge+gf) + (-ga+gb+gc-gd+ge-gf-gg+gh)*u.x*u.y*u.z +   // derivatives
                  du * (vec3(vb,vc,ve) - va + u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) ));
}

float sdCircle( vec3 p, float r )
{
    return length(p) - r;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
  return mix(a, b, h) - k*h*(1.0-h);
}

const mat3 m3  = mat3( 0.00,  0.80,  0.60,
  -0.80,  0.36, -0.48,
  -0.60, -0.48,  0.64 );
const mat3 m3i = mat3( 0.00, -0.80, -0.60,
   0.80,  0.36, -0.48,
   0.60, -0.48,  0.64 );
const mat2 m2 = mat2(  0.80,  0.60,
  -0.60,  0.80 );
const mat2 m2i = mat2( 0.80, -0.60,
   0.60,  0.80 );

vec4 fbmd_7( in vec3 x )
{
    float f = 1.92;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=0; i<3; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
          `
          #include <emissivemap_fragment>
  
          float size = 1.0;
          vec2 posXY = mod(floor(vWorldPosition.xy / size), size);  
          vec2 posXZ = mod(floor(vWorldPosition.xz / size), 10.0);  
          vec2 posYZ = mod(floor(vWorldPosition.yz), 1.0);
  
          vec3 weights = abs(vWorldNormal.xyz);
          weights /= dot(weights, vec3(1.0));

          // vec2 coords1 = vWorldPosition.xy / size;
          // vec2 coords2 = vWorldPosition.xz / size;
          // vec2 coords3 = vWorldPosition.yz / size;
          // vec3 diffuseColor1 = mapTexelToLinear(texture(map, coords1)).xyz;
          // vec3 diffuseColor2 = mapTexelToLinear(texture(map, coords2)).xyz;
          // vec3 diffuseColor3 = mapTexelToLinear(texture(map, coords3)).xyz;

          // diffuseColor.xyz = diffuseColor1 * weights.z + diffuseColor2 * weights.y + diffuseColor3 * weights.x;

          // {
          //   vec3 mapN1 = texture(normalMap, coords1).xyz * 2.0 - 1.0;
          //   vec3 mapN2 = texture(normalMap, coords2).xyz * 2.0 - 1.0;
          //   vec3 mapN3 = texture(normalMap, coords3).xyz * 2.0 - 1.0;
          //   vec3 mapN = normalize(mapN1 * weights.z + mapN2 * weights.y + mapN3 * weights.x);
  
          //   normal = normalize( vNormal );
          //   normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );
          // }

          float maxWeight = max(weights.x, max(weights.y, weights.z));

          vec2 coords;
          if (maxWeight == weights.z) {
            coords = vWorldPosition.xy / size;
          } else if (maxWeight == weights.y) {
            coords = vWorldPosition.xz / size;
          } else {
            coords = vWorldPosition.yz / size;
          }

          diffuseColor.xyz = mapTexelToLinear(texture(map, coords)).xyz;
          // metalnessFactor = texture(metalnessMap, coords).x;
          // roughnessFactor = texture(roughnessMap, coords).x;

          // {
          //   vec3 mapN = texture2D( normalMap, coords ).xyz * 2.0 - 1.0;
          //   normal = normalize( vNormal );
          //   normal = perturbNormal2Arb( -vViewPosition, normal, mapN, faceDirection );
          //   // oop
          // }
          // diffuseColor.xyz = colXY * weights.z + colXZ * weights.y + colYZ * weights.x;
          // diffuseColor.xyz = vec3(1.0);

          metalnessFactor = 0.1 * (1.0 - diffuseColor.x);
          roughnessFactor = diffuseColor.x * 0.5;

          vec4 t = noised(floor(vWorldPosition.xyz / size) * 23.926325 + vec3(0.2));
          vec3 c1 = pal( t.x, vec3(0.1,0.3,1.0),vec3(0.0,0.2,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.33,0.67) );

          diffuseColor.xyz *= mix(0.25, 0.5, t.x);

          t = noised(floor(vWorldPosition.xyz / size) * 37.8953326 + vec3(0.05 * iTime));
          totalEmissiveRadiance += smoothstep(0.3, 0.31, t.x) * c1 * 0.25;
          diffuseColor.a = smoothstep(50.0, 0.0, fogDepth) * smoothstep(0.3, 0.31, t.x) * 0.5;

        `);
        material.userData.shader = shader;
      };

      material.customProgramCacheKey = () => {
        return albedo;
      };

      // VIDEO HACK
      const csm = this.FindEntity('threejs').GetComponent('ThreeJSController').csm_;
      csm.setupMaterial(material);

      return material;
    }

    BuildHackModel_() {
      // HACK
      // const plane = new THREE.Mesh(
      //     new THREE.PlaneGeometry(100, 100, 10, 10),
      //     checkerboard);
      // plane.castShadow = false;
      // plane.receiveShadow = true;
      // plane.rotation.x = -Math.PI / 2;
      // this.scene_.add(plane);
      this.materials_.checkerboard = this.LoadMaterial_(
        'whitesquare.png', null, null, null);
      this.materials_.vintageTile = this.LoadMaterial_(
        'vintage-tile1_albedo.png', 'vintage-tile1_normal.png',
        'vintage-tile1_roughness.png', 'vintage-tile1_metallic.png');
      this.materials_.hexagonPavers = this.LoadMaterial_(
        'hexagon-pavers1_albedo.png', 'hexagon-pavers1_normal.png',
        'hexagon-pavers1_roughness.png', 'hexagon-pavers1_metallic.png');
      this.materials_.dampDungeon = this.LoadMaterial_(
        'damp-dungeon-floor_albedo.png', 'damp-dungeon-floor_normal.png',
        'damp-dungeon-floor_roughness.png', 'damp-dungeon-floor_metallic.png');
      this.materials_.rockSliced = this.LoadMaterial_(
        'rock_sliced_albedo.png', 'rock_sliced_normal.png',
        'rock_sliced_roughness.png', 'rock_sliced_metallic.png');
      this.materials_.filthySpacePanels = this.LoadMaterial_(
        'filthy-space-panels_albedo.png', 'filthy-space-panels_normal.png',
        'filthy-space-panels_roughness.png', 'filthy-space-panels_metallic.png');
      this.materials_.paintedWornAsphalt = this.LoadMaterial_(
        'painted-worn-asphalt_albedo.png', 'painted-worn-asphalt_normal.png',
        'painted-worn-asphalt_roughness.png', 'painted-worn-asphalt_metallic.png');
      this.materials_.brokenDownConcrete2 = this.LoadMaterial_(
        'broken_down_concrete2_albedo.png', 'broken_down_concrete2_normal.png',
        'broken_down_concrete2_roughness.png', 'broken_down_concrete2_metallic.png');
      this.materials_.stucco1 = this.LoadMaterial_(
        'stucco1_albedo.png', 'stucco1_normal.png',
        'stucco1_roughness.png', 'stucco1_metallic.png');

      const ground = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1, 10, 10, 10),
        this.materials_.checkerboard);
      ground.castShadow = true;
      ground.receiveShadow = true;

      this.FindEntity('loader').GetComponent('LoadController').AddModel(ground, 'built-in.', 'ground');

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1, 10, 10, 10),
        this.materials_.checkerboard);
      box.castShadow = true;
      box.receiveShadow = true;

      this.FindEntity('loader').GetComponent('LoadController').AddModel(box, 'built-in.', 'box');

      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1),
        this.materials_.hexagonPavers);
      column.castShadow = true;
      column.receiveShadow = true;

      this.FindEntity('loader').GetComponent('LoadController').AddModel(column, 'built-in.', 'column');

      this.currentTime_ = 0.0;
    }

    async Update(timeElapsed) {
      this.currentTime_ += timeElapsed;

      if (this.materials_.checkerboard && this.materials_.checkerboard.userData.shader) {
        this.materials_.checkerboard.userData.shader.uniforms.iTime.value = this.currentTime_;
        this.materials_.checkerboard.needsUpdate = true;
      }

      if (this.spawned_) {
        return;
      }

      this.spawned_ = true;

      this.BuildHackModel_();

      // VIDEO HACK

      const e = new entity.Entity();
      e.AddComponent(new render_component.RenderComponent({
        scene: this.params_.scene,
        resourcePath: 'built-in.',
        resourceName: 'ground',
        scale: new THREE.Vector3(150, 3, 150),
        emissive: new THREE.Color(0x000000),
        color: new THREE.Color(0xFFFFFF),
      }));
      e.AddComponent(new basic_rigid_body.BasicRigidBody({
        box: new THREE.Vector3(150, 3, 150)
      }));

      this.Manager.Add(e);
      e.SetPosition(new THREE.Vector3(0, -10, 0));
      e.SetActive(false);

      const walls = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (let i = 0; i < walls.length; ++i) {
         const e = new entity.Entity();
         e.AddComponent(new basic_rigid_body.BasicRigidBody({
           box: new THREE.Vector3(150, 20, 150)
         }));
         this.Manager.Add(e);
         e.SetPosition(new THREE.Vector3(walls[i][0] * 150, 0, walls[i][1] * 150));
         e.SetActive(false);
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.mjs';

      const roomCode = getRoomCodeFromUrl();
      const room = await getRoom(roomCode)
      const monitors = room.monitors;
      for (let i = 0; i < monitors.length; ++i) {
        loadPDF(monitors[i]).then((canvas) => {
        
          const pdfMesh = createPDFMesh(canvas, monitors[i]);
          this.FindEntity('loader').GetComponent('LoadController').AddModel(pdfMesh, 'built-in.', 'pdfMesh' + '_' + i);
  
          const pdfEntity = new entity.Entity();
          pdfEntity.AddComponent(new render_component.RenderComponent({
            scene: this.params_.scene,
            resourcePath: 'built-in.',
            resourceName: 'pdfMesh' + '_' + i,
            scale: new THREE.Vector3(canvas.width / 1750 * 3, canvas.height / 1750 * 3, 1),
          }));
  
          this.Manager.Add(pdfEntity);
          var position = 150 * 0.75 / monitors.length
          pdfEntity.SetPosition(new THREE.Vector3(position * (i - 1), -6.0, -70));
          pdfEntity.SetActive(false);
        });
     }
    }
  };

  function getRoom(roomCode) {
    return fetch('http://localhost:8080/rooms/' + roomCode)
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid room response');
      }
      return response.json();
    })
    .then(roomData => {
      return roomData;
    })
    .catch(error => {
      console.error('There has been an error during room retrieving:', error);
    });
  }

  function getRoomCodeFromUrl() {
    var urlPath = window.location.pathname;
    var urlParts = urlPath.split('/');
    return urlParts[urlParts.length - 1]; 
  }

  async function loadPDF(monitor) {
    return getDocument('http://localhost:8080/monitor/' + monitor.id).promise.then((pdf) => {
      return pdf.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale: 3.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        return page.render(renderContext).promise.then(() => canvas);
      });
    });
  }

  function createPDFMesh(canvas, monitor) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    material.side = THREE.DoubleSide;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const basePath = '/resources/pdf/'
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.pdfId = monitor.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }


  return {
    Level1Builder: Level1Builder
  };

})();