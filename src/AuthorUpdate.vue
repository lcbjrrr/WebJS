<template>
  <div class="author-update">
    <h1>🖋️ Update Author Details</h1>

    <div v-if="error" class="alert error">
      <p>{{ error }}</p>
    </div>

    <form v-if="author.authorId" @submit.prevent="updateAuthor">
      <input type="hidden" v-model="author.authorId" />

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
      
      <p>
        <button type="submit">Update Author</button>
      </p>
    </form>
    
    <div v-else-if="!error">
      <p>Loading author details...</p>
    </div>

    <!-- Add/Remove Papers Section -->
    <div v-if="author.authorId" class="papers-section">
      <hr />
      <h2>Papers of this Author</h2>
      
      <ul>
        <li v-for="paper in author.papers" :key="paper.paperId">
          {{ paper.title }} ({{ paper.year }})
          <button @click.prevent="removePaper(paper.paperId)">Remove</button>
        </li>
      </ul>
      <p v-if="!author.papers || author.papers.length === 0">No papers assigned.</p>

      <h3>Add a Paper</h3>
      <select v-model="selectedPaperId">
        <option disabled value="">Please select one</option>
        <option v-for="p in allPapers" :key="p.paperId" :value="p.paperId">
          {{ p.title }}
        </option>
      </select>
      <button @click.prevent="addPaper" :disabled="!selectedPaperId">Add Paper</button>
    </div>

    <p>
      <router-link to="/authors/list">🔙 Back to Author List</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();
const API_BASE_URL = 'http://localhost:8080/authors';
//const API_BASE_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/authors';



const author = ref({
  authorId: null,
  name: '',
  affiliation: '',
  email: '',
  papers: [],
});
const error = ref('');
const allPapers = ref([]);
const selectedPaperId = ref('');



const PAPERS_API_URL = 'http://localhost:8080/papers';
//const PAPERS_API_URL = 'https://restpapers-870ea9b4e95c.herokuapp.com/papers';


// --- 1. Fetch data to pre-load the form ---
const fetchAuthorDetails = async () => {
  const idFromUrl = route.params.authorId; 
  try {
    const response = await fetch(`${API_BASE_URL}/${idFromUrl}`);
    if (!response.ok) throw new Error('Could not find that author.');
    
    const data = await response.json();
    author.value = data; 
  } catch (e) {
    error.value = "Error pre-loading: " + e.message;
  }
};

// --- 2. Submit the updated data ---
const updateAuthor = async () => {
  try {
    // FIX: Using author.value.authorId instead of idFromUrl
    const response = await fetch(`${API_BASE_URL}/${author.value.authorId}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(author.value), 
    });

    if (!response.ok) throw new Error('Failed to update author.');

    router.push({ 
      path: '/authors/list', 
      query: { message: 'Author updated successfully!' } 
    });
  } catch (e) {
    error.value = "Error saving: " + e.message;
  }
};

onMounted(() => {
  fetchAuthorDetails();
  fetchAllPapers();
});

const fetchAllPapers = async () => {
  try {
    const response = await fetch(PAPERS_API_URL);
    if (!response.ok) throw new Error('Could not fetch papers.');
    allPapers.value = await response.json();
  } catch (e) {
    console.error(e);
  }
};

const removePaper = async (paperId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${author.value.authorId}/papers/${paperId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove paper.');
    await fetchAuthorDetails();
  } catch (e) {
    alert(e.message);
  }
};

const addPaper = async () => {
  if (!selectedPaperId.value) return;
  try {
    const response = await fetch(`${API_BASE_URL}/${author.value.authorId}/papers/${selectedPaperId.value}`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to add paper.');
    selectedPaperId.value = '';
    await fetchAuthorDetails();
  } catch (e) {
    alert(e.message);
  }
};
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
.papers-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>