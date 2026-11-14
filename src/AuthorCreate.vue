<template>
<div class="author-create">
  <h1>➕ Create New Author</h1>

  <div v-if="error" class="alert error">
    <p>{{ error }}</p>
  </div>

  <form @submit.prevent="createAuthor" novalidate>
    <p>
      <label for="name">Name:</label><br />
      <input type="text" id="name" v-model="author.name" required />
    </p>
    <p>
      <label for="email">Email:</label><br />
      <input type="email" id="email" v-model="author.email" required
             :class="{ invalid: emailError }" @input="emailError = ''" />
      <br /><small v-if="emailError" class="field-error">{{ emailError }}</small>
    </p>
    <p>
      <label for="rank">Rank:</label><br />
      <select id="rank" v-model="author.rank" required>
        <option value="" disabled>-- Select a rank --</option>
        <option v-for="r in ranks" :key="r" :value="r">{{ r }}</option>
      </select>
    </p>
    <p><button type="submit">Save New Author</button></p>
  </form>

  <p>
    <router-link to="/authors/list">🔙 Back to Author List</router-link>
  </p>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rest-final-papers.onrender.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseResponse = async (response) => {
  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  if (!response.ok) {
    throw new Error((data && (data.message || data.error)) || text || response.statusText);
  }
  return data;
};

// --- State Definitions using ref ---
const router = useRouter();

// A ref holding an object (Vue automatically wraps it as a Proxy/reactive)
const author = ref({
name: '',
email: '',
rank: '',
});
const error = ref('');
const emailError = ref('');
const ranks = ref([]);

// Load the valid rank values (categorical domain) from the backend
const loadRanks = async () => {
try {
  const response = await fetch(`${API_BASE_URL}/authors/ranks`);
  ranks.value = await parseResponse(response);
} catch (e) {
  error.value = 'Error loading ranks: ' + e.message;
}
};

onMounted(loadRanks);

// --- Client-side validation (runs before submitting) ---
const validate = () => {
error.value = '';
emailError.value = '';
if (!author.value.name.trim()) {
  error.value = 'Name is required.';
  return false;
}
if (!EMAIL_REGEX.test(author.value.email.trim())) {
  emailError.value = 'Please enter a valid email address (e.g. name@example.com).';
  return false;
}
if (!author.value.rank) {
  error.value = 'Please select a rank.';
  return false;
}
return true;
};

// --- Functions ---
const createAuthor = async () => {
if (!validate()) return;
try {
  const response = await fetch(`${API_BASE_URL}/authors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(author.value),
  });
  await parseResponse(response);

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

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
.invalid { border: 2px solid red; }
.field-error { color: red; }
</style>
