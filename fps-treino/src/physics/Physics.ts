import RAPIER from "@dimforge/rapier3d-compat";

export class Physics {
  world!: RAPIER.World;
  ready = false;

  constructor() {
    RAPIER.init().then(() => {
      this.world = new RAPIER.World({
        x: 0,
        y: -9.81,
        z: 0
      });
      this.ready = true;
    });
  }

  step() {
    if (!this.ready) return;
    this.world.step();
  }
}
