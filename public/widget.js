/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/widget.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/widget.js":
/*!***********************!*\
  !*** ./src/widget.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_RESULT__ = (function (exports) {\n  'use strict';\n\n  Object.defineProperty(exports, \"__esModule\", {\n    value: true\n  });\n  var kefu = exports.kefu = {\n    chat: {\n      init: function init(conf) {\n        var _kechat_init = window._kechat_init;\n\n        if (_kechat_init && 'function' == typeof _kechat_init) {\n          var diy = _kechat_init();\n          for (var i in diy) {\n            if ([diy] != null && 'string' != typeof diy[i] && 'number' != typeof diy[i]) {\n              throw i + ' must a string';\n            }\n            conf[i] = diy[i];\n          }\n        }\n\n        if (!conf.unique_id) {\n          if (localStorage) {\n            if (!localStorage.kefuchat_unique_id) {\n              localStorage.kefuchat_unique_id = parseInt((Math.random() * 99999).toString());\n            }\n            conf.unique_id = localStorage.kefuchat_unique_id;\n          } else {\n            if (!document.cookie.match(/kefuchat_unique_id\\=(^[;])/)) {\n              document.cookie = 'kefuchat_unique_id=' + parseInt((Math.random() * 99999).toString());\n            }\n            conf.unique_id = document.cookie.match(/kefuchat_unique_id\\=(^[;])/)[1];\n          }\n        }\n\n        if (!conf.name) {\n          conf.name = '访客' + conf.unique_id;\n        }\n\n        var createDiv = function createDiv(__cls) {\n          var div = document.createElement('div');\n          div.className = __cls;\n          return div;\n        };\n        var installDom = function installDom() {\n          var container = createDiv('kefuchat');\n          var chat = createDiv('kefuchat-chat');\n          var close = createDiv('kefuchat-close');\n          var opener = createDiv('kefuchat-opener');\n          var kfdesc = createDiv('kefuchat-kfdesc');\n          var logo = createDiv('kefuchat-logo');\n          var badge = createDiv('kefuchat-badge');\n          var iframe = document.createElement('iframe');\n          kfdesc.innerText = '客服在线, 来咨询吧';\n          iframe.className = 'kefuchat-iframe';\n          iframe.src = conf.chat_origin + '?institution_id=' + conf.institution_id + '&unique_id=' + conf.unique_id + '&userAgent=' + encodeURIComponent(conf.userAgent) + '&languages[]=' + conf.language + '&url=' + encodeURIComponent(conf.url) + '&name=' + encodeURIComponent(conf.name) + '&referer=' + encodeURIComponent(conf.referer);\n\n          opener.style.display = 'none';\n          chat.style.display = 'none';\n\n          chat.appendChild(close);\n          chat.appendChild(iframe);\n          opener.appendChild(kfdesc);\n          opener.appendChild(logo);\n          opener.appendChild(badge);\n          container.appendChild(opener);\n          container.appendChild(chat);\n\n          document.body.appendChild(container);\n        };\n\n        var installCss = function installCss() {\n          var css = document.createElement('link');\n          css.href = conf.asset_origin + '/widget.css';\n          css.rel = 'stylesheet';\n          css.onload = function () {\n            show();\n            if ('function' == typeof window.onloadKefuchat) {\n              window.onloadKefuchat();\n            }\n          };\n          document.head.appendChild(css);\n        };\n\n        window.openKefuchat = function () {\n          document.querySelector('.kefuchat-opener').style.display = 'none';document.querySelector('.kefuchat-chat').style.display = 'block';\n        };\n\n        window.closeKefuchat = function () {\n          document.querySelector('.kefuchat-chat').style.display = 'none';document.querySelector('.kefuchat-opener').style.display = 'block';\n        };\n\n        var bindEvent = function bindEvent() {\n          document.querySelector('.kefuchat-opener').addEventListener('click', window.openKefuchat);\n          document.querySelector('.kefuchat-close').addEventListener('click', window.closeKefuchat);\n        };\n\n        var registerNotification = function registerNotification() {\n          var askNotificationPermission = function askNotificationPermission() {\n            return new Promise(function (resolve, reject) {\n              var permissionResult = Notification.requestPermission(function (result) {\n                resolve(result);\n              });\n\n              if (permissionResult) {\n                permissionResult.then(resolve, reject);\n              }\n            });\n          };\n\n          window.addEventListener(\"message\", function (message) {\n            console.log(message);\n            if (message.data.action == 'showNotification') {\n              askNotificationPermission().then(function () {\n                var msg = message.data.msg;\n                var body = void 0,\n                    image = void 0;\n\n                if (msg.type == 1) {\n                  body = msg.content;\n                }\n                if (msg.type == 2) {\n                  body = \"[图片消息]\";\n                  image = msg.content;\n                }\n\n                var notify = new Notification(\"您收到新消息\", {\n                  body: body,\n                  image: image,\n                  vibrate: 1\n                });\n\n                notify.onclick = function () {\n                  var o = window;\n                  o.focus();\n                  o.openKefuchat();\n\n                  setTimeout(function () {\n                    notify.close();\n                  }, 200);\n                };\n              });\n            }\n          }, false);\n        };\n\n        var show = function show() {\n          document.querySelector('.kefuchat-opener').style.display = 'block';\n        };\n\n        installDom();\n        installCss();\n        bindEvent();\n        registerNotification();\n      },\n\n      load: function load() {\n        var conf = {\n          chat_origin: \"http://dev.fastsupport.cn:5000/\",\n          asset_origin: \"http://dev.fastsupport.cn:5000/\",\n          userAgent: navigator.userAgent,\n          language: navigator.language,\n          url: location.href,\n          title: document.title,\n          name: null,\n          referer: document.referrer,\n          unique_id: null\n        };\n\n        kefu.chat.init(conf);\n      },\n\n      update: function update(info) {\n        var conf = {\n          chat_origin: \"http://dev.fastsupport.cn:5000/\",\n          asset_origin: \"http://dev.fastsupport.cn:5000/\",\n          userAgent: navigator.userAgent,\n          language: navigator.language,\n          url: location.href,\n          title: document.title,\n          name: null,\n          referer: document.referrer,\n          unique_id: null\n        };\n        for (var i in info) {\n          conf[i] = info[i];\n        }\n\n        kefu.chat.init(conf);\n      }\n    }\n  };\n\n  kefu.chat.load();\n}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n\n//# sourceURL=webpack:///./src/widget.js?");

/***/ })

/******/ });