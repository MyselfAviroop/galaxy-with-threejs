import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// GUI controls for particle properties
const guichange = {
  count: 29000,
  size: 0.02,
  radius: 5,
  branch: 4,
  spin: 1,
  randomness: 0.2,
  power: 3,
  falloffPower: 1.5,  // New falloff power to concentrate particles in center
  inside: "#ff6830",
  outside: "#1b3984",
};

let particles, particlegeo, particlematerial;

// Function to generate or update galaxy particles
const generateGalaxy = () => {
  if (particles) {
    particlegeo.dispose();
    particlematerial.dispose();
    scene.remove(particles);
  }

  particlegeo = new THREE.BufferGeometry();
  const positions = new Float32Array(guichange.count * 3);
  const colors = new Float32Array(guichange.count * 3);

  const insideColor = new THREE.Color(guichange.inside);
  const outsideColor = new THREE.Color(guichange.outside);

  for (let i = 0; i < guichange.count; i++) {
    const i3 = i * 3;

    // Create a radius with falloff power to concentrate particles near center
    const radius = Math.pow(Math.random(), guichange.falloffPower) * guichange.radius;
    const branchAngle = ((i % guichange.branch) / guichange.branch) * Math.PI * 2;
    const spin = radius * guichange.spin;

    const randomFactor = () => (Math.pow(Math.random(), guichange.power) * (Math.random() < 0.5 ? 1 : -1));
    const randomx = randomFactor();
    const randomy = randomFactor();
    const randomz = randomFactor();

    positions[i3] = Math.cos(branchAngle + spin) * radius + randomx;
    positions[i3 + 1] = randomy;
    positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomz;

    const colorMix = insideColor.clone();
    colorMix.lerp(outsideColor, radius / guichange.radius);
    colors[i3] = colorMix.r;
    colors[i3 + 1] = colorMix.g;
    colors[i3 + 2] = colorMix.b;
  }

  particlegeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particlegeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  particlematerial = new THREE.PointsMaterial({
    size: guichange.size,
    sizeAttenuation: true,
    vertexColors: true,
    alphaTest: 0.5,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(particlegeo, particlematerial);
  scene.add(particles);
};

// Initial galaxy creation
generateGalaxy();

// GUI controls (debounced to prevent excessive regeneration)
const debouncedGenerateGalaxy = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(generateGalaxy, 300);
  };
})();

gui.add(guichange, "count").min(1000).max(100000).step(100).onChange(debouncedGenerateGalaxy);
gui.add(guichange, "size").min(0.001).max(0.1).step(0.001).onChange(debouncedGenerateGalaxy);
gui.add(guichange, "radius").min(0.5).max(10).step(0.5).onChange(debouncedGenerateGalaxy);
gui.add(guichange, "branch").min(2).max(8).step(1).onChange(debouncedGenerateGalaxy);

gui.add(guichange, "power").min(2).max(12).step(1).onChange(debouncedGenerateGalaxy);
gui.add(guichange, "falloffPower").min(0.5).max(3).step(0.1).onChange(debouncedGenerateGalaxy);
gui.addColor(guichange, "inside").onFinishChange(debouncedGenerateGalaxy);
gui.addColor(guichange, "outside").onFinishChange(debouncedGenerateGalaxy);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 6, 5);
scene.add(camera);

//stars
const stargeo= new THREE.BufferGeometry()
const starpos = new Float32Array(guichange.count*3)

for (let i= 0; i<guichange.count*3;i++){
  starpos[i]=(Math.random()-.5)*camera.position.distanceTo(particles.position)*60

}
  stargeo.setAttribute("position", new THREE.BufferAttribute(starpos, 3))
const points = new THREE.Points(stargeo,new THREE.PointsMaterial({size:.001,sizeAttenuation:true}))

scene.add(points)







// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  points.rotation.y=elapsedTime/8;
 particles.rotation.y=elapsedTime/8
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick(); 
