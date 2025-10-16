// ==UserScript==
// @name         BC Mod Manager
// @version      1.0
// @include      /^https:\/\/(www\.)?bondage(projects\.elementfx|-(europe|asia))\.com\/.*/
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";
  const script = document.createElement("script");
  script.src = `https://inkerbot.github.io/bc-mod-manager/main.js`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
})();
