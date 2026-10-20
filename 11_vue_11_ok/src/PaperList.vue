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

  <p v-if="loading">Loading papers...</p>

  <p>
    <router-link to="/papers/create">➕ Add New Paper</router-link>
  </p>

  <table border="1">
    <thead>
      <tr>
        <th>ID</th>
        <th>Entry ID</th>
        <th>Title</th>
        <th>Abstract</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="paper in papers" :key="paper.paperId">
        <td>{{ paper.paperId }}</td>
        <td>{{ paper.entryId }}</td>
        <td>
          <router-link :to="{ name: 'PaperUpdate', params: { paperId: paper.paperId } }">
            {{ paper.title }}
          </router-link>
        </td>
        <td>{{ paper.abstract }}</td>
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
const papers = ref([]);
const loading = ref(false);

// Load the list from the REST API
const loadPapers = async () => {
loading.value = true;
try {
  const response = await fetch(`${API_BASE_URL}/papers`);
  if (!response.ok) throw new Error(await getErrorMessage(response));
  papers.value = await response.json();
} catch (e) {
  error.value = 'Error loading papers: ' + e.message;
} finally {
  loading.value = false;
}
};

// --- Functions ---
const deletePaper = async (paperId, paperTitle) => {
if (confirm(`Are you sure you want to delete paper '${paperTitle}'?`)) {
  try {
    const response = await fetch(`${API_BASE_URL}/papers/${paperId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    await loadPapers();
    message.value = `Paper '${paperTitle}' deleted successfully!`;
    error.value = '';
  } catch (e) {
    error.value = 'Error deleting paper: ' + e.message;
    message.value = '';
  }
}
};

onMounted(() => {
loadPapers();
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


