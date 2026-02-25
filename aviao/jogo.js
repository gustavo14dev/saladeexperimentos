// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = 'https://bzpdjexpkdydpdjshdmv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5UqN3VIRzBAwS1lefzCuRA_zdEJS61P';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONFIGURAÇÃO SCENE ---
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 150, 900);
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.body.appendChild(renderer.domElement);

// --- LUZES ---
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(150, 300, 100);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 300; dirLight.shadow.camera.bottom = -300;
dirLight.shadow.camera.left = -300; dirLight.shadow.camera.right = 300;
dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// --- VARIÁVEIS DE ESTADO ---
let isDead = false;
let score = 0;
let speed = 1.5;
const WORLD_SIZE = 2000;
const HALF_WORLD = WORLD_SIZE / 2;
let mouseX = 0, mouseY = 0;

// --- MULTIPLAYER LOGIC ---
const remotePlayers = {};
const myId = 'player_' + Math.random().toString(36).substr(2, 9);
const channel = supabaseClient.channel('voo_livre', {
    config: { presence: { key: myId } }
});

function setupMultiplayer() {
    channel
    .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        for (const id in state) {
            if (id === myId) continue;
            const data = state[id][0];
            if (data && data.x !== undefined) {
                updateRemotePlayer(id, data);
            }
        }
    })
    .on('presence', { event: 'leave', key: '*' }, ({ leftPresences }) => {
        leftPresences.forEach(p => {
            if (remotePlayers[p.key]) {
                scene.remove(remotePlayers[p.key]);
                delete remotePlayers[p.key];
            }
        });
    })
    .subscribe();
}

function updateRemotePlayer(id, data) {
    if (!remotePlayers[id]) {
        // Usa sua geometria original, mas com cor vermelha
        const otherPlane = new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({ color: 0xff4444, side: THREE.DoubleSide }));
        
        // Define a posição e rotação inicial para não "nascer" no 0,0,0
        otherPlane.position.set(data.x, data.y, data.z);
        otherPlane.rotation.set(data.rx, data.ry, data.rz);
        
        // Cria os alvos para a Interpolação (LERP)
        otherPlane.userData.targetPos = new THREE.Vector3(data.x, data.y, data.z);
        otherPlane.userData.targetRot = new THREE.Euler(data.rx, data.ry, data.rz);
        
        scene.add(otherPlane);
        remotePlayers[id] = otherPlane;
    }
    const p = remotePlayers[id];
    
    // Atualiza apenas o OBJETIVO para onde o avião deve ir
    if (p.userData.targetPos) {
        p.userData.targetPos.set(data.x, data.y, data.z);
        p.userData.targetRot.set(data.rx, data.ry, data.rz);
    }
    
    p.visible = !data.isDead;
}

// --- WORLD WRAP ---
function wrapObject(obj) {
     const dx = airplane.position.x - obj.position.x;
     const dz = airplane.position.z - obj.position.z;
     if (dx > HALF_WORLD) obj.position.x += WORLD_SIZE;
     else if (dx < -HALF_WORLD) obj.position.x -= WORLD_SIZE;
     if (dz > HALF_WORLD) obj.position.z += WORLD_SIZE;
     else if (dz < -HALF_WORLD) obj.position.z -= WORLD_SIZE;
}

// --- O AVIÃO ---
const planeGeo = new THREE.BufferGeometry();
const vertices = new Float32Array([
    0, 0, -2.5,  -1.5, 0.2, 1.5,   0, -0.5, 1.5,
    0, 0, -2.5,   0, -0.5, 1.5,    1.5, 0.2, 1.5,
    0, 0, -1.8,   0, -0.5, 1.5,    0, 0.8, 1.5
]);
planeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
planeGeo.computeVertexNormals();
const airplane = new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.5 }));
airplane.position.set(0, 60, 0);
airplane.castShadow = true;
scene.add(airplane);

// --- EXPLOSÃO E GAME OVER ---
const particles = [];
function triggerGameOver() {
    if (isDead) return;
    isDead = true; 
    airplane.visible = false;
    document.getElementById('flash').style.opacity = '0.5';
    setTimeout(() => document.getElementById('flash').style.opacity = '0', 100);
    for(let i=0; i<25; i++) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
        p.position.copy(airplane.position);
        p.userData.vel = new THREE.Vector3((Math.random()-0.5)*2, Math.random()*1.5, (Math.random()-0.5)*2);
        p.userData.rot = new THREE.Vector3(Math.random()*0.3, Math.random()*0.3, Math.random()*0.3);
        scene.add(p); particles.push(p);
    }
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('final-score').innerText = `Pontuação: ${score}`;
}

