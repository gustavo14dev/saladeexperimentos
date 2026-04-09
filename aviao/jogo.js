// ===================== SUPABASE =====================
const SUPABASE_URL = 'https://bzpdjexpkdydpdjshdmv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5UqN3VIRzBAwS1lefzCuRA_zdEJS61P';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===================== LOAD PLAYER CONFIG =====================
const cfg = {
    color:    localStorage.getItem('skydash_color')    || '#ffffff',
    plane:    localStorage.getItem('skydash_plane')    || 'paper',
    upgrades: JSON.parse(localStorage.getItem('skydash_upgrades') || '{}'),
    coins:    parseInt(localStorage.getItem('skydash_coins')    || '0'),
    best:     parseInt(localStorage.getItem('skydash_best')     || '0'),
};
const UPG_SPEED    = (cfg.upgrades.speed    || 0) * 0.12;   // +12% per level
const UPG_AGILITY  = (cfg.upgrades.agility  || 0) * 0.10;   // +10% per level
const UPG_LUCK     = (cfg.upgrades.luck     || 0);           // extra rings

// ===================== SCENE SETUP =====================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 200, 900);
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ===================== LIGHTS =====================
const hemiLight = new THREE.HemisphereLight(0xccddff, 0x226622, 0.9);
scene.add(hemiLight);
const sunLight = new THREE.DirectionalLight(0xfff8e8, 1.1);
sunLight.position.set(200, 400, 150);
sunLight.castShadow = true;
sunLight.shadow.camera.top = 400; sunLight.shadow.camera.bottom = -400;
sunLight.shadow.camera.left = -400; sunLight.shadow.camera.right = 400;
sunLight.shadow.mapSize.width = 2048; sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// ===================== WORLD CONSTANTS =====================
const WORLD_SIZE   = 2000;
const HALF_WORLD   = WORLD_SIZE / 2;
const RING_COINS   = 500;
const BASE_RINGS   = 100 + UPG_LUCK * 20;

// ===================== GAME STATE =====================
let isDead    = false;
let score     = 0;
let ringsHit  = 0;
let coinsEarned = 0;
let speed     = 1.8;
const BASE_SPEED  = 1.8 * (1 + UPG_SPEED);
const MAX_SPEED   = 5.0 * (1 + UPG_SPEED);
const MIN_SPEED   = 0.5;

// ===================== PHYSICS STATE =====================
// Using Euler YXZ for proper bank-to-turn aircraft physics
let planeYaw   = 0;    // world-space heading
let planePitch = 0;    // nose up/down
let planeRoll  = 0;    // bank
let mouseX = 0, mouseY = 0;

const MAX_ROLL    = Math.PI / 2.0;
const MAX_PITCH   = Math.PI / 3.5;
const ROLL_SPEED  = 0.09 * (1 + UPG_AGILITY);
const PITCH_SPEED = 0.08 * (1 + UPG_AGILITY);
const TURN_RATE   = 0.022;  // yaw per radian of roll per frame

// ===================== AIRPLANE =====================
function buildPlane(planeId, color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), side: THREE.DoubleSide, roughness: 0.35, metalness: 0.08 });
    const matDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), roughness: 0.5 });

    if (planeId === 'paper' || planeId === 'default') {
        const geo = new THREE.BufferGeometry();
        const v = new Float32Array([
            0,0,-2.5,  -1.5,0.2,1.5,   0,-0.5,1.5,
            0,0,-2.5,   0,-0.5,1.5,    1.5,0.2,1.5,
            0,0,-1.8,   0,-0.5,1.5,    0,0.8,1.5
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, mat);
        m.scale.setScalar(1.3);
        group.add(m);
    } else if (planeId === 'glider') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.22,5,8), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(10,0.08,1.8), mat);
        wing.position.z = 0.3; group.add(wing);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(3,0.08,0.8), mat);
        tail.position.z = 2.3; tail.position.y = 0.2; group.add(tail);
        const vtail = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.9,0.7), mat);
        vtail.position.z = 2.3; vtail.position.y = 0.3; group.add(vtail);
    } else if (planeId === 'biplane') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,5,8), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(7,0.1,1.5), mat);
        w1.position.y = 0.7; group.add(w1);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(7,0.1,1.5), mat);
        w2.position.y = -0.7; group.add(w2);
        [-2,2].forEach(x => {
            const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.4,4), matDark);
            s.position.set(x,0,0); group.add(s);
        });
    } else if (planeId === 'fighter') {
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.3,6,8), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        // Delta wings
        const dg = new THREE.BufferGeometry();
        const dv = new Float32Array([0,0,-2.8, -4,0,1.5, 4,0,1.5]);
        dg.setAttribute('position',new THREE.BufferAttribute(dv,3));
        dg.computeVertexNormals();
        const dWing = new THREE.Mesh(dg, mat); group.add(dWing);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(2,0.08,0.7), mat);
        tail.position.z = 2.5; group.add(tail);
        const vtail = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.8,0.6), mat);
        vtail.position.z = 2.5; vtail.position.y = 0.3; group.add(vtail);
    } else if (planeId === 'bomber') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.7,6,10), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(9,0.18,2.5), mat);
        group.add(wing);
        [-2.5,2.5].forEach(x => {
            const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,1.2,8), matDark);
            eng.rotation.z = Math.PI/2; eng.position.set(x,-0.7,0); group.add(eng);
        });
        const tail = new THREE.Mesh(new THREE.BoxGeometry(3,0.15,1.2), mat);
        tail.position.z = 2.8; tail.position.y = 0.4; group.add(tail);
        const vtail = new THREE.Mesh(new THREE.BoxGeometry(0.15,1,1), mat);
        vtail.position.z = 2.8; vtail.position.y = 0.4; group.add(vtail);
    }

    group.castShadow = true;
    return group;
}

