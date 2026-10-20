<template>
 <div class="paper-update">
   <h1>🖋️ Update Paper Details</h1>

   <div v-if="error" class="alert error">
     <p>{{ error }}</p>
   </div>

   <form v-if="paper.paperId" @submit.prevent="updatePaper">
     <input type="hidden" v-model="paper.paperId" />

     <p>
       <label for="entryId">Entry ID:</label><br />
       <input type="text" id="entryId" v-model="paper.entryId" required />
     </p>

     <p>
       <label for="title">Title:</label><br />
       <input type="text" id="title" v-model="paper.title" required />
     </p>

     <p>
       <label for="abstract">Abstract:</label><br />
       <textarea id="abstract" v-model="paper.abstract" rows="5" cols="50"></textarea>
     </p>

     <p>
       <button type="submit">Update Paper</button>
     </p>
   </form>

   <div v-if="paper.paperId" class="links">
     <h2>👤 Authors of this Paper ({{ paperAuthors.length }})</h2>

     <div v-if="message" class="alert success">
       <p>{{ message }}</p>
     </div>

     <ul>
       <li v-for="author in paperAuthors" :key="author.authorId">
         {{ author.name }} ({{ author.email }})
         <button @click="removeAuthor(author)">Remove</button>
       </li>
       <li v-if="paperAuthors.length === 0">No authors linked yet.</li>
     </ul>

     <p>
       <select v-model="selectedAuthorId">
         <option value="">-- Select an author --</option>
         <option v-for="author in availableAuthors" :key="author.authorId" :value="author.authorId">
           {{ author.name }}
         </option>
       </select>
       <button @click="addAuthor" :disabled="!selectedAuthorId">Add Author</button>
     </p>
   </div>

   <div v-else-if="!error">
     <p>Loading paper details...</p>
   </div>

   <p>
     <router-link to="/papers/list">🔙 Back to Paper List</router-link>
   </p>
 </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { request } from './api.js';

const route = useRoute();
const router = useRouter();

const paper = ref({
 paperId: null,
 entryId: '',
 title: '',
 abstract: '',
});
const error = ref('');
const message = ref('');
const paperAuthors = ref([]);
const allAuthors = ref([]);
const selectedAuthorId = ref('');

// Authors not yet linked to this paper (options for the dropdown)
const availableAuthors = computed(() =>
 allAuthors.value.filter((a) => !paperAuthors.value.some((pa) => pa.authorId === a.authorId))
);

// --- 1. Fetch data to pre-load the form ---
const fetchPaperDetails = async () => {
 const idFromUrl = route.params.paperId;
 try {
   const data = await request(`/papers/${idFromUrl}`);
   if (!data) throw new Error('Could not find that paper.');

   // Keep only the editable fields (the API also returns the paper's authors)
   paper.value = { paperId: data.paperId, entryId: data.entryId, title: data.title, abstract: data.abstract };
   paperAuthors.value = data.authors || [];
 } catch (e) {
   error.value = "Error pre-loading: " + e.message;
 }
};

// Reload only the linked authors (keeps unsaved edits in the form)
const refreshPaperAuthors = async () => {
 const data = await request(`/papers/${route.params.paperId}`);
 paperAuthors.value = data.authors || [];
};

const fetchAllAuthors = async () => {
 try {
   allAuthors.value = await request('/authors');
 } catch (e) {
   error.value = "Error loading authors: " + e.message;
 }
};

// --- Link / unlink authors ---
const addAuthor = async () => {
 const author = allAuthors.value.find((a) => a.authorId === selectedAuthorId.value);
 try {
   await request(`/papers/${paper.value.paperId}/authors/${selectedAuthorId.value}`, { method: 'PUT' });
   await refreshPaperAuthors();
   selectedAuthorId.value = '';
   message.value = `Author '${author?.name}' added to this paper.`;
   error.value = '';
 } catch (e) {
   error.value = "Error adding author: " + e.message;
   message.value = '';
 }
};

const removeAuthor = async (author) => {
 if (!confirm(`Remove author '${author.name}' from this paper?`)) return;
 try {
   await request(`/papers/${paper.value.paperId}/authors/${author.authorId}`, { method: 'DELETE' });
   await refreshPaperAuthors();
   message.value = `Author '${author.name}' removed from this paper.`;
   error.value = '';
 } catch (e) {
   error.value = "Error removing author: " + e.message;
   message.value = '';
 }
};

// --- 2. Submit the updated data ---
const updatePaper = async () => {
 try {
   await request(`/papers/${paper.value.paperId}`, { method: 'PUT', body: paper.value });

   router.push({
     path: '/papers/list',
     query: { message: 'Paper updated successfully!' }
   });
 } catch (e) {
   error.value = "Error saving: " + e.message;
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
.success { color: green; border-color: green; }
</style>
