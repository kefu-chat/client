<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { user } from "./stores.js";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { toHSL } from "./toHSL.js";
  import format from "date-fns/format";

  // const dispatch = createEventDispatcher();

  export let chats;

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
    line-height: 1.8;
    padding: 0.4em 1em;
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
  }

  .visitor {
    text-align: right;
  }

  .user {
    color: #9fabb7
  }

  .msg:hover button {
    opacity: 1;
  }

  button.delete {
    position: absolute;
    top: 0;
    left: -2em;
    width: 2em;
    height: 100%;
    background: no-repeat 50% 50% url(/trash.svg);
    background-size: 1.4em 1.4em;
    border: none;
    opacity: 0;
    transition: opacity 0.2s;
    text-indent: -9999px;
    cursor: pointer;
  }
  .avatar {
    width: 32px;
    height: 32px;
    display: inline-block;
    vertical-align: bottom;
    margin-right: 2px;
  }

  .avatar img {
    background: #ccc;
    border-radius: 16px;
    width: 32px;
    height: 32px;
  }

  .message-container {
    display: inline-block;
    vertical-align: bottom;
  }
</style>

{#each chats as chat (chat.id)}
  <article class:visitor={chat.sender_type_text === 'visitor'}>
    {#if chat.sender_type_text === 'user'}
      <div class="avatar">
        <img src="{chat.sender.avatar}"/>
      </div>
    {/if}
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
      <div
        class="msg"
        style="background-color: {chat.user !== $user && toHSL(chat.user)}">
        {chat.content}
      </div>
    </div>
  </article>
{/each}
