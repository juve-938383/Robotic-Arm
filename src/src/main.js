import * as THREE from './three.js';
import { OrbitControls } from './three/addons/controls/OrbitControls.js';
import { EXRLoader } from './three/addons/loaders/EXRLoader.js';
import * as tex from "./textures.js";
import { GLTFLoader } from './three/addons/loaders/GLTFLoader.js';
import { Arm } from "./arm.js";


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const scene = new THREE.Scene();
new EXRLoader().load('empty_warehouse_01_4k.exr',(texture) => {
    texture.mapping=THREE.EquirectangularReflectionMapping;
    const envMap =pmremGenerator.fromEquirectangular(texture).texture;
    scene.background = texture;   
    scene.environment = envMap;      
    texture.dispose();
    pmremGenerator.dispose();
  }
);


const light = new THREE.DirectionalLight( 0xffffff,Math.PI );
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
light.position.x=20;
light.position.y=20;
light.target.position.set(0, 0, 0);
light.castShadow = true;
scene.add(light);
scene.add(light.target);

light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.left = -50;
light.shadow.camera.right = 50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;


const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 10, 15, -30 );
controls.update();
controls.rotateLeft(Math.PI/4);


document.getElementById('threejs-container').appendChild(renderer.domElement);
const container = document.getElementById('threejs-container');
window.addEventListener('resize', () => {
    const container = document.getElementById('threejs-container');

    camera.aspect =
        container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );
});

const tray_geometry = new THREE.PlaneGeometry( 100, 6,500,500);
const ground_geometry = new THREE.PlaneGeometry( 120, 75,50,50);

const cube_geometry = new THREE.BoxGeometry( 3.2, 3.2, 3.2 );
const sphere_geometry = new THREE.SphereGeometry( 1.8, 320, 160);
const torus_geometry = new THREE.TorusGeometry( 1.3, 0.67, 12,48 );

const geometries = [cube_geometry,sphere_geometry,torus_geometry];

const tray_left = new THREE.Mesh(tray_geometry,tex.metal_tray_material);
const tray_right= new THREE.Mesh(tray_geometry,tex.metal_tray_material);
const tray_top = new THREE.Mesh(tray_geometry,tex.tray_top_material);
tray_top.receiveShadow = true;
scene.add(tray_left);
scene.add(tray_right);
scene.add(tray_top);

tray_left.position.z -= 3;
tray_right.position.z += 3;
tray_top.rotation.x -=Math.PI/2;
tray_left.rotation.x += Math.PI;
tray_left.position.y -= 2;
tray_right.position.y -= 2;
const objects_on_tray = [];
const ground = new THREE.Mesh(ground_geometry,tex.ground_base_material);
scene.add(ground);
ground.rotation.x -= Math.PI/2;
ground.position.y -= 4;

var box_period = 3;
var simulationSpeed = 1;
var box_spawn_time = 0;
let armPause = true;
let trayPause = false;

var objectSpeed=200;
let stopSimulation = false;


function create_object(){
  if (!trayPause){
    const geo_ind=Math.floor(Math.random() * geometries.length);
    var mat=null;
    if (geo_ind==0){
      const mat_ind=Math.floor(Math.random() * tex.cube_materials.length);
      mat = tex.cube_materials[mat_ind];
    }
    if (geo_ind==1){
      const mat_ind=Math.floor(Math.random() * tex.sphere_materials.length);
      mat = tex.sphere_materials[mat_ind];
    }
    if (geo_ind==2){
      const mat_ind=Math.floor(Math.random() * tex.torus_materials.length);
      mat = tex.torus_materials[mat_ind];
    }

    const geo = geometries[geo_ind];
    const object= new THREE.Mesh(geo, mat);

    object.position.y += 2.2;
    object.position.x = -48;
    if (geo_ind==2){
      object.rotation.x=Math.PI/2;
      object.position.y-=1.05;
    }else if(geo_ind == 0){
      object.position.y -= 0.1
    }
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    objects_on_tray.push(object);
  } 
}

function setSpeed(s){
  simulationSpeed=Number(s);
  if (objectSpeed==0){
    trayPause=true;
  }
}
function setStop(){
  stopSimulation = !stopSimulation;
  if (trayPause==false && objectSpeed==0){
    objectSpeed=6.67;
    document.getElementById('object-speed').value=6.67;
  }
}
function setRotateCamera(){
  controls.autoRotate = !controls.autoRotate;
  document.getElementById('rotate-speed').disabled = !controls.autoRotate;
}
function setRotateSpeed(s){
  controls.autoRotateSpeed = Number(s);
}

