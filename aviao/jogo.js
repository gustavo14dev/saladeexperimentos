// ===================== SUPABASE =====================
const SUPABASE_URL = 'https://bzpdjexpkdydpdjshdmv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5UqN3VIRzBAwS1lefzCuRA_zdEJS61P';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===================== GAME MODE (URL param) =====================
const urlParams  = new URLSearchParams(window.location.search);
const GAME_MODE  = urlParams.get('mode') || 'free';  // 'free' | 'career'
const MISSION_ID = parseInt(urlParams.get('mission') || '0');

// ===================== PLAYER CONFIG =====================
const cfg = {
    color:    localStorage.getItem('skydash_color')    || '#ffffff',
    plane:    localStorage.getItem('skydash_plane')    || 'paper',
    upgrades: JSON.parse(localStorage.getItem('skydash_upgrades') || '{}'),
    coins:    parseInt(localStorage.getItem('skydash_coins')    || '0'),
    best:     parseInt(localStorage.getItem('skydash_best')     || '0'),
    profile:  JSON.parse(localStorage.getItem('skydash_profile') || '{"name":"Piloto","level":1,"xp":0,"flights":0,"totalRings":0,"totalDist":0}'),
};
const UPG_SPEED   = (cfg.upgrades.speed    || 0) * 0.12;
const UPG_AGILITY = (cfg.upgrades.agility  || 0) * 0.10;
const UPG_LUCK    = (cfg.upgrades.luck     || 0);

// ===================== SCENE =====================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 200, 950);
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
sunLight.shadow.camera.top = 500; sunLight.shadow.camera.bottom = -500;
sunLight.shadow.camera.left = -500; sunLight.shadow.camera.right = 500;
sunLight.shadow.mapSize.width = 2048; sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// ===================== CONSTANTS =====================
const WORLD_SIZE = 2000;
const HALF_WORLD = WORLD_SIZE / 2;
const RING_COINS = 500;
const BASE_RINGS = 100 + UPG_LUCK * 20;

// ===================== GAME STATE =====================
let isDead      = false;
let isReplay    = false;
let score       = 0;
let ringsHit    = 0;
let coinsEarned = 0;
let totalDist   = 0;
let shieldActive = false;
let shieldTimer  = 0;
let magnetActive = false;
let magnetTimer  = 0;
let multiplier   = 1;
let multiplierTimer = 0;
let speedBoostTimer = 0;
let missionProgress = 0;
let missionComplete = false;

// ===================== PHYSICS =====================
let speed      = 1.8;
const BASE_SPEED = 1.8 * (1 + UPG_SPEED);
const MAX_SPEED  = 5.0 * (1 + UPG_SPEED);
const MIN_SPEED  = 0.5;
let planeYaw   = 0;
let planePitch = 0;
let planeRoll  = 0;
let mouseX = 0, mouseY = 0;

const MAX_ROLL   = Math.PI / 2.0;
const MAX_PITCH  = Math.PI / 3.5;
const ROLL_SPEED = 0.09 * (1 + UPG_AGILITY);
const PITCH_SPEED= 0.08 * (1 + UPG_AGILITY);
const TURN_RATE  = 0.022;

// ===================== TERRAIN HEIGHT (pure function — same formula as mesh) =====================
function getTerrainHeight(wx, wz) {
    // Must match generateTerrain exactly
    let y = 0;
    y += Math.sin(wx * 0.005 + 0.7) * Math.cos(wz * 0.005 + 0.3) * 80;
    y += Math.sin(wx * 0.011 + 2.1) * Math.cos(wz * 0.013 + 1.4) * 40;
    y += Math.sin(wx * 0.027)        * Math.cos(wz * 0.022 + 0.9) * 18;
    y += Math.sin(wx * 0.06 + 1.0)  * Math.cos(wz * 0.055)        * 7;
    // Flatten spawn area
    const dist = Math.sqrt(wx * wx + wz * wz);
    if (dist < 200) y *= Math.pow(dist / 200, 2.5);
    return Math.max(0, y);
}

// ===================== REPLAY BUFFER =====================
const REPLAY_LEN = 360; // 6 seconds at 60fps
const replayBuf = {
    pos: Array.from({length: REPLAY_LEN}, () => new THREE.Vector3()),
    rot: Array.from({length: REPLAY_LEN}, () => new THREE.Euler()),
    spd: new Float32Array(REPLAY_LEN),
    head: 0, full: false
};

function recordReplayFrame() {
    const i = replayBuf.head;
    replayBuf.pos[i].copy(airplane.position);
    replayBuf.rot[i].copy(airplane.rotation);
    replayBuf.spd[i] = speed;
    replayBuf.head = (i + 1) % REPLAY_LEN;
    if (replayBuf.head === 0) replayBuf.full = true;
}

let replayFrame  = 0;
let replayLength = 0;
let replayStart  = 0;

function startReplay() {
    isReplay = true;
    replayLength = replayBuf.full ? REPLAY_LEN : replayBuf.head;
    replayStart  = replayBuf.full ? replayBuf.head : 0;
    replayFrame  = 0;
    airplane.visible = true;
    document.getElementById('replay-bar').style.display = 'block';
    document.getElementById('replay-label').style.display = 'block';
}

// ===================== WEB AUDIO ENGINE =====================
let audioCtx = null;
let engineOsc = null, engineGain = null;
let engineRunning = false;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Engine: two oscillators detuned for that propeller growl
    engineGain = audioCtx.createGain();
    engineGain.gain.value = 0;
    engineGain.connect(audioCtx.destination);

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    osc1.type = 'sawtooth'; osc2.type = 'sawtooth';
    osc1.frequency.value = 55; osc2.frequency.value = 57;

    // Distortion for more 'gruff' engine feel
    const dist = audioCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
    }
    dist.curve = curve;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    osc1.connect(dist); osc2.connect(dist);
    dist.connect(filter); filter.connect(engineGain);
    osc1.start(); osc2.start();

    engineOsc  = { o1: osc1, o2: osc2, filter };
    engineRunning = true;
}

function updateEngineSound(spd, alive) {
    if (!audioCtx || !engineOsc) return;
    const vol  = alive ? THREE.MathUtils.clamp(spd / MAX_SPEED * 0.35, 0.02, 0.35) : 0;
    const freq = 40 + (spd / MAX_SPEED) * 120;
    engineGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.05);
    engineOsc.o1.frequency.setTargetAtTime(freq,     audioCtx.currentTime, 0.1);
    engineOsc.o2.frequency.setTargetAtTime(freq + 2, audioCtx.currentTime, 0.1);
    engineOsc.filter.frequency.setTargetAtTime(400 + (spd / MAX_SPEED) * 800, audioCtx.currentTime, 0.1);
}

function playRingSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 880;
    g.gain.setValueAtTime(0.3, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    // Harmonic
    const osc2 = audioCtx.createOscillator();
    const g2   = audioCtx.createGain();
    osc2.type = 'sine'; osc2.frequency.value = 1320;
    g2.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc2.connect(g2); g2.connect(audioCtx.destination);
    osc2.start(); osc2.stop(audioCtx.currentTime + 0.3);
}

function playCrashSound() {
    if (!audioCtx) return;
    const bufSize = audioCtx.sampleRate * 0.5;
    const buf     = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = audioCtx.createBufferSource();
    const g   = audioCtx.createGain();
    const lp  = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    src.buffer = buf; src.connect(lp); lp.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.6, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    src.start();
}

