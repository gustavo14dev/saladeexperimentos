import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { Physics } from "../physics/Physics";
import { Input } from "./Input";

export class Player {
  body!: RAPIER.RigidBody;
  input: Input;

  yawObject = new THREE.Object3D();
  pitchObject = new THREE.Object3D();

  yaw = 0;
  pitch = 0;

  speed = 5;

  constructor(
    public camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    physics: Physics
  ) {
    this.input = new Input(document.body);

    this.yawObject.add(this.pitchObject);
    this.pitchObject.add(this.camera);
    scene.add(this.yawObject);

    const wait = setInterval(() => {
      if (!physics.ready) return;

      this.body = physics.world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(0, 1.7, 5)
          .setCanSleep(false)
      );

      physics.world.createCollider(
        RAPIER.ColliderDesc.capsule(0.6, 0.3),
        this.body
      );

      clearInterval(wait);
    }, 50);
  }

  update() {
    if (!this.body) return;

    this.yaw -= this.input.consumeMouseX() * 0.002;
    this.pitch -= this.input.consumeMouseY() * 0.002;

    this.pitch = THREE.MathUtils.clamp(
      this.pitch,
      -Math.PI / 2 + 0.05,
      Math.PI / 2 - 0.05
    );

    this.yawObject.rotation.y = this.yaw;
    this.pitchObject.rotation.x = this.pitch;

    const forward =
      (this.input.isKeyDown("KeyW") ? 1 : 0) -
      (this.input.isKeyDown("KeyS") ? 1 : 0);
    const strafe =
      (this.input.isKeyDown("KeyD") ? 1 : 0) -
      (this.input.isKeyDown("KeyA") ? 1 : 0);

    const dir = new THREE.Vector3(strafe, 0, -forward)
      .normalize()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const vel = this.body.linvel();
    this.body.setLinvel(
      { x: dir.x * this.speed, y: vel.y, z: dir.z * this.speed },
      true
    );

    const pos = this.body.translation();
    this.yawObject.position.set(pos.x, pos.y + 0.3, pos.z);
  }
}