var prevTex="metal"
function setTrayTexture(texture){

  
  if (texture =="metal"){
    tray_left.material = tex.metal_tray_material;
    tray_right.material = tex.metal_tray_material;
  }

  if (texture =="brick"){
    tray_left.material = tex.brick_material;
    tray_right.material = tex.brick_material;
  }

  if (texture =="concrete"){
    tray_left.material= tex.concrete_material;
    tray_right.material = tex.concrete_material;
  }

  //displacementMaps creates gap, all except metal has it so I move the panels to close the gap
  if(prevTex!=texture){
    if(texture=="metal"){
      tray_left.position.z-=0.05;
      tray_right.position.z+=0.05;
    }
    else if (prevTex=="metal") {
      tray_left.position.z+=0.05;
      tray_right.position.z-=0.05;
    }
  }
  
  prevTex=texture;
}

function setGroundTexture(texture){
  if (texture =="tiles"){
    ground.material = tex.ground_tile_material;

  }
  if (texture =="dark"){
    ground.material = tex.ground_base_material;

  }
  if (texture =="wood"){
    ground.material= tex.ground_wood_material;

  }

}
document.getElementById('object-speed').addEventListener('input', function () {
    setSpeed(this.value);
});
document.getElementById('stop').addEventListener('click', function () {
    if(stopSimulation){ this.innerHTML = "Stop Tray"; }
    else{ this.innerHTML = "Start Tray"; }
    setStop();
});
document.getElementById('rotate-camera').addEventListener('click', function () {
    setRotateCamera();
});
document.getElementById('rotate-speed').addEventListener('input', function () {
    setRotateSpeed(this.value);
} );
document.querySelectorAll('input[name="tray_texture"]').forEach(radio => {
  radio.addEventListener("change", function () {
    setTrayTexture(this.value);
  });
});
document.querySelectorAll('input[name="ground_texture"]').forEach(radio => {
  radio.addEventListener("change", function () {
    setGroundTexture(this.value);
  });
});




//=============Arm Initialization================

const x = new THREE.Vector3(1, 0, 0);
const y = new THREE.Vector3(0,1,0);
let z = new THREE.Vector3(0,0,1);

const stateCount = 8;
const state_positions = [
  new THREE.Vector3(0, 5.5, 0),  // LOWER
  new THREE.Vector3(0, 5.5, 0),  // PICK
  new THREE.Vector3(0, 12, 0),  // LIFT
  new THREE.Vector3(0, 12, 0),  // ADJUST
  new THREE.Vector3(0, 7, -10), // TO_GOAL
  new THREE.Vector3(0, 7, -10), // DROP
  new THREE.Vector3(0, 12, 0),  // RETREAT
  new THREE.Vector3(0, 12, 0)   // ADJUST 
  ];

const state_timers = [
    0.5,  // LOWER
    0.5,  // PICK
    0.5,  // LIFT
    0.5,  // ADJUST
    0.5,  // TO_GOAL
    0.5,  // DROP
    0.5,  // RETREAT 
    0.5   // ADJUST
  ];
const armMovingStages =[
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    false
  ];
const adjustements =[
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true
  ];
const clawAdjustements = [
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false
  ]
const clawL_open = -2.2;
const clawL_closed = -1.7;
const clawR_open = -0.9;
const clawR_closed = -1.5;
let clawOpen = true;
let previousClawLRotation = clawL_open;
let targetClawLRotation = clawL_closed;
let previousClawRRotation = clawR_open;
let targetClawRRotation = clawR_closed;




let stateTimer = 0;
let currentTime = 0;

let targetElbow = new THREE.Vector3(0,0,0);
let targetElbowCopy = new THREE.Vector3(0,0,0);
let targetHand = new THREE.Vector3(0,0,0);
//==============================================

//=============Arm Model Loading================

const gltfLoader = new GLTFLoader();
var baseModel;
var rootModel;
var upperArmModel;
var foreArmModel;
var clawL;
var clawRModel;
var clawLModel;
var pipe0;
var pipe1 = new THREE.Object3D();
var pipe2 = new THREE.Object3D();
var pipe3 = new THREE.Object3D();


baseModel = (await gltfLoader.loadAsync('./arm/base.glb')).scene;
rootModel = (await gltfLoader.loadAsync('./arm/root.glb')).scene;
upperArmModel = (await gltfLoader.loadAsync('./arm/upperArm.glb')).scene;
foreArmModel = (await gltfLoader.loadAsync('./arm/foreArm.glb')).scene;
clawRModel = (await gltfLoader.loadAsync('./arm/clawR.glb')).scene;
clawLModel = (await gltfLoader.loadAsync('./arm/clawL.glb')).scene;
pipe0 = (await gltfLoader.loadAsync('./pipe.glb')).scene;
pipe1 = pipe0.clone();
pipe2 = pipe0.clone();
pipe3 = pipe0.clone();


