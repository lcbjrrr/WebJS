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
        <label for="affiliation">Affiliation:</label><br />
        <input type="text" id="affiliation" v-model="author.affiliation" />
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

// --- State Definitions using ref ---
const router = useRouter();
const API_BASE_URL = 'http://localhost:8080/authors';
//const API_BASE_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/authors';

// A ref holding an object (Vue automatically wraps it as a Proxy/reactive)
const author = ref({
  name: '',
  affiliation: '',
  email: '',
});
const error = ref('');

// --- Functions ---
const createAuthor = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Accessing the object's value property for JSON serialization
      body: JSON.stringify(author.value),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || 'Failed to create author.');
    }

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