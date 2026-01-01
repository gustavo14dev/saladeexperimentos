export class HUD {
  el = document.createElement("div");

  constructor() {
    this.el.style.position = "fixed";
    this.el.style.bottom = "20px";
    this.el.style.left = "20px";
    this.el.style.color = "white";
    this.el.style.fontFamily = "monospace";
    this.el.style.fontSize = "18px";
    document.body.appendChild(this.el);
  }

  update(ammo: number, score: number) {
    this.el.innerText = `Munição: ${ammo} | Acertos: ${score}`;
  }
}
