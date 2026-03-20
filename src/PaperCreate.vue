<template>
  <div class="paper-create">
    <h1>➕ Create New Paper</h1>

    <div v-if="error" class="alert error">
      <p>{{ error }}</p>
    </div>

    <form @submit.prevent="createPaper">
      <p>
        <label for="title">Title:</label><br />
        <input type="text" id="title" v-model="paper.title" required />
      </p>
      <p>
        <label for="year">Year:</label><br />
        <input type="number" id="year" v-model="paper.year" />
      </p>
      <p><button type="submit">Save New Paper</button></p>
    </form>

    <p>
      <router-link to="/papers/list">🔙 Back to Paper List</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// --- State Definitions using ref ---
const router = useRouter();
const API_BASE_URL = 'http://localhost:8080/papers';

//const API_BASE_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/papers';

// A ref holding an object (Vue automatically wraps it as a Proxy/reactive)
const paper = ref({
  title: '',
  year: new Date().getFullYear(),
});
const error = ref('');

// --- Functions ---
const createPaper = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Accessing the object's value property for JSON serialization
      body: JSON.stringify(paper.value),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || 'Failed to create paper.');
    }

    // Redirect on success, using query parameters for the message
    router.push({
      path: '/papers/list',
      query: {
        message: `Paper '${paper.value.title}' created successfully!`,
      },
    });
  } catch (e) {
    error.value = 'Error creating paper: ' + e.message;
  }
};
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
</style>
