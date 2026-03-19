<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="hello-container">
    <h1>Hello, {{ props.name }}!</h1>
    <p>Thanks for visiting this simple routed app.</p>
    <router-link to="/">Go back home</router-link>
  </div>
</template>

