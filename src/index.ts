import { app, BrowserWindow, ipcMain } from "electron";
import registry from "winreg";
import { Mutex } from "async-mutex";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any; // eslint-disable-line @typescript-eslint/no-explicit-any

// interfaces
import { GenshinImpactSettings } from "./genshinimpactsettings";

const isDevelopment = process.env.NODE_ENV === "development" || false;
const genshinImpactConfigLocation = "\\Software\\miHoYo\\Genshin Impact";
const genshinImpactConfigKeyName = "GENERAL_DATA_h2389025596";
const genshinRegistry = new registry({
  hive: registry.HKCU,
  key: genshinImpactConfigLocation,
});
// used for safety when writing to the registry
const registryMutex = new Mutex();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: { nodeIntegration: true },
  });

  // disable the toolbar
  mainWindow.setMenu(null);
  mainWindow.setMaximizable(false);
  mainWindow.setResizable(false);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on("did-finish-load", () => {
    getGenshinConfigJson().then((data) => {
      mainWindow.webContents.send("initClient", data);
    });
  });

  // register event handlers
  ipcMain.on("languageChange", (event, value) =>
    updateLanguage(parseInt(value))
  );
  ipcMain.on("voiceChange", (event, value) =>
    updateVoiceLanguage(parseInt(value))
  );
  ipcMain.on("motionblurChange", (event, value) => updateMotionblur(value));
  ipcMain.on("globalVolumeChange", (event, value) => updateGlobalVolume(value));
  ipcMain.on("sfxVolumeChange", (event, value) => updateSfxVolume(value));
  ipcMain.on("musicVolumeChange", (event, value) => updateMusicVolume(value));
  ipcMain.on("voiceVolumeChange", (event, value) =>
    updateVoiceVolume(parseInt(value))
  );

  // Open the DevTools.
  if (isDevelopment) mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function getGenshinConfigJson(): Promise<GenshinImpactSettings> {
  return new Promise((resolve, reject) => {
    genshinRegistry.values((err, items) => {
      if (err) reject(err);
      for (let i = 0; i < items.length; i++) {
        if (items[i].name === genshinImpactConfigKeyName) {
          let data = Buffer.from(items[i].value, "hex");
          // we remove the last byte here because it is a null character
          data = data.slice(0, data.length - 1);
          resolve(JSON.parse(data.toString()));
        }
      }
    });
  });
}

function saveGenshinConfigJson(json: GenshinImpactSettings) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(json), "ascii");
    const nullByte = Buffer.from([0x00]);
    const genshinConfig = Buffer.concat([data, nullByte]);
    genshinRegistry.set(
      genshinImpactConfigKeyName,
      "REG_BINARY",
      genshinConfig.toString("hex").toUpperCase(),
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

function updateMotionblur(value: boolean) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.motionBlur = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}

function updateGlobalVolume(value: number) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.volumeGlobal = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}

function updateSfxVolume(value: number) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.volumeSFX = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}

function updateMusicVolume(value: number) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.volumeMusic = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}

function updateVoiceVolume(value: number) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.volumeVoice = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}

function updateVoiceLanguage(value: number) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.deviceVoiceLanguageType = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}

function updateLanguage(value: number) {
  registryMutex.acquire().then((release) => {
    getGenshinConfigJson().then((json) => {
      json.deviceLanguageType = value;
      saveGenshinConfigJson(json).then(() => {
        release();
      });
    });
  });
}
