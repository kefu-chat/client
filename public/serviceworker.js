importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

workbox.core.setCacheNameDetails({
  prefix: "PhrassedChatCache",
  precache: "precache",
  runtime: "runtime",
});

if (workbox) {
  workbox.precaching.precacheAndRoute([{"revision":"34924f8abdd9d4f416a34e358c52420b","url":"build/bundle.css"},{"revision":"0acddb4caac19d422a5839ddd4764b29","url":"build/bundle.js"},{"revision":"a03f4b94dbc312d82993d003ac0cae64","url":"build/demo.html"},{"revision":"658771503050f5c8c2dcb53bab65f14d","url":"build/global.css"},{"revision":"3bf4a556a0c9c9c03e6a1e68e88866f3","url":"build/trash.svg"},{"revision":"dd9bb11ec31c4c5a42f79124c2fd1fea","url":"build/up.svg"},{"revision":"f8727aa86cdb0145eaa2fcd091ea6b3c","url":"build/webpack-assets.json"},{"revision":"e40c415d5cd51dd95e2d09380ef9703d","url":"build/widget.css"},{"revision":"49179442bf0e0591be4830f3952264e4","url":"build/widget.js"},{"revision":"f7a283f851882858fd61468f2db02c07","url":"bundle.js"},{"revision":"a03f4b94dbc312d82993d003ac0cae64","url":"demo.html"},{"revision":"c64beab291de80970aa4887a5a1c9135","url":"favicon.png"},{"revision":"658771503050f5c8c2dcb53bab65f14d","url":"global.css"},{"revision":"f5454a7dc500f8b59a8e820b4b7f8917","url":"index.html"},{"revision":"9c2e49da0f71fc9696df9c6f26930c54","url":"logo-192.png"},{"revision":"969c573d518c9b22995a5ed9e5a59ce5","url":"logo-512.png"},{"revision":"68d4ad7aca9bbdddefbf02c4d25de457","url":"manifest.json"},{"revision":"c4e9cf0201b7bbe10c818732343d2e76","url":"sw.js"},{"revision":"3bf4a556a0c9c9c03e6a1e68e88866f3","url":"trash.svg"},{"revision":"dd9bb11ec31c4c5a42f79124c2fd1fea","url":"up.svg"},{"revision":"d6c0533765a22ef4e6d30b329fde4949","url":"webpack-assets.json"},{"revision":"8470bf0c0f4b059b41fdb18a8f7a5c7e","url":"widget_77b4f7.js"},{"revision":"e40c415d5cd51dd95e2d09380ef9703d","url":"widget.css"},{"revision":"15cdeeb06e28737edd9e01c89207eb3c","url":"widget.js"}]);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

const { registerRoute } = workbox.routing;
const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

registerRoute(
  /\.js$/,
  new StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: "js-cache",
  })
);

registerRoute(
  /\.css$/,
  // Use cache but update in the background.
  new StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: "css-cache",
  })
);

workbox.routing.registerRoute(
  // Cache image files.
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  // Use the cache if it's available.
  new CacheFirst({
    // Use a custom cache name.
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        // Cache only 20 images.
        maxEntries: 20,
        // Cache for a maximum of a week.
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener("install", function (event) {
  console.log("Installing service worker");
  if (self.skipWaiting) {
    console.log("Installing update now!");
    self.skipWaiting();
  }
});
