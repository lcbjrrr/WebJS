<script setup>
import { ref, onMounted } from 'vue'
 
const currentDate = ref('')

onMounted(() => {
  currentDate.value = new Date().toLocaleDateString()
})
</script>

<template>
  <h1>Hello {{ currentDate }}</h1>
  <p>...
  </p>
</template>