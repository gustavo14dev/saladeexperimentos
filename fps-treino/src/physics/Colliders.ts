import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import { Physics } from "./Physics";

export function createStaticCollider(
  physics: Physics,
  mesh: THREE.Mesh
) {
  if (!physics.ready) return;

  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);

  const colliderDesc = RAPIER.ColliderDesc.cuboid(
    size.x / 2,
    size.y / 2,
    size.z / 2
  ).setTranslation(
    mesh.position.x,
    mesh.position.y,
    mesh.position.z
  );

  physics.world.createCollider(colliderDesc);
}
