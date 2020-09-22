<script>
  import { createEventDispatcher } from "svelte";
  export let showBack = false;
  export let backText = null;
  const dispatch = createEventDispatcher();
</script>

<nav>
  {#if showBack}
    <button on:click={() => dispatch('back')}>
      <svg
        height="40"
        width="40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M13.7 15.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4
          1.4L10.42 12l3.3 3.3z"
        />
      </svg>
      {#if backText}
        <span>{backText}</span>
      {/if}
    </button>
  {/if}
  <div>
    <slot />
  </div>
  <div class="dot"/>
</nav>

<style>
  nav {
    position: -webkit-sticky;
    position: sticky;
    z-index: 10;
    top: 0;
    margin: 0;
    display: flex;
    background: linear-gradient(95deg, rgb(0, 33, 163) 20%, rgb(0, 110, 255) 80%);
    color: #fff;
    height: 70px;
  }
  nav .dot {
    background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDMyIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxOEMxMzkiIGQ9Ik05IDBjMy41ODEuMDUgMjMgNS40MjYgMjMgMzMuMDh2LjAzQzE4LjkyMiAzMC43NTEgOSAxOS4zMTEgOSA1LjU1NFYweiIvPjwvZz48L3N2Zz4=") no-repeat no-repeat;
    width: 32px;
    height: 40px;
    position: absolute;
    right: 0;
  }
  button {
    display: flex;
    position: absolute;
    left: 0.5em;
    top: 0.37em;
    border: none;
    background-color: white;
    align-items: center;
    padding: 0;
    color: #0074d9;
  }
  button:hover {
    transition: 0.75s cubic-bezier(0, 1.2, 0.2, 1.5);
    transform: scale(1.1);
  }

  span {
    margin: 0 0 0 -1em;
    font-size: 0.8em;
  }
</style>