function playPowerupSound(type) {
    if (!audioCtx) return;
    const freqs = { speed: [660, 880, 1100], shield: [440, 554, 660], magnet: [330, 415, 523], multi: [523, 659, 784, 1047] };
    const f = freqs[type] || freqs.speed;
    f.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g   = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + i * 0.08 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.3);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.08);
        osc.stop(audioCtx.currentTime + i * 0.08 + 0.3);
    });
}

// ===================== AIRPLANE =====================
function buildPlane(planeId, color) {
    const group = new THREE.Group();
    const mat     = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), side: THREE.DoubleSide, roughness: 0.35, metalness: 0.08 });
    const matDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.6), roughness: 0.5 });
    if (planeId === 'paper' || planeId === 'default') {
        const geo = new THREE.BufferGeometry();
        const v = new Float32Array([0,0,-2.5,-1.5,0.2,1.5,0,-0.5,1.5,0,0,-2.5,0,-0.5,1.5,1.5,0.2,1.5,0,0,-1.8,0,-0.5,1.5,0,0.8,1.5]);
        geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, mat); m.scale.setScalar(1.3); group.add(m);
    } else if (planeId === 'glider') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.22,5,8), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(10,0.08,1.8), mat);
        wing.position.z = 0.3; group.add(wing);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(3,0.08,0.8), mat);
        tail.position.set(0,0.2,2.3); group.add(tail);
        const vtail = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.9,0.7), mat);
        vtail.position.set(0,0.3,2.3); group.add(vtail);
    } else if (planeId === 'biplane') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,5,8), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(7,0.1,1.5), mat); w1.position.y = 0.7; group.add(w1);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(7,0.1,1.5), mat); w2.position.y = -0.7; group.add(w2);
        [-2,2].forEach(x => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.4,4), matDark); s.position.set(x,0,0); group.add(s); });
    } else if (planeId === 'fighter') {
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.3,6,8), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        const dg = new THREE.BufferGeometry();
        const dv = new Float32Array([0,0,-2.8,-4,0,1.5,4,0,1.5]);
        dg.setAttribute('position',new THREE.BufferAttribute(dv,3)); dg.computeVertexNormals();
        group.add(new THREE.Mesh(dg, mat));
        const tail = new THREE.Mesh(new THREE.BoxGeometry(2,0.08,0.7), mat); tail.position.z = 2.5; group.add(tail);
        const vtail = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.8,0.6), mat); vtail.position.set(0,0.3,2.5); group.add(vtail);
    } else if (planeId === 'bomber') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.7,6,10), mat);
        body.rotation.z = Math.PI/2; group.add(body);
        group.add(new THREE.Mesh(new THREE.BoxGeometry(9,0.18,2.5), mat));
        [-2.5,2.5].forEach(x => { const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,1.2,8), matDark); eng.rotation.z=Math.PI/2; eng.position.set(x,-0.7,0); group.add(eng); });
        const tail = new THREE.Mesh(new THREE.BoxGeometry(3,0.15,1.2), mat); tail.position.set(0,0.4,2.8); group.add(tail);
        const vtail = new THREE.Mesh(new THREE.BoxGeometry(0.15,1,1), mat); vtail.position.set(0,0.4,2.8); group.add(vtail);
    }
    group.castShadow = true;
    return group;
}

const airplane = buildPlane(cfg.plane, cfg.color);
airplane.position.set(0, 80, 0);
scene.add(airplane);

// Shield bubble (invisible until activated)
const shieldMesh = new THREE.Mesh(
    new THREE.SphereGeometry(4, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x00aaff, transparent: true, opacity: 0, wireframe: true, emissive: 0x002266, emissiveIntensity: 1 })
);
airplane.add(shieldMesh);

// ===================== TERRAIN =====================
function generateTerrain() {
    const size = WORLD_SIZE * 2.2;
    const segs = 140;
    const geo  = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = getTerrainHeight(x, z);
        pos.setY(i, y);
    }
    geo.computeVertexNormals();
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
        const h = pos.getY(i);
        if      (h < 3)  colors.push(0.25,0.62,0.25);
        else if (h < 20) colors.push(0.22,0.55,0.22);
        else if (h < 45) colors.push(0.35,0.48,0.28);
        else if (h < 65) colors.push(0.52,0.42,0.32);
        else             colors.push(0.92,0.92,0.93);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    const mat  = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}
generateTerrain();

// ===================== RIVERS (flat animated ribbon) =====================
// Store river curves for water material time update
const riverMaterials = [];

