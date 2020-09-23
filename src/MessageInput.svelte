<script>
  import Input from "./ui/Input.svelte";
  import request from "./request";
  let msgInput;

  function sendMessage() {
    const id = localStorage.getItem("conversation_id");
    if (id) {
      const { data } = request({
        url: `api/conversation/${id}/send-message`,
        method: "POST",
        data: { type: 1, content: msgInput },
      });
      //console.log(data);
    }
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
</style>

<div>
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
      ariaLabel="输入您的消息" />
  </form>
</div>