const airplane = buildPlane(cfg.plane, cfg.color);
airplane.position.set(0, 80, 0);
scene.add(airplane);

// ===================== TERRAIN WITH MOUNTAINS =====================
function generateTerrain() {
    // Large static terrain - player wraps, terrain stays
    const size = WORLD_SIZE * 2.2;
    const segs = 140;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        let y = 0;

        // Large mountains - multiple octaves of sine noise
        y += Math.sin(x * 0.005 + 0.7) * Math.cos(z * 0.005 + 0.3) * 80;
        y += Math.sin(x * 0.011 + 2.1) * Math.cos(z * 0.013 + 1.4) * 40;
        y += Math.sin(x * 0.027)        * Math.cos(z * 0.022 + 0.9) * 18;
        y += Math.sin(x * 0.06 + 1.0)  * Math.cos(z * 0.055)       * 7;

        // Keep spawn area flat (radius 200)
        const dist = Math.sqrt(x*x + z*z);
        if (dist < 200) y *= Math.pow(dist / 200, 2.5);

        y = Math.max(0, y);
        pos.setY(i, y);
    }
    geo.computeVertexNormals();

    // Vertex color by height
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
        const h = pos.getY(i);
        if (h < 3)       colors.push(0.25, 0.62, 0.25);  // flat grass
        else if (h < 20) colors.push(0.22, 0.55, 0.22);  // lower slope
        else if (h < 45) colors.push(0.35, 0.48, 0.28);  // mid slope
        else if (h < 65) colors.push(0.52, 0.42, 0.32);  // rocky
        else             colors.push(0.92, 0.92, 0.93);  // snow cap
    }
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}
const terrain = generateTerrain();

// ===================== RIVERS =====================
function createRivers() {
    const riverMat = new THREE.MeshStandardMaterial({
        color: 0x2277bb, roughness: 0.05, metalness: 0.3,
        transparent: true, opacity: 0.85
    });

    // Generate 3 winding rivers
    for (let r = 0; r < 3; r++) {
        const points = [];
        let x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
        let z = -HALF_WORLD;
        for (let i = 0; i < 18; i++) {
            points.push(new THREE.Vector3(x, 0.6, z));
            x += (Math.random() - 0.5) * 200;
            x = Math.max(-HALF_WORLD * 0.8, Math.min(HALF_WORLD * 0.8, x));
            z += WORLD_SIZE / 17;
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, 120, 6 + Math.random()*5, 8, false);
        const river = new THREE.Mesh(tubeGeo, riverMat);
        scene.add(river);
    }
}
createRivers();

