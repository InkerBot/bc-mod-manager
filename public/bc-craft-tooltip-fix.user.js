// ==UserScript==
// @name         BC Craft Tooltip Fix
// @version      1.0
// @description  修复 BC CreateCraftTooltipContent 导致的严重 bug
// @include      /^https:\/\/(www\.)?bondage(projects\.elementfx|-(europe|asia))\.com\/.*/
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";
  const timer = setInterval(() => {
    if (typeof ElementButton !== "undefined" && ElementButton.CreateCraftTooltipContent) {
      clearInterval(timer);
      (_=>{const b=ElementButton.CreateCraftTooltipContent;ElementButton.CreateCraftTooltipContent=e=>(e.Effects??={},b(e))})()
    }
  }, 500);
})();
