<script>
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let ariaLabelledBy = null;
  export let ariaLabel = null;
  export let placeholder = null;
  export let value = "";
  export let name = null;
  export let maxLength = 160;
  export let maxRows = 1;
  export let multiline = false;

  // TODO: kinda hacky, on desktop it's more that 40, but calculating chars per line is hard
  // FIX: something along the lines of this: https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/TextareaAutosize/TextareaAutosize.js
  const CHARS_PER_LINE = 40;

  function calcRows(v) {
    let textRows = Math.floor(v.length / CHARS_PER_LINE) + 1;
    const numberOfReturns = (v.match(/\n/g) || []).length;
    textRows += numberOfReturns;
    return Math.min(maxRows, textRows);
  }

  $: rows = Math.max(2, calcRows(value));

  function handleKeyPress(e) {
    if (e.which === 13 && !e.shiftKey) {
      // simulate actual submit event when user pressed return
      // but not on 'soft return'
      e.target.form.dispatchEvent(
        new Event("submit", {
          cancelable: true,
        })
      );
      e.preventDefault();
    }
  }
</script>

<style>
  .input-with-button {
    position: relative;
  }

  .input {
    padding: 0.6em 0 0.6em 0;
    width: 100%;
    resize: none;
    /* fix for firefox showing two rows, see: 
        https://stackoverflow.com/questions/7695945/height-of-textarea-does-not-match-the-rows-in-firefox */
    overflow-x: hidden;
    border: 0;
  }

  .input:disabled {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==)
      repeat;
    cursor: not-allowed;
  }

  .input:focus {
    outline: none;
  }

  .submit {
    position: absolute;
    top: 0.4em;
    right: 0em;
    width: 34px;
    height: 34px;
    background: no-repeat 50% 50% url(/up.svg);
    background-size: 0.75em;
    border: none;
    border-radius: 50%;
    background-color: #0074d9;
    text-indent: -9999px;
    cursor: pointer;
  }
  .btn-emoji, .btn-file {
    width: 24px;
    height: 24px;
    display: inline-block;
  }
  .btn-emoji {
    background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%0A%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%20transform%3D%22translate(3%204)%22%3E%0A%20%20%20%20%3Ccircle%20cx%3D%228.5%22%20cy%3D%228.5%22%20r%3D%229.3%22%20stroke%3D%22%23a3aab5%22%20stroke-width%3D%221.6%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%225.375%22%20cy%3D%226.375%22%20r%3D%221.375%22%20fill%3D%22%23a3aab5%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2211.875%22%20cy%3D%226.375%22%20r%3D%221.375%22%20fill%3D%22%23a3aab5%22%20transform%3D%22matrix(-1%200%200%201%2023.75%200)%22%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22%23a3aab5%22%20stroke-linecap%3D%22round%22%20stroke-width%3D%221.6%22%20d%3D%22M4.25%2010.5S4.5%2013%208.5%2013s4.25-2.5%204.25-2.5%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E');
  }
  .btn-file {
    background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%0A%20%20%20%20%3Cpath%20fill%3D%22%23a3aab5%22%20fill-rule%3D%22nonzero%22%20d%3D%22M16.5%208v9.5c0%202.21-1.79%204-4%204s-4-1.79-4-4V7a2.5%202.5%200%200%201%205%200v8.5c0%20.55-.45%201-1%201s-1-.45-1-1V8H10v7.5a2.5%202.5%200%200%200%205%200V7c0-2.21-1.79-4-4-4S7%204.79%207%207v10.5c0%203.04%202.46%205.5%205.5%205.5s5.5-2.46%205.5-5.5V8h-1.5z%22%2F%3E%0A%3C%2Fsvg%3E%0A');
  }
</style>

<div class="input-with-button">
  {#if multiline}
    <textarea
      {rows}
      class="input"
      type="text"
      {maxLength}
      {name}
      bind:value
      on:keypress={handleKeyPress}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      {placeholder} />
  {:else}
    <input
      {rows}
      class="input"
      type="text"
      {maxLength}
      {name}
      bind:value
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      {placeholder} />
  {/if}
  <input class="submit" type="submit" value="Send" in:fade out:fade />
</div>

<div>
  <div class="btn-emoji" />
  <div class="btn-file" />
</div>