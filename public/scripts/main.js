// Constants

/* Code modified by NoobStranslater (@NoobStranslater)
 * Copyright (C) 2020  Andrew Larson (thealiendrew@gmail.com)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const corsProxy = 'https://api.allorigins.win/get?url=';
const validMediafireIdentifierDL = /^[a-zA-Z0-9]+$/m;
const validMediafireShortDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+$/m;
const validMediafireLongDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_\-\.~%]+)?(\/file)?$/m;
const checkHTTP = /^https?:\/\//m;
const paramDL_initialDelay = 1; // ms
const paramDL_loadDelay = 1750; // ms

// Browser Detection Variables
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof InstallTrigger !== 'undefined';
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
var isBlink = (isChrome || isOpera) && !!window.CSS;

// Variables

let validateDelayCheck = null;
let fromParameters = false;
let previousUrlValue = '';

// Functions

var getQueryStringArray = function() {
  let assoc=[];
  let items = window.location.search.substring(1).split('&');
  for(let j = 0; j < items.length; j++) {
    let a = items[j].split('='); assoc[a[0]] = a[1];
  }
  return assoc;
};

// alternative way when using parameters, to know when the download starts
var downloadFileStarting = function() {
  // will try to redirect to previous page or new tab when download starts after a tiny delay
  setTimeout(function() {
    // redirect to previous page if it exists
    // redirect to browser specfic newtab
      location.replace("https://noobstraducciones.blogspot.com/")
  }, paramDL_loadDelay);
};
var downloadFileBegin = function(filePath) {
  let iframeDivDL = document.createElement('div');
  iframeDivDL.style = 'display: none';
  document.body.appendChild(iframeDivDL);

  //start download
  let link=document.createElement('a');
  link.href = filePath;
  link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
  link.click();
  //window.location = filePath;

  let iframeFileDL = '<iframe id="iframeFileDL" src="about:blank" onload="downloadFileStarting()"></iframe>';
  iframeDivDL.innerHTML = iframeFileDL;

};


var validationChecker = function(url) {
  let validatedURL = validMediafireIdentifierDL.test(url) || validMediafireShortDL.test(url) || validMediafireLongDL.test(url);

  // Test if the new value is a valid link, to enable the download button
  if (url) {
    // check if we have valid url
    if (validatedURL) { return true; } 
    else { return false; }
  } 
  else { return false; }
};

var attemptDownloadRedirect = async function(url) {

  // modify the link to work with proxy
  url = url.replace('http://', 'https://'); // not required, but makes them secure
  // if it's just the download identifier, add on mediafire pre-link
  if (validMediafireIdentifierDL.test(url)) url = 'https://mediafire.com/file/' + url + '/';
  // if the link doesn't have http(s), it needs to be appended
  if (!checkHTTP.test(url)) url = 'https://' + url;

  console.log(`Checking "${url}" for valid download page...`);
  // try and get the mediafire page to get actual download link
  try {
    let mediafirePageResponse = await fetch(corsProxy+encodeURIComponent(url));
    
    // make sure the response was ok
    if (mediafirePageResponse.ok) {
      let data = await mediafirePageResponse.json();
      let html = data.contents;

      // if we received a page
      if (html) {
        // Convert the HTML string into a document object
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        // redirect to direct download if the download page was real (and not taken down)
        let mfDlBtn = doc.getElementById('downloadButton');
        if (mfDlBtn && mfDlBtn.href) {
          let dlUrl = mfDlBtn.href;

          console.log(`Downloading from "${dlUrl}"...`);
          // need to do correct download based on if we came from parameters
          if (fromParameters) downloadFileBegin(dlUrl);

          return true;
        }
      }
    }
    return false;
  } 
  catch (err) { return false; }
};

// Wait for page to load
window.addEventListener('load', function() {
  //assigns query strings variables
  let vars = getQueryStringArray();
  let paramURL = vars.var + vars.val + vars.str;
  if (paramURL) {
    fromParameters = true;
    console.log(`Validating "${paramURL}" as valid Mediafire download...`);
  }
  // run checker once on after parameter check
  if (validationChecker(paramURL)) {
    attemptDownloadRedirect(paramURL);
  }
});