// --- CENÁRIO POPULATION (ÁRVORES, NUVENS, ANÉIS, PASSARINHOS) ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE*2, WORLD_SIZE*2), new THREE.MeshStandardMaterial({ color: 0x3a9d3a, roughness: 0.8 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const trees = [], clouds = [], rings = [], birds = [];
const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 4, 6);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
const leavesGeo = new THREE.ConeGeometry(4.5, 12, 6);
const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22, flatShading: true });
const ringGeo = new THREE.TorusGeometry(4.5, 0.6, 8, 16);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0x665500, flatShading: true });
const birdGeo = new THREE.BufferGeometry();
const birdVerts = new Float32Array([-1,0,0.5, 0,0,-0.2, 0,0,0, 1,0,0.5, 0,0,0, 0,0,-0.2]);
birdGeo.setAttribute('position', new THREE.BufferAttribute(birdVerts, 3));
birdGeo.computeVertexNormals();
const birdMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide, flatShading: true });

const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent:true, opacity:0.9 });
const cloudSphere = new THREE.SphereGeometry(5, 7, 7);
function createCloud() {
    const group = new THREE.Group();
    for(let i=0; i<4 + Math.random()*3; i++) {
         const p = new THREE.Mesh(cloudSphere, cloudMat);
         p.position.set(Math.random()*10-5, Math.random()*4, Math.random()*10-5);
         const s = 0.7 + Math.random()*0.8; p.scale.set(s,s*0.8,s);
         group.add(p);
    }
    return group;
}

// CRIANDO O MUNDO (600 Árvores, 100 Nuvens, 100 Anéis, 80 Pássaros)
for(let i=0; i<600; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 6; trunk.position.y = 2;
    trunk.castShadow = true; leaves.castShadow = true;
    tree.add(trunk); tree.add(leaves);
    tree.position.set((Math.random()-0.5)*WORLD_SIZE, 0, (Math.random()-0.5)*WORLD_SIZE);
    const s = 0.7 + Math.random()*0.6; tree.scale.set(s,s,s);
    tree.userData = { colRadius: 2.5 * s, colHeight: 14 * s };
    scene.add(tree); trees.push(tree);
}
for(let i=0; i<100; i++) {
    const c = createCloud();
    c.position.set((Math.random()-0.5)*WORLD_SIZE, 70+Math.random()*100, (Math.random()-0.5)*WORLD_SIZE);
    scene.add(c); clouds.push(c);
}
for(let i=0; i<100; i++) {
    const r = new THREE.Mesh(ringGeo, ringMat);
    r.position.set((Math.random()-0.5)*WORLD_SIZE, 30+Math.random()*80, (Math.random()-0.5)*WORLD_SIZE);
    r.userData = { active: true, baseH: r.position.y, spinSpeed: Math.random()*0.02+0.01 };
    scene.add(r); rings.push(r);
}
for(let i=0; i<80; i++) {
    const b = new THREE.Mesh(birdGeo, birdMat);
    b.position.set((Math.random()-0.5)*WORLD_SIZE, 50+Math.random()*120, (Math.random()-0.5)*WORLD_SIZE);
    b.userData = { vel: new THREE.Vector3((Math.random()-0.5)*0.3, 0, -0.5 - Math.random()*0.5), phase: Math.random()*Math.PI*2 };
    scene.add(b); birds.push(b);
}

// --- CONTROLES ---
document.addEventListener('mousemove', (e) => {
    if(isDead) return;
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1; 
});

function resetGame() {
    isDead = false; score = 0; speed = 1.5;
    airplane.position.set(0, 60, 0); airplane.rotation.set(0, 0, 0); airplane.visible = true;
    document.getElementById('game-over').style.display = 'none';
    particles.forEach(p => scene.remove(p)); particles.length = 0;
    rings.forEach(r => { r.visible = true; r.userData.active = true; });
}

