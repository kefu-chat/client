
let kefu = {
  chat: {
    options: {},
    iframe: null,
    initIframeDom: function () {
      kefu.chat.iframe.contentDocument.writeln([
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="utf-8" />',
        '<meta name="viewport" content="width=device-width,initial-scale=1" />',
        '<meta name="theme-color" content="#ffffff" />',
        '<title>对话</title>',
        '<link rel="stylesheet" href="' + kefu.chat.options.asset_origin + 'global.css" />',
        '<link rel="stylesheet" href="' + kefu.chat.options.asset_origin + 'bundle.css" />',
        '</head>',
        '<body>',
        '<p class="loading-bundle"> Loading bundle... You need JavaScript for this. <div class="centered">',
        '<div class="loadingspinner">',
        '</div>',
        '</p>',
        '<script>',
        'window.parameters = ' + JSON.stringify(kefu.chat.options) + ';',
        '</script>',
        '<script async src="' + kefu.chat.options.asset_origin + 'bundle.js"></script>',
        '</body>',
        '</html>'
      ].join(''));
    },
    init: function (conf) {
      let _kefuchat_init = (window)._kefuchat_init;

      if (_kefuchat_init && 'function' == typeof _kefuchat_init) {
        let diy = _kefuchat_init();
        for (let i in diy) {
          if (diy[i] != null && 'string' != typeof diy[i] && 'number' != typeof diy[i]) {
            throw i + ' must a string'
          }
          conf[i] = diy[i]
        }
      }

      for (let j in conf) {
        kefu.chat.options[j] = conf[j];
      }

      if (!kefu.chat.options.unique_id) {
        if (localStorage) {
          if (!localStorage.kefuchat_unique_id) {
            localStorage.kefuchat_unique_id = parseInt((Math.random() * 99999).toString());
          }
          kefu.chat.options.unique_id = localStorage.kefuchat_unique_id
        } else {
          if (!document.cookie.match(/kefuchat_unique_id\=(^[;])/)) {
            document.cookie = 'kefuchat_unique_id=' + parseInt((Math.random() * 99999).toString());
          }
          kefu.chat.options.unique_id = document.cookie.match(/kefuchat_unique_id\=(^[;])/)[1]
        }
      }

      if (!kefu.chat.options.name) {
        kefu.chat.options.name = '访客' + kefu.chat.options.unique_id;
      }

      let askNotificationPermission = () => {
        return new Promise((resolve, reject) => {
          const permissionResult = Notification.requestPermission((result) => {
            resolve(result);
          });

          if (permissionResult) {
            permissionResult.then(resolve, reject);
          }
        });
      }
      let createDiv = (__cls) => {
        let div = document.createElement('div');
        div.className = __cls;
        return div;
      }

      let installDom = () => {
        let container = createDiv('kefuchat');
        document.body.appendChild(container);

        let chat = createDiv('kefuchat-chat');
        container.appendChild(chat);

        let close = createDiv('kefuchat-close');
        chat.appendChild(close);

        let opener = createDiv('kefuchat-opener');
        container.appendChild(opener);

        let logo = createDiv('kefuchat-logo');
        let badge = createDiv('kefuchat-badge');
        if (!kefu.chat.iframe) {
          kefu.chat.iframe = document.createElement('iframe');
          chat.appendChild(kefu.chat.iframe);
          kefu.chat.iframe.className = 'kefuchat-iframe';
          setTimeout(kefu.chat.initIframeDom, 1000);
        }
        let iframe = kefu.chat.iframe;
        let kfdesc = createDiv('kefuchat-kfdesc');
        kfdesc.innerText = '客服在线, 来咨询吧'
        //iframe.src = kefu.chat.options.chat_origin + '?institution_id=' + kefu.chat.options.institution_id + '&unique_id=' + kefu.chat.options.unique_id + '&userAgent=' + encodeURIComponent(kefu.chat.options.userAgent) + '&languages[]=' + kefu.chat.options.language + '&url=' + encodeURIComponent(kefu.chat.options.url) + '&name=' + encodeURIComponent(kefu.chat.options.name) + '&referer=' + encodeURIComponent(kefu.chat.options.referer);


        opener.style.display = 'none'
        chat.style.display = 'none'

        opener.appendChild(kfdesc);
        opener.appendChild(logo);
        opener.appendChild(badge);
      }

      let installCss = () => {
        let css = document.createElement('link');
        css.href = kefu.chat.options.asset_origin + 'widget.css';
        css.rel = 'stylesheet';
        css.onload = () => {
          document.querySelector('.kefuchat-opener').style.display = 'block';
          if ('function' == typeof (window).onloadKefuchat) {
            (window).onloadKefuchat()
          }
        };
        document.head.appendChild(css);
      };

      (window).openKefuchat = () => {
        askNotificationPermission().then(() => { });
        (document.querySelector('.kefuchat-opener')).style.display = 'none'; (document.querySelector('.kefuchat-chat')).style.display = 'block';
      };

      (window).closeKefuchat = () => {
        (document.querySelector('.kefuchat-chat')).style.display = 'none'; (document.querySelector('.kefuchat-opener')).style.display = 'block'
      };

      let bindEvent = () => {
        document.querySelector('.kefuchat-opener').addEventListener('click', (window).openKefuchat);
        document.querySelector('.kefuchat-close').addEventListener('click', (window).closeKefuchat);
      };

      let registerNotification = () => {
        window.addEventListener("message", (message) => {
          console.log(message);
          if (message.data.action == 'showNotification') {
            askNotificationPermission().then(() => {
              let msg = message.data.msg;
              let body, image;

              if (msg.type == 1) {
                body = msg.content;
              }
              if (msg.type == 2) {
                body = "[图片消息]";
                image = msg.content;
              }

              let notify = new Notification("您收到新消息", {
                body,
                image,
                vibrate: 1,
              });

              notify.onclick = () => {
                const o = window;
                o.focus();
                (o).openKefuchat();

                setTimeout(() => {
                  notify.close();
                }, 200);
              };
            });
          }
        }, false);
      };

      registerNotification();
      installDom();
      installCss();
      bindEvent();
    },

    load: () => {
      let conf = {
        chat_origin: WIDGET_URL,
        asset_origin: WIDGET_URL,
        userAgent: window.navigator.userAgent,
        languages: window.navigator.languages,
        url: window.location.href,
        title: window.document.title,
        name: null,
        referer: window.document.referrer,
        unique_id: null,
      };

      kefu.chat.init(conf);
    },

    update: (info) => {
      let conf = {
        chat_origin: WIDGET_URL,
        asset_origin: WIDGET_URL,
        userAgent: window.navigator.userAgent,
        languages: window.navigator.languages,
        url: window.location.href,
        title: document.title,
        name: null,
        referer: document.referrer,
        unique_id: null,
      };
      for (let i in info) {
        conf[i] = info[i];
      }

      kefu.chat.init(conf);
    },

    say: (msg) => {

    },

    open: (msg) => {
      window.openKefuchat();
    },

    close: () => {
      window.closeKefuchat();
    },
  }
};

kefu.chat.load();
window.kefu = kefu;
