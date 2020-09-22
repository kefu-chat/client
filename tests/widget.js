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
  iframe.src = 'http://localhost:5000/?institution_id=rxpXD6uDD0EJqvbD&unique_id=3334&userAgent=Chrome&languages[]=zh-CN&url=https://www.ssls.com.cn&title=SSL&name=%E6%B5%8B%E8%AF%95%E8%AE%BF%E5%AE%A2&referer=https://www.baidu.com/';

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

