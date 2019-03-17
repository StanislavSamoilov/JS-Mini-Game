export default class Gate {
  constructor(topLeft, bottomLeft = topLeft) {
    this.topEl = document.createElement('div');
    this.bottomEl = document.createElement('div');

    this.initialLeft = {
      topLeft,
      bottomLeft,
    }

    this.topEl.classList.add('wall');
    this.topEl.style.cssText = `
      position: absolute;
      width: 5vw;
      height: 25vh;
      left: ${this.initialLeft.topLeft}vw;
      top: -5vh;
      background-color: rgb(99, 206, 108);
    `;

    this.bottomEl.classList.add('wall');
    this.bottomEl.style.cssText = `
      position: absolute;
      width: 5vw;
      height: 35vh;
      left: ${this.initialLeft.bottomLeft}vw;
      bottom: -105vh;
      background-color: rgb(99, 206, 108);
    `;
  }

  setRandomHeight(max = 60, min = 20, all = 80) {
    let topHeight = Math.random() * (max - min) + min;
    let bottomHeight = all - topHeight;

    this.topEl.style.height = `${topHeight}vh`;
    this.bottomEl.style.height = `${bottomHeight}vh`;
  }

  addToDom(parent) {
    parent.appendChild(this.topEl);
    parent.appendChild(this.bottomEl);
  }
  
  getLeftPos() {
    return parseInt(this.topEl.style.left);
  }

  changeLeftPos(delta) {
    this.topEl.style.left = `${this.getLeftPos() - delta}vw`;
    this.bottomEl.style.left = `${this.getLeftPos() - delta}vw`;
  }

  setStartPosition() {
    this.topEl.style.left = `${this.initialLeft.topLeft + 100}vw`;
    this.bottomEl.style.left = `${this.initialLeft.bottomLeft + 100}vw`;
  }
}