function createRivers() {
    for (let r = 0; r < 3; r++) {
        const points = [];
        let rx = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
        let rz = -HALF_WORLD * 0.8;
        for (let i = 0; i < 22; i++) {
            points.push(new THREE.Vector3(rx, 0, rz));
            rx += (Math.random() - 0.5) * 160;
            rx  = Math.max(-HALF_WORLD * 0.75, Math.min(HALF_WORLD * 0.75, rx));
            rz += WORLD_SIZE * 0.8 / 21;
        }
        const curve  = new THREE.CatmullRomCurve3(points);
        const nSeg   = 180;
        const width  = 18 + Math.random() * 14;

        // Build flat ribbon: for each segment, sample tangent → perp, extrude left/right
        const verts = [];
        const uvs   = [];
        const inds  = [];

        for (let i = 0; i <= nSeg; i++) {
            const t  = i / nSeg;
            const pt = curve.getPoint(t);
            const tn = curve.getTangent(t).normalize();
            const perp = new THREE.Vector3(-tn.z, 0, tn.x);

            const yOff = getTerrainHeight(pt.x, pt.z) + 0.3;
            const left  = new THREE.Vector3(pt.x - perp.x * width * 0.5, yOff, pt.z - perp.z * width * 0.5);
            const right = new THREE.Vector3(pt.x + perp.x * width * 0.5, yOff, pt.z + perp.z * width * 0.5);

            verts.push(left.x,  left.y,  left.z);
            verts.push(right.x, right.y, right.z);
            uvs.push(0, t * 8,   1, t * 8);

            if (i < nSeg) {
                const base = i * 2;
                inds.push(base, base+1, base+2,  base+1, base+3, base+2);
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        geo.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geo.setIndex(inds);
        geo.computeVertexNormals();

        // Animated water shader
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                time:       { value: 0 },
                colorDeep:  { value: new THREE.Color(0x1155aa) },
                colorShallow:{ value: new THREE.Color(0x44aadd) },
                colorFoam:  { value: new THREE.Color(0xaaddff) },
            },
            vertexShader: `
                varying vec2 vUv;
                varying float vFresnel;
                uniform float time;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    // Small surface ripple
                    pos.y += sin(pos.x * 0.18 + time * 2.0) * 0.15;
                    pos.y += sin(pos.z * 0.22 + time * 1.6) * 0.1;
                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    vFresnel   = abs(normalize(mvPos.xyz).z);
                    gl_Position = projectionMatrix * mvPos;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 colorDeep;
                uniform vec3 colorShallow;
                uniform vec3 colorFoam;
                varying vec2 vUv;
                varying float vFresnel;

                float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }

                void main() {
                    // Scrolling flow lines
                    float flow  = vUv.y - time * 0.55;
                    float wave1 = sin(flow * 18.0 + vUv.x * 6.0) * 0.5 + 0.5;
                    float wave2 = sin(flow * 28.0 - vUv.x * 9.0 + 1.2) * 0.5 + 0.5;
                    float foam  = smoothstep(0.78, 1.0, wave1 * wave2);
                    // Edge foam (banks)
                    float edge  = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
                    float bankFoam = 1.0 - edge;

                    vec3 col = mix(colorDeep, colorShallow, wave1 * 0.5 + 0.2);
                    col = mix(col, colorFoam, foam * 0.6 + bankFoam * 0.4);
                    // Fresnel shimmer
                    col += vec3(0.15) * vFresnel * (wave2 * 0.5 + 0.5);

                    gl_FragColor = vec4(col, 0.88);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = 1;
        scene.add(mesh);
        riverMaterials.push(mat);
    }
}
createRivers();

// ===================== HOUSES =====================
function createHouse(x, z, scale = 1) {
    const g = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.08+Math.random()*0.05, 0.3, 0.75+Math.random()*0.1), roughness:0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.05+Math.random()*0.02, 0.6, 0.3+Math.random()*0.15), roughness:0.9 });
    const w=4+Math.random()*3, d=4+Math.random()*3, h=4+Math.random()*2;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), wallMat);
    wall.position.y=h/2; wall.castShadow=true; wall.receiveShadow=true; g.add(wall);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.75, h*0.6, 4), roofMat);
    roof.position.y=h+h*0.3; roof.rotation.y=Math.PI/4; roof.castShadow=true; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.5,0.05), new THREE.MeshStandardMaterial({color:0x5D3A1A}));
    door.position.set(0,0.75,d/2+0.02); g.add(door);
    const ground_y = getTerrainHeight(x, z);
    g.position.set(x, ground_y, z);
    g.scale.setScalar(scale);
    g.rotation.y = Math.random()*Math.PI*2;
    return g;
}
function createVillages() {
    for (let v=0; v<12; v++) {
        let vx, vz;
        do { vx=(Math.random()-0.5)*WORLD_SIZE*0.9; vz=(Math.random()-0.5)*WORLD_SIZE*0.9; }
        while (Math.sqrt(vx*vx+vz*vz) < 250);
        for (let h=0; h<3+Math.floor(Math.random()*7); h++) {
            const hx=vx+(Math.random()-0.5)*60, hz=vz+(Math.random()-0.5)*60;
            scene.add(createHouse(hx, hz, 0.8+Math.random()*0.5));
        }
        const roadMat = new THREE.MeshStandardMaterial({ color:0x777777, roughness:1 });
        const road = new THREE.Mesh(new THREE.PlaneGeometry(8,60), roadMat);
        road.rotation.x=-Math.PI/2; road.rotation.z=Math.random()*Math.PI;
        road.position.set(vx, getTerrainHeight(vx,vz)+0.05, vz);
        scene.add(road);
    }
}
createVillages();

// ===================== TREES =====================
const trees = [];
const treeMats = {
    pineL:  new THREE.MeshStandardMaterial({ color:0x1a6b1a, flatShading:true, roughness:0.9 }),
    decidL: new THREE.MeshStandardMaterial({ color:0x2d8a2d, roughness:0.8 }),
    autumnL:new THREE.MeshStandardMaterial({ color:0xcc6600, flatShading:true, roughness:0.8 }),
    trunk:  new THREE.MeshStandardMaterial({ color:0x5D4037, roughness:1 }),
    palmT:  new THREE.MeshStandardMaterial({ color:0x8B7355, roughness:0.9 }),
    palmL:  new THREE.MeshStandardMaterial({ color:0x33aa33, side:THREE.DoubleSide, roughness:0.7 }),
};
const trunkGeo = new THREE.CylinderGeometry(0.5,0.9,4,6);
const pGeo1 = new THREE.ConeGeometry(3.5,8,7), pGeo2=new THREE.ConeGeometry(4.5,10,7);
const dGeo  = new THREE.SphereGeometry(4.5,7,6);
function createTree(type, x, z) {
    const g   = new THREE.Group();
    const yOff = getTerrainHeight(x, z);
    if (type==='pine') {
        const t=new THREE.Mesh(trunkGeo,treeMats.trunk); t.position.y=2; t.castShadow=true; g.add(t);
        const l1=new THREE.Mesh(pGeo2,treeMats.pineL); l1.position.y=10; l1.castShadow=true; g.add(l1);
        const l2=new THREE.Mesh(pGeo1,treeMats.pineL); l2.position.y=7; l2.castShadow=true; g.add(l2);
    } else if (type==='deciduous') {
        const t=new THREE.Mesh(trunkGeo,treeMats.trunk); t.position.y=2; g.add(t);
        const l=new THREE.Mesh(dGeo,treeMats.decidL); l.position.y=9; l.castShadow=true; g.add(l);
    } else if (type==='autumn') {
        const t=new THREE.Mesh(trunkGeo,treeMats.trunk); t.position.y=2; g.add(t);
        const l=new THREE.Mesh(dGeo,treeMats.autumnL); l.position.y=9; l.castShadow=true; g.add(l);
    } else if (type==='palm') {
        const tg=new THREE.CylinderGeometry(0.3,0.5,10,6);
        const t=new THREE.Mesh(tg,treeMats.palmT); t.position.y=5; g.add(t);
        for (let i=0;i<5;i++) {
            const lf=new THREE.Mesh(new THREE.PlaneGeometry(0.6,5),treeMats.palmL);
            lf.position.y=10; lf.rotation.y=(i/5)*Math.PI*2; lf.rotation.z=Math.PI/3; g.add(lf);
        }
    }
    const s=0.6+Math.random()*0.8;
    g.scale.setScalar(s);
    g.position.set(x, yOff, z);
    g.rotation.y=Math.random()*Math.PI*2;
    g.userData={ colRadius:(type==='palm'?2.8:2.5)*s, colHeight:(type==='pine'?14:12)*s };
    scene.add(g); return g;
}
const treeTypes=['pine','pine','pine','deciduous','deciduous','autumn','palm'];
for (let i=0;i<700;i++) {
    const type=treeTypes[Math.floor(Math.random()*treeTypes.length)];
    const x=(Math.random()-0.5)*WORLD_SIZE, z=(Math.random()-0.5)*WORLD_SIZE;
    if (Math.sqrt(x*x+z*z)<30){i--;continue;}
    trees.push(createTree(type,x,z));
}

// ===================== CLOUDS =====================
const clouds = [];
const cMat = new THREE.MeshStandardMaterial({color:0xffffff,flatShading:true,transparent:true,opacity:0.88});
const cGeo  = new THREE.SphereGeometry(5,6,6);
function mkCloud() {
    const g=new THREE.Group();
    for(let i=0;i<4+Math.random()*4;i++){
        const p=new THREE.Mesh(cGeo,cMat);
        p.position.set(Math.random()*12-6,Math.random()*5,Math.random()*12-6);
        const s=0.6+Math.random()*0.9; p.scale.set(s,s*0.7,s); g.add(p);
    }
    return g;
}
for(let i=0;i<120;i++){
    const c=mkCloud();
    c.position.set((Math.random()-0.5)*WORLD_SIZE,70+Math.random()*130,(Math.random()-0.5)*WORLD_SIZE);
    scene.add(c); clouds.push(c);
}

// ===================== RINGS =====================
const rings=[];
const ringGeo=new THREE.TorusGeometry(5,0.7,8,20);
const ringMat=new THREE.MeshStandardMaterial({color:0xFFD700,emissive:0x664400,emissiveIntensity:0.4,roughness:0.2,metalness:0.8});
const RING_COUNT=Math.floor(BASE_RINGS);
for(let i=0;i<RING_COUNT;i++){
    const r=new THREE.Mesh(ringGeo,ringMat);
    r.position.set((Math.random()-0.5)*WORLD_SIZE,30+Math.random()*90,(Math.random()-0.5)*WORLD_SIZE);
    r.userData={active:true,baseH:r.position.y,spinSpeed:Math.random()*0.03+0.015,phase:Math.random()*Math.PI*2};
    scene.add(r); rings.push(r);
}

// ===================== BIRDS =====================
const birds=[];
const bGeo=new THREE.BufferGeometry();
const bv=new Float32Array([-1,0,0.5,0,0,-0.2,0,0,0,1,0,0.5,0,0,0,0,0,-0.2]);
bGeo.setAttribute('position',new THREE.BufferAttribute(bv,3)); bGeo.computeVertexNormals();
const bMat=new THREE.MeshStandardMaterial({color:0x222222,side:THREE.DoubleSide,flatShading:true});
for(let i=0;i<80;i++){
    const b=new THREE.Mesh(bGeo,bMat);
    b.position.set((Math.random()-0.5)*WORLD_SIZE,50+Math.random()*100,(Math.random()-0.5)*WORLD_SIZE);
    b.userData={vel:new THREE.Vector3((Math.random()-0.5)*0.4,0,-0.4-Math.random()*0.4),phase:Math.random()*Math.PI*2};
    scene.add(b); birds.push(b);
}

// ===================== POWER-UPS =====================
const powerups = [];

const POWERUP_TYPES = {
    speed:  { color: 0x00ffaa, emissive: 0x007744, label: '⚡ TURBO!',   duration: 8  },
    shield: { color: 0x4488ff, emissive: 0x002266, label: '🛡 ESCUDO!',  duration: 12 },
    magnet: { color: 0xff44ff, emissive: 0x660066, label: '🧲 ÍMÃ!',     duration: 10 },
    multi:  { color: 0xffdd00, emissive: 0x886600, label: '✖2 MULTI!',   duration: 8  },
};

function createPowerup(type, x, z) {
    const info = POWERUP_TYPES[type];
    const g    = new THREE.Group();
    const mat  = new THREE.MeshStandardMaterial({ color: info.color, emissive: info.emissive, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.5 });
    // Core orb
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), mat);
    g.add(core);
    // Ring around it
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.25, 8, 24), mat);
    ring.rotation.x = Math.PI/2;
    g.add(ring);
    // Glow sprite (billboard)
    const glowMat = new THREE.SpriteMaterial({ color: info.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.setScalar(8);
    g.add(glow);

    const groundY = getTerrainHeight(x, z);
    g.position.set(x, groundY + 25 + Math.random()*40, z);
    g.userData = { type, active: true, baseY: g.position.y, phase: Math.random()*Math.PI*2 };
    scene.add(g);
    powerups.push(g);
    return g;
}

// Spawn powerups
const puTypes = ['speed','shield','magnet','multi'];
for (let i=0; i<40; i++) {
    const type = puTypes[i % 4];
    const x = (Math.random()-0.5)*WORLD_SIZE*0.85;
    const z = (Math.random()-0.5)*WORLD_SIZE*0.85;
    if (Math.sqrt(x*x+z*z) < 50) continue;
    createPowerup(type, x, z);
}

// ===================== EXPLOSION =====================
const particles = [];
function triggerGameOver() {
    if (isDead) return;
    isDead = true;
    airplane.visible = false;
    if (engineGain) engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    playCrashSound();
    document.getElementById('flash').style.opacity='0.6';
    setTimeout(()=>document.getElementById('flash').style.opacity='0', 150);
    for(let i=0;i<40;i++){
        const cols=[0xffd700,0xff6600,0xffffff,0xff4400];
        const p=new THREE.Mesh(new THREE.PlaneGeometry(0.7+Math.random()*0.5,0.7+Math.random()*0.5),
            new THREE.MeshBasicMaterial({color:cols[i%cols.length],side:THREE.DoubleSide}));
        p.position.copy(airplane.position);
        p.userData.vel=new THREE.Vector3((Math.random()-0.5)*3,Math.random()*2.5,(Math.random()-0.5)*3);
        p.userData.rot=new THREE.Vector3(Math.random()*0.2,Math.random()*0.2,Math.random()*0.2);
        scene.add(p); particles.push(p);
    }
    // Save stats
    const totalCoins = cfg.coins + coinsEarned;
    localStorage.setItem('skydash_coins', totalCoins);
    const isNewBest = score > cfg.best;
    if (isNewBest) { localStorage.setItem('skydash_best', score); cfg.best = score; }
    // Update profile
    cfg.profile.flights++;
    cfg.profile.totalRings += ringsHit;
    cfg.profile.totalDist  += Math.floor(totalDist / 10);
    cfg.profile.xp += Math.floor(score / 100) + ringsHit * 5;
    cfg.profile.level = Math.floor(1 + Math.sqrt(cfg.profile.xp / 200));
    localStorage.setItem('skydash_profile', JSON.stringify(cfg.profile));

    if (isNewBest) showRecordNotification(score);

    // Start replay
    setTimeout(() => {
        startReplay();
        setTimeout(() => {
            isReplay = false;
            airplane.visible = false;
            document.getElementById('replay-bar').style.display = 'none';
            document.getElementById('replay-label').style.display = 'none';
            document.getElementById('final-score').textContent = score.toLocaleString('pt-BR');
            document.getElementById('final-rings').textContent = ringsHit;
            document.getElementById('final-coins').textContent = '✦ '+coinsEarned.toLocaleString('pt-BR');
            document.getElementById('final-best').textContent  = Math.max(score,cfg.best).toLocaleString('pt-BR');
            document.getElementById('game-over').style.display = 'flex';
        }, REPLAY_LEN * (1000/60) * 0.5 + 500); // replay duration
    }, 600);
}

// ===================== RECORD NOTIFICATION =====================
function showRecordNotification(newScore) {
    const el = document.getElementById('record-notif');
    if (!el) return;
    el.querySelector('.rn-score').textContent = newScore.toLocaleString('pt-BR');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
}

// ===================== RING POPUP =====================
function showRingPopup(pts) {
    const el = document.getElementById('ring-popup');
    el.textContent = '+' + pts;
    el.style.transition='none';
    el.style.opacity='1';
    el.style.transform='translate(-50%,-50%) scale(1)';
    requestAnimationFrame(()=>{
        el.style.transition='opacity 0.8s ease-out, transform 0.8s ease-out';
        el.style.opacity='0';
        el.style.transform='translate(-50%,-80%) scale(1.4)';
    });
}

// ===================== POWERUP NOTIFICATION =====================
function showPowerupHUD(label) {
    const el = document.getElementById('powerup-toast');
    if (!el) return;
    el.textContent = label;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}

// ===================== RESET =====================
function resetGame() {
    isDead=false; isReplay=false; score=0; ringsHit=0; coinsEarned=0; totalDist=0;
    missionProgress=0; missionComplete=false;
    speed=BASE_SPEED; planeYaw=0; planePitch=0; planeRoll=0;
    shieldActive=false; shieldTimer=0; magnetActive=false; magnetTimer=0;
    multiplier=1; multiplierTimer=0; speedBoostTimer=0;
    shieldMesh.material.opacity=0;
    airplane.position.set(0,80,0); airplane.rotation.set(0,0,0); airplane.visible=true;
    replayBuf.head=0; replayBuf.full=false;
    document.getElementById('game-over').style.display='none';
    document.getElementById('alt-warn').className='';
    document.getElementById('speed-lines').className='';
    document.getElementById('replay-bar').style.display='none';
    document.getElementById('replay-label').style.display='none';
    particles.forEach(p=>scene.remove(p)); particles.length=0;
    rings.forEach(r=>{r.visible=true;r.userData.active=true;});
    powerups.forEach(p=>{p.visible=true;p.userData.active=true;});
    updateScoreUI();
    updatePowerupTimers();
}

// ===================== WORLD WRAP =====================
function wrapObject(obj) {
    const dx=airplane.position.x-obj.position.x;
    const dz=airplane.position.z-obj.position.z;
    if      (dx> HALF_WORLD) obj.position.x+=WORLD_SIZE;
    else if (dx<-HALF_WORLD) obj.position.x-=WORLD_SIZE;
    if      (dz> HALF_WORLD) obj.position.z+=WORLD_SIZE;
    else if (dz<-HALF_WORLD) obj.position.z-=WORLD_SIZE;
}

// ===================== HUD CANVAS =====================
const hudCanvas=document.getElementById('hud-canvas');
const hudCtx=hudCanvas.getContext('2d');
const HUD_W=520, HUD_H=170;
hudCanvas.width=HUD_W; hudCanvas.height=HUD_H;
hudCanvas.style.width=HUD_W+'px'; hudCanvas.style.height=HUD_H+'px';

function drawGauge(ctx,cx,cy,radius,value,maxVal,unit,color,segments) {
    const startAngle=Math.PI*0.75, endAngle=Math.PI*2.25, range=endAngle-startAngle;
    ctx.save();
    // Bezel
    const bG=ctx.createRadialGradient(cx,cy,radius-4,cx,cy,radius+8);
    bG.addColorStop(0,'#2a2a2a'); bG.addColorStop(1,'#111');
    ctx.beginPath(); ctx.arc(cx,cy,radius+8,0,Math.PI*2); ctx.fillStyle=bG; ctx.fill();
    // Face
    const fG=ctx.createRadialGradient(cx,cy-10,5,cx,cy,radius);
    fG.addColorStop(0,'#1a1a1a'); fG.addColorStop(1,'#060608');
    ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.fillStyle=fG; ctx.fill();
    // Ticks + numbers
    for(let i=0;i<=segments;i++){
        const t=i/segments, angle=startAngle+t*range;
        const isMajor=i%(segments/5)===0, tickLen=isMajor?12:6;
        const r1=radius-4, r2=r1-tickLen;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(angle)*r1,cy+Math.sin(angle)*r1);
        ctx.lineTo(cx+Math.cos(angle)*r2,cy+Math.sin(angle)*r2);
        ctx.strokeStyle=isMajor?color:'rgba(255,100,50,0.4)';
        ctx.lineWidth=isMajor?2.5:1; ctx.stroke();
        if(isMajor){
            const val=Math.round(t*maxVal), tr=r2-10;
            ctx.font=`bold 9px Orbitron,monospace`; ctx.fillStyle='#ccc';
            ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(val,cx+Math.cos(angle)*tr,cy+Math.sin(angle)*tr);
        }
    }
    // Value arc
    const vAngle=startAngle+(Math.min(value,maxVal)/maxVal)*range;
    ctx.beginPath(); ctx.arc(cx,cy,radius-14,startAngle,vAngle,false);
    const aG=ctx.createLinearGradient(cx-radius,cy,cx+radius,cy);
    aG.addColorStop(0,'rgba(255,60,60,0.5)'); aG.addColorStop(1,color);
    ctx.strokeStyle=aG; ctx.lineWidth=4; ctx.lineCap='round'; ctx.stroke();
    // Needle
    const nAngle=startAngle+(Math.min(value,maxVal)/maxVal)*range;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(nAngle);
    ctx.shadowColor='rgba(255,255,255,0.4)'; ctx.shadowBlur=4;
    ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(radius-18,0);
    ctx.strokeStyle='#fff'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.stroke();
    ctx.restore();
    // Center cap
    ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2);
    const cG=ctx.createRadialGradient(cx-1,cy-1,0,cx,cy,6);
    cG.addColorStop(0,'#aaa'); cG.addColorStop(1,'#333');
    ctx.fillStyle=cG; ctx.fill();
    // Digital readout
    ctx.fillStyle='#0a1a0a'; ctx.beginPath(); ctx.roundRect(cx-28,cy+28,56,22,4); ctx.fill();
    ctx.strokeStyle='#22aa22'; ctx.lineWidth=1; ctx.stroke();
    ctx.font='bold 13px "Courier New",monospace'; ctx.fillStyle='#33ff33';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(Math.floor(value),cx,cy+39);
    ctx.font='8px Orbitron,monospace'; ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.fillText(unit,cx,cy+57);
    ctx.restore();
}

function drawHUD(spd,alt,sc) {
    hudCtx.clearRect(0,0,HUD_W,HUD_H);
    const bG=hudCtx.createLinearGradient(0,0,HUD_W,HUD_H);
    bG.addColorStop(0,'rgba(5,10,20,0.93)'); bG.addColorStop(1,'rgba(10,18,35,0.9)');
    hudCtx.fillStyle=bG; hudCtx.beginPath(); hudCtx.roundRect(0,0,HUD_W,HUD_H,16); hudCtx.fill();
    hudCtx.strokeStyle='rgba(0,200,255,0.18)'; hudCtx.lineWidth=1;
    hudCtx.beginPath(); hudCtx.roundRect(0.5,0.5,HUD_W-1,HUD_H-1,16); hudCtx.stroke();

    // Multiplier indicator
    if (multiplier > 1) {
        hudCtx.font='bold 14px Orbitron,monospace';
        hudCtx.fillStyle='#FFD700';
        hudCtx.textAlign='center';
        hudCtx.fillText(`×${multiplier} PONTOS`, HUD_W/2, 18);
    }
    drawGauge(hudCtx, 95, 88,75,alt, 500,'m',   '#00d4ff',10);
    drawGauge(hudCtx,260, 88,82,spd, 240,'km/h','#ff6633', 12);
    drawGauge(hudCtx,425, 88,75,Math.min(sc,99999)/99999*500,500,'pts','#FFD700',10);
    hudCtx.font='bold 11px Orbitron,monospace'; hudCtx.fillStyle='#FFD700';
    hudCtx.textAlign='center'; hudCtx.textBaseline='middle';
    hudCtx.fillText(sc>=1000?(sc/1000).toFixed(1)+'k':sc, 425,127);
}

// ===================== POWERUP TIMER UI =====================
function updatePowerupTimers() {
    const shEl = document.getElementById('pu-shield');
    const mgEl = document.getElementById('pu-magnet');
    const muEl = document.getElementById('pu-multi');
    const spEl = document.getElementById('pu-speed');
    if (shEl) shEl.style.opacity = shieldActive ? '1' : '0.2';
    if (mgEl) mgEl.style.opacity = magnetActive ? '1' : '0.2';
    if (muEl) muEl.style.opacity = multiplier > 1 ? '1' : '0.2';
    if (spEl) spEl.style.opacity = speedBoostTimer > 0 ? '1' : '0.2';
    if (shEl && shieldActive) shEl.querySelector('.pu-timer').textContent = Math.ceil(shieldTimer)+'s';
    if (mgEl && magnetActive) mgEl.querySelector('.pu-timer').textContent = Math.ceil(magnetTimer)+'s';
    if (muEl && multiplier>1) muEl.querySelector('.pu-timer').textContent = Math.ceil(multiplierTimer)+'s';
    if (spEl && speedBoostTimer>0) spEl.querySelector('.pu-timer').textContent = Math.ceil(speedBoostTimer)+'s';
}

// ===================== CAREER MISSION =====================
function getMission(id) {
    const types = ['collect_rings','survive_time','fly_high','fly_fast','fly_low','fly_distance'];
    // Seeded random so missions are always the same for a given id
    const seed = id * 1337 + 42;
    const rng  = (n) => { const x=Math.sin(seed*n+n)*43758.5453123; return x-Math.floor(x); };
    const type = types[Math.floor(rng(1)*types.length)];
    const tier = Math.floor(id/100); // 0-9
    const diff = 1 + tier * 0.8;
    const missions = {
        collect_rings:  { target: Math.floor(3+diff*2),  desc: `Pegar ${Math.floor(3+diff*2)} anéis`,      reward: Math.floor(1000+tier*500) },
        survive_time:   { target: Math.floor(30+diff*20),desc: `Sobreviver ${Math.floor(30+diff*20)}s`,     reward: Math.floor(800+tier*400)  },
        fly_high:       { target: Math.floor(80+diff*30),desc: `Altitude de ${Math.floor(80+diff*30)}m`,    reward: Math.floor(900+tier*450)  },
        fly_fast:       { target: Math.floor(100+diff*20),desc:`Velocidade ${Math.floor(100+diff*20)}km/h`, reward: Math.floor(700+tier*350)  },
        fly_low:        { target: 5,                      desc: 'Voar abaixo de 15m por 5s',                reward: Math.floor(1200+tier*600) },
        fly_distance:   { target: Math.floor(500+diff*300),desc:`Distância de ${Math.floor(500+diff*300)}m`,reward: Math.floor(1100+tier*550) },
    };
    return { id, type, ...missions[type], name:`Missão #${id+1}` };
}

let currentMission = GAME_MODE==='career' ? getMission(MISSION_ID) : null;
let surviveTimer    = 0;
let flyLowTimer     = 0;
let maxAltReached   = 0;
let maxSpdReached   = 0;

function updateMissionProgress() {
    if (!currentMission || missionComplete) return;
    const m = currentMission;
    let prog = 0;
    if (m.type==='collect_rings') { prog=ringsHit; missionProgress=ringsHit; }
    else if (m.type==='survive_time') { surviveTimer+=1/60; prog=Math.floor(surviveTimer); missionProgress=prog; }
    else if (m.type==='fly_high') { if(airplane.position.y>maxAltReached)maxAltReached=airplane.position.y; prog=Math.floor(maxAltReached); missionProgress=prog; }
    else if (m.type==='fly_fast') { const spd=speed*40; if(spd>maxSpdReached)maxSpdReached=spd; prog=Math.floor(maxSpdReached); missionProgress=prog; }
    else if (m.type==='fly_low') { if(airplane.position.y<15&&airplane.position.y>2){flyLowTimer+=1/60;prog=Math.floor(flyLowTimer);}missionProgress=prog; }
    else if (m.type==='fly_distance') { prog=Math.floor(totalDist); missionProgress=prog; }

    const pct = Math.min(1, prog / m.target);
    const fill = document.getElementById('mission-bar-fill');
    const txt  = document.getElementById('mission-progress-txt');
    if (fill) fill.style.width = (pct*100)+'%';
    if (txt)  txt.textContent  = `${prog} / ${m.target}`;

    if (prog >= m.target && !missionComplete) {
        missionComplete = true;
        completeMission();
    }
}

function completeMission() {
    const m = currentMission;
    cfg.coins = (cfg.coins||0) + m.reward;
    // Mark completed
    const completed = JSON.parse(localStorage.getItem('skydash_completed') || '[]');
    if (!completed.includes(m.id)) completed.push(m.id);
    localStorage.setItem('skydash_completed', JSON.stringify(completed));
    localStorage.setItem('skydash_coins', cfg.coins);

    const el = document.getElementById('mission-complete-banner');
    if (el) {
        el.querySelector('.mc-reward').textContent = '✦ +'+m.reward.toLocaleString('pt-BR');
        el.classList.add('show');
        setTimeout(()=>el.classList.remove('show'), 4000);
    }
}

// ===================== CONTROLS =====================
document.addEventListener('mousemove', e => {
    if (isDead || isReplay) return;
    mouseX=(e.clientX/window.innerWidth)*2-1;
    mouseY=(e.clientY/window.innerHeight)*2-1;
});
document.addEventListener('touchmove', e => {
    e.preventDefault();
    if (isDead || isReplay) return;
    mouseX=(e.touches[0].clientX/window.innerWidth)*2-1;
    mouseY=(e.touches[0].clientY/window.innerHeight)*2-1;
}, { passive:false });
// Click to init audio
document.addEventListener('click', () => { if(!audioCtx) initAudio(); }, { once:true });
document.addEventListener('keydown', e => { if(e.code==='Space'&&!audioCtx) initAudio(); });

// ===================== MULTIPLAYER =====================
const remotePlayers = {};
const myId = 'player_'+Math.random().toString(36).substr(2,9);
const channel = supabaseClient.channel('skydash_world', { config:{ presence:{ key:myId } } });

function setupMultiplayer() {
    channel
    .on('presence',{event:'sync'},()=>{
        const state=channel.presenceState();
        for(const id in state){
            if(id===myId) continue;
            const d=state[id][0];
            if(d&&d.x!==undefined) updateRemotePlayer(id,d);
        }
    })
    .on('presence',{event:'leave'},({leftPresences})=>{
        leftPresences.forEach(p=>{ if(remotePlayers[p.key]){scene.remove(remotePlayers[p.key]);delete remotePlayers[p.key];} });
    })
    .subscribe();
}

function updateRemotePlayer(id, data) {
    if(!remotePlayers[id]){
        const rp=buildPlane('paper','#'+(data.color||'ff4444'));
        rp.position.set(data.x||0,data.y||60,data.z||0);
        rp.userData.targetPos=new THREE.Vector3(data.x||0,data.y||60,data.z||0);
        rp.userData.targetRot=new THREE.Euler(data.rx||0,data.ry||0,data.rz||0);
        scene.add(rp); remotePlayers[id]=rp;
    }
    const p=remotePlayers[id];
    p.userData.targetPos?.set(data.x,data.y,data.z);
    p.userData.targetRot?.set(data.rx,data.ry,data.rz);
    p.visible=!data.isDead;
}

// ===================== SCORE UI =====================
function updateScoreUI() {
    document.getElementById('score').textContent=score.toLocaleString('pt-BR');
    document.getElementById('coins-earned').textContent=coinsEarned.toLocaleString('pt-BR');
    document.getElementById('rings-count').textContent=ringsHit;
}

// ===================== LOADING =====================
function fakeLoading(cb) {
    const bar=document.getElementById('loading-bar');
    const text=document.getElementById('loading-text');
    const msgs=['Gerando terreno com montanhas...','Plantando árvores...','Construindo vilarejos...','Criando rios animados...','Posicionando power-ups...','Inicializando motor de som...','Pronto para decolar!'];
    let p=0;
    const iv=setInterval(()=>{
        p+=3+Math.random()*5; if(p>100)p=100;
        bar.style.width=p+'%';
        text.textContent=msgs[Math.min(Math.floor((p/100)*msgs.length),msgs.length-1)];
        if(p>=100){ clearInterval(iv); setTimeout(()=>{ const l=document.getElementById('loading'); l.style.opacity='0'; setTimeout(()=>{l.style.display='none';cb();},800); },400); }
    },60);
}

// ===================== MAIN LOOP =====================
const clock = new THREE.Clock();
let syncTimer = 0;
const cameraOffset = new THREE.Vector3();
const lookTarget   = new THREE.Vector3();
let lastWrapX = 0, lastWrapZ = 0; // For camera snap on wrap

// Extra HUD elements (created in JS since they need dynamic ids)
const speedLines = document.createElement('div');
speedLines.id='speed-lines'; document.body.appendChild(speedLines);
const altWarn = document.createElement('div');
altWarn.id='alt-warn'; altWarn.textContent='⚠ ALTITUDE CRÍTICA ⚠'; document.body.appendChild(altWarn);

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05); // cap delta to avoid spiral of death
    const time  = clock.getElapsedTime();

    // Update river water animation
    riverMaterials.forEach(m => { m.uniforms.time.value = time; });

    // Spin powerups
    powerups.forEach(p => {
        if (!p.userData.active) return;
        p.rotation.y += 0.02;
        p.position.y = p.userData.baseY + Math.sin(time*1.5+p.userData.phase)*3;
        const scale = 1 + Math.sin(time*3+p.userData.phase)*0.08;
        p.scale.setScalar(scale);
    });

    if (isReplay) {
        // ============ REPLAY PLAYBACK ============
        const fi  = (replayStart + Math.floor(replayFrame)) % REPLAY_LEN;
        const fi2 = (fi + 1) % REPLAY_LEN;
        const t   = replayFrame - Math.floor(replayFrame);
        airplane.position.lerpVectors(replayBuf.pos[fi], replayBuf.pos[fi2], t);
        airplane.rotation.x = replayBuf.rot[fi].x + (replayBuf.rot[fi2].x - replayBuf.rot[fi].x)*t;
        airplane.rotation.y = replayBuf.rot[fi].y + (replayBuf.rot[fi2].y - replayBuf.rot[fi].y)*t;
        airplane.rotation.z = replayBuf.rot[fi].z + (replayBuf.rot[fi2].z - replayBuf.rot[fi].z)*t;
        replayFrame += 0.5; // Half speed replay

        // Move camera for replay: orbiting cinematic
        const cx  = airplane.position.x + Math.sin(time*0.3)*30;
        const cz  = airplane.position.z + Math.cos(time*0.3)*30;
        camera.position.lerp(new THREE.Vector3(cx, airplane.position.y + 8, cz), 0.05);
        camera.lookAt(airplane.position);

        // Progress bar
        const pct = replayFrame / replayLength;
        const rfill = document.getElementById('replay-bar-fill');
        if (rfill) rfill.style.width = (Math.min(pct,1)*100)+'%';

        drawHUD(0, Math.floor(airplane.position.y), score);

        // Explosion particles continue
        particles.forEach(p => {
            p.position.add(p.userData.vel); p.rotation.x+=p.userData.rot.x; p.rotation.y+=p.userData.rot.y;
            p.userData.vel.y-=0.06; if(p.position.y<0)p.userData.vel.y*=-0.4;
            p.material.opacity=Math.max(0,p.material.opacity-0.003); p.material.transparent=true;
        });
        renderer.render(scene,camera);
        return;
    }

    if (!isDead) {
        // ============ PHYSICS ============
        const targetRoll  = mouseX * MAX_ROLL;
        const targetPitch = -mouseY * MAX_PITCH;
        planeRoll  += (targetRoll  - planeRoll)  * ROLL_SPEED;
        planePitch += (targetPitch - planePitch) * PITCH_SPEED;
        planeYaw   += planeRoll * -TURN_RATE;

        airplane.rotation.order = 'YXZ';
        airplane.rotation.y = planeYaw;
        airplane.rotation.x = planePitch;
        airplane.rotation.z = planeRoll;

        // Speed dynamics
        const effectiveMaxSpeed = speedBoostTimer > 0 ? MAX_SPEED * 1.5 : MAX_SPEED;
        speed -= Math.sin(planePitch) * 0.14;
        speed += (BASE_SPEED - speed) * 0.012;
        speed  = THREE.MathUtils.clamp(speed, MIN_SPEED, effectiveMaxSpeed);

        // Lift
        const cosRoll  = Math.cos(planeRoll);
        const lift     = (speed/BASE_SPEED)*0.048*cosRoll*Math.max(0.1,Math.cos(planePitch));
        const gravity  = 0.052;

        // Save previous pos to detect wrap
        const prevX = airplane.position.x, prevZ = airplane.position.z;
        airplane.translateZ(-speed);
        airplane.position.y += lift - gravity;

        // Track distance (only if not wrapping)
        const moveDist = Math.sqrt(
            Math.pow(airplane.position.x-prevX,2)+
            Math.pow(airplane.position.z-prevZ,2)
        );
        if (moveDist < 20) totalDist += moveDist; // ignore wrap jumps

        // ============ TERRAIN COLLISION (mountain physics) ============
        const terrainY = getTerrainHeight(airplane.position.x, airplane.position.z);
        const minFlyHeight = terrainY + 3.5;

        if (airplane.position.y <= minFlyHeight) {
            if (shieldActive) {
                // Shield bounces off terrain
                airplane.position.y = minFlyHeight + 1;
                planePitch = Math.abs(planePitch) * 0.3; // bounce nose up
                speed *= 0.85;
            } else {
                triggerGameOver();
            }
        }

        // Ceiling
        if (airplane.position.y > 460) airplane.position.y = 460;

        // World wrap — detect wrap and snap camera
        let didWrap = false;
        if      (airplane.position.x > HALF_WORLD)  { airplane.position.x -= WORLD_SIZE; didWrap=true; }
        else if (airplane.position.x < -HALF_WORLD) { airplane.position.x += WORLD_SIZE; didWrap=true; }
        if      (airplane.position.z > HALF_WORLD)  { airplane.position.z -= WORLD_SIZE; didWrap=true; }
        else if (airplane.position.z < -HALF_WORLD) { airplane.position.z += WORLD_SIZE; didWrap=true; }
        if (didWrap) {
            // Snap camera on wrap to avoid huge lerp jump
            const yawQuat2=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),planeYaw);
            const off2=new THREE.Vector3(0,6+Math.abs(planePitch)*5,20+speed*1.5).applyQuaternion(yawQuat2);
            camera.position.copy(airplane.position).add(off2);
        }

        // ============ TREE COLLISION ============
        for (const tree of trees) {
            const dx=airplane.position.x-tree.position.x;
            const dz=airplane.position.z-tree.position.z;
            if(Math.abs(dx)<tree.userData.colRadius&&Math.abs(dz)<tree.userData.colRadius&&airplane.position.y<tree.userData.colHeight+tree.position.y){
                if (shieldActive) { speed*=0.8; break; }
                triggerGameOver(); break;
            }
        }

        // ============ RINGS ============
        const magnetRange = magnetActive ? 18 : 6.5;
        for(const r of rings){
            if(!r.userData.active) continue;
            const dist=airplane.position.distanceTo(r.position);
            if(dist < magnetRange){
                // Magnet: pull ring toward player
                if (magnetActive && dist > 6.5) {
                    const dir=airplane.position.clone().sub(r.position).normalize();
                    r.position.addScaledVector(dir, 2.0);
                }
                if(dist < 6.5){
                    r.userData.active=false; r.visible=false;
                    const pts = 500 * multiplier;
                    score+=pts; ringsHit++; coinsEarned+=RING_COINS;
                    speed=Math.min(speed+1.0,effectiveMaxSpeed);
                    showRingPopup(pts);
                    playRingSound();
                    updateScoreUI();
                }
            }
        }

        // ============ POWER-UPS COLLECTION ============
        for(const pu of powerups){
            if(!pu.userData.active) continue;
            if(airplane.position.distanceTo(pu.position) < 7){
                pu.userData.active=false; pu.visible=false;
                const type=pu.userData.type;
                playPowerupSound(type);
                const info=POWERUP_TYPES[type];
                showPowerupHUD(info.label);
                if(type==='speed')  { speedBoostTimer=info.duration; speed=Math.min(speed+2,effectiveMaxSpeed); }
                if(type==='shield') { shieldActive=true; shieldTimer=info.duration; shieldMesh.material.opacity=0.25; }
                if(type==='magnet') { magnetActive=true; magnetTimer=info.duration; }
                if(type==='multi')  { multiplier=2; multiplierTimer=info.duration; }
                updatePowerupTimers();
                // Respawn powerup elsewhere after 30s
                setTimeout(()=>{ 
                    pu.position.set((Math.random()-0.5)*WORLD_SIZE,(getTerrainHeight(pu.position.x,pu.position.z)||0)+25+Math.random()*40,(Math.random()-0.5)*WORLD_SIZE);
                    pu.userData.baseY=pu.position.y; pu.userData.active=true; pu.visible=true;
                }, 30000);
            }
        }

        // ============ POWERUP TIMERS ============
        if(shieldActive){ shieldTimer-=delta; if(shieldTimer<=0){shieldActive=false;shieldTimer=0;shieldMesh.material.opacity=0;} }
        if(magnetActive){ magnetTimer-=delta; if(magnetTimer<=0){magnetActive=false;magnetTimer=0;} }
        if(multiplier>1){ multiplierTimer-=delta; if(multiplierTimer<=0){multiplier=1;multiplierTimer=0;} }
        if(speedBoostTimer>0){ speedBoostTimer-=delta; if(speedBoostTimer<=0)speedBoostTimer=0; }
        if(time%2<delta) updatePowerupTimers();

        // Shield pulse
        if(shieldActive){ shieldMesh.material.opacity=0.15+Math.sin(time*4)*0.12; shieldMesh.rotation.y+=0.03; shieldMesh.rotation.x+=0.02; }

        // Score tick
        score+=1;
        if(score%50===0) updateScoreUI();

        // Career mission tracking
        if(GAME_MODE==='career') updateMissionProgress();

        // ============ RECORD REPLAY BUFFER ============
        recordReplayFrame();

        // ============ ENVIRONMENT UPDATE ============
        trees.forEach(wrapObject);
        clouds.forEach(wrapObject);
        birds.forEach(wrapObject);
        powerups.forEach(p => { if(p.userData.active) wrapObject(p); });

        rings.forEach(r=>{
            r.rotation.y+=r.userData.spinSpeed;
            r.position.y=r.userData.baseH+Math.sin(time*2.2+r.userData.phase)*4;
            wrapObject(r);
            if(!r.userData.active&&airplane.position.distanceTo(r.position)>HALF_WORLD*0.6){
                r.userData.active=true; r.visible=true;
                r.position.set((Math.random()-0.5)*WORLD_SIZE,35+Math.random()*80,(Math.random()-0.5)*WORLD_SIZE);
                r.userData.baseH=r.position.y;
            }
        });
        birds.forEach(b=>{
            b.position.add(b.userData.vel);
            b.position.y+=Math.sin(time*7+b.userData.phase)*0.1;
            b.lookAt(b.position.clone().add(b.userData.vel));
            wrapObject(b);
        });
        clouds.forEach(c=>{ c.position.x+=0.04; wrapObject(c); });

        // ============ CAMERA ============
        const yawQuat=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),planeYaw);
        cameraOffset.set(0,6+Math.abs(planePitch)*5,20+speed*1.5).applyQuaternion(yawQuat);
        const desiredCam=airplane.position.clone().add(cameraOffset);
        camera.position.lerp(desiredCam,0.12);
        lookTarget.copy(airplane.position).add(new THREE.Vector3(0,2.5,0));
        camera.lookAt(lookTarget);

        // ============ HUD ============
        const spdKmh=speed*40, altM=Math.max(0,Math.floor(airplane.position.y-terrainY));
        drawHUD(spdKmh, altM, score);

        if(speed>MAX_SPEED*0.75||speedBoostTimer>0) speedLines.className='active';
        else speedLines.className='';

        if(airplane.position.y < terrainY+18) altWarn.className='visible';
        else altWarn.className='';

        // ============ AUDIO ============
        updateEngineSound(speed, true);

        // ============ MULTIPLAYER SYNC ============
        syncTimer+=delta;
        if(syncTimer>0.05){
            syncTimer=0;
            channel.track({ x:airplane.position.x,y:airplane.position.y,z:airplane.position.z, rx:airplane.rotation.x,ry:airplane.rotation.y,rz:airplane.rotation.z, isDead, color:cfg.color.replace('#','') });
        }

    } else if (!isReplay) {
        // Explosion particles
        particles.forEach(p=>{
            p.position.add(p.userData.vel); p.rotation.x+=p.userData.rot.x; p.rotation.y+=p.userData.rot.y;
            p.userData.vel.y-=0.06; if(p.position.y<0)p.userData.vel.y*=-0.4;
            p.material.opacity=Math.max(0,p.material.opacity-0.003); p.material.transparent=true;
        });
        updateEngineSound(0, false);
        drawHUD(0, 0, score);
    }

    // Remote players LERP
    for(const id in remotePlayers){
        const p=remotePlayers[id];
        if(p.userData.targetPos){ p.position.lerp(p.userData.targetPos,0.1); p.rotation.x+=(p.userData.targetRot.x-p.rotation.x)*0.1; p.rotation.y+=(p.userData.targetRot.y-p.rotation.y)*0.1; p.rotation.z+=(p.userData.targetRot.z-p.rotation.z)*0.1; }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize',()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });

// Setup career HUD
if (GAME_MODE==='career' && currentMission) {
    const mhud = document.getElementById('mission-hud');
    if (mhud) {
        mhud.style.display='block';
        document.getElementById('mission-name').textContent  = currentMission.name;
        document.getElementById('mission-desc').textContent  = currentMission.desc;
        document.getElementById('mission-reward').textContent= '✦ '+currentMission.reward.toLocaleString('pt-BR');
    }
}

setupMultiplayer();
fakeLoading(() => { animate(); });