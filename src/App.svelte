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
        unique_id: parseInt(Math.random()*9999999).toString(),
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
    <Nav>
      <div class="assistant-info">
        <div class="assistant-avatar"/>
        <div class="assistant-text">
          <div class="text-white text-size-15">客服名字</div>
          <div class="text-white-50 text-size-13">Customer Support</div>
        </div>
      </div>
    </Nav>
    <Messages />
  {/if}
</Page>

<style>
  .assistant-info {
    padding: 14px;
  }
  .assistant-info .assistant-avatar, .assistant-info .assistant-text {
    display: inline-block;
    vertical-align: middle;
  }
  .assistant-info .assistant-avatar {
    width: 40px;
    height: 40px;
    float: none;
    border-radius: 20px!important;
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