// ===================== HOUSES / VILLAGES =====================
function createHouse(x, z, scale = 1) {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.08 + Math.random()*0.05, 0.3, 0.75 + Math.random()*0.1), roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.05 + Math.random()*0.02, 0.6, 0.3 + Math.random()*0.15), roughness: 0.9 });

    const w = 4 + Math.random()*3, d = 4 + Math.random()*3, h = 4 + Math.random()*2;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    wall.position.y = h/2; wall.castShadow = true; wall.receiveShadow = true;
    group.add(wall);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.75, h*0.6, 4), roofMat);
    roof.position.y = h + (h*0.6)/2; roof.rotation.y = Math.PI/4;
    roof.castShadow = true;
    group.add(roof);

    // Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.05), doorMat);
    door.position.set(0, 0.75, d/2 + 0.02);
    group.add(door);

    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    group.rotation.y = Math.random() * Math.PI * 2;
    return group;
}

function createVillages() {
    const villageCount = 12;
    for (let v = 0; v < villageCount; v++) {
        // Avoid spawn area
        let vx, vz;
        do {
            vx = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
            vz = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
        } while (Math.sqrt(vx*vx + vz*vz) < 250);

        const houseCount = 3 + Math.floor(Math.random() * 7);
        for (let h = 0; h < houseCount; h++) {
            const hx = vx + (Math.random() - 0.5) * 60;
            const hz = vz + (Math.random() - 0.5) * 60;
            const scale = 0.8 + Math.random() * 0.5;
            const house = createHouse(hx, hz, scale);
            scene.add(house);
        }

        // Village road (flat grey strip)
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 1 });
        const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 60), roadMat);
        road.rotation.x = -Math.PI/2;
        road.position.set(vx, 0.05, vz);
        road.rotation.z = Math.random() * Math.PI;
        scene.add(road);
    }
}
createVillages();

// ===================== TREES =====================
const trees = [];
const treeMats = {
    pineLeaves: new THREE.MeshStandardMaterial({ color: 0x1a6b1a, flatShading: true, roughness: 0.9 }),
    decidLeaves: new THREE.MeshStandardMaterial({ color: 0x2d8a2d, roughness: 0.8 }),
    autumnLeaves: new THREE.MeshStandardMaterial({ color: 0xcc6600, flatShading: true, roughness: 0.8 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 1 }),
    palmTrunk: new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 }),
    palmLeaf: new THREE.MeshStandardMaterial({ color: 0x33aa33, side: THREE.DoubleSide, roughness: 0.7 }),
};
const trunkGeo  = new THREE.CylinderGeometry(0.5, 0.9, 4, 6);
const pineGeo1  = new THREE.ConeGeometry(3.5, 8, 7);
const pineGeo2  = new THREE.ConeGeometry(4.5, 10, 7);
const decidGeo  = new THREE.SphereGeometry(4.5, 7, 6);

function createTree(type, x, z) {
    const g = new THREE.Group();
    if (type === 'pine') {
        const trunk = new THREE.Mesh(trunkGeo, treeMats.trunk);
        trunk.position.y = 2; trunk.castShadow = true; g.add(trunk);
        const top = new THREE.Mesh(pineGeo2, treeMats.pineLeaves);
        top.position.y = 10; top.castShadow = true; g.add(top);
        const mid = new THREE.Mesh(pineGeo1, treeMats.pineLeaves);
        mid.position.y = 7; mid.castShadow = true; g.add(mid);
    } else if (type === 'deciduous') {
        const trunk = new THREE.Mesh(trunkGeo, treeMats.trunk);
        trunk.position.y = 2; g.add(trunk);
        const leaves = new THREE.Mesh(decidGeo, treeMats.decidLeaves);
        leaves.position.y = 9; leaves.castShadow = true; g.add(leaves);
    } else if (type === 'autumn') {
        const trunk = new THREE.Mesh(trunkGeo, treeMats.trunk);
        trunk.position.y = 2; g.add(trunk);
        const leaves = new THREE.Mesh(decidGeo, treeMats.autumnLeaves);
        leaves.position.y = 9; leaves.castShadow = true; g.add(leaves);
    } else if (type === 'palm') {
        const tgeo = new THREE.CylinderGeometry(0.3, 0.5, 10, 6);
        const trunk = new THREE.Mesh(tgeo, treeMats.palmTrunk);
        trunk.position.y = 5; trunk.rotation.z = (Math.random()-0.5)*0.3; g.add(trunk);
        for (let i=0; i<5; i++) {
            const lg = new THREE.PlaneGeometry(0.6, 5);
            const leaf = new THREE.Mesh(lg, treeMats.palmLeaf);
            leaf.position.y = 10;
            leaf.rotation.y = (i/5)*Math.PI*2;
            leaf.rotation.z = Math.PI/3;
            g.add(leaf);
        }
    }
    const s = 0.6 + Math.random() * 0.8;
    g.scale.setScalar(s);
    g.position.set(x, 0, z);
    g.rotation.y = Math.random() * Math.PI * 2;
    const types = ['pine','deciduous','autumn','palm'];
    const colR = (type === 'palm') ? 2.8*s : 2.5*s;
    const colH = (type === 'pine') ? 14*s : 12*s;
    g.userData = { colRadius: colR, colHeight: colH };
    scene.add(g);
    return g;
}

