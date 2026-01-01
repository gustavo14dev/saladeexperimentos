import * as THREE from "three";
import { Physics } from "../physics/Physics";
import RAPIER from "@dimforge/rapier3d-compat";

export function createScene(scene: THREE.Scene, physics: Physics) {
  scene.background = new THREE.Color(0x222222);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(5, 10, 5);
  scene.add(light);

  // chão
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // paredes
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x666666 });

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(50, 10, 1),
    wallMat
  );
  backWall.position.set(0, 5, -25);
  scene.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 10, 50),
    wallMat
  );
  leftWall.position.set(-25, 5, 0);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 10, 50),
    wallMat
  );
  rightWall.position.set(25, 5, 0);
  scene.add(rightWall);

  // física (quando pronta)
  const waitPhysics = setInterval(() => {
    if (!physics.ready) return;

    physics.world.createCollider(
      RAPIER.ColliderDesc.cuboid(25, 0.1, 25).setTranslation(0, 0, 0)
    );

    physics.world.createCollider(
      RAPIER.ColliderDesc.cuboid(25, 5, 0.5).setTranslation(0, 5, -25)
    );

    physics.world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.5, 5, 25).setTranslation(-25, 5, 0)
    );

    physics.world.createCollider(
      RAPIER.ColliderDesc.cuboid(0.5, 5, 25).setTranslation(25, 5, 0)
    );

    clearInterval(waitPhysics);
  }, 50);
}
