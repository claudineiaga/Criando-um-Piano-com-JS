const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const getElementByNote = (note) => note && document.querySelector(`[note="${note}"]`)
const lettersToKeys = {
  Q: {element: getElementByNote("C2"), note: "C", octaveOffset: 2},
  "2": {element: getElementByNote("C2#"), note: "C#", octaveOffset: 2},
  W: {element: getElementByNote("D2"), note: "D", octaveOffset: 2},
  "3": {element: getElementByNote("D2#"), note: "D#", octaveOffset: 2},
  E: {element: getElementByNote("E2"), note: "E", octaveOffset: 2},
  R: {element: getElementByNote("F2"), note: "F", octaveOffset: 2},
  "5": {element: getElementByNote("F2#"), note: "F#", octaveOffset: 2},
  T: {element: getElementByNote("G2"), note: "G", octaveOffset: 2},
  "6": {element: getElementByNote("G2#"), note: "G#", octaveOffset: 2},
  Y: {element: getElementByNote("A2"), note: "A", octaveOffset: 2},
  "7": {element: getElementByNote("A2#"), note: "A#", octaveOffset: 2},
  U: {element: getElementByNote("B2"), note: "B", octaveOffset: 2},

  I: {element: getElementByNote("C3"), note: "C", octaveOffset: 3},
  "9": {element: getElementByNote("C3#"), note: "C#", octaveOffset: 3},
  O: {element: getElementByNote("D3"), note: "D", octaveOffset: 3},
  "0": {element: getElementByNote("D3#"), note: "D#", octaveOffset: 3},
  P: {element: getElementByNote("E3"), note: "E", octaveOffset: 3},
  Z: {element: getElementByNote("F3"), note: "F", octaveOffset: 3},
  S: {element: getElementByNote("F3#"), note: "F#", octaveOffset: 3},
  X: {element: getElementByNote("G3"), note: "G", octaveOffset: 3},
  D: {element: getElementByNote("G3#"), note: "G#", octaveOffset: 3},
  C: {element: getElementByNote("A3"), note: "A", octaveOffset: 3},
  F: {element: getElementByNote("A3#"), note: "A#", octaveOffset: 3},
  V: {element: getElementByNote("B3"), note: "B", octaveOffset: 3},

  B: {element: getElementByNote("C4"), note: "C", octaveOffset: 4},
  H: {element: getElementByNote("C4#"), note: "C#", octaveOffset: 4},
  N: {element: getElementByNote("D4"), note: "D", octaveOffset: 4},
  J: {element: getElementByNote("D4#"), note: "D#", octaveOffset: 4},
  M: {element: getElementByNote("E4"), note: "E", octaveOffset: 4},
  comma: {element: getElementByNote("F4"), note: "F", octaveOffset: 4},
};

const getHz = (note = "A", octave = 4) => {
  const A4 = 440;
  let N = 0;
  switch (note){
    default:
    case "C":
      N = 0;
      break;
    case "C#":
      N = 1;
      break;
    case "D":
      N = 2;
      break;
    case "D#":
      N = 3;
      break;
    case "E":
      N = 4;
      break;
    case "F":
      N = 5;
      break;
    case "F#":
      N = 6;
      break;
    case "G":
      N = 7;
      break;
    case "G#":
      N = 8;
      break;
    case "A":
      N = 9;
      break;
    case "A#":
      N = 10;
      break;
    case "B":
      N = 11;
      break;
  }
  N += 12 * (octave - 4);
  return A4 * Math.pow(2, N / 12)
};
const pressedNotes = new Map();
let clickedKey = "";

const playKey = (key) => {
    if (!lettersToKeys[key]) {
        return;
    }
    const osc = audioContext.createOscillator();
    const noteGainNode = audioContext.createGain();
    noteGainNode.connect(audioContext.destination);
    const zeroGain = 0.0001;
    const maxGain = 0.5;
    const sustainedGain = 0.04;
    noteGainNode.gain.value = zeroGain;
    const setAttack = () => 
        noteGainNode.gain.exponentialRampToValueAtTime(
            maxGain,
            audioContext.currentTime + 0.01
        );
    const setDecay = () =>
         noteGainNode.gain.exponentialRampToValueAtTime(
            sustainedGain,
            audioContext.currentTime + 1
            );
    const setRelease = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            zeroGain,
            audioContext.currentTime + 2
        );
    setAttack();
    setDecay();
    setRelease();
    osc.connect(noteGainNode);
    osc.type = "triangle";
    const freq = getHz(lettersToKeys[key].note, (lettersToKeys[key].octaveOffset || 0) + 1);
    if (Number.isFinite(freq)) {
        osc.frequency.value = freq;
    }
    lettersToKeys[key].element.classList.add("pressed");
    pressedNotes.set(key, osc);
    pressedNotes.get(key).start();
};
const stopKey = (key) => {
    if (!lettersToKeys[key]) {
      return;
    }
    lettersToKeys[key].element.classList.remove("pressed");
    const osc = pressedNotes.get(key);
    if (osc) {
      setTimeout(() => {
        osc.stop();
      }, 3000);  
      pressedNotes.delete(key);
    }
  };
  document.addEventListener("keydown", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === "," ? "comma" : eventKey;
    if (!key || pressedNotes.get(key)) {
      return;
    }
    playKey(key);
  });
  document.addEventListener("keyup", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === "," ? "comma" : eventKey;
    if (!key) {
      return;
    }
    stopKey(key);
  });
  for (const [key, { element }] of Object.entries(lettersToKeys)) {
    element.addEventListener("mousedown", () => {
      playKey(key);
      clickedKey = key;
    });
  }
  document.addEventListener("mouseup", () => {
    stopKey(clickedKey);
  });