const treeTypes = ['pine','pine','pine','deciduous','deciduous','autumn','palm'];
for (let i = 0; i < 700; i++) {
    const type = treeTypes[Math.floor(Math.random()*treeTypes.length)];
    const x = (Math.random()-0.5)*WORLD_SIZE;
    const z = (Math.random()-0.5)*WORLD_SIZE;
    if (Math.sqrt(x*x+z*z) < 30) { i--; continue; }
    trees.push(createTree(type, x, z));
}

// ===================== CLOUDS =====================
const clouds = [];
const cMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.88 });
const cGeo  = new THREE.SphereGeometry(5, 6, 6);
function mkCloud() {
    const g = new THREE.Group();
    for (let i=0; i<4+Math.random()*4; i++) {
        const p = new THREE.Mesh(cGeo, cMat);
        p.position.set(Math.random()*12-6, Math.random()*5, Math.random()*12-6);
        const s = 0.6+Math.random()*0.9; p.scale.set(s, s*0.7, s);
        g.add(p);
    }
    return g;
}
for (let i=0; i<120; i++) {
    const c = mkCloud();
    c.position.set((Math.random()-0.5)*WORLD_SIZE, 70+Math.random()*130, (Math.random()-0.5)*WORLD_SIZE);
    scene.add(c); clouds.push(c);
}

// ===================== RINGS =====================
const rings = [];
const ringGeo = new THREE.TorusGeometry(5, 0.7, 8, 20);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0x664400, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.8 });
const RING_COUNT = Math.floor(BASE_RINGS);
for (let i=0; i<RING_COUNT; i++) {
    const r = new THREE.Mesh(ringGeo, ringMat);
    r.position.set((Math.random()-0.5)*WORLD_SIZE, 30+Math.random()*90, (Math.random()-0.5)*WORLD_SIZE);
    r.userData = { active: true, baseH: r.position.y, spinSpeed: Math.random()*0.03+0.015, phase: Math.random()*Math.PI*2 };
    scene.add(r); rings.push(r);
}

// ===================== BIRDS =====================
const birds = [];
const bGeo = new THREE.BufferGeometry();
const bv = new Float32Array([-1,0,0.5, 0,0,-0.2, 0,0,0,  1,0,0.5, 0,0,0, 0,0,-0.2]);
bGeo.setAttribute('position', new THREE.BufferAttribute(bv, 3));
bGeo.computeVertexNormals();
const bMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide, flatShading: true });
for (let i=0; i<80; i++) {
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set((Math.random()-0.5)*WORLD_SIZE, 50+Math.random()*100, (Math.random()-0.5)*WORLD_SIZE);
    b.userData = { vel: new THREE.Vector3((Math.random()-0.5)*0.4, 0, -0.4-Math.random()*0.4), phase: Math.random()*Math.PI*2 };
    scene.add(b); birds.push(b);
}

// ===================== EXPLOSION =====================
const particles = [];
function triggerGameOver() {
    if (isDead) return;
    isDead = true;
    airplane.visible = false;
    document.getElementById('flash').style.opacity = '0.6';
    setTimeout(() => document.getElementById('flash').style.opacity = '0', 150);

    for (let i=0; i<35; i++) {
        const colors = [0xffd700, 0xff6600, 0xffffff, 0xff4400];
        const p = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7+Math.random()*0.5, 0.7+Math.random()*0.5),
            new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random()*colors.length)], side: THREE.DoubleSide })
        );
        p.position.copy(airplane.position);
        p.userData.vel = new THREE.Vector3((Math.random()-0.5)*3, Math.random()*2.5, (Math.random()-0.5)*3);
        p.userData.rot = new THREE.Vector3(Math.random()*0.2, Math.random()*0.2, Math.random()*0.2);
        scene.add(p); particles.push(p);
    }

    // Save coins and best score
    const totalCoins = cfg.coins + coinsEarned;
    localStorage.setItem('skydash_coins', totalCoins);
    if (score > cfg.best) {
        localStorage.setItem('skydash_best', score);
        cfg.best = score;
    }

    // Show game over
    document.getElementById('final-score').textContent = score.toLocaleString('pt-BR');
    document.getElementById('final-rings').textContent = ringsHit;
    document.getElementById('final-coins').textContent = '✦ ' + coinsEarned.toLocaleString('pt-BR');
    document.getElementById('final-best').textContent = Math.max(score, cfg.best).toLocaleString('pt-BR');
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('alt-warn').className = '';
}

