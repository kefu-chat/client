let kefu = {
  chat: {
    opened: false,
    greet: false,
    options: {
      api_origin: API_URL,
      chat_origin: WIDGET_URL,
      asset_origin: WIDGET_URL,
    },
    iframe: null,

    initIframeDom: function () {
      kefu.chat.iframe.contentDocument.head.innerHTML = [
        '<meta charset="utf-8" />',
        '<meta name="viewport" content="width=device-width,initial-scale=1" />',
        '<meta name="theme-color" content="#ffffff" />',
        "<title>对话</title>",
        '<link rel="stylesheet" href="' + kefu.chat.options.asset_origin + 'global.css" />',
        '<link rel="stylesheet" href="' + kefu.chat.options.asset_origin + 'bundle.css" />',
        '<link rel="stylesheet" href="' + kefu.chat.options.asset_origin + 'theme.css" />',
      ].join("");
      kefu.chat.iframe.contentDocument.body.innerHTML = [
        '<div class="loadingspinner">',
        "</div>",
      ].join("");
      kefu.chat.iframe.contentDocument.parameters = kefu.chat.options;

      //let pusherjs = document.createElement("script");
      //pusherjs.src = kefu.chat.options.asset_origin + "pusher.js";
      //kefu.chat.iframe.contentDocument.body.appendChild(pusherjs);

      let script = document.createElement("script");
      script.src = kefu.chat.options.asset_origin + "bundle.js";
      kefu.chat.iframe.contentDocument.body.appendChild(script);
    },

    init: function (conf) {
      for (let j in conf) {
        kefu.chat.options[j] = conf[j];
      }

      if (!kefu.chat.options.unique_id) {
        if (localStorage) {
          if (!localStorage.kefuchat_unique_id) {
            localStorage.kefuchat_unique_id = parseInt(
              (Math.random() * 99999).toString()
            );
          }
          kefu.chat.options.unique_id = localStorage.kefuchat_unique_id;
        } else {
          if (!document.cookie.match(/kefuchat_unique_id\=(^[;])/)) {
            document.cookie =
              "kefuchat_unique_id=" +
              parseInt((Math.random() * 99999).toString());
          }
          kefu.chat.options.unique_id = document.cookie.match(
            /kefuchat_unique_id\=(^[;])/
          )[1];
        }
      }

      if (!kefu.chat.options.name) {
        kefu.chat.options.name = "访客" + kefu.chat.options.unique_id;
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
      };
      let createDiv = (__cls) => {
        let div = document.createElement("div");
        div.className = __cls;
        return div;
      };

      let installDom = () => {
        let container = createDiv("kefuchat");
        document.body.appendChild(container);

        let chat = createDiv("kefuchat-chat");
        container.appendChild(chat);

        let close = createDiv("kefuchat-close");
        chat.appendChild(close);

        let opener = createDiv("kefuchat-opener theme-" + (kefu.chat.options.theme || 'default'));
        container.appendChild(opener);

        let logo = new Image;
        logo.className = 'kefuchat-logo';
        logo.src = kefu.chat.options.asset_origin + 'logo.svg';
        let badge = createDiv("kefuchat-badge");
        if (!kefu.chat.iframe) {
          kefu.chat.iframe = document.createElement("iframe");
          chat.appendChild(kefu.chat.iframe);
          kefu.chat.iframe.className = "kefuchat-iframe";
        }
        let kfdesc = createDiv("kefuchat-kfdesc");
        kfdesc.innerText = "客服在线, 来咨询吧";

        opener.style.display = "none";
        chat.style.display = "none";

        opener.appendChild(kfdesc);
        opener.appendChild(logo);
        opener.appendChild(badge);

        let greet = createDiv("kefuchat-greet");
        let greetHead = createDiv("kefuchat-greet-head");
        let greetAvatar = createDiv("kefuchat-greet-avatar");
        let avatar = new Image();
        avatar.className = 'avatar-img';
        avatar.src = 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E';
        greetAvatar.appendChild(avatar);
        greetHead.appendChild(greetAvatar);
        greet.appendChild(greetHead);
        let greetMessage = createDiv("kefuchat-greet-msg");
        let greetMessageContent = document.createElement('p');
        greetMessageContent.className = 'kefuchat-greet-msg-content';
        greetMessageContent.innerText = '';
        greetMessage.appendChild(greetMessageContent);
        greet.appendChild(greetMessage);
        greet.style.display = 'none';
        container.appendChild(greet);
      };

      let installCss = () => {
        let themeCss = document.createElement("link");
        themeCss.href = kefu.chat.options.asset_origin + "theme.css";
        themeCss.rel = "stylesheet";
        document.head.appendChild(themeCss);

        let css = document.createElement("link");
        css.href = kefu.chat.options.asset_origin + "widget.css";
        css.rel = "stylesheet";
        css.onload = () => {
          document.querySelector(".kefuchat-opener").style.display = "block";
          if ("function" == typeof window.onloadKefuchat) {
            window.onloadKefuchat();
          }
        };
        document.head.appendChild(css);
      };

      window.openKefuchat = () => {
        document.querySelector(".kefuchat-opener").style.display = "none";
        document.querySelector(".kefuchat-greet").style.display = "none";
        document.querySelector(".kefuchat-chat").style.display = "block";

        if (!kefu.chat.options.greet) {
          let msg = {
            id: parseInt((Math.random() * 99999).toString()).toString(),
            content: kefu.chat.options.greeting_message,
            type: 1,
            sender: kefu.chat.options.greeter,
            sender_type_text: 'user',
            sender_type: 'App\\Models\\User',
            sender_id: kefu.chat.options.greeter.id,
            created_at: (new Date()).toISOString(),
            updated_at: (new Date()).toISOString(),
          };
          kefu.chat.iframe.contentWindow.postMessage({ action: 'autoGreet', msg: msg});
          kefu.chat.options.greet = true;
          askNotificationPermission().then(() => { });
        }
        kefu.chat.opened = true;
      };

      window.closeKefuchat = () => {
        document.querySelector(".kefuchat-chat").style.display = "none";
        document.querySelector(".kefuchat-opener").style.display = "block";
        kefu.chat.opened = false;
      };

      let bindEvent = () => {
        document
          .querySelector(".kefuchat-opener")
          .addEventListener("click", window.openKefuchat);
        document
          .querySelector(".kefuchat-greet")
          .addEventListener("click", window.openKefuchat);
        document
          .querySelector(".kefuchat-close")
          .addEventListener("click", window.closeKefuchat);
      };

      let registerNotification = () => {
        window.addEventListener(
          "message",
          (message) => {
            if (message.data.action == "showNotification") {
              let msg = message.data.msg;
              let body, image;

              if (msg.type == 1) {
                body = msg.content;
              }
              if (msg.type == 2) {
                body = "[图片消息]";
                image = msg.content;
              }

              if (!kefu.chat.opened) {
                document.querySelector(".kefuchat-opener").style.display = "block";
                document.querySelector('.kefuchat-greet-msg-content').innerText = body;
                document.querySelector('.avatar-img').src = msg.sender.avatar;
                document.querySelector(".kefuchat-greet").style.display = "block";
              }

              askNotificationPermission().then(() => {
                let notify = new Notification("您收到新消息", {
                  body,
                  image,
                  vibrate: 1,
                });

                notify.onclick = () => {
                  const o = window;
                  o.focus();
                  o.openKefuchat();

                  setTimeout(() => {
                    notify.close();
                  }, 200);
                };
              });
            }
          },
          false
        );
      };

      registerNotification();
      installDom();
      installCss();
      kefu.chat.initIframeDom();
      bindEvent();
    },

    load: (config) => {
      let conf = {
        api_origin: API_URL,
        chat_origin: WIDGET_URL,
        asset_origin: WIDGET_URL,
        userAgent: window.navigator.userAgent,
        languages: window.navigator.languages,
        url: window.location.href,
        title: window.document.title,
        name: null,
        referer: window.document.referrer,
        unique_id: null,
        theme: config.theme,
        terminate_manual: config.terminate_manual,
        terminate_timeout: config.terminate_timeout,
        greeting_message: config.greeting_message,
        greeter: config.greeter,
      };

      kefu.chat.init(conf);
    },

    start: () => {
      let _kefuchat_init = window._kefuchat_init;
      if (_kefuchat_init && "function" == typeof _kefuchat_init) {
        let diy = _kefuchat_init();
        for (let i in diy) {
          if (
            diy[i] != null &&
            "string" != typeof diy[i] &&
            "number" != typeof diy[i]
          ) {
            throw i + " must a string";
          }
          kefu.chat.options[i] = diy[i];
        }
      }

      const js = document.createElement(`script`);
      js.src = kefu.chat.options.api_origin + 'api/visitor/config/' + kefu.chat.options.institution_id + '?callback=kefu.chat.load&t=' + (new Date).toISOString();
      document.body.append(js);
    },

    destroy: () => {
      kefu.chat.iframe.contentWindow.postMessage({action: 'uninstall'});
    },

    update: (info) => {
      let conf = {
        api_origin: API_URL,
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

      kefu.chat.destroy();
      kefu.chat.init(conf);
    },

    registerPushService: function () {
      const applicationServerPublicKey = 'BHdd2PwLOsYaDQQOmqw_8KIIYOQYECWNlat0K8GScnytjV88e6Xifn0GMz7MbScAkxf_kVJhnp-0NrB_P4u6WHw';

      const pushButton = document.querySelector('.kefuchat-opener');

      let isSubscribed = false;
      let swRegistration = null;

      function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }


      function updateSubscriptionOnServer(subscription) {
        // TODO: Send subscription to application server

        const subscriptionJson = document.querySelector('.js-subscription-json');
        const subscriptionDetails =
          document.querySelector('.js-subscription-details');

        if (subscription) {
          subscriptionJson.textContent = JSON.stringify(subscription);
          subscriptionDetails.classList.remove('is-invisible');
        } else {
          subscriptionDetails.classList.add('is-invisible');
        }
      }

      function subscribeUser() {
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        })
          .then(function (subscription) {
            console.log('User is subscribed.');

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;
          })
          .catch(function (err) {
            console.log('Failed to subscribe the user: ', err);
          });
      }

      function unsubscribeUser() {
        swRegistration.pushManager.getSubscription()
          .then(function (subscription) {
            if (subscription) {
              return subscription.unsubscribe();
            }
          })
          .catch(function (error) {
            console.log('Error unsubscribing', error);
          })
          .then(function () {
            updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
          });
      }


      if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');

        navigator.serviceWorker.register('worker.js')
          .then(function (swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
            subscribeUser();
          })
          .catch(function (error) {
            console.error('Service Worker Error', error);
          });
      } else {
        console.warn('Push messaging is not supported');
      }
    },

    say: (msg) => { },

    open: (msg) => {
      window.openKefuchat();
    },

    close: () => {
      window.closeKefuchat();
    },
  },
};

kefu.chat.start();
// kefu.chat.registerPushService();
window.kefu = kefu;
