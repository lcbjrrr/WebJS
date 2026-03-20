<template>
  <div class="paper-update">
    <h1>📄 Update Paper Details</h1>

    <div v-if="error" class="alert error">
      <p>{{ error }}</p>
    </div>

    <!-- Main Update Form -->
    <form v-if="paper.paperId" @submit.prevent="updatePaper">
      <input type="hidden" v-model="paper.paperId" />

      <p>
        <label for="title">Title:</label><br />
        <input type="text" id="title" v-model="paper.title" required />
      </p>
      
      <p>
        <label for="year">Year:</label><br />
        <input type="number" id="year" v-model="paper.year" />
      </p>
      
      <p>
        <button type="submit">Update Paper</button>
      </p>
    </form>
    
    <div v-else-if="!error">
      <p>Loading paper details...</p>
    </div>

    <!-- Add/Remove Authors Section -->
    <div v-if="paper.paperId" class="authors-section">
      <hr />
      <h2>Authors of this Paper</h2>
      
      <ul>
        <li v-for="author in paper.authors" :key="author.authorId">
          {{ author.name }} ({{ author.affiliation }})
          <button @click.prevent="removeAuthor(author.authorId)">Remove</button>
        </li>
        <li v-if="!paper.authors || paper.authors.length === 0">No authors assigned.</li>
      </ul>

      <h3>Add an Author</h3>
      <select v-model="selectedAuthorId">
        <option disabled value="">Please select one</option>
        <option v-for="a in allAuthors" :key="a.authorId" :value="a.authorId">
          {{ a.name }}
        </option>
      </select>
      <button @click.prevent="addAuthor" :disabled="!selectedAuthorId">Add Author</button>
    </div>

    <p>
      <router-link to="/papers/list">🔙 Back to Paper List</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const API_BASE_URL = 'http://localhost:8080/papers';
// const API_BASE_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/papers';
//const AUTHORS_API_URL = 'http://localhost:8080/authors';
const AUTHORS_API_URL = 'http://localhost:8080/authors';

const paper = ref({
  paperId: null,
  title: '',
  year: '',
  authors: [],
});
const error = ref('');
const allAuthors = ref([]);
const selectedAuthorId = ref('');

// --- 1. Fetch data to pre-load the form ---
const fetchPaperDetails = async () => {
  const idFromUrl = route.params.paperId; 
  try {
    const response = await fetch(`${API_BASE_URL}/${idFromUrl}`);
    if (!response.ok) throw new Error('Could not find that paper.');
    
    const data = await response.json();
    paper.value = data; 
  } catch (e) {
    error.value = "Error pre-loading paper: " + e.message;
  }
};

const fetchAllAuthors = async () => {
  try {
    const response = await fetch(AUTHORS_API_URL);
    if (!response.ok) throw new Error('Could not fetch authors.');
    allAuthors.value = await response.json();
  } catch (e) {
    console.error(e);
  }
};

// --- 2. Submit the updated data ---
const updatePaper = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/${paper.value.paperId}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paper.value), 
    });

    if (!response.ok) throw new Error('Failed to update paper.');

    router.push({ 
      path: '/papers/list', 
      query: { message: 'Paper updated successfully!' } 
    });
  } catch (e) {
    error.value = "Error saving: " + e.message;
  }
};

// --- 3. Manage associations ---
const removeAuthor = async (authorId) => {
  try {
    // Assuming backend endpoint for removing association
    const response = await fetch(`${API_BASE_URL}/${paper.value.paperId}/authors/${authorId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove author from paper.');
    await fetchPaperDetails(); // refresh details
  } catch (e) {
    alert(e.message);
  }
};

const addAuthor = async () => {
  if (!selectedAuthorId.value) return;
  try {
    // Assuming backend endpoint for adding association
    const response = await fetch(`${API_BASE_URL}/${paper.value.paperId}/authors/${selectedAuthorId.value}`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to add author to paper.');
    selectedAuthorId.value = ''; // reset selection
    await fetchPaperDetails(); // refresh details
  } catch (e) {
    alert(e.message);
  }
};

onMounted(() => {
  fetchPaperDetails();
  fetchAllAuthors();
});
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
.authors-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
