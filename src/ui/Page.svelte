<script>
  import { fade } from "svelte/transition";
</script>

<div class="animation" in:fade out:fade>
  <div class="container">
    <slot />
  </div>
</div>

<style>
  .animation {
    position: absolute;
    height: 100%;
    width: 100vw;
  }
  .container {
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    max-width: 640px;
    background-color: white;
    border-top-right-radius: 30px;
    border-top-left-radius: 10px;
    overflow: hidden;
  }
  @media (max-width: 768px) {
    .container {
      border-top-right-radius: 0;
      border-top-left-radius: 0;
    }
  }
</style>
