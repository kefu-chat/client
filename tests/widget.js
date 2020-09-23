var conf = {
  widget_origin: 'http://localhost:5000',
  institution_id: 'rxpXD6uDD0EJqvbD',
  userAgent: navigator.userAgent,
  language: navigator.language,
  url: location.href,
  title: document.title,
  name : null,
  referer: document.referrer,
  unique_id : null,
}
if ('function' == typeof _kechat_init) {
  var diy = _kechat_init();
  for (var i in diy) {
    if ([diy] != null && 'string' != typeof diy[i] && 'number' != typeof diy[i] ) {
      throw i + ' must a string'
    }
    conf[i] = diy[i]
  }
}

if (!conf.unique_id) {
  if (localStorage) {
    if (!localStorage.kefuchat_unique_id) {
      localStorage.kefuchat_unique_id = parseInt(Math.random()*99999);
    }
    conf.unique_id = localStorage.kefuchat_unique_id
  } else {
    if (!document.cookie.match(/kefuchat_unique_id\=(^[;])/)) {
      document.cookie = 'kefuchat_unique_id=' + parseInt(Math.random()*99999);
    }
    conf.unique_id = document.cookie.match(/kefuchat_unique_id\=(^[;])/)[1]
  }
}
if (!conf.name) {
  conf.name = '访客' + conf.unique_id
}

var createDiv = function (__cls) {
  var div = document.createElement('div');
  div.className = __cls;
  return div;
}
var installDom = function () {
  var container = createDiv('kefuchat');
  var chat = createDiv('kefuchat-chat');
  var close = createDiv('kefuchat-close');
  var opener = createDiv('kefuchat-opener');
  var kfdesc = createDiv('kefuchat-kfdesc');
  var logo = createDiv('kefuchat-logo');
  var badge = createDiv('kefuchat-badge');
  var iframe = document.createElement('iframe');
  kfdesc.innerText = '客服在线, 来咨询吧'
  iframe.className = 'kefuchat-iframe';
  iframe.src = conf.widget_origin + '?institution_id=' + conf.institution_id + '&unique_id=' + conf.unique_id + '&userAgent=' + encodeURIComponent(conf.userAgent) + '&languages[]=' + conf.language + '&url=' + encodeURIComponent(conf.url) + '&name=' + encodeURIComponent(conf.name) + '&referer=' + encodeURIComponent(conf.referer);

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

var installCss = function () {
  var css = document.createElement('link');
  css.href = 'widget.css';
  css.rel = 'stylesheet';
  css.onload = function () {
    show();
    if ('function' == typeof onloadKefuchat) {
      onloadKefuchat()
    }
  };
  document.head.appendChild(css);
};

window.openKefuchat = function () {
  document.querySelector('.kefuchat-opener').style.display = 'none'; document.querySelector('.kefuchat-chat').style.display = 'block';
};

window.closeKefuchat = function () {
  document.querySelector('.kefuchat-chat').style.display = 'none'; document.querySelector('.kefuchat-opener').style.display = 'block'
};

var bindEvent = function () {
  document.querySelector('.kefuchat-opener').addEventListener('click', window.openKefuchat);
  document.querySelector('.kefuchat-close').addEventListener('click', window.closeKefuchat);
};

var registerNotification = function () {
  // 注册桌面推送通知, 需要 serviceWorker
};

var show = function () {
  document.querySelector('.kefuchat-opener').style.display = 'block';
};

installDom();
installCss();
bindEvent();
registerNotification();

