<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";
  import { user } from "./stores.js";
  import ScrollToBottom from "./ScrollToBottom.svelte";
  import MessageInput from "./MessageInput.svelte";
  import MessageList from "./MessageList.svelte";
  import Spinner from "./ui/Spinner.svelte";
  import request from "./request";
  import Echo from "laravel-echo";

  const ADD_ON_SCROLL = 50; // messages to add when scrolling to the top
  let showMessages = 100; // initial messages to load

  let store = {};
  let chats = [];
  let autoscroll;
  let showScrollToBottom;
  let main;
  let isLoading = false;
  let timeout;
  let echo;

  $: {
    // isLoading = true;
    if (timeout) clearTimeout(timeout);
    // debounce update svelte store to avoid overloading ui
    timeout = setTimeout(() => {
      // convert key/value object to sorted array of messages (with a max length)
      // const arr = Object.values(store);
      // const sorted = arr.sort((a, b) => a.time - b.time);
      // const begin = Math.max(0, sorted.length - showMessages);
      // const end = arr.length;
      chats = chats;
      isLoading = false;
    }, 200);
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

  function handleNewMessage(msg) {
    const now = new Date().getTime();
    const message = { msg, user: $user, time: now };
  }

  onMount(async () => {
    const id = localStorage.getItem("conversation_id");
    if (id) {
      const token = localStorage.getItem("visitor_token");
      const channel = `conversation.${id}.messaging`;
      echo = new Echo({
        broadcaster: "socket.io",
        host: request.socketUrl,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      const { data } = await request({
        url: `api/conversation/${id}/messages`,
        method: "GET",
      });
      chats = data.messages;
      isLoading = false;
      echo
        .join(channel)
        .here()
        .joining()
        .leaving()
        .listen(".message.created", (e) => {
          chats.push(e);
        });
    }
  });

  beforeUpdate(() => {
    autoscroll =
      main && main.offsetHeight + main.scrollTop > main.scrollHeight - 50;
  });

  afterUpdate(() => {
    if (autoscroll) main.scrollTo(0, main.scrollHeight);
  });

  onDestroy(() => {
    // remove gun listeners
  });
</script>

<style>
  main {
    margin: auto 0 3em 0;
    padding: 0.5em 1em 0.5em 1em;
    overflow-y: auto;
  }
</style>

<main bind:this={main} on:scroll={handleScroll}>
  {#if isLoading}
    <Spinner />
  {/if}
  <MessageList {chats} />
</main>

<MessageInput
  on:message={(e) => {
    console.log(e);
    handleNewMessage(e.detail);
    scrollToBottom();
  }} />

{#if showScrollToBottom}
  <ScrollToBottom onScroll={scrollToBottom} />
{/if}
