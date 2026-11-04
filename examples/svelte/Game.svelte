<script lang="ts">
  import "@johnmorrisdotca/kotoba/element/define";

  let { words = "en", letters = 5 }: { words?: string; letters?: number } = $props();
</script>

<kotoba-game {words} {letters} daily="today"></kotoba-game>
