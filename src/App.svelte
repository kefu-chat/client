<script>
  import { nav, user } from "./stores.js";
  import Messages from "./Messages.svelte";
  import Nav from "./ui/Nav.svelte";
  import Page from "./ui/Page.svelte";
  import Footer from "./Footer.svelte";
  import { onMount } from "svelte";
  import request from "./request";

  onMount(async () => {
    // $nav = "messages";
    const { data } = await request({
      url: `api/visitor/init`,
      method: "POST",
      data: {
        institution_id: 1,
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
  });
</script>

<Page>
  <Nav>Messages</Nav>
  <Messages />
</Page>
