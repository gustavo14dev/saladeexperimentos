export class Input {
  keys = new Set<string>();
  mouseDX = 0;
  mouseDY = 0;

  rightMouse = false;

  constructor(element: HTMLElement) {
    element.addEventListener("click", () => {
      element.requestPointerLock();
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === element) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });

    document.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
    });

    document.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });

    document.addEventListener("mousedown", (e) => {
      if (e.button === 2) this.rightMouse = true;
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button === 2) this.rightMouse = false;
    });

    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  consumeMouseX() {
    const x = this.mouseDX;
    this.mouseDX = 0;
    return x;
  }

  consumeMouseY() {
    const y = this.mouseDY;
    this.mouseDY = 0;
    return y;
  }

  isKeyDown(code: string) {
    return this.keys.has(code);
  }
}
