<template>
<div class="author-list">
  <h1>📚 Author Management</h1>

  <div v-if="message" class="alert success">
    <p>{{ message }}</p>
  </div>
  <div v-if="error" class="alert error">
    <p>{{ error }}</p>
  </div>

  <h2>Current Authors ({{ authors.length }})</h2>

  <p v-if="loading">Loading authors...</p>

  <p>
    <router-link to="/authors/create">➕ Add New Author</router-link>
  </p>

  <table border="1">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>  
      <tr v-for="author in authors" :key="author.authorId">
        <td>{{ author.authorId }}</td>
        <td>
          <router-link :to="{ name: 'AuthorUpdate', params: { authorId: author.authorId } }">
            {{ author.name }}
          </router-link>
        </td>
        <td>{{ author.email }}</td>
        <td>
          <button @click="deleteAuthor(author.authorId, author.name)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const API_BASE_URL = 'https://rest-papers.onrender.com';
const getErrorMessage = async (response) => {
  const text = await response.text();
  try {
    const data = text ? JSON.parse(text) : null;
    return (data && (data.message || data.error)) || text || response.statusText;
  } catch {
    return text || response.statusText;
  }
};

// --- State Definitions using ref ---
const route = useRoute(); // Access the current route object

// Read flash message/error from query parameters on load
const message = ref(route.query.message || '');
const error = ref(route.query.error || '');
const authors = ref([]);
const loading = ref(false);

// Load the list from the REST API
const loadAuthors = async () => {
loading.value = true;
try {
  const response = await fetch(`${API_BASE_URL}/authors`);
  if (!response.ok) throw new Error(await getErrorMessage(response));
  authors.value = await response.json();
} catch (e) {
  error.value = 'Error loading authors: ' + e.message;
} finally {
  loading.value = false;
}
};

// --- Functions ---
const deleteAuthor = async (authorId, authorName) => {
if (confirm(`Are you sure you want to delete author '${authorName}'?`)) {
  try {
    const response = await fetch(`${API_BASE_URL}/authors/${authorId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    await loadAuthors();
    message.value = `Author '${authorName}' deleted successfully!`;
    error.value = '';
  } catch (e) {
    error.value = 'Error deleting author: ' + e.message;
    message.value = '';
  }
}
};

onMounted(() => {
loadAuthors();
});
</script>

<style scoped>
.alert {
padding: 10px;
border: 1px solid;
margin-bottom: 15px;
}
.success {
color: green;
border-color: green;
}
.error {
color: red;
border-color: red;
}
</style>


	
