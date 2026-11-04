<script setup lang="ts">
import "@johnmorrisdotca/kotoba/element/define";

withDefaults(defineProps<{ words?: string; letters?: number }>(), { words: "en", letters: 5 });
</script>

<template>
  <kotoba-game :words="words" :letters="letters" daily="today"></kotoba-game>
</template>
