let i = 0;
let SceneCounter = 0;
let CurrentlyWriting = false;
let SceneToLoad;
let ScenePath;
let buttonArray = [];
let stopper = false;
/* let options = {
  TextSpeed: parseInt(localStorage.getItem("TextSpeed")),
  Volume: parseInt(localStorage.Volume)
}; */

//document objects
let CharacterImage = document.getElementById("Character");
let TextField = document.getElementById("TextField");
let CharacterName = document.getElementById("CharacterName");
let LoadingComponent = document.getElementById("Loading");
let NextButton = document.getElementById("NextButton");
document.title = localStorage.getItem("NovelTitle");
let MenuButtons = document.getElementById("Items");
let SaveMenu = document.getElementById("SaveMenu");
let PauseMenu = document.getElementById("PauseMenu");
let VolumeRange = document.getElementById("VolumeRange");
let VolumeValue = document.getElementById("VolumeValue");
let SpeedRange = document.getElementById("SpeedRange");
let SpeedValue = document.getElementById("SpeedValue");
let Player = document.getElementById("Soundtrack");
let SourceAudio = document.getElementById("Source");
let SaveItems = document.getElementsByClassName("SaveItem");

//init values 
Player.volume = parseInt(localStorage.Volume) * 0.01;
VolumeRange.value = parseInt(localStorage.Volume);
VolumeValue.innerHTML = localStorage.Volume + "%";
SpeedRange.value = parseInt(localStorage.TextSpeed);
SpeedValue.innerHTML = localStorage.TextSpeed + "ms";

//engine functions
function controller(counter, TextArray) {
  if(TextArray[counter] == undefined) window.location.assign("/index.html");
  if(CurrentlyWriting) { 
    TextField.innerHTML = TextArray[counter-1];
    CurrentlyWriting = false;
    stopper = true;
    return;
  }
  if(TextArray[counter].startsWith("Bg!")) {
    document.body.style.backgroundImage = `url(${TextArray[counter].substr(3)})`;
    counter++;
    SceneCounter++;
  }
  if(TextArray[counter].startsWith("Audio!")) {
    Source.src = TextArray[counter].substr(6);
    Player.load();
    Player.play();
    counter++;
    SceneCounter++;
  }
  if(TextArray[counter].startsWith("Name!")) {
    let name = TextArray[counter].substr(5);
    let size = name.length * 3 + 80;
    CharacterName.style.display = "block";
    CharacterName.style.width = size.toString() + "px";
    CharacterName.innerHTML = name;
    counter++;
    SceneCounter++;
  }
  if(TextArray[counter].startsWith("Image!")) {
    CharacterImage.src = TextArray[counter].substr(6);
    counter++;
    SceneCounter++;
  }
  if(TextArray[counter].startsWith("Button!")) {
    let buttonCounter = 0;
    window.onclick = null;
    while(true) {
      if(!TextArray[counter].startsWith("Button!") || TextArray[counter] == "undefined") return;
      changeButtons("block", buttonCounter, TextArray[counter].substr(7), TextArray[counter].split("<")[1].slice(0,-1));
      buttonArray.push(TextArray[counter].substr(7));
      counter++;
      SceneCounter++;
      buttonCounter++;
    }
  }
  if(TextArray[counter].startsWith("Scene!")) {
    requestScenes(TextArray[counter].substr(6));
    return;
  }
  if(TextArray[counter].startsWith("Noname!")) {
    CharacterName.style.display = "hidden";
  }
  if(TextArray[counter].startsWith("Nochar!")) {
    CharacterImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAnSURBVHic7cEBDQAAAMKg909tDjegAAAAAAAAAAAAAAAAAAAAgHcDQEAAAY/yyVEAAAAASUVORK5CYII="
  }
  stopper = false;
  console.log(counter);
  NextButton.style.display = "none";
  TextField.innerHTML = " ";
  repeater(addChar, localStorage.TextSpeed, TextArray[counter].length, TextField, TextArray[counter]);
  SceneCounter++;
}

function addChar(field, text) {
  field.innerHTML += text[i];
  i++;
}

function changeButtons(display, number, content, click) {
  let buttons = document.getElementsByClassName("choption");
  buttons[number].style.display = display;
  buttons[number].innerHTML = content;
  console.log(display + number + content + click);
  if(click.includes("continue")) {
    buttons[number].onclick = function() {
      let opt = document.getElementsByClassName("choption");
      for(let button of opt) {
        button.innerHTML = " ";
        button.style.display = "none";
      }
      buttonArray = [];
      controller(SceneCounter, SceneToLoad);
      setTimeout(function() { 
        window.onclick = function() {
          controller(SceneCounter, SceneToLoad);
        };
      }, 100);
    };
  } else {
    buttons[number].onclick = function() {
      let opt = document.getElementsByClassName("choption");
      for(let button of opt) {
        button.innerHTML = " ";
        button.style.display = "none";
      }
      buttonArray = [];
      requestScenes(click);
    };
  }
}

