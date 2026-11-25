import {
Scene, Color, Fog, PerspectiveCamera, WebGLRenderer,
HemisphereLight, DirectionalLight, PointLight,
PlaneGeometry, Mesh, MeshStandardMaterial,
CylinderGeometry, TorusGeometry, SphereGeometry,
CapsuleGeometry, BoxGeometry, Group, Points,
BufferGeometry, PointsMaterial, Float32BufferAttribute,
Clock, PCFSoftShadowMap
} from 'three';
import './style.css';

const game = document.querySelector('#game');

const scene = new Scene();
scene.background = new Color(0x10182c);
scene.fog = new Fog(0x10182c, 18, 65);

const camera = new PerspectiveCamera(
  48, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.set(0, 3.2, 10);
camera.lookAt(0, 1.6, 0);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
game.appendChild(renderer.domElement);

scene.add(new HemisphereLight(0x9bbcff, 0x25202a, 2));

const light = new DirectionalLight(0xffffff, 3);
light.position.set(5, 9, 7);
light.castShadow = true;
scene.add(light);

const blueLight = new PointLight(0x168aff, 24, 18);
blueLight.position.set(-5, 3, 2);
scene.add(blueLight);

const floor = new Mesh(
  new PlaneGeometry(100, 100),
  new MeshStandardMaterial({ color: 0x202b3b, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.02;
floor.receiveShadow = true;
scene.add(floor);

const platform = new Mesh(
  new CylinderGeometry(1.5, 1.7, 0.25, 48),
  new MeshStandardMaterial({
    color: 0x263f5b, metalness: 0.7, roughness: 0.3
  })
);
platform.position.y = 0.12;
platform.receiveShadow = true;
scene.add(platform);

const ring = new Mesh(
  new TorusGeometry(1.55, 0.035, 12, 80),
  new MeshBasicMaterial({ color: 0x22aaff })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.27;
scene.add(ring);

const character = new Group();
scene.add(character);

function part(geometry, color, x, y, z, sx=1, sy=1, sz=1) {
  const mesh = new Mesh(
    geometry,
    new MeshStandardMaterial({ color, roughness: 0.65 })
  );
  mesh.position.set(x,y,z);
  mesh.scale.set(sx,sy,sz);
  mesh.castShadow = true;
  character.add(mesh);
  return mesh;
}

const torso = part(new CapsuleGeometry(0.38, 0.65, 5, 12), 0x263c58, 0, 1.55, 0);
part(new SphereGeometry(0.27, 24, 20), 0xd9a77f, 0, 2.35, 0);
part(new SphereGeometry(0.29, 24, 16), 0x172333, 0, 2.52, -0.035, 1, 0.55, 1);

const leftArm = part(new CapsuleGeometry(0.12, 0.48, 4, 8), 0xd9a77f, -0.48, 1.58, 0);
const rightArm = part(new CapsuleGeometry(0.12, 0.48, 4, 8), 0xd9a77f, 0.48, 1.58, 0);

const leftLeg = part(new CapsuleGeometry(0.15, 0.55, 4, 8), 0x182638, -0.19, 0.55, 0);
const rightLeg = part(new CapsuleGeometry(0.15, 0.55, 4, 8), 0x182638, 0.19, 0.55, 0);

part(new BoxGeometry(0.78, 0.25, 0.3), 0x3a526b, 0, 1.8, -0.32);

const buildings = new Group();
scene.add(buildings);

for(let i=0;i<22;i++){
  const h = 2 + Math.random()*7;
  const w = 1.5 + Math.random()*2;
  const b = new Mesh(
    new BoxGeometry(w,h,w),
    new MeshStandardMaterial({color:0x18283e, roughness:0.85})
  );
  const side = i%2 ? 1 : -1;
  b.position.set(side*(3+Math.random()*10),h/2,-5-Math.random()*12);
  buildings.add(b);
}

const stars = new Points(
  new BufferGeometry(),
  new PointsMaterial({color:0x8fcaff,size:0.055})
);
const positions = [];
for(let i=0;i<400;i++){
  positions.push((Math.random()-.5)*55,Math.random()*20+2,(Math.random()-.5)*35);
}
stars.geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
scene.add(stars);

let selectedMode = 'Battle Royale';
let running = true;

document.querySelectorAll('.mode').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.mode').forEach(b=>b.classList.remove('active'));
    button.classList.add('active');
    selectedMode = button.dataset.mode;
    document.querySelector('#status').textContent = selectedMode.toUpperCase()+' SELECTED';
  });
});

function toast(message){
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.style.display = 'block';
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>el.style.display='none',2500);
}

document.querySelectorAll('.menu').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.menu').forEach(b=>b.classList.remove('active'));
    button.classList.add('active');
    if(button.textContent.includes('FRIENDS')) toast('Friends feature coming soon');
    else if(button.textContent.includes('RANK')) toast('Rank system coming soon');
    else if(button.textContent.includes('SETTINGS')) toast('Settings coming soon');
  });
});

document.querySelectorAll('.slot').forEach((slot,i)=>{
  if(i>0) slot.addEventListener('click',()=>toast('Team invite feature coming soon'));
});

document.querySelector('#start').addEventListener('click',()=>{
  document.querySelector('#status').textContent='MATCH SYSTEM NOT CONNECTED';
  toast(selectedMode+' selected — multiplayer server not connected yet');
});

const clock = new Clock();

function animate(){
  if(!running) return;
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  character.position.y = Math.sin(t*2)*0.045;
  character.rotation.y = Math.sin(t*0.5)*0.12;
  leftArm.rotation.z = Math.sin(t*1.5)*0.08;
  rightArm.rotation.z = -Math.sin(t*1.5)*0.08;
  ring.rotation.z = t*0.3;
  stars.rotation.y = t*0.008;

  renderer.render(scene,camera);
}
animate();

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden) clock.stop();
  else clock.start();
});
