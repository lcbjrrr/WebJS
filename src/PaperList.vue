<template>
  <div class="paper-list">
    <h1>📄 Paper Management</h1>

    <div v-if="message" class="alert success">
      <p>{{ message }}</p>
    </div>
    <div v-if="error" class="alert error">
      <p>{{ error }}</p>
    </div>

    <h2>Current Papers ({{ papers.length }})</h2>

    <p>
      <router-link to="/papers/create">➕ Add New Paper</router-link>
    </p>

    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Year</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>    
        <tr v-for="paper in papers" :key="paper.paperId">
          <td>{{ paper.paperId }}</td>
          <td>
            <router-link :to="{ name: 'PaperUpdate', params: { paperId: paper.paperId } }">
              {{ paper.title }}
            </router-link>
          </td>
          <td>{{ paper.year }}</td>
          <td>
            <button @click="deletePaper(paper.paperId, paper.title)">Delete</button>
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
const papers = ref([]);
const route = useRoute(); // Access the current route object

// Read flash message/error from query parameters on load
const message = ref(route.query.message || '');
const error = ref(route.query.error || '');
const API_BASE_URL = 'http://localhost:8080/papers';
//const API_BASE_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/papers';

// --- Functions ---
const fetchPapers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    console.log('OK');
    if (!response.ok) {
      console.log('ERROR.');
      throw new Error('Failed to fetch papers.');
    }
    papers.value = await response.json();
    console.log(papers.value);
  } catch (e) {
    error.value = 'Error loading papers: ' + e.message;
  }
};

const deletePaper = async (paperId, title) => {
  if (confirm(`Are you sure you want to delete paper '${title}'?`)) {
    try {
      const response = await fetch(`${API_BASE_URL}/${paperId}`, {method: 'DELETE',});
      if (!response.ok) {
        throw new Error(`Deletion failed with status ${response.status}`);
      }

      // Clear messages and refresh list
      await fetchPapers();
      message.value = `Paper '${title}' deleted successfully!`;
      error.value = '';
    } catch (e) {
      error.value = 'Error deleting paper: ' + e.message;
      message.value = '';
    }
  }
};

onMounted(() => {
  console.log('PaperList component mounted.');
  fetchPapers();
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
