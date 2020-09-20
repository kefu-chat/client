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
    border-top-right-radius: 30px;
    border-top-left-radius: 10px;
  }
  nav .dot {
    background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2240%22%20viewBox%3D%220%200%2032%2040%22%3E%0A%20%20%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20fill%3D%22%23006eff%22%20d%3D%22M0%200h9.02L32%2033.196V40H0z%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20fill%3D%22%2318C139%22%20d%3D%22M9%200c3.581.05%2023%205.426%2023%2033.08v.03C18.922%2030.751%209%2019.311%209%205.554V0z%22%2F%3E%0A%20%20%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A") no-repeat no-repeat;
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
