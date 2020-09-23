var widget_origin = 'http://localhost:5000';
var institution_id = 'rxpXD6uDD0EJqvbD';
var userAgent = navigator.userAgent;
var language = navigator.language;
var url = location.href;
var title = document.title;
var name = '访客' + unique_id
var referer = document.referrer;
var unique_id;

if (!unique_id) {
  if (localStorage) {
    if (!localStorage.kefuchat_unique_id) {
      localStorage.kefuchat_unique_id = parseInt(Math.random()*99999);
    }
    unique_id = localStorage.kefuchat_unique_id
  } else {
    if (!document.cookie.match(/kefuchat_unique_id\=(^[;])/)) {
      document.cookie = 'kefuchat_unique_id=' + parseInt(Math.random()*99999);
    }
    unique_id = document.cookie.match(/kefuchat_unique_id\=(^[;])/)[1]
  }
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
  iframe.src = widget_origin + '?institution_id=' + institution_id + '&unique_id=' + unique_id + '&userAgent=' + encodeURIComponent(userAgent) + '&languages[]=' + language + '&url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(name) + '&referer=' + encodeURIComponent(referer);

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
  css.onload = show;
  document.head.appendChild(css);
};

var bindEvent = function () {
  document.querySelector('.kefuchat-opener').addEventListener('click', function () {
    document.querySelector('.kefuchat-opener').style.display = 'none'; document.querySelector('.kefuchat-chat').style.display = 'block';
  });
  document.querySelector('.kefuchat-close').addEventListener('click', function () {
    document.querySelector('.kefuchat-chat').style.display = 'none'; document.querySelector('.kefuchat-opener').style.display = 'block'
  });
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