// --- LOOP PRINCIPAL ---
const clock = new THREE.Clock();
setupMultiplayer();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    if (!isDead) {
        // FÍSICA E MOVIMENTO ORIGINAL
        const targetRoll = mouseX * (Math.PI / 2.2);
        const targetPitch = -mouseY * (Math.PI / 3.5); 
        airplane.rotation.z += (targetRoll - airplane.rotation.z) * 0.08;
        airplane.rotation.x += (targetPitch - airplane.rotation.x) * 0.08;
        airplane.rotation.y += airplane.rotation.z * -0.025;
        speed -= Math.sin(airplane.rotation.x) * 0.12;
        speed += (1.5 - speed) * 0.015;
        speed = THREE.MathUtils.clamp(speed, 0.4, 4.5);
        const lift = (speed / 1.5) * 0.045 * Math.max(0.2, Math.cos(airplane.rotation.z));
        airplane.translateZ(-speed);
        airplane.position.y -= (0.05 - lift);

        if (airplane.position.y <= 2.0) triggerGameOver();

        // COLISÃO COM ÁRVORES
        for (let tree of trees) {
            if (Math.abs(airplane.position.x - tree.position.x) < tree.userData.colRadius &&
                Math.abs(airplane.position.z - tree.position.z) < tree.userData.colRadius) {
                if (airplane.position.y < tree.userData.colHeight) {
                    triggerGameOver(); break;
                }
            }
        }

        // SINCRONIZAR COM SUPABASE
        if (Math.floor(time * 60) % 2 === 0) {
            channel.track({
                x: airplane.position.x, y: airplane.position.y, z: airplane.position.z,
                rx: airplane.rotation.x, ry: airplane.rotation.y, rz: airplane.rotation.z,
                isDead: isDead
            });
        }

        // ATUALIZAÇÃO DO CENÁRIO
        ground.position.set(airplane.position.x, 0, airplane.position.z);
        trees.forEach(wrapObject);
        clouds.forEach(wrapObject);
        rings.forEach(r => {
            r.rotation.y += r.userData.spinSpeed;
            r.position.y = r.userData.baseH + Math.sin(time * 2 + r.position.x) * 3;
            if(r.userData.active && airplane.position.distanceTo(r.position) < 6.5) {
                r.userData.active = false; r.visible = false;
                score += 500; speed = 4.5;
            }
            wrapObject(r);
            if(airplane.position.distanceTo(r.position) > HALF_WORLD * 0.8 && !r.userData.active) {
                 r.userData.active = true; r.visible = true;
                 r.position.y = r.userData.baseH = 30 + Math.random()*80;
            }
        });
        birds.forEach(b => {
            b.position.add(b.userData.vel);
            b.position.y += Math.sin(time * 6 + b.userData.phase) * 0.08;
            b.lookAt(b.position.clone().add(b.userData.vel));
            wrapObject(b);
        });

        // CÂMERA
        const offset = new THREE.Vector3(0, 7, 22).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), airplane.rotation.y)).add(airplane.position);
        camera.position.lerp(offset, 0.15);
        camera.lookAt(airplane.position.clone().add(new THREE.Vector3(0, 2, 0)));
        
        document.getElementById('score').innerText = score;
        document.getElementById('alt').innerText = Math.max(0, Math.floor(airplane.position.y));
        document.getElementById('speed').innerText = Math.floor(speed * 40);

    } else {
        // EXPLOSÃO ORIGINAL
        particles.forEach(p => {
            p.position.add(p.userData.vel);
            p.rotation.x += p.userData.rot.x; p.rotation.y += p.userData.rot.y;
            p.userData.vel.y -= 0.05; 
            if(p.position.y < 0) p.userData.vel.y *= -0.5;
        });
    }

    // --- SUAVIZAÇÃO DOS OUTROS JOGADORES (LERP) ---
    for (let id in remotePlayers) {
        const p = remotePlayers[id];
        if (p.userData.targetPos) {
            // O valor 0.1 dita a velocidade do deslizamento
            p.position.lerp(p.userData.targetPos, 0.1); 
            p.rotation.x += (p.userData.targetRot.x - p.rotation.x) * 0.1;
            p.rotation.y += (p.userData.targetRot.y - p.rotation.y) * 0.1;
            p.rotation.z += (p.userData.targetRot.z - p.rotation.z) * 0.1;
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
animate();l