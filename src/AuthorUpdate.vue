<template> 
 <div class="author-update"> 
   <h1>🖋️ Update Author Details</h1>

   <div v-if="error" class="alert error">
     <p>{{ error }}</p>
   </div>

   <form v-if="author.authorId" @submit.prevent="updateAuthor" novalidate>
     <input type="hidden" v-model="author.authorId" />

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

     <p>
       <button type="submit">Update Author</button>
     </p>
   </form>

   <div v-if="author.authorId" class="links">
     <h2>📄 Papers by this Author ({{ authorPapers.length }})</h2>

     <div v-if="message" class="alert success">
       <p>{{ message }}</p>
     </div>

     <ul>
       <li v-for="paper in authorPapers" :key="paper.paperId">
         {{ paper.title }} ({{ paper.entryId }})
         <button @click="removePaper(paper)">Remove</button>
       </li>
       <li v-if="authorPapers.length === 0">No papers linked yet.</li>
     </ul>

     <p>
       <select v-model="selectedPaperId">
         <option value="">-- Select a paper --</option>
         <option v-for="paper in availablePapers" :key="paper.paperId" :value="paper.paperId">
           {{ paper.title }}
         </option>
       </select>
       <button @click="addPaper" :disabled="!selectedPaperId">Add Paper</button>
     </p>
   </div>

   <div v-else-if="!error">
     <p>Loading author details...</p>
   </div>

   <p>
     <router-link to="/authors/list">🔙 Back to Author List</router-link>
   </p>
 </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const route = useRoute();
const router = useRouter();

const author = ref({
 authorId: null,
 name: '',
 email: '',
 rank: '',
});
const error = ref('');
const emailError = ref('');
const ranks = ref([]);
const message = ref('');
const authorPapers = ref([]);
const allPapers = ref([]);
const selectedPaperId = ref('');

// Papers not yet linked to this author (options for the dropdown)
const availablePapers = computed(() =>
 allPapers.value.filter((p) => !authorPapers.value.some((ap) => ap.paperId === p.paperId))
);

// --- 1. Fetch data to pre-load the form ---
const fetchAuthorDetails = async () => {
 const idFromUrl = route.params.authorId;
 try {
   const response = await fetch(`${API_BASE_URL}/authors/${idFromUrl}`);
   const data = await parseResponse(response);
   if (!data) throw new Error('Could not find that author.');

   // Keep only the editable fields (the API also returns the author's papers)
   author.value = { authorId: data.authorId, name: data.name, email: data.email, rank: data.rank || '' };
   authorPapers.value = data.papers || [];
 } catch (e) {
   error.value = "Error pre-loading: " + e.message;
 }
};

// Reload only the linked papers (keeps unsaved edits in the form)
const refreshAuthorPapers = async () => {
 const response = await fetch(`${API_BASE_URL}/authors/${route.params.authorId}`);
 const data = await parseResponse(response);
 authorPapers.value = data.papers || [];
};

const fetchAllPapers = async () => {
 try {
   const response = await fetch(`${API_BASE_URL}/papers`);
   allPapers.value = await parseResponse(response);
 } catch (e) {
   error.value = "Error loading papers: " + e.message;
 }
};

// --- Link / unlink papers ---
const addPaper = async () => {
 const paper = allPapers.value.find((p) => p.paperId === selectedPaperId.value);
 try {
   const response = await fetch(`${API_BASE_URL}/authors/${author.value.authorId}/papers/${selectedPaperId.value}`, { method: 'PUT' });
   await parseResponse(response);
   await refreshAuthorPapers();
   selectedPaperId.value = '';
   message.value = `Paper '${paper?.title}' added to this author.`;
   error.value = '';
 } catch (e) {
   error.value = "Error adding paper: " + e.message;
   message.value = '';
 }
};

const removePaper = async (paper) => {
 if (!confirm(`Remove paper '${paper.title}' from this author?`)) return;
 try {
   const response = await fetch(`${API_BASE_URL}/authors/${author.value.authorId}/papers/${paper.paperId}`, { method: 'DELETE' });
   await parseResponse(response);
   await refreshAuthorPapers();
   message.value = `Paper '${paper.title}' removed from this author.`;
   error.value = '';
 } catch (e) {
   error.value = "Error removing paper: " + e.message;
   message.value = '';
 }
};

// Load the valid rank values (categorical domain) from the backend
const fetchRanks = async () => {
 try {
   const response = await fetch(`${API_BASE_URL}/authors/ranks`);
   ranks.value = await parseResponse(response);
 } catch (e) {
   error.value = "Error loading ranks: " + e.message;
 }
};

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

// --- 2. Submit the updated data ---
const updateAuthor = async () => {
 if (!validate()) return;
 try {
   const response = await fetch(`${API_BASE_URL}/authors/${author.value.authorId}`, {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(author.value),
   });
   await parseResponse(response);

   router.push({
     path: '/authors/list',
     query: { message: 'Author updated successfully!' }
   });
 } catch (e) {
   error.value = "Error saving: " + e.message;
 }
};

onMounted(() => {
 fetchRanks();
 fetchAuthorDetails();
 fetchAllPapers();
});
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
.success { color: green; border-color: green; }
.invalid { border: 2px solid red; }
.field-error { color: red; }
</style>

