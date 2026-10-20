<template>
<div class="author-create">
  <h1>➕ Create New Author</h1>

  <div v-if="error" class="alert error">
    <p>{{ error }}</p>
  </div>

  <form @submit.prevent="createAuthor">
    <p>
      <label for="name">Name:</label><br />
      <input type="text" id="name" v-model="author.name" required />
    </p>
    <p>
      <label for="email">Email:</label><br />
      <input type="email" id="email" v-model="author.email" required />
    </p>
    <p><button type="submit">Save New Author</button></p>
  </form>

  <p>
    <router-link to="/authors/list">🔙 Back to Author List</router-link>
  </p>
</div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { request } from './api.js';

// --- State Definitions using ref ---
const router = useRouter();

// A ref holding an object (Vue automatically wraps it as a Proxy/reactive)
const author = ref({
name: '',
email: '',
});
const error = ref('');

// --- Functions ---
const createAuthor = async () => {
try {
  await request('/authors', { method: 'POST', body: author.value });

  // Redirect on success, using query parameters for the message
  router.push({
    path: '/authors/list',
    query: {
      message: `Author '${author.value.name}' created successfully!`,
    },
  });
} catch (e) {
  error.value = 'Error creating author: ' + e.message;
}
};
</script>



