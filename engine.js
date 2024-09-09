let i = 0;
let SceneCounter = 0;
let CurrentlyWriting = false;
let SceneToLoad;
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

//init values 
Player.volume = parseInt(localStorage.Volume) * 0.01;
VolumeRange.value = parseInt(localStorage.Volume);
VolumeValue.innerHTML = localStorage.Volume + "%";
SpeedRange.value = parseInt(localStorage.TextSpeed);
SpeedValue.innerHTML = localStorage.TextSpeed + "ms";

//engine start
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
    //setTimeout(() => {Player.load(); Player.play();}, 1000);
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
    CharacterName.style.display = "none";
  }
  stopper = false;
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
  if(click.includes("continue")) {
    buttons[number].onclick = function() {
      let opt = document.getElementsByClassName("choption");
      for(let bbb of opt) {
        bbb.innerHTML = " ";
        bbb.style.display = "none";
      }
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
      for(let bbb of opt) {
        bbb.innerHTML = " ";
        bbb.style.display = "none";
      }
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

function requestScenes(scene) {
  LoadingComponent.style.display = "flex";
  SceneCounter = 0;
  let request = new XMLHttpRequest();
  request.onload = function() {
    LoadingComponent.style.display = "none";
    SceneToLoad = this.response;
    controller(SceneCounter, SceneToLoad);
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

function explode() {
  Player.muted = false;
  Player.play();
  window.onclick = function() {
    controller(SceneCounter, SceneToLoad);
  };
}

//document functions

MenuButtons.children[0].onclick = function(e) {
  if(SaveMenu.style.display == "flex") SaveMenu.style.display = "none";
  PauseMenu.style.display = PauseMenu.style.display == "block" ? "none" : "block";
  e.stopPropagation();
}

MenuButtons.children[1].onclick = function(e) {
  if(PauseMenu.style.display == "block") PauseMenu.style.display = "none"
  SaveMenu.style.display = SaveMenu.style.display == "flex" ? "none" : "flex";
  e.stopPropagation();
}

MenuButtons.children[2].onclick = function(e) {
  SaveMenu.style.display = SaveMenu.style.display == "flex" ? "none" : "flex";
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

requestScenes("/scenes/test.novel");