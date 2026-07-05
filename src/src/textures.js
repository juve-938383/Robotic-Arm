import * as THREE from './three.js';


import brickBaseUrl from './assets/red_brick_diff_1k.jpg';
import brickNormalUrl from './assets/red_brick_nor_gl_1k.jpg';
import brickHeightUrl from './assets/red_brick_disp_1k.jpg';
import metalObjectUrl from './assets/metal_object.jpg';
import metalTrayUrl from './assets/metal_tray.jpg';
import conveyorBaseUrl from './assets/Conveyor_Belt_001_basecolor.png';
import conveyorNormalUrl from './assets/Conveyor_Belt_001_normal.png';
import conveyorHeightUrl from './assets/Conveyor_Belt_001_height.png';
import woodBaseUrl from './assets/worn_planks_diff_4k.jpg';
import woodNormalUrl from './assets/worn_planks_nor_gl_4k.jpg';
import concreteBaseUrl from './assets/interlocking_concrete_pavers_diff_1k.jpg';
import concreteNormalUrl from './assets/interlocking_concrete_pavers_nor_gl_1k.jpg';
import concreteHeightUrl from './assets/interlocking_concrete_pavers_disp_1k.png';
import plasticUrl from './assets/plastic.jpg';
import groundTilesBaseUrl from './assets/interior_tiles_diff_1k.jpg';
import groundTilesNormalUrl from './assets/interior_tiles_nor_gl_1k.jpg';
import groundWoodBaseUrl from './assets/wood_floor_diff_1k.jpg';
import groundWoodNormalUrl from './assets/wood_floor_nor_gl_1k.jpg';
import groundWoodHeightUrl from './assets/wood_floor_disp_1k.jpg';
import groundBaseUrl from './assets/clean_asphalt_diff_1k.jpg';

const brickBase = new THREE.TextureLoader().load(brickBaseUrl);
const brickNormal = new THREE.TextureLoader().load(brickNormalUrl);
const brickHeight = new THREE.TextureLoader().load(brickHeightUrl);
const metalObject = new THREE.TextureLoader().load(metalObjectUrl);
const metalTray = new THREE.TextureLoader().load(metalTrayUrl);
const conveyorBase = new THREE.TextureLoader().load(conveyorBaseUrl);
const conveyorNormal = new THREE.TextureLoader().load(conveyorNormalUrl);
const conveyorHeight = new THREE.TextureLoader().load(conveyorHeightUrl);
const woodBase = new THREE.TextureLoader().load(woodBaseUrl);
const woodNormal = new THREE.TextureLoader().load(woodNormalUrl);
const concreteBase = new THREE.TextureLoader().load(concreteBaseUrl);
const concreteNormal = new THREE.TextureLoader().load(concreteNormalUrl);
const concreteHeight = new THREE.TextureLoader().load(concreteHeightUrl);
const plastic = new THREE.TextureLoader().load(plasticUrl);
const groundTilesBase = new THREE.TextureLoader().load(groundTilesBaseUrl);
const groundTilesNormal = new THREE.TextureLoader().load(groundTilesNormalUrl);
const groundWoodBase = new THREE.TextureLoader().load(groundWoodBaseUrl);
const groundWoodNormal = new THREE.TextureLoader().load(groundWoodNormalUrl);
const groundWoodHeight = new THREE.TextureLoader().load(groundWoodHeightUrl);
const groundBase = new THREE.TextureLoader().load(groundBaseUrl);

const trayRepeatTextures = [
  brickBase,
  brickNormal,
  brickHeight,
  metalTray,
  conveyorBase,
  conveyorNormal,
  conveyorHeight,
  concreteBase,
  concreteNormal,
  concreteHeight,
 
];

trayRepeatTextures.forEach(tex => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 1);
});

const groundRepeatTextures = [
    groundTilesBase,
    groundTilesNormal,
    groundWoodBase,
    groundWoodNormal,
    groundWoodHeight,
    groundBase
];

groundRepeatTextures.forEach(tex => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
});

export const metal_material = new THREE.MeshPhysicalMaterial( {
   map:metalObject,
   metalness:0.8,
   roughness:0,
     
  } );
export const metal_tray_material = new THREE.MeshPhysicalMaterial( {
   map:metalTray,
   roughness:0.8, 
   side: THREE.DoubleSide
  } );
export const wood_material = new THREE.MeshStandardMaterial( {
  map: woodBase,
  bumpMap:woodNormal,
  roughness:0.8

} );
export const glassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  roughness: 0,
  thickness: 0.5,
  ior: 1.5,
  metalness: 0,
  envMapIntensity: 1.5
});
export const plasticMaterial = new THREE.MeshPhysicalMaterial({
  map:plastic,
  transmission: 0.4,
  roughness: 0.8,
  thickness: 0.5,
  metalness: 0
});
export const brick_material = new THREE.MeshStandardMaterial({
  map: brickBase,
  bumpMap:brickNormal,
  bumpScale:1,
  displacementMap:brickHeight,
  displacementScale:0.2,
  side: THREE.DoubleSide
});
export const concrete_material = new THREE.MeshStandardMaterial({
  map: concreteBase,
  bumpMap:concreteNormal,
  bumpScale:1,
  displacementMap:concreteHeight,
  displacementScale:0.15,
  side: THREE.DoubleSide
})
export const tray_top_material = new THREE.MeshStandardMaterial({
  map:conveyorBase,
  bumpMap:conveyorNormal,
  displacementMap:conveyorHeight,
  displacementScale:0.5,
  side: THREE.DoubleSide
});
export const ground_tile_material = new THREE.MeshStandardMaterial({
  map:groundTilesBase,
  bumpMap:groundTilesNormal,
  roughness:0.8,
  side: THREE.DoubleSide
});
export const ground_wood_material = new THREE.MeshStandardMaterial({
  map:groundWoodBase,
  bumpMap:groundWoodNormal,
  displacementMap:groundWoodHeight,
  displacementScale:0.5,
  roughness:1,
  side: THREE.DoubleSide
});
export const ground_base_material = new THREE.MeshStandardMaterial({
  map:groundBase,
  roughness:1,
  side: THREE.DoubleSide
});

export const cube_materials = [metal_material,wood_material,glassMaterial];
export const sphere_materials = [metal_material,glassMaterial,plasticMaterial];
export const torus_materials = [metal_material,glassMaterial,plasticMaterial];