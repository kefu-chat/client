<script>
  import { nav, user } from "./stores.js";
  import Messages from "./Messages.svelte";
  import Nav from "./ui/Nav.svelte";
  import Page from "./ui/Page.svelte";
  import Footer from "./Footer.svelte";
  import { onMount } from "svelte";
  import request from "./request";
  export let _data = null;
  onMount(async () => {
    // $nav = "messages";
    const { data } = await request({
      url: `api/visitor/init`,
      method: "POST",
      data: {
        institution_id: "rxpXD6uDD0EJqvbD",
        unique_id: "123456",
        userAgent: navigator.userAgent,
        languages: navigator.languages,
        url: location.href,
        title: document.title,
        name: "visitor001",
      },
    });
    localStorage.setItem("visitor_token", data.visitor_token);
    localStorage.setItem("conversation_id", data.conversation.id);
    _data = data;
  });
</script>

<Page>
  {#if _data}
    <Nav>Messages</Nav>
    <Messages />
  {/if}
</Page>
