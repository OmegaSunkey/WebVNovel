let i = 0;
let SceneCounter = 0;
let CurrentlyWriting = false;
let SceneToLoad;
let ScenePath;
let buttonArray = [];
let stopper = false;

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
let VolumeRange2 = document.getElementById("VolumeRange");
let VolumeValue2 = document.getElementById("VolumeValue");
let SpeedRange2 = document.getElementById("SpeedRange");
let SpeedValue2 = document.getElementById("SpeedValue");
let Player = document.getElementById("Soundtrack");
let SourceAudio = document.getElementById("Source");
let SaveItems = document.getElementsByClassName("SaveItem");
let TextAlert = document.getElementById("Alert");

//init values 
Player.volume = parseInt(localStorage.Volume) * 0.01;
VolumeRange2.value = parseInt(localStorage.Volume);
VolumeValue2.innerHTML = localStorage.Volume + "%";
SpeedRange2.value = parseInt(localStorage.TextSpeed);
SpeedValue2.innerHTML = localStorage.TextSpeed + "ms";

if(!document.fullscreenElement) {
	document.documentElement.requestFullscreen().catch( (error) => { 
		alert(`${error.message} ${error.name}`); 
	});
}

//engine functions
function controller(counter, TextArray) {
	if(TextArray[counter] == undefined) window.location.assign("/index.html");
	
	if(CurrentlyWriting) {
		TextField.innerHTML = TextArray[counter-1];
		CurrentlyWriting = false;
		stopper = true;
		return;
	}
	
	let SplitArray = TextArray[counter].split("!");
	
	switch(SplitArray[0]) {
		case "Bg":
			document.body.style.backgroundImage = `url(${SplitArray[1]})`;
			//counter++;
			SceneCounter++;
			controller(SceneCounter, TextArray);
			break;
		case "Audio":
			SourceAudio.src = SplitArray[1];
			Player.load();
			Player.play();
			SceneCounter++;
			controller(SceneCounter, TextArray);
			break;
		case "Name":
			let name = SplitArray[1];
			let size = name.length * 3 + 80;
			CharacterName.style.display = "block";
			CharacterName.style.width = size.toString() + "px";
			CharacterName.innerHTML = name;
			SceneCounter++;
			controller(SceneCounter, TextArray);
			break;
		case "Image":
			CharacterImage.src = SplitArray[1];
			SceneCounter++;
			controller(SceneCounter, TextArray);
			break;
		case "Button":
			unsetKeys();
			let int = counter;
			while (true) {
				if(TextArray[int].split("!")[0] !== "Button" || TextArray[int].split("!")[1] == "undefined") break;
				buttonArray.push(TextArray[int].split("!")[1]);
				changeButtons("block", buttonArray.length-1, TextArray[int].split("!")[1], TextArray[int].split("<")[1].slice(0, -1));
				int++;
				SceneCounter++;
			}
			break;
		case "Scene":
			requestScenes(SplitArray[1]);
			break;
		case "Noname":
			CharacterName.style.display = "hidden";
			SceneCounter++;
			controller(SceneCounter, TextArray);
			break;
		case "Nochar":
			CharacterImage.style.display = "hidden";
			SceneCounter++;
			controller(SceneCounter, TextArray);
			break;
		default:
			stopper = false;
			console.log(counter);
			NextButton.style.display = "none";
			TextField.innerHTML = " ";
			repeater(addChar, localStorage.TextSpeed, TextArray[counter].length, TextField, TextArray[counter]);
			SceneCounter++;
	}
}

function addChar(field, text) {
  field.innerHTML += text[i];
  i++;
}

function setKeys() {
	window.onclick = () => controller(SceneCounter, SceneToLoad);
	window.onkeydown = (e) => {
		if(e.code == "Space" || e.code == "Enter" || e.code == "ArrowRight" || e.code == "NumpadEnter") controller(SceneCounter, SceneToLoad);
	};
}

function unsetKeys() {
	window.onclick = null;
	window.onkeydown = null;
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
      setTimeout(setKeys, 100);
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
  let interv = function(w, t) {
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
    setKeys();
  };
  request.open('GET', scene);
  request.responseType = 'json';
  request.send();
}

function setupLoad(bg, audio, name, img, button, noname) {
  document.body.style.backgroundImage = `url(${bg})`;
  SourceAudio.src = audio;
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
//document functions

// Menu button
MenuButtons.children[0].onclick = function(e) {
  if(SaveMenu.style.display == "flex") SaveMenu.style.display = "none";
  PauseMenu.style.display = PauseMenu.style.display == "block" ? "none" : "block";
  e.stopPropagation();
};

// Save button
MenuButtons.children[1].onclick = function(e) {
  if(PauseMenu.style.display == "block") PauseMenu.style.display = "none";
  SaveMenu.style.display = SaveMenu.style.display == "flex" ? "none" : "flex";
  for(let save of SaveItems) {
    if(localStorage.getItem(save.id)) {
      save.children[1].innerText = "Slot " + save.id.substr(4);
      save.children[0].src = localStorage.getItem(save.id + "img");
    }
    save.onclick = function(e) { //jshint ignore:line
      localStorage.setItem(save.id, JSON.stringify([document.body.style.backgroundImage, SourceAudio.src, CharacterName.innerHTML, CharacterImage.src, buttonArray, CharacterName.style.display, ScenePath, SceneCounter-1])); 
      save.children[1].innerText = "Slot " + save.id.substr(4);
      html2canvas(document.body, {windowWidth: 480, windowHeight: 480, backgroundColor: null, imageTimeout: 0}).then((c) => {
        save.children[0].src = c.toDataURL("image/png");
        localStorage.setItem(save.id + "img", c.toDataURL("image/png"));
        TextAlert.style.display = "block";
        TextAlert.innerText = `Saved on Slot ${save.id}`;
        setTimeout(() => { TextAlert.style.display = "none"; }, 2000);
      });
      e.stopPropagation();
    };
  }
  e.stopPropagation();
};

// Load button
MenuButtons.children[2].onclick = function(e) {
  SaveMenu.style.display = SaveMenu.style.display == "flex" ? "none" : "flex";
  for(let save of SaveItems) {
    if(localStorage.getItem(save.id)) {
      save.children[1].innerText = "Slot " + save.id.substr(4);
      save.children[0].src = localStorage.getItem(save.id + "img");
    }
    save.onclick = function(e) { //jshint ignore:line
      let temp = JSON.parse(localStorage.getItem(save.id));
      requestScenes(temp[6], temp[7]);
      setupLoad(...temp);
      e.stopPropagation();
    };
  }
  e.stopPropagation();
};

SpeedRange2.oninput = function(e) {
  localStorage.setItem("TextSpeed", SpeedRange2.value);
  SpeedValue2.innerHTML = SpeedRange2.value + "ms";
  e.stopPropagation();
};

VolumeRange2.oninput = function(e) {
  localStorage.setItem("Volume", VolumeRange2.value);
  VolumeValue2.innerHTML = VolumeRange2.value + "%";
  Player.volume = VolumeRange2.value * 0.01;
  e.stopPropagation();
};

let debug = document.getElementById("debug");
window.onresize = () => { debug.innerHTML = "H W " + window.innerHeight + "px;" + window.innerWidth + "px";};

requestScenes("/scenes/test.novel");