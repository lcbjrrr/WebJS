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

    <p>
      <router-link to="/authors/create">➕ Add New Author</router-link>
    </p>

    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Affiliation</th>
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
          <td>{{ author.affiliation }}</td>
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

// --- State Definitions using ref ---
const authors = ref([]);
const route = useRoute(); // Access the current route object

// Read flash message/error from query parameters on load
const message = ref(route.query.message || '');
const error = ref(route.query.error || '');

// Mock API path
const API_BASE_URL = 'http://localhost:8080/authors';
//const API_BASE_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/authors';

// --- Functions ---
const fetchAuthors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    console.log('OK');
    if (!response.ok) {
      console.log('ERROR.');
      throw new Error('Failed to fetch authors.');
    }
    // Update the ref's value property
    authors.value = await response.json();
    console.log(authors.value);
  } catch (e) {
    error.value = 'Error loading authors: ' + e.message;
  }
};

const deleteAuthor = async (authorId, authorName) => {
  if (confirm(`Are you sure you want to delete author '${authorName}'?`)) {
    try {
      console.log(`${API_BASE_URL}/${authorId}`);
      const response = await fetch(`${API_BASE_URL}/${authorId}`, {method: 'DELETE',});
      console.log(response);
      if (!response.ok) {
        throw new Error(`Deletion failed with status ${response.status}`);
      }

      // Clear messages and refresh list
      await fetchAuthors();
      message.value = `Author '${authorName}' deleted successfully!`;
      error.value = '';
    } catch (e) {
      error.value = 'Error deleting author: ' + e.message;
      message.value = '';
    }
  }
};

// --- Lifecycle Hook ---
// Equivalent to the 'created' hook in Options API


onMounted(() => {
  console.log('AuthorList component mounted.');
  fetchAuthors();
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