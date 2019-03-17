'use strict';

import Hero from './components/hero';
import Gate from './components/gate';

// body
document.body.style.overflow = 'hidden';
document.body.style.backgroundImage = 'linear-gradient(#e66465, #9198e5)';
document.body.style.backgroundRepeat = 'no-repeat';
document.body.style.width = '100vw';
document.body.style.height = '100vh';

// root
const root = document.querySelector('.root');
root.textContent = '';
root.style.position = 'relative';

// spawn hero
const mainHero = new Hero(30, 10, 'wall');
root.appendChild(mainHero.heroEl);
mainHero.startLifeCheck();

// hero movements
document.addEventListener('keydown', (evt) => {
  let heroTop = parseInt(mainHero.heroEl.style.top);
  let heroLeft = parseInt(mainHero.heroEl.style.left);

  switch(evt.key) {
    case 'w':
      if (heroTop > 3) {
        mainHero.heroEl.style.top = heroTop - 3 + 'vh';
      }
      break;
    case 's':
      if (heroTop < 89) {
        mainHero.heroEl.style.top = heroTop + 3 + 'vh';
      }
      break;
    case 'd':
      if (heroLeft < 89) {
        mainHero.heroEl.style.left = heroLeft + 1.5 + 'vw';
      }
      break;
    case 'a':
      if (heroLeft > 3) {
        mainHero.heroEl.style.left = heroLeft - 1.5 + 'vw';
      }
      break;
  }
});

// create best time counter
let bestTime = 0;
let bestTimeEl = document.createElement('span');
bestTimeEl.prepend(document.createElement('strong'));
bestTimeEl.children[0].textContent = 'Your best time is: ';
bestTimeEl.append(document.createElement('span'));
bestTimeEl.children[1].textContent = `${bestTime}`;
bestTimeEl.style.cssText = `
  padding: 5px;
  background-color: green;
`;
root.prepend(bestTimeEl);

// create and spawn gates
let allGates = spawn(5, 30, root, 50);

// event hero dead, refresh best time and reset gates
document.body.addEventListener('heroDead', (e) => {
  let newTime = ( Math.round(performance.now() - e.detail.creationTime) / 1000 ).toFixed(1);
  alert('Your time is: ' + newTime + ' sec');
  if (+bestTimeEl.children[1].textContent < newTime) {
   bestTimeEl.children[1].textContent = newTime;
  }
  e.detail.resetTime();
  e.detail.respawn();
  resetGates(allGates);
});

function spawn(amount, gap, parent, speed) {
  let allGates = [];

  for (let i = 0, j = gap; i < amount; i++, j += gap) {
    allGates.push(new Gate(j, j));
  }

  for (let i = 0; i < allGates.length; i++) {
    allGates[i].addToDom(parent);

    setInterval(function spawnGate() {
      if (allGates[i].getLeftPos() < 1) {
        allGates[i].setRandomHeight();
        allGates[i].setStartPosition();
      }

      allGates[i].changeLeftPos(1);
    }, speed);
  }

  return allGates;
}

function resetGates(gates) {
  for (let i = 0; i < gates.length; i++) {
    gates[i].setStartPosition();
  }
}
