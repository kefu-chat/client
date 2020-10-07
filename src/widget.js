let kefu = {
  chat: {
    init: (conf) => {
      let _kefuchat_init = (window)._kefuchat_init;

      if (_kefuchat_init && 'function' == typeof _kefuchat_init) {
        let diy = _kefuchat_init();
        for (let i in diy) {
          if ([diy] != null && 'string' != typeof diy[i] && 'number' != typeof diy[i]) {
            throw i + ' must a string'
          }
          conf[i] = diy[i]
        }
      }

      if (!conf.unique_id) {
        if (localStorage) {
          if (!localStorage.kefuchat_unique_id) {
            localStorage.kefuchat_unique_id = parseInt((Math.random() * 99999).toString());
          }
          conf.unique_id = localStorage.kefuchat_unique_id
        } else {
          if (!document.cookie.match(/kefuchat_unique_id\=(^[;])/)) {
            document.cookie = 'kefuchat_unique_id=' + parseInt((Math.random() * 99999).toString());
          }
          conf.unique_id = document.cookie.match(/kefuchat_unique_id\=(^[;])/)[1]
        }
      }

      if (!conf.name) {
        conf.name = '访客' + conf.unique_id;
      }

      let createDiv = (__cls) => {
        let div = document.createElement('div');
        div.className = __cls;
        return div;
      }
      let installDom = () => {
        let container = createDiv('kefuchat');
        let chat = createDiv('kefuchat-chat');
        let close = createDiv('kefuchat-close');
        let opener = createDiv('kefuchat-opener');
        let kfdesc = createDiv('kefuchat-kfdesc');
        let logo = createDiv('kefuchat-logo');
        let badge = createDiv('kefuchat-badge');
        let iframe = document.createElement('iframe');
        kfdesc.innerText = '客服在线, 来咨询吧'
        iframe.className = 'kefuchat-iframe';
        iframe.src = (conf).chat_origin + '?institution_id=' + (conf).institution_id + '&unique_id=' + (conf).unique_id + '&userAgent=' + encodeURIComponent((conf).userAgent) + '&languages[]=' + (conf).language + '&url=' + encodeURIComponent((conf).url) + '&name=' + encodeURIComponent((conf).name) + '&referer=' + encodeURIComponent((conf).referer);

        opener.style.display = 'none'
        chat.style.display = 'none'

        chat.appendChild(close);
        chat.appendChild(iframe);
        opener.appendChild(kfdesc);
        opener.appendChild(logo);
        opener.appendChild(badge);
        container.appendChild(opener);
        container.appendChild(chat);

        document.body.appendChild(container);
      }

      let installCss = () => {
        let css = document.createElement('link');
        css.href = conf.asset_origin + '/widget.css';
        css.rel = 'stylesheet';
        css.onload = function () {
          show();
          if ('function' == typeof (window).onloadKefuchat) {
            (window).onloadKefuchat()
          }
        };
        document.head.appendChild(css);
      };

      (window).openKefuchat = () => {
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

      let show = () => {
        (document.querySelector('.kefuchat-opener')).style.display = 'block';
      };

      installDom();
      installCss();
      bindEvent();
      registerNotification();
    },

    load: () => {
      let conf = {
        chat_origin: WIDGET_URL,
        asset_origin: WIDGET_URL,
        userAgent: (navigator).userAgent,
        language: (navigator).language,
        url: (location).href,
        title: (document).title,
        name: null,
        referer: (document).referrer,
        unique_id: null,
      };

      kefu.chat.init(conf);
    },

    update: (info) => {
      let conf = {
        chat_origin: WIDGET_URL,
        asset_origin: WIDGET_URL,
        userAgent: (navigator).userAgent,
        language: (navigator).language,
        url: (location).href,
        title: (document).title,
        name: null,
        referer: (document).referrer,
        unique_id: null,
      };
      for (let i in info) {
        conf[i] = info[i];
      }

      kefu.chat.init(conf);
    }
  }
};

kefu.chat.load();