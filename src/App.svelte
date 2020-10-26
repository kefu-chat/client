<script>
  import io from 'socket.io-client';
  import Nav from "./ui/Nav.svelte";
  import Page from "./ui/Page.svelte";
  import request from "./request";
  import Echo from "laravel-echo";
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";
  import { user } from "./stores.js";
  import ScrollToBottom from "./ScrollToBottom.svelte";
  import MessageInput from "./MessageInput.svelte";
  import Spinner from "./ui/Spinner.svelte";

  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { toHSL } from "./toHSL.js";
  import format from "date-fns/format";

  export let visitor = null;
  export let _data = null;
  export let _user = null;
  export let _chats = [];
  export let textareaClass = "";

  let echo;
  let socket;
  let store = {};
  let autoscroll;
  let showScrollToBottom;
  let main;
  let isLoading = false;
  let typing = false;
  let typingUser = null;
  let timeout;
  let channel;
  const ADD_ON_SCROLL = 50; // messages to add when scrolling to the top
  let showMessages = 100; // initial messages to load
  let queue = [];
  export const messageNotifyAudio = new Audio(document.parameters.asset_origin + 'music/dong.mp3');

  window.io = io;

  window.messageProcess = ({data, silent}) => {
    if (!socket) {
      queue.push({data});
    }
    if (data.action == 'autoGreet') {
      if ('undefined' == typeof data.silent || !data.silent) {
        messageNotifyAudio.play();
      }
      return _chats.push(data.msg);
    }
    if (data.action == 'uninstall') {
      if (channel && echo && socket) {
        try {
          echo.leave(channel);
        } catch (e) {
          console.error(e);
        }
      }
      _chats = [];
      localStorage.removeItem("visitor_token");
      localStorage.removeItem("conversation_id");
      return;
    }
  };
  export const init = async function(reopen = false) {
    window.removeEventListener('message', window.messageProcess);
    window.addEventListener('message', window.messageProcess)

    // $nav = "messages";
    const { data } = await request({
      url: `api/visitor/init`,
      method: "POST",
      data: {
        ...document.parameters,
        // institution_id: window.parameters.institution_id, //"rxpXD6uDD0EJqvbD",
        // unique_id: window.parameters.unique_id, //parseInt(Math.random()*9999999).toString(),
        // userAgent: window.parameters.userAgent, //navigator.userAgent,
        // languages: window.parameters.languages, //navigator.languages,
        // url: window.parameters.url, //location.href,
        // title: window.parameters.title, //document.title,
        // name: window.parameters.name, //"visitor001",
        // referer: window.parameters.referer,
        reopen,
      },
    });
    const visitor_token = data.visitor_token;
    const conversation_id = data.conversation.id;
    visitor = data.conversation.visitor;
    localStorage.setItem("visitor_token", visitor_token);
    localStorage.setItem("conversation_id", conversation_id);
    _data = data;

    if (channel && reopen && echo && socket) {
      try {
        echo.leave(channel);
      } catch (e) {
        console.error(e);
      }
    }

    if (conversation_id) {
      setTimeout(async () => {
        channel = `conversation.${conversation_id}`;

        echo = new Echo({
          broadcaster: "socket.io",
          host: SOCKET_HOST,
          auth: {
            headers: {
              Authorization: `Bearer ${visitor_token}`,
            },
          },
        });

        const { data } = await request({
          url: `api/conversation/${conversation_id}/messages`,
          method: "GET",
        });
        _chats = data.messages;
        _user = data.conversation.user;
        if (!data.conversation.status) {
          textareaClass = 'disabled';
        } else {
          textareaClass = '';
        }

        socket = echo
          .join(channel)
          //.here()
          //.joining((user) => (_user = user))
          //.leaving((user) => {})
          .listen(".conversation.terminated", (msg) => {
            textareaClass = 'disabled';
            msg.id = parseInt((Math.random() * 99999).toString());
            _chats.push(msg);
            if (msg.sender_type_text == "user") {
              messageNotifyAudio.play();
              window.parent.postMessage({action: 'showNotification', msg})
            }
          })
          .listenForWhisper("message", (msg) => {
            msg.id = parseInt((Math.random() * 99999).toString());
            _chats.push(msg);
            if (msg.sender_type_text == "user") {
              messageNotifyAudio.play();
              _user = msg.sender;
              window.parent.postMessage({action: 'showNotification', msg})
            }
          })
          .listenForWhisper('startTyping', (evt) => {
            typing = true;
            typingUser = evt;
          })
          .listenForWhisper('stopTyping', (evt) => {
            typing = false;
          });

          for (let index = 0; index < queue.length; index++) {
            const msg = queue[index];
            msg.silent = true;
            window.messageProcess(msg);
          }
          queue = [];

        //startTyping()
      }, 1000);
    }
  };

  onMount(init);

  $: {
    // debounce update svelte store to avoid overloading ui
    timeout = setTimeout(() => {
      //  // convert key/value object to sorted array of messages (with a max length)
      //  // const arr = Object.values(store);
      //  // const sorted = arr.sort((a, b) => a.time - b.time);
      //  // const begin = Math.max(0, sorted.length - showMessages);
      //  // const end = arr.length;
      _chats = _chats;
      isLoading = false;
    }, 200);

    visitor;
    socket;
    _chats;
    textareaClass;
    init;
  }

  function startTyping(evt) {
    socket.whisper('startTyping', {
        name: 'test' //this.user.name,
    })
  }

  function stopTyping(evt) {
    socket.whisper('stopTyping', {
        name: this.user.name,
    })
  }

  function scrollToBottom() {
    main.scrollTo({ left: 0, top: main.scrollHeight });
  }

  function handleScroll(e) {
    showScrollToBottom =
      main.scrollHeight - main.offsetHeight > main.scrollTop + 300;
    if (!isLoading && main.scrollTop <= main.scrollHeight / 10) {
      const totalMessages = Object.keys(store).length - 1;
      if (showMessages >= totalMessages) return;
      isLoading = true;
      setTimeout(() => {
        showMessages += ADD_ON_SCROLL;
        if (main.scrollTop === 0) main.scrollTop = 1;
        isLoading = false;
      }, 200);
    }
  }

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
          transform: ${transform} scale(${t});
          opacity: ${t}
  			`,
      };
    },
  });

  function handleNewMessage(msg) {
    const now = new Date().getTime();
    const message = { msg, user: $user, time: now };
  }

  beforeUpdate(() => {
    autoscroll =
      main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
  });

  afterUpdate(() => {
    if (autoscroll) main.scrollTo(0, main.scrollHeight);
  });

  onDestroy(() => {
    // remove gun listeners
    clearTimeout(timeout);
  });
</script>

<style>
  article {
    margin: 0 0;
  }
  .meta {
    font-size: 10px;
    margin: 0.5em;
  }

  .msg {
    display: inline-block;
    position: relative;
    line-height: 1.5;
    padding: 0.5em 1em;
    background-color: #eee;
    border-radius: 11px;

    /* This makes sure returns are also rendered */
    white-space: pre-wrap;

    /* The trouble you have to go through to keep simple text inside a div! 😆 */
    /* Source: https://css-tricks.com/snippets/css/prevent-long-urls-from-breaking-out-of-container/ */

    /* These are technically the same, but use both */
    overflow-wrap: break-word;
    word-wrap: break-word;

    -ms-word-break: break-all;
    /* This is the dangerous one in WebKit, as it breaks things wherever */
    word-break: break-all;
    /* Instead use this non-standard one: */
    word-break: break-word;
    color: #222d38;
    vertical-align: middle;
    max-width: calc(100% - 80px);
  }
  .msg.msg-image {
    padding: 0;
    border: 0;
    margin: 0;
  }

  .visitor {
    text-align: right;
  }

  .user {
    color: #9fabb7;
    margin-left: 40px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    display: inline-block;
    vertical-align: top;
    margin-right: 2px;
    margin-top: 4px;
  }

  .avatar img {
    border-radius: 16px;
    width: 32px;
    height: 32px;
  }

  .message-container {
    display: inline-block;
    vertical-align: middle;
    width: 100%;
  }

  main {
    margin: auto 0 100px 0;
    padding: 0.5em 1em 0.5em 1em;
    overflow-y: auto;
  }
  .assistant-info {
    padding: 14px;
  }
  .assistant-info .assistant-avatar,
  .assistant-info .assistant-text {
    display: inline-block;
    vertical-align: middle;
  }
  .assistant-info .assistant-avatar {
    width: 40px;
    height: 40px;
    float: none;
    border-radius: 20px !important;
    background-repeat: no-repeat;
    background-size: contain;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='36' height='36'%3E%3Cdefs%3E%3Ccircle id='a' cx='18' cy='18' r='18'/%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cmask id='b' fill='%23fff'%3E%3Cuse xlink:href='%23a'/%3E%3C/mask%3E%3Cuse fill='%23FFF' opacity='.12' xlink:href='%23a'/%3E%3Cpath fill='%23FFF' fill-rule='nonzero' d='M27.588 29.805h-1.891a3.783 3.783 0 01-3.783-3.783v-1.215c.837-.995 1.437-2.171 1.81-3.414.039-.21.24-.313.375-.457.724-.725.866-1.946.323-2.816-.074-.132-.207-.247-.2-.41 0-1.11.006-2.22-.001-3.329-.03-1.338-.412-2.73-1.35-3.72-.758-.801-1.798-1.278-2.87-1.482-1.357-.259-2.775-.246-4.118.096-1.163.294-2.257.975-2.933 1.986-.598.878-.86 1.945-.905 2.996-.017 1.128-.004 2.26-.007 3.39.025.227-.167.38-.253.568-.512.928-.287 2.192.535 2.867.209.144.248.407.324.633a9.148 9.148 0 001.704 3.051v1.256a3.783 3.783 0 01-3.782 3.783H8.674S5.246 30.751 3 35.479v1.892a1.89 1.89 0 001.891 1.89h26.48a1.89 1.89 0 001.891-1.89v-1.892c-2.246-4.728-5.674-5.674-5.674-5.674z' mask='url(%23b)' opacity='.18'/%3E%3C/g%3E%3C/svg%3E");
  }
  .assistant-info .assistant-text {
    margin-left: 12px;
    font-weight: 300;
  }
  .text-size-15 {
    font-size: 15px;
  }
  .text-size-13 {
    font-size: 15px;
  }
  .text-white {
    color: #fff;
  }
  .text-white-50 {
    color: rgba(255, 255, 255, 0.5);
  }
</style>

<Page>
  {#if _data}
    <Nav>
      <div class="assistant-info">
        {#if _user}
          <div class="assistant-avatar" style="background-image: url({_user.avatar})"/>
          <div class="assistant-text">
            <div class="text-white text-size-15">{_user.name}</div>
            {#if _user.title && _user.title.trim()}
              <div class="text-white-50 text-size-13">{_user.title}</div>
            {/if}
          </div>
        {/if}
        {#if !_user}
          <div class="assistant-text">
            <div class="text-white text-size-15">
              开始聊天将自动为您分配客服
            </div>
            <div class="text-white-50 text-size-13">客服当前在线</div>
          </div>
        {/if}
      </div>
    </Nav>

    <main bind:this={main} on:scroll={handleScroll}>
      {#if isLoading}
        <Spinner />
      {/if}
      {#each _chats as chat (chat.id)}
        <article class:visitor={chat.sender_type_text === 'visitor'}>
          <div class="message-container">
            <div class="meta">
              <!--
            <span class="time">
              {format(new Date(chat.created_at), 'yyyy-MM-dd HH:mm:ss')}
            </span>
            -->
              {#if chat.sender_type_text === 'user'}
                <span class="user">{chat.sender.name}</span>
              {/if}
            </div>
            <div>
              {#if chat.sender_type_text === 'user'}
                <div class="avatar">
                  <img src={chat.sender.avatar} alt="" />
                </div>
              {/if}
              {#if chat.type == 1}
                <div
                  class="msg"
                  style="background-color: {chat.user !== $user && toHSL(chat.user)}">
                  {chat.content}
                </div>
              {/if}
              {#if chat.type == 2}
                <img src={chat.content} class="msg msg-image" alt="" />
              {/if}
            </div>
          </div>
        </article>
      {/each}

      {#if typing}
      <article class="svelte-1wx9mm9">
        <div class="message-container svelte-1wx9mm9">
          <div class="meta svelte-1wx9mm9">
            <span class="user svelte-1wx9mm9">{typingUser.name}</span>
          </div>
          <div>
            <div class="avatar svelte-1wx9mm9">
              <img src={typingUser.avatar} alt="" class="svelte-1wx9mm9">
            </div>
            <div class="msg" style="padding: 0">
              <svg xml:space="preserve" viewBox="0 0 100 100" y="0" x="0" xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" style="height: 60px; width: 70px; background: none; shape-rendering: auto; margin: -6px 0 -23px 0;">
                <g class="ldl-scale" style="transform-origin: 50% 50%; transform: rotate(0deg) scale(0.6, 0.6);">
                  <g class="ldl-ani">
                    <g class="ldl-layer">
                      <g class="ldl-ani" style="transform-origin: 50px 50px; transform: matrix(1, 0, 0, 1, 0, 0); animation: 1.23457s linear -0.823045s infinite normal forwards running bounce-8f">
                        <circle fill="#666666" r="10" cy="50" cx="20"></circle>
                      </g>
                    </g>
                    <g class="ldl-layer">
                      <g class="ldl-ani" style="transform-origin: 50px 50px; transform: matrix(1, 0, 0, 1, 0, 0); animation: 1.23457s linear -1.02881s infinite normal forwards running bounce-8f">
                        <circle fill="#999999" r="10" cy="50" cx="50"></circle>
                      </g>
                    </g>
                    <g class="ldl-layer">
                      <g class="ldl-ani" style="transform-origin: 50px 50px; transform: matrix(1, 0, 0, 1, 0, 0); animation: 1.23457s linear -1.23457s infinite normal forwards running bounce-8f">
                        <circle fill="#cccccc" r="10" cy="50" cx="80"></circle>
                      </g>
                    </g>
                  </g>
                </g>
                <style id="bounce-8f">
                @keyframes bounce-8f{
                  0% {
                    animation-timing-function: cubic-bezier(0.1361,0.2514,0.2175,0.8786);
                    transform: translate(0,0px) scaleY(1);
                  }
                  37% {
                    animation-timing-function: cubic-bezier(0.7674,0.1844,0.8382,0.7157);
                    transform: translate(0,-20px) scaleY(1);
                  }
                  72% {
                    animation-timing-function: cubic-bezier(0.1118,0.2149,0.2172,0.941);
                    transform: translate(0,0px) scaleY(1);
                  }
                  87% {
                    animation-timing-function: cubic-bezier(0.7494,0.2259,0.8209,0.6963);
                    transform: translate(0,10px) scaleY(0.602);
                  }
                  100% {
                    transform: translate(0,0px) scaleY(1);
                  }
                }
                </style>
              </svg>
            </div>
          </div>
        </div>
      </article>
      {/if}
    </main>

    <MessageInput
      {textareaClass}
      {visitor}
      {socket}
      {init}
      {_chats}
      on:message={(e) => {
        console.log(e)
        handleNewMessage(e.detail);
        scrollToBottom();
      }} />

    {#if showScrollToBottom}
      <ScrollToBottom onScroll={scrollToBottom} />
    {/if}
  {/if}
</Page>
