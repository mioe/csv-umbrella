if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/csv-umbrella/sw.js', { scope: '/csv-umbrella/' })})}