// ===================== RING POPUP =====================
function showRingPopup() {
    const el = document.getElementById('ring-popup');
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -80%) scale(1.4)';
    });
}

// ===================== RESET =====================
function resetGame() {
    isDead = false; score = 0; ringsHit = 0; coinsEarned = 0;
    speed = BASE_SPEED; planeYaw = 0; planePitch = 0; planeRoll = 0;
    airplane.position.set(0, 80, 0);
    airplane.rotation.set(0, 0, 0);
    airplane.visible = true;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('alt-warn').className = '';
    document.getElementById('speed-lines').className = '';
    particles.forEach(p => scene.remove(p)); particles.length = 0;
    rings.forEach(r => { r.visible = true; r.userData.active = true; });
    updateScoreUI();
}

// ===================== WORLD WRAP =====================
function wrapObject(obj) {
    const dx = airplane.position.x - obj.position.x;
    const dz = airplane.position.z - obj.position.z;
    if (dx > HALF_WORLD)  obj.position.x += WORLD_SIZE;
    else if (dx < -HALF_WORLD) obj.position.x -= WORLD_SIZE;
    if (dz > HALF_WORLD)  obj.position.z += WORLD_SIZE;
    else if (dz < -HALF_WORLD) obj.position.z -= WORLD_SIZE;
}

// ===================== HUD - SPEEDOMETER =====================
const hudCanvas = document.getElementById('hud-canvas');
const hudCtx = hudCanvas.getContext('2d');
const HUD_W = 520, HUD_H = 170;
hudCanvas.width = HUD_W; hudCanvas.height = HUD_H;
hudCanvas.style.width = HUD_W + 'px'; hudCanvas.style.height = HUD_H + 'px';

function drawGauge(ctx, cx, cy, radius, value, maxVal, label, unit, color, segments) {
    const startAngle = Math.PI * 0.75;
    const endAngle   = Math.PI * 2.25;
    const range = endAngle - startAngle;

    // Outer bezel
    ctx.save();
    const bGrad = ctx.createRadialGradient(cx, cy, radius-4, cx, cy, radius+8);
    bGrad.addColorStop(0, '#2a2a2a');
    bGrad.addColorStop(1, '#111');
    ctx.beginPath();
    ctx.arc(cx, cy, radius+8, 0, Math.PI*2);
    ctx.fillStyle = bGrad;
    ctx.fill();

    // Face
    const fGrad = ctx.createRadialGradient(cx, cy-10, 5, cx, cy, radius);
    fGrad.addColorStop(0, '#1a1a1a');
    fGrad.addColorStop(1, '#080808');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fillStyle = fGrad;
    ctx.fill();

    // Tick marks + numbers
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = startAngle + t * range;
        const isMajor = i % (segments / 5) === 0;
        const tickLen = isMajor ? 12 : 6;
        const r1 = radius - 4;
        const r2 = r1 - tickLen;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle)*r1, cy + Math.sin(angle)*r1);
        ctx.lineTo(cx + Math.cos(angle)*r2, cy + Math.sin(angle)*r2);
        ctx.strokeStyle = isMajor ? color : 'rgba(255,100,50,0.5)';
        ctx.lineWidth = isMajor ? 2.5 : 1;
        ctx.stroke();

        if (isMajor) {
            const val = Math.round((i / segments) * maxVal);
            const tr = r2 - 10;
            ctx.font = `bold ${isMajor ? 9 : 8}px Orbitron, monospace`;
            ctx.fillStyle = '#ddd';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, cx + Math.cos(angle)*tr, cy + Math.sin(angle)*tr);
        }
    }

    // Colored arc (value)
    const valueAngle = startAngle + (value / maxVal) * range;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 14, startAngle, valueAngle, false);
    const arcGrad = ctx.createLinearGradient(
        cx - radius, cy, cx + radius, cy
    );
    arcGrad.addColorStop(0, 'rgba(255,60,60,0.6)');
    arcGrad.addColorStop(1, color);
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle
    const needleAngle = startAngle + (Math.min(value, maxVal) / maxVal) * range;
    const nLen = radius - 18;
    const nBack = 10;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);
    // Shadow
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(-nBack, 0);
    ctx.lineTo(nLen, 0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Center cap
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    const capGrad = ctx.createRadialGradient(cx-1, cy-1, 0, cx, cy, 6);
    capGrad.addColorStop(0, '#aaa');
    capGrad.addColorStop(1, '#333');
    ctx.fillStyle = capGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();

    // Digital value display
    ctx.fillStyle = '#0a1a0a';
    ctx.beginPath();
    ctx.roundRect(cx - 28, cy + 28, 56, 22, 4);
    ctx.fill();
    ctx.strokeStyle = '#22aa22';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#33ff33';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.floor(value), cx, cy + 39);

    // Label
    ctx.font = '8px Orbitron, monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(unit, cx, cy + 58);

    ctx.restore();
}

