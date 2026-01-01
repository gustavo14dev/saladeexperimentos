import * as THREE from "three";

import { Physics } from "../physics/Physics";
import { createScene } from "../world/Scene";
import { Player } from "./Player";
import { Weapon } from "./Weapon";
import { HUD } from "../ui/HUD";
import { Targets } from "../world/Targets";

export class Game {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  physics: Physics;
  player!: Player;
  weapon!: Weapon;
  hud!: HUD;
  targets!: Targets;

  lastTime = performance.now();

  constructor() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.physics = new Physics();

    window.addEventListener("resize", this.onResize);
  }

  start() {
    // cenário (chão + luz + paredes da sala)
    createScene(this.scene, this.physics);

    // jogador
    this.player = new Player(this.camera, this.scene, this.physics);

    // alvos
    this.targets = new Targets(this.scene);

    // arma (precisa dos alvos para raycast)
    this.weapon = new Weapon(
      this.camera,
      this.player.input,
      this.targets
    );

    // HUD
    this.hud = new HUD();

    this.loop();
  }

  private loop = () => {
    requestAnimationFrame(this.loop);

    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // física
    this.physics.step();

    // updates
    this.player.update();
    this.weapon.update(delta);
    this.targets.update();
    this.hud.update(this.weapon.ammo, this.targets.score);

    // render
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}
