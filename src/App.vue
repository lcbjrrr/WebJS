<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/authors/list">Authors</router-link> |
      <router-link to="/">Home</router-link>
    </nav>
    <hr />

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>
