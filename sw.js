if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let l={};const o=e=>i(e,t),u={module:{uri:t},exports:l,require:o};s[t]=Promise.all(n.map((e=>u[e]||o(e)))).then((e=>(r(...e),l)))}}define(["./workbox-e1498109"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/en-D6i4YiJZ.js",revision:null},{url:"assets/index-BLsmRdyq.js",revision:null},{url:"assets/index-Y9O4j6lb.css",revision:null},{url:"assets/ru-S4YIU4Hq.js",revision:null},{url:"index.html",revision:"b06b9313dd5d2e6d023a5886c54df695"},{url:"registerSW.js",revision:"4fc997be41f4c2f37f5d01a914b500b5"},{url:"manifest.webmanifest",revision:"902d0e9fc627488cb924042a6ce1b141"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
