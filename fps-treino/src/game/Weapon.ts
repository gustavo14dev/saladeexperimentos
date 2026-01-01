import * as THREE from "three";
import { Input } from "./Input";
import { Targets } from "../world/Targets";

export class Weapon {
  group = new THREE.Group();

  ammo = 15;
  maxAmmo = 15;
  cooldown = 0;

  ads = false;
  recoil = 0;

  raycaster = new THREE.Raycaster();

  constructor(
    private camera: THREE.PerspectiveCamera,
    private input: Input,
    private targets: Targets
  ) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    // Corpo
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.18, 0.7),
      mat
    );
    body.position.set(0.2, -0.2, -0.6);

    // Cano
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.7),
      mat
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.2, -0.15, -1);

    // Massa de mira
    const sight = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.05, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    sight.position.set(0.2, -0.05, -1.05);

    this.group.add(body, barrel, sight);
    this.camera.add(this.group);
  }

  update(delta: number) {
    this.ads = this.input.rightMouse;

    // ADS (igual imagem)
    this.camera.fov = this.ads ? 40 : 75;
    this.camera.updateProjectionMatrix();

    const targetPos = this.ads
      ? new THREE.Vector3(0, -0.05, -0.35)
      : new THREE.Vector3(0.25, -0.25, -0.6);

    this.group.position.lerp(targetPos, 0.15);

    if (this.cooldown > 0) this.cooldown -= delta;

    // Atirar
    if (
      this.input.isKeyDown("Space") &&
      this.cooldown <= 0 &&
      this.ammo > 0
    ) {
      this.shoot();
      this.cooldown = 0.25;
    }

    // Recarregar
    if (this.input.isKeyDown("KeyR")) {
      this.ammo = this.maxAmmo;
    }

    // Recuo visual
    this.recoil = THREE.MathUtils.lerp(this.recoil, 0, 10 * delta);
    this.group.rotation.x = this.recoil;
  }

  shoot() {
    this.ammo--;
    this.recoil = -0.15;
    this.camera.rotation.x -= 0.05;

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const hits = this.raycaster.intersectObjects(this.targets.targets);

    if (hits.length > 0) {
      this.targets.hit(hits[0].object as THREE.Mesh);
    }
  }
}