foreArmModel.add(clawRModel);
foreArmModel.add(clawLModel)
upperArmModel.add(foreArmModel);
scene.add(upperArmModel);
scene.add(baseModel);
scene.add(rootModel);



const posX = 0;
const posZ = 15;
rootModel.position.set(posX, 0, posZ);
rootModel.rotation.y = Math.PI/2;
baseModel.position.set(posX, 1, posZ);
upperArmModel.position.set(posX, 1, posZ);
upperArmModel.rotation.y = Math.PI/2;
foreArmModel.position.y = 15;
clawLModel.position.set(0.9, 16.7, -1);
clawLModel.rotation.y = Math.PI/2;
clawLModel.rotateOnWorldAxis(z, -Math.PI/5);
clawLModel.rotation.z = clawL_open;
clawRModel.position.set(0.9, 16.7, 0.95);
clawRModel.rotation.y = Math.PI/2;
clawRModel.rotateOnWorldAxis(z, -Math.PI/5);
clawRModel.rotation.z = clawR_open;

pipe0.position.set(-48, 2, 0);
pipe0.rotation.z = -Math.PI/2;
pipe1.position.set(-8.5, 0, -10);
pipe2.position.set(0, 0, -10);
pipe3.position.set(8.5, 0, -10);
pipe0.scale.set(4, 4, 4);
pipe1.scale.set(3, 3, 3);
pipe2.scale.set(3, 3, 3);
pipe3.scale.set(3, 3, 3);
scene.add(pipe0);
scene.add(pipe1);
scene.add(pipe2);
scene.add(pipe3);


for(var i = 0; i < stateCount; i++){
  state_positions[i] = rootModel.worldToLocal(state_positions[i]);
}

let stateIndex = 0;
let adjusting = adjustements[stateIndex];
let clawAdjusting = clawAdjustements[stateIndex];
let armMoving = armMovingStages[stateIndex];

var previousPosition = new THREE.Vector3(0,0,0).copy(state_positions[5]);
var targetPosition = new THREE.Vector3(0,0,0).copy(state_positions[6]);
let previousRootRotation = rootModel.rotation.y;
let targetRootRotation = Math.atan2(targetPosition.x, targetPosition.z);
let previousArmRotation = upperArmModel.rotation.y;
let targetArmRotation = Math.atan2(targetPosition.x, targetPosition.z);

const arm = new Arm(rootModel.position);



//=====================================

//============Sequencing===============
let t;
let waitingObject;
let pickingObject;
let pickingObjectPosition = new THREE.Vector3(0,0,0);
let pickingObjectRotation = new THREE.Quaternion();
let droppingObject = null;
let clock = new THREE.Clock(true);
let deltaTime = 0;
let coldStart = true;
let coldStartTime = 0;
let coldStartTotalTime = 2;
let targetX = 0;
//=====================================

requestAnimationFrame(start);

function animate( time ) {
  deltaTime = clock.getDelta() * simulationSpeed;
  controls.update(deltaTime);
  if(!stopSimulation){
    if(coldStart){
      coldStartTime += deltaTime;
      start(coldStartTime/coldStartTotalTime);
      if(coldStartTime > 1){
        coldStart = false;
        previousPosition.copy(state_positions[7]);
        targetPosition.copy(state_positions[0]);
      }
    }
    if(box_spawn_time < 0){
      create_object();
      box_spawn_time = box_period;
    }
    if(!armPause){ updateArm(deltaTime); }
    
    if(!trayPause){
      box_spawn_time -= deltaTime;
      tray_top.material.map.offset.x -= objectSpeed*0.001*deltaTime;
      tray_top.material.bumpMap.offset.x -= objectSpeed*0.001*deltaTime;
      tray_top.material.displacementMap.offset.x -= objectSpeed*0.001*deltaTime;
      if (typeof objects_on_tray !== 'undefined' && objects_on_tray.length > 0) {
        objects_on_tray.forEach(element => {
          element.position.x += objectSpeed*0.01*deltaTime;
        });
        if(objects_on_tray[0].position.x > -0.1){
          if(armPause){ armPause = false; }
          waitingObject = objects_on_tray.shift();
          trayPause = true;
        }
      }
    }else{
      armPause = false;
    }

    if(droppingObject){
      droppingObject.position.y -= 0.2;
      if(droppingObject.position.y < -1.5){
        scene.remove(droppingObject);
        droppingObject = null;
      }
    }
  }
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );


