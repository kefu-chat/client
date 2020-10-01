<script>
  import Input from "./ui/Input.svelte";
  import request from "./request";
  export let visitor;
  export let socket;
  export let _chats;
  export let textareaClass;
  let msgInput;

  function whisper(message) {
    socket.whisper("message", message);
  }

  function sendMessage() {
    const id = localStorage.getItem("conversation_id");
    const msg = msgInput;
    if (id) {
      request({
        url: `api/conversation/${id}/send-message`,
        method: "POST",
        data: { type: 1, content: msg },
      }).then(({success, data}) => {
        if (!success) {
          return;
        }

        const message = {
          type: 1,
          content: msg,
          id: parseInt((Math.random()*9999999).toString()).toString(),
          sender_id: visitor.id,
          sender_type: 'App\\Models\\Visitor',
          sender_type_text: 'visitor',
          sender: visitor,
          created_at: (new Date()).toISOString(),
          updated_at: (new Date()).toISOString(),
        };

        whisper(message);
        _chats.push(message);
      });
    }
  }

  $: {
    socket;
  }
</script>

<style>
  div {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  form.msg-send-form {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    max-width: 640px;
    background-color: white;
    padding: 0.25em 1em;
    border-top: 1px solid #d8dee3;
  }

  .disabled, .disabled form {
    background-color: #eee;
    height: 94px;
    padding: 15px;
    border-top: 1px solid #ccc;
  }

  .disabled .tips {
    font-size: 14px;
    position: relative;
  }
</style>

<div class="{textareaClass}">
  {#if textareaClass !='disabled'}
    <form
      class="msg-send-form"
      autocomplete="off"
      on:submit|preventDefault={(e) => {
        if (!msgInput || !msgInput.trim()) return;
        sendMessage();
        msgInput = '';
        e.target.msg.focus();
      }}>
      <Input
        multiline
        maxRows={3}
        bind:value={msgInput}
        name="msg"
        placeholder="输入您的消息"
        ariaLabel="输入您的消息"
        {socket}
        />
    </form>
  {/if}
  {#if textareaClass == 'disabled'}
    <div class="tips">本次服务已结束, 若您仍有需要咨询的问题, 欢迎再次<a href="">发起咨询</a>.</div>
  {/if}
</div>