function drawHUD(spd, alt, score) {
    hudCtx.clearRect(0, 0, HUD_W, HUD_H);

    // Dashboard panel background
    const bgGrad = hudCtx.createLinearGradient(0, 0, HUD_W, HUD_H);
    bgGrad.addColorStop(0, 'rgba(5,10,20,0.92)');
    bgGrad.addColorStop(1, 'rgba(10,18,35,0.88)');
    hudCtx.fillStyle = bgGrad;
    hudCtx.beginPath();
    hudCtx.roundRect(0, 0, HUD_W, HUD_H, 16);
    hudCtx.fill();

    // Border
    hudCtx.strokeStyle = 'rgba(0,200,255,0.2)';
    hudCtx.lineWidth = 1;
    hudCtx.beginPath();
    hudCtx.roundRect(0.5, 0.5, HUD_W-1, HUD_H-1, 16);
    hudCtx.stroke();

    // Gauges
    drawGauge(hudCtx,  95, 88, 75, alt,  500, 'ALTITUDE', 'm',    '#00d4ff', 10);
    drawGauge(hudCtx, 260, 88, 82, spd,  240, 'VELOCIDADE', 'km/h','#ff6633', 12);
    drawGauge(hudCtx, 425, 88, 75, Math.min(score, 99999) / 99999 * 500, 500, 'PONTOS', 'pts', '#FFD700', 10);

    // Score text overlay on right gauge center
    hudCtx.font = 'bold 11px Orbitron, monospace';
    hudCtx.fillStyle = '#FFD700';
    hudCtx.textAlign = 'center';
    hudCtx.textBaseline = 'middle';
    hudCtx.fillText(score >= 1000 ? (score/1000).toFixed(1)+'k' : score, 425, 127);
}

// ===================== CONTROLS =====================
document.addEventListener('mousemove', (e) => {
    if (isDead) return;
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// Touch controls for mobile
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDead) return;
    const t = e.touches[0];
    mouseX = (t.clientX / window.innerWidth) * 2 - 1;
    mouseY = (t.clientY / window.innerHeight) * 2 - 1;
}, { passive: false });

// ===================== MULTIPLAYER =====================
const remotePlayers = {};
const myId = 'player_' + Math.random().toString(36).substr(2, 9);
const channel = supabaseClient.channel('skydash_world', {
    config: { presence: { key: myId } }
});

function setupMultiplayer() {
    channel
    .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        for (const id in state) {
            if (id === myId) continue;
            const data = state[id][0];
            if (data && data.x !== undefined) updateRemotePlayer(id, data);
        }
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach(p => {
            if (remotePlayers[p.key]) { scene.remove(remotePlayers[p.key]); delete remotePlayers[p.key]; }
        });
    })
    .subscribe();
}

function updateRemotePlayer(id, data) {
    if (!remotePlayers[id]) {
        const rPlane = buildPlane('paper', '#' + (data.color || 'ff4444'));
        rPlane.position.set(data.x||0, data.y||60, data.z||0);
        rPlane.userData.targetPos = new THREE.Vector3(data.x||0, data.y||60, data.z||0);
        rPlane.userData.targetRot = new THREE.Euler(data.rx||0, data.ry||0, data.rz||0);
        scene.add(rPlane);
        remotePlayers[id] = rPlane;
    }
    const p = remotePlayers[id];
    p.userData.targetPos?.set(data.x, data.y, data.z);
    p.userData.targetRot?.set(data.rx, data.ry, data.rz);
    p.visible = !data.isDead;
}

