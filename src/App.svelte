<script>
  import { nav, user } from "./stores.js";
  import Messages from "./Messages.svelte";
  import Nav from "./ui/Nav.svelte";
  import Page from "./ui/Page.svelte";
  import Footer from "./Footer.svelte";
  import { onMount } from "svelte";
  onMount(async () => {
    $user = "Amazing";
    $nav = "messages";
  });
</script>

<Page>
  <Nav>Messages</Nav>
  <Messages />
</Page>
