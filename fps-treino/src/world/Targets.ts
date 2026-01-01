import * as THREE from "three";

export class Targets {
  targets: THREE.Mesh[] = [];
  score = 0;

  constructor(scene: THREE.Scene) {
    for (let i = 0; i < 5; i++) {
      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      t.rotation.x = Math.PI / 2;
      t.position.set(-4 + i * 2, 1.5, -15);
      scene.add(t);
      this.targets.push(t);
    }
  }

  update() {
    this.targets.forEach((t, i) => {
      t.position.x += Math.sin(performance.now() * 0.001 + i) * 0.01;
    });
  }

  hit(target: THREE.Mesh) {
    (target.material as THREE.MeshStandardMaterial).color.set(0x00ff00);
    this.score++;
  }
}
