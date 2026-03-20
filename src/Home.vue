<template>
  <div class="container">
    <h1>Welcome to the ACME Publication Manager</h1>
    <p>Please select a management area:</p>

    <div class="links">
      <router-link to="/authors/list">📚 Manage Authors</router-link>
      <router-link to="/papers/list">📰 Manage Research Papers</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style>
.container { max-width: 600px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; text-align:center; font-family: Arial, sans-serif; }
.links { margin-top:20px; display:flex; flex-direction:column; gap:12px; align-items:center; }
.links a { display:block; width: 260px; padding:15px; text-decoration:none; background:#007bff; color:#fff; border-radius:5px; font-size:1.05rem; text-align:center; }
.links a:hover{ background:#0056b3; }
</style>