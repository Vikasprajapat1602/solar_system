console.log("Three.js Solar System – Final Build");

/* ───────────────── SCENE & BACKGROUND STARS ───────────────── */
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = [];
for (let i = 0; i < starCount; i++) {
  starPositions.push(
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 200
  );
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPositions, 3)
);
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
scene.add(new THREE.Points(starGeometry, starMaterial));

/* ───────────────── CAMERA & RENDERER ───────────────── */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("solarCanvas"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ───────────────── LIGHT & MODERN GLOWING SUN ───────────────── */
// white fill‑light for the scene
const sceneLight = new THREE.PointLight(0xffffff, 2, 500);
sceneLight.position.set(0, 0, 0);
scene.add(sceneLight);

// 🌞 glowing, smooth Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2.2, 64, 64),              // smoother sphere
  new THREE.MeshStandardMaterial({
    color: 0xfdb813,          // surface colour
    emissive: 0xfdb813,       // glow colour
    emissiveIntensity: 1.5,   // stronger glow
    roughness: 0.2,
    metalness: 0.1
  })
);
scene.add(sun);

// subtle orange halo light so nearby planets pick up warm tint
const sunGlow = new THREE.PointLight(0xfdb813, 1.5, 120);
scene.add(sunGlow);

/* ───────────────── PLANETS DATA ───────────────── */
const planetData = [
  { name: "Mercury", color: 0xaaaaaa, size: 0.6, distance: 4,  speed: 0.04 },
  { name: "Venus",   color: 0xffddaa, size: 0.9, distance: 6,  speed: 0.03 },
  { name: "Earth",   color: 0x3399ff, size: 1.0, distance: 8,  speed: 0.02 },
  { name: "Mars",    color: 0xff5533, size: 0.8, distance: 10, speed: 0.015 },
  { name: "Jupiter", color: 0xffcc99, size: 1.5, distance: 13, speed: 0.01 },
  { name: "Saturn",  color: 0xffeeaa, size: 1.4, distance: 16, speed: 0.008 },
  { name: "Uranus",  color: 0x66ffff, size: 1.1, distance: 18, speed: 0.006 },
  { name: "Neptune", color: 0x3333ff, size: 1.1, distance: 20, speed: 0.005 }
];

/* ───────────────── CREATE PLANETS ───────────────── */
const planets = [];
planetData.forEach(d => {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(d.size, 32, 32),
    new THREE.MeshStandardMaterial({ color: d.color })
  );
  const angle = Math.random() * Math.PI * 2;
  planet.userData = { ...d, angle };
  planet.position.set(Math.cos(angle) * d.distance, 0, Math.sin(angle) * d.distance);
  scene.add(planet);
  planets.push(planet);
});

/* ───────────────── CONTROLS (Speed Sliders) ───────────────── */
const controlsDiv = document.getElementById("controls");
planets.forEach(p => {
  const box   = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = `${p.userData.name} Speed`;
  const slider = document.createElement("input");
  slider.type  = "range";
  slider.min   = "0.001";
  slider.max   = "0.1";
  slider.value = p.userData.speed;
  slider.step  = "0.001";
  slider.oninput = () => (p.userData.speed = +slider.value);
  box.appendChild(label);
  box.appendChild(slider);
  controlsDiv.appendChild(box);
});

/* ───────────────── DARK / LIGHT MODE ───────────────── */
let isDark = true;
const modeBtn = document.getElementById("modeToggle");
modeBtn.addEventListener("click", () => {
  isDark = !isDark;
  scene.background = new THREE.Color(isDark ? "black" : "#d0e0f0");
  modeBtn.textContent = isDark ? "Dark" : "Light";
});

/* ───────────────── PAUSE / RESUME ───────────────── */
let isPaused = false;
const pauseBtn = document.getElementById("toggleButton");
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
});

/* ───────────────── TOOLTIP (Hover Labels) ───────────────── */
const tooltip = document.getElementById("tooltip");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseX = 0, mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

/* ───────────────── CAMERA ZOOM ON CLICK ───────────────── */
window.addEventListener("click", () => {
  camera.position.z = camera.position.z === 30 ? 15 : 30;
});

/* ───────────────── ANIMATE ───────────────── */
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach(p => {
      p.userData.angle += p.userData.speed;
      p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
      p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
    });
  }

  // tooltip
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(planets);
  if (hit.length) {
    tooltip.style.display = "block";
    tooltip.textContent = hit[0].object.userData.name;
    tooltip.style.left = `${mouseX + 10}px`;
    tooltip.style.top  = `${mouseY + 10}px`;
  } else {
    tooltip.style.display = "none";
  }

  renderer.render(scene, camera);
}
animate();
