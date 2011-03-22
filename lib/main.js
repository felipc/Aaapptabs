const wu = require("window-utils");

let mappings = [];

function start(chromeWindow) {
  let XULBrowserWindow = chromeWindow.XULBrowserWindow;
  let originalFunction = XULBrowserWindow.hideChromeForLocation;

  mappings.push({window: chromeWindow, originalFunction: originalFunction});

  XULBrowserWindow.hideChromeForLocation = function(aLocation) {
    return originalFunction.call(XULBrowserWindow, aLocation) ||
           chromeWindow.gBrowser.selectedTab.pinned;
  }

  chromeWindow.document.addEventListener("TabPinned", triggerOnLocationChange, false);
  chromeWindow.document.addEventListener("TabUnpinned", triggerOnLocationChange, false);
}

function stop(chromeWindow) {
  for (let i in mappings) {
    let pair = mappings[i];
    if (chromeWindow === pair.window) {
      chromeWindow.XULBrowserWindow.hideChromeForLocation = pair.originalFunction;
      chromeWindow.document.removeEventListener("TabPinned", triggerOnLocationChange, false);
      chromeWindow.document.removeEventListener("TabUnpinned", triggerOnLocationChange, false);
      mappings.splice(i,1);
      break;
    }
  }
}

function triggerOnLocationChange(event) {
  let win = event.target.ownerDocument.defaultView;
  win.XULBrowserWindow.onLocationChange(
    {DOMWindow: win.content}, /* stub aWebProgress obj */
    null,
    win.gBrowser.selectedTab.location
  );
}

var delegate = {
  onTrack: function (window) start(window),
  onUntrack: function (window) stop(window)
}

new wu.WindowTracker(delegate);