// ===================== SCORE UI =====================
function updateScoreUI() {
    document.getElementById('score').textContent = score.toLocaleString('pt-BR');
    document.getElementById('coins-earned').textContent = coinsEarned.toLocaleString('pt-BR');
    document.getElementById('rings-count').textContent = ringsHit;
}

// ===================== LOADING =====================
function fakeLoading(cb) {
    const bar = document.getElementById('loading-bar');
    const text = document.getElementById('loading-text');
    const msgs = ['Gerando terreno...','Plantando árvores...','Construindo vilarejos...','Criando rios...','Posicionando anéis...','Preparando para decolar!'];
    let p = 0;
    const interval = setInterval(() => {
        p += 3 + Math.random()*4;
        if (p > 100) p = 100;
        bar.style.width = p + '%';
        text.textContent = msgs[Math.floor((p/100)*msgs.length)] || msgs[msgs.length-1];
        if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                const loading = document.getElementById('loading');
                loading.style.opacity = '0';
                setTimeout(() => { loading.style.display = 'none'; cb(); }, 800);
            }, 400);
        }
    }, 60);
}

// ===================== MAIN LOOP =====================
const clock = new THREE.Clock();
let syncTimer = 0;
const cameraOffset = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

// Speed lines element
const speedLines = document.createElement('div');
speedLines.id = 'speed-lines';
document.body.appendChild(speedLines);

