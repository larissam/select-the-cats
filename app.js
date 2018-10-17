// Generate 5 cats
// pick one "correct" configuration type to select for
// ie. "black cats", "striped cats", "cats with blue bows"
// at least one cat in every set needs to have the characteristic
// generate 5 random ones and then hardcode a random # of them 
// - this is only  b/c all fields are independent.

// Input field
// User can type selector

// HTML markup field
// Just for reference

// Scoreboard
// Did they get it right or not?
// If not, what the correct selector was
// What % they've got correct so far

const Engine = (function(){
  const config = {
    color: [
      'black',
      'gray',
      'orange',
      'cream',
      'white',
    ],
    eye: [
      'black',
      'blue',
      'green',
      // 'orange', // only black and gray cats should be eligible for orange eyes
      'odd',
    ],
    bow: [
      'neck',
      'head',
      'tail',
    ],
    stripes: [
      true,
      false,
    ],
    tuxedo: [
      true,
      false,
    ]
  };

  const getRandomIndex = (max) => Math.floor(Math.random() * Math.floor(max));
  const getRandomCharacteristic = () => Object.keys(config)[getRandomIndex(Object.keys(config).length)];
  const getRandomCharacteristicValue = (characteristic) => {
    const options = config[characteristic];
    const randomIdx = getRandomIndex(options.length);

    return options[randomIdx];
  };

  // fixedCharacteristics
  // [key]: value
  const generateCat = (fixedCharacteristics = {}) => ({
    color: getRandomCharacteristicValue('color'),
    eye: getRandomCharacteristicValue('eye'),
    bow: getRandomCharacteristicValue('bow'),
    stripes: getRandomCharacteristicValue('stripes'),
    tuxedo: getRandomCharacteristicValue('tuxedo'),
    ...fixedCharacteristics,
  });

  const generateCats = ({ quantity = 5, fixedCharacteristics = {} }) => {
    // change to random indices
    const randomIdx = getRandomIndex(quantity);
    console.log("randomIdx: ", randomIdx);
    console.log("fixedCharacterisitics: ", fixedCharacteristics);

    // You cannot have a solid color and a tuxedo at the same time
    if(fixedCharacteristics.color !== undefined) {
      fixedCharacteristics.tuxedo = false;
    } else if(fixedCharacteristics.tuxedo !== undefined) {
      // You cannot have a white cat with tuxedo coloring (hardcode to black for now)
      fixedCharacteristics.color = 'black';
    } else if(fixedCharacteristics.eye !== undefined && fixedCharacteristics.eye === "orange") {
      // Only black cats can have orange eyes (should later add gray)
      // Unused - because we need to fix the orange eyes at the generateCat level.
      // fixedCharacteristics.color = 'black';
    }

    const cats = [...Array(quantity).keys()].map((idx) => idx === randomIdx ? generateCat(fixedCharacteristics) : generateCat());

    return cats;
  };

  const getTargetSelector = (characteristic, value) => {
    if(characteristic === "color" && value === "white") {
      return `.cat--${characteristic}-${value}:not(.cat--tuxedo)`;
    } else if(characteristic === "stripes" && value === true) {
      return `.cat--tabby`;
    } else if(characteristic === "stripes" && value === false) {
      return `.cat:not(.cat--tabby)`;
    } else if(characteristic === "tuxedo" && value === true) {
      return `.cat--tuxedo`;
    } else if(characteristic === "tuxedo" && value === false) {
      return `.cat:not(.cat--tuxedo)`;
    } else {
      return `.cat--${characteristic}-${value}`;
    }
  };

  const getAnswerSelector = (characteristic, value) => {
    if(characteristic === "stripes" && value === true) {
      return `.cat--stripes`;
    } else if(characteristic === "stripes" && value === false) {
      return `.cat--no-stripes`;
    } else if(characteristic === "tuxedo" && value === true) {
      return `.cat--color-${value}-and-white`;
    } else {
      return `.cat--${characteristic}-${value}`; 
    }
  }

  const getConfig = () => {
    const randomCharacteristic = getRandomCharacteristic();
    const randomCharacteristicValue = getRandomCharacteristicValue(randomCharacteristic);

    return {
      cats: generateCats({ fixedCharacteristics: { [randomCharacteristic]: randomCharacteristicValue }}),
      randomCharacteristic,
      randomCharacteristicValue,
      targetSelector: getTargetSelector(randomCharacteristic, randomCharacteristicValue),
      answerSelector: getAnswerSelector(randomCharacteristic, randomCharacteristicValue)
    }
  };

  const getCatColorClasses = (color, tuxedo) => {
    if(tuxedo) { // all tuxedo cats have base white
      return `cat--color-white`;
    } else {
      return `cat--color-${color}`;
    }
  };

  const getCatStripesClasses = (stripes, color) => {
    if(stripes) {
      return `cat--tabby cat--tabby-color-${color}`; 
    } else {
      return '';
    }
  }

  const getCatTuxedoClasses = (tuxedo, color) => {
    if(tuxedo && color !== "white") {
      return `cat--tuxedo cat--tuxedo-color-${color}`;
    } else {
      return '';
    }
  }

  const getCatMarkup = ({ color, eye, bow, stripes, tuxedo }) => `
  <div class="cat-wrapper">
      <div class="cat ${ getCatColorClasses(color, tuxedo) } cat--bow-${bow} cat--eye-${eye} ${ getCatStripesClasses(stripes, color) } ${ getCatTuxedoClasses(tuxedo, color) }">
          <div class="cat-bow"></div>
          <div class="cat-head">
              <div class="cat-head-base">
                  <div class="cat-forehead"></div>
                  <div class="cat-muzzle">
                      <div class="cat-nose-mouth"></div>
                  </div>
              </div>
              <div class="cat-ear cat-ear-left"></div>
              <div class="cat-ear cat-ear-right"></div>
          </div>
          <div class="cat-body">
              <div class="cat-body-base">
                  <div class="cat-body-back"></div>
              </div>
              <div class="cat-leg cat-leg-left"></div>
              <div class="cat-leg cat-leg-right"></div>
              <div class="cat-tail"></div>
          </div>
      </div>
  </div>
`;

const getSelectorText = (characteristic, value) => {
  return `Select the cat with the ${value} ${characteristic}`;
};



  const start = () => {
    console.log("~~~~ starting!");

    // elements
    const feedbackRow = document.querySelector('.feedback-row');
    const submit = document.querySelector('#submit');
    const answer = document.querySelector('#answer');
    const nextRow = document.querySelector('.next-row');
    const next = document.querySelector('#next');

    // reset everything
    feedbackRow.innerHTML = "";
    feedbackRow.classList.remove('feedback-row--success');
    submit.disabled = false;
    answer.disabled = false;
    answer.value = "";
    nextRow.classList.remove('fade-in');



    const { cats, randomCharacteristic, randomCharacteristicValue, targetSelector, answerSelector } = getConfig();

    document.querySelector('.characteristic-row').innerHTML = getSelectorText(randomCharacteristic, randomCharacteristicValue);
    document.querySelector('.cat-row').innerHTML = cats.map((cat) => getCatMarkup(cat)).join('');
    document.querySelectorAll(targetSelector).forEach((cat) => cat.classList.add('strobe'));

    

    const clickHandler = () => {
      const userInput = answer.value;
      console.log('answerSelector: ', answerSelector)
      feedbackRow.classList.add('fade-in');
      if(userInput === answerSelector) {
        feedbackRow.innerHTML = "Yay! You got it";
        feedbackRow.classList.remove('feedback-row--error');
        feedbackRow.classList.add('feedback-row--success');
        submit.disabled = true;
        answer.disabled = true;
        nextRow.classList.add('fade-in');

        // cleanUp
        submit.removeEventListener('click', clickHandler);

      } else {
        feedbackRow.innerHTML = "Try again";
        feedbackRow.classList.add('feedback-row--error');
        answer.value = "";
      }
    };
    
    
    submit.addEventListener('click', clickHandler);
    next.addEventListener('click', start);
  };


  return {
    start
  };

})();

Engine.start();