//I took this function from a blog: https://www.thecodeship.com/web-development/alternative-to-javascript-evil-setinterval/
function repeater(func, wait, times) {
  let arg = Array.prototype.slice.call(arguments, 2);
  var interv = function(w, t) {
    return function() {
      if (t-- > 0 && !stopper) {
        CurrentlyWriting = true;
        setTimeout(interv, w);
        try {
          func.call(...arg);
        }
        catch (e) {
          t = 0;
          throw e.toString();
        }
      } else {
        CurrentlyWriting = false;
        NextButton.style.display = "block";
        i = 0;
      }
    };
  }(wait, times);

  setTimeout(interv, wait);
}

function requestScenes(scene, countermod) {
  LoadingComponent.style.display = "flex";
  if(countermod == undefined) {
    SceneCounter = 0;
    countermod = 0;
  } else {
    SceneCounter = countermod;
  }
  ScenePath = scene;
  let request = new XMLHttpRequest();
  request.onload = function() {
    LoadingComponent.style.display = "none";
    SceneToLoad = this.response;
    //strange condition...
    if(SceneToLoad[countermod].startsWith("Button!")) {
      while(true) {
        if(!SceneToLoad[countermod].startsWith("Button!")) { 
          console.log(countermod);
          controller(countermod, SceneToLoad);
          break;
        }
        countermod--;
        SceneCounter--;
      }
    } else controller(countermod, SceneToLoad);
    if((typeof window.onclick) != "function") {
      window.onclick = function() {
        explode();
        controller(SceneCounter, SceneToLoad);
      };
    }
  };
  request.open('GET', scene);
  request.responseType = 'json';
  request.send();
}

function setupLoad(bg, audio, name, img, button, noname) {
  document.body.style.backgroundImage = `url(${bg})`;
  Source.src = audio;
  Player.play();
  let size = name.length * 3 + 80;
  CharacterName.style.display = noname == "hidden" ? "hidden" : "block";
  CharacterName.style.width = size.toString() + "px";
  CharacterName.innerHTML = name;
  CharacterImage.src = img;
  let opt = document.getElementsByClassName("choption");
  for(let button of opt) {
    button.innerHTML = " ";
    button.style.display = "none";
    console.log("done!");
  }
}

function explode() {
  Player.play();
  window.onclick = function() {
    controller(SceneCounter, SceneToLoad);
  };
}

//document functions

// Menu button
MenuButtons.children[0].onclick = function(e) {
  if(SaveMenu.style.display == "flex") SaveMenu.style.display = "none";
  PauseMenu.style.display = PauseMenu.style.display == "block" ? "none" : "block";
  e.stopPropagation();
}

// Save button
MenuButtons.children[1].onclick = function(e) {
  if(PauseMenu.style.display == "block") PauseMenu.style.display = "none"
  SaveMenu.style.display = SaveMenu.style.display == "flex" ? "none" : "flex";
  for(let save of SaveItems) {
    if(localStorage.getItem(save.id)) {
      save.children[1].innerText = "Slot " + save.id.substr(4);
    }
    save.onclick = function(e) {
      localStorage.setItem(save.id, JSON.stringify([document.body.style.backgroundImage, Source.src, CharacterName.innerHTML, CharacterImage.src, buttonArray, CharacterName.style.display, ScenePath, SceneCounter-1]));
      save.children[1].innerText = "Slot " + save.id.substr(4);
      e.stopPropagation();
    }
  }
  e.stopPropagation();
}

// Load button
MenuButtons.children[2].onclick = function(e) {
  SaveMenu.style.display = SaveMenu.style.display == "flex" ? "none" : "flex";
  for(let save of SaveItems) {
    if(localStorage.getItem(save.id)) {
      save.children[1].innerText = "Slot " + save.id.substr(4);
    }
    save.onclick = function(e) {
      temp = JSON.parse(localStorage.getItem(save.id));
      requestScenes(temp[6], temp[7]);
      setupLoad(...temp);
      e.stopPropagation();
    }
  }
  e.stopPropagation();
}

SpeedRange.oninput = function(e) {
  localStorage.setItem("TextSpeed", SpeedRange.value);
  SpeedValue.innerHTML = SpeedRange.value + "ms";
  e.stopPropagation();
}

VolumeRange.oninput = function(e) {
  localStorage.setItem("Volume", VolumeRange.value);
  VolumeValue.innerHTML = VolumeRange.value + "%";
  Player.volume = VolumeRange.value * 0.01;
  e.stopPropagation();
}

let debug = document.getElementById("debug");
window.onresize = () => { debug.innerHTML = "H W " + window.innerHeight + "px;" + window.innerWidth + "px"; console.log(this)}


requestScenes("/scenes/test.novel");