// Altitude warning element
const altWarn = document.createElement('div');
altWarn.id = 'alt-warn';
altWarn.textContent = '⚠ ALTITUDE CRÍTICA ⚠';
document.body.appendChild(altWarn);

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time  = clock.getElapsedTime();

    if (!isDead) {
        // ============ IMPROVED PHYSICS (YXZ Euler = bank-to-turn) ============

        // Smooth mouse to roll/pitch
        const targetRoll  = mouseX * MAX_ROLL;
        const targetPitch = -mouseY * MAX_PITCH;

        planeRoll  += (targetRoll  - planeRoll)  * ROLL_SPEED;
        planePitch += (targetPitch - planePitch)  * PITCH_SPEED;

        // Bank-to-turn: rolling causes yaw change (proper aircraft physics)
        planeYaw += planeRoll * -TURN_RATE;

        // Apply Euler in YXZ order (heading → pitch → roll)
        // This avoids gimbal lock in normal flight
        airplane.rotation.order = 'YXZ';
        airplane.rotation.y = planeYaw;
        airplane.rotation.x = planePitch;
        airplane.rotation.z = planeRoll;

        // Speed: pitch up = slow, pitch down = gain
        speed -= Math.sin(planePitch) * 0.14;
        speed += (BASE_SPEED - speed) * 0.012;
        speed = THREE.MathUtils.clamp(speed, MIN_SPEED, MAX_SPEED);

        // Lift from speed and bank angle
        const cosRoll  = Math.cos(planeRoll);
        const cosPitch = Math.cos(planePitch);
        const lift = (speed / BASE_SPEED) * 0.048 * cosRoll * Math.max(0.1, cosPitch);
        const gravity = 0.052;

        // Move forward in LOCAL space (translateZ is in local forward direction)
        airplane.translateZ(-speed);
        airplane.position.y += lift - gravity;

        // Ground collision
        if (airplane.position.y <= 2.5) { triggerGameOver(); }

        // Very high ceiling
        if (airplane.position.y > 450) airplane.position.y = 450;

        // World wrap for player
        if (airplane.position.x > HALF_WORLD)  airplane.position.x -= WORLD_SIZE;
        if (airplane.position.x < -HALF_WORLD) airplane.position.x += WORLD_SIZE;
        if (airplane.position.z > HALF_WORLD)  airplane.position.z -= WORLD_SIZE;
        if (airplane.position.z < -HALF_WORLD) airplane.position.z += WORLD_SIZE;

        // ============ TREE COLLISION ============
        for (const tree of trees) {
            const dx = airplane.position.x - tree.position.x;
            const dz = airplane.position.z - tree.position.z;
            const r = tree.userData.colRadius;
            if (Math.abs(dx) < r && Math.abs(dz) < r && airplane.position.y < tree.userData.colHeight) {
                triggerGameOver(); break;
            }
        }

        // ============ RINGS ============
        for (const r of rings) {
            if (!r.userData.active) continue;
            const dist = airplane.position.distanceTo(r.position);
            if (dist < 6.5) {
                r.userData.active = false;
                r.visible = false;
                score += 500;
                ringsHit++;
                coinsEarned += RING_COINS;
                speed = Math.min(speed + 1.2, MAX_SPEED);
                showRingPopup();
                updateScoreUI();
            }
        }

        // Score ticks up with time
        score += 1;
        if (score % 50 === 0) updateScoreUI();

        // ============ ENVIRONMENT UPDATE ============
        // Wrap objects
        trees.forEach(wrapObject);
        clouds.forEach(wrapObject);
        birds.forEach(wrapObject);

        // Rings spin + bob + respawn
        rings.forEach(r => {
            r.rotation.y += r.userData.spinSpeed;
            r.position.y = r.userData.baseH + Math.sin(time*2.2 + r.userData.phase)*4;
            wrapObject(r);
            if (!r.userData.active && airplane.position.distanceTo(r.position) > HALF_WORLD * 0.6) {
                r.userData.active = true;
                r.visible = true;
                r.position.set(
                    (Math.random()-0.5)*WORLD_SIZE,
                    35+Math.random()*80,
                    (Math.random()-0.5)*WORLD_SIZE
                );
                r.userData.baseH = r.position.y;
            }
        });

        // Birds fly and flap
        birds.forEach(b => {
            b.position.add(b.userData.vel);
            b.position.y += Math.sin(time*7 + b.userData.phase)*0.1;
            b.lookAt(b.position.clone().add(b.userData.vel));
            wrapObject(b);
        });

        // Clouds drift
        clouds.forEach(c => {
            c.position.x += 0.04;
            wrapObject(c);
        });

        // ============ CAMERA ============
        // Smooth chase camera
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), planeYaw);
        cameraOffset.set(0, 6 + Math.abs(planePitch)*5, 20 + speed*1.5).applyQuaternion(yawQuat);
        const desiredCamPos = airplane.position.clone().add(cameraOffset);
        camera.position.lerp(desiredCamPos, 0.12);

        lookTarget.copy(airplane.position).add(new THREE.Vector3(0, 2.5, 0));
        camera.lookAt(lookTarget);

        // ============ HUD UPDATE ============
        const spdKmh = speed * 40;
        const altM   = Math.max(0, Math.floor(airplane.position.y));
        drawHUD(spdKmh, altM, score);

        // Speed lines at high speed
        if (speed > MAX_SPEED * 0.75) {
            document.getElementById('speed-lines').className = 'active';
        } else {
            document.getElementById('speed-lines').className = '';
        }

        // Altitude warning
        if (airplane.position.y < 20) {
            altWarn.className = 'visible';
        } else {
            altWarn.className = '';
        }

        // ============ MULTIPLAYER SYNC ============
        syncTimer += delta;
        if (syncTimer > 0.05) {
            syncTimer = 0;
            channel.track({
                x: airplane.position.x, y: airplane.position.y, z: airplane.position.z,
                rx: airplane.rotation.x, ry: airplane.rotation.y, rz: airplane.rotation.z,
                isDead, color: cfg.color.replace('#','')
            });
        }

    } else {
        // Explosion particles
        particles.forEach(p => {
            p.position.add(p.userData.vel);
            p.rotation.x += p.userData.rot.x;
            p.rotation.y += p.userData.rot.y;
            p.userData.vel.y -= 0.06;
            if (p.position.y < 0) p.userData.vel.y *= -0.4;
            p.material.opacity = Math.max(0, p.material.opacity - 0.005);
            p.material.transparent = true;
        });

        // Keep drawing HUD during game over
        drawHUD(0, 0, score);
    }

    // Remote players LERP
    for (const id in remotePlayers) {
        const p = remotePlayers[id];
        if (p.userData.targetPos) {
            p.position.lerp(p.userData.targetPos, 0.1);
            p.rotation.x += (p.userData.targetRot.x - p.rotation.x) * 0.1;
            p.rotation.y += (p.userData.targetRot.y - p.rotation.y) * 0.1;
            p.rotation.z += (p.userData.targetRot.z - p.rotation.z) * 0.1;
        }
    }

    renderer.render(scene, camera);
}

// ===================== RESIZE =====================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===================== START =====================
setupMultiplayer();
fakeLoading(() => {
    animate();
});