function updateArm(deltaTime){
    currentTime += deltaTime;
    if(currentTime > state_timers[stateIndex]){
      currentTime = currentTime - state_timers[stateIndex];
      stateIndex = (stateIndex + 1) % stateCount;
      adjusting = false;
      clawAdjusting = false;
      armMoving = false;      
      previousPosition.copy(targetPosition);
      targetPosition.copy(state_positions[stateIndex]);
    
      if(stateIndex == 0){ 
        armPause = true; 
        targetX = 5 * (Math.floor(Math.random() * 3) - 1);
        state_positions[3].z = targetX;
        state_positions[4].z = targetX;
        state_positions[5].z = targetX;
        
      }
      else if(stateIndex == 2){ 
        pickingObject = waitingObject;
        foreArmModel.attach(pickingObject); 
      }
      else if(stateIndex == 3){ trayPause = false; }
      else if(stateIndex == 5){ 
        pickingObject.getWorldPosition(pickingObjectPosition);
        pickingObject.getWorldQuaternion(pickingObjectRotation);
        droppingObject = pickingObject.removeFromParent();
        scene.add(droppingObject); 
        droppingObject.position.copy(pickingObjectPosition);
        droppingObject.quaternion.copy(pickingObjectRotation);
        pickingObject = null; 
      }      

      if(adjustements[stateIndex]){
        adjusting = true;
        previousRootRotation = rootModel.rotation.y;
        targetRootRotation = Math.atan2(targetPosition.x, targetPosition.z);
        previousArmRotation = upperArmModel.rotation.y;
        targetArmRotation = Math.atan2(targetPosition.x, targetPosition.z);
      }else if(clawAdjustements[stateIndex]){
        clawAdjusting = true;
        if(clawOpen){
          clawOpen = false;
          previousClawLRotation = clawL_open;
          targetClawLRotation = clawL_closed;
          previousClawRRotation = clawR_open;
          targetClawRRotation = clawR_closed;
        }else{
          clawOpen = true;
          previousClawLRotation = clawL_closed;
          targetClawLRotation = clawL_open;
          previousClawRRotation = clawR_closed;
          targetClawRRotation = clawR_open;
        }
      }else if(armMovingStages[stateIndex]){
        armMoving = true;
      }

    }

    t = currentTime / state_timers[stateIndex]; 
    
    if(adjusting){
      rootModel.rotation.y = interpolate(previousRootRotation, targetRootRotation, t);
      upperArmModel.rotation.y = interpolate(previousArmRotation, targetArmRotation, t);
    }
    else if (clawAdjusting){
      clawLModel.rotation.z = interpolate(previousClawLRotation, targetClawLRotation, t);
      clawRModel.rotation.z = interpolate(previousClawRRotation, targetClawRRotation, t);
    }
    else if (armMoving){
      arm.setTarget(new THREE.Vector3(interpolate(previousPosition.x, targetPosition.x, t), interpolate(previousPosition.y, targetPosition.y, t), interpolate(previousPosition.z, targetPosition.z, t))); 
      arm.update();
      targetElbow.set(arm.controlPos[1].x, arm.controlPos[1].y, 0);
      targetElbowCopy.copy(targetElbow);
      targetElbowCopy.normalize();
      upperArmModel.rotation.z = -Math.atan2(targetElbowCopy.x, targetElbowCopy.y);

      targetHand.set(arm.controlPos[2].x, arm.controlPos[2].y, 0);
      targetHand.sub(targetElbow).normalize();
      foreArmModel.rotation.z = -Math.acos(targetElbowCopy.dot(targetHand));      
    }
  
}

function interpolate(a, b, t){
  return a + t * (b - a);
}

function start(t){
  arm.setTarget(new THREE.Vector3(interpolate(previousPosition.x, targetPosition.x, t), interpolate(previousPosition.y, targetPosition.y, t), interpolate(previousPosition.z, targetPosition.z, t))); 
  arm.update();
  targetElbow.set(arm.controlPos[1].x, arm.controlPos[1].y, 0);
  targetElbowCopy.copy(targetElbow);
  targetElbowCopy.normalize();
  upperArmModel.rotation.z = -Math.atan2(targetElbowCopy.x, targetElbowCopy.y);

  targetHand.set(arm.controlPos[2].x, arm.controlPos[2].y, 0);
  targetHand.sub(targetElbow).normalize();
  foreArmModel.rotation.z = -Math.acos(targetElbowCopy.dot(targetHand)); 
}