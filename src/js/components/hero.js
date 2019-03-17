export default class Hero {
  constructor(top, left, enemyClass) {
    this.heroEl = document.createElement('div');

    this.initialPosition = {
      top,
      left,
    };

    this.heroEl.style.cssText = `
      position: absolute;
      top: ${this.initialPosition.top}vh;
      left: ${this.initialPosition.left}vw;
      width: 60px;
      height: 60px;
      background-color: rgb(102, 164, 223);
    `;

    this.enemyClass = enemyClass;

    this.creationTime = performance.now();
  }

  startLifeCheck() {
    setInterval(() => {
      let coord = this.heroEl.getBoundingClientRect();
      
      if (  document.elementsFromPoint(coord.right, coord.top).find((e) => e.classList.contains(this.enemyClass)) ||
            document.elementsFromPoint(coord.left, coord.bottom).find((e) => e.classList.contains(this.enemyClass))) {
        let event = new CustomEvent('heroDead', { bubbles: true, detail: this });
        this.heroEl.dispatchEvent(event);
      }
    }, 100);
  }

  respawn() {
    this.heroEl.style.top = `${this.initialPosition.top}vh`;
    this.heroEl.style.left = `${this.initialPosition.left}vw`;
  }

  resetTime() {
    this.creationTime = performance.now();
  }
}