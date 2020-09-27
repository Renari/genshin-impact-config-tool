import { ipcRenderer } from "electron";
import "./css/index.css";

// data obtained from https://www.reddit.com/r/Genshin_Impact/comments/j0h181/languaguegraphic_settings/
const deviceLanguageSettings = new Map([
  ["English", 1],
  ["Chinese", 2],
  ["Japanese", 9],
  ["Korean", 10],
]);

const deviceVoiceLanguageSetting = new Map([
  ["Chinese", 0],
  ["English", 1],
  ["Japanese", 2],
  ["Korean", 3],
]);

// add the language settings to the language dropdown
const language = document.querySelector("#language") as HTMLInputElement;
deviceLanguageSettings.forEach((value, key) => {
  const option = document.createElement("option");
  option.value = value.toString();
  option.innerHTML = key;
  language.append(option);
});

// add the voice settings to the voice dropdown
const voice = document.querySelector("#voice") as HTMLInputElement;
deviceVoiceLanguageSetting.forEach((value, key) => {
  const option = document.createElement("option");
  option.value = value.toString();
  option.innerHTML = key;
  voice.append(option);
});

ipcRenderer.on("initClient", (event, config) => {
  // Global Volume
  const globalVolume = document.querySelector(
    "#globalVolume"
  ) as HTMLInputElement;
  globalVolume.value = config.volumeGlobal || 10;

  // Music Volume
  const musicVolume = document.querySelector(
    "#musicVolume"
  ) as HTMLInputElement;
  musicVolume.value = config.volumeMusic || 10;

  // SFX Volume
  const sfxVolume = document.querySelector("#sfxVolume") as HTMLInputElement;
  sfxVolume.value = config.volumeSFX || 10;

  // Voice Volume
  const voiceVolume = document.querySelector(
    "#voiceVolume"
  ) as HTMLInputElement;
  voiceVolume.value = config.volumeVoice || 10;
  voiceVolume.dispatchEvent(new Event("input"));

  // Motion Blur
  const motionblur = document.querySelector("#motionblur") as HTMLInputElement;
  if (config.motionBlur === undefined || config.motionBlur === null) {
    motionblur.checked = true;
  } else {
    motionblur.checked = config.motionBlur;
  }
  motionblur.addEventListener("change", () => {
    ipcRenderer.send("motionblurChange", motionblur.checked);
  });

  // Language
  language.value = config.deviceLanguageType;
  language.addEventListener("change", () => {
    ipcRenderer.send("languageChange", language.value);
  });
  // Voice
  voice.value = config.deviceVoiceLanguageType;
  voice.addEventListener("change", () => {
    ipcRenderer.send("voiceChange", voice.value);
  });

  // initilize sliders
  (function rangeSlider() {
    const slider = document.querySelectorAll(".range-slider");
    const range = document.querySelectorAll(".range-slider__range");
    const value = document.querySelectorAll(".range-slider__value");

    slider.forEach(() => {
      // set the initial values
      value.forEach((valueElement) => {
        const value = (valueElement.previousElementSibling as HTMLInputElement)
          .value;
        valueElement.innerHTML = value;
      });
    });
    // updating values
    range.forEach((rangeElem) => {
      rangeElem.addEventListener("change", (event) => {
        const elem = event.currentTarget as HTMLInputElement;
        rangeElem.nextElementSibling.innerHTML = elem.value;
        switch (elem.id) {
          case "globalVolume":
            ipcRenderer.send("globalVolumeChange", elem.value);
            break;
          case "sfxVolume":
            ipcRenderer.send("sfxVolumeChange", elem.value);
            break;
          case "musicVolume":
            ipcRenderer.send("musicVolumeChange", elem.value);
            break;
          case "voiceVolume":
            ipcRenderer.send("voiceVolumeChange", elem.value);
            break;
        }
      });
    });
  })();
});
