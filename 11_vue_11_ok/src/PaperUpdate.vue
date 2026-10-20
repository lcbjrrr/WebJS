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

   <div v-else-if="!error">
     <p>Loading paper details...</p>
   </div>

   <p>
     <router-link to="/papers/list">🔙 Back to Paper List</router-link>
   </p>
 </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const route = useRoute();
const router = useRouter();

const paper = ref({
 paperId: null,
 entryId: '',
 title: '',
 abstract: '',
});
const error = ref('');

// --- 1. Fetch data to pre-load the form ---
const fetchPaperDetails = async () => {
 const idFromUrl = route.params.paperId;
 try {
   const response = await fetch(`${API_BASE_URL}/papers/${idFromUrl}`);
  if (!response.ok) throw new Error(await getErrorMessage(response));
   const data = await response.json();
   if (!data) throw new Error('Could not find that paper.');

   // Keep only the editable fields (the API also returns the paper's authors)
   paper.value = { paperId: data.paperId, entryId: data.entryId, title: data.title, abstract: data.abstract };
 } catch (e) {
   error.value = "Error pre-loading: " + e.message;
 }
};

// --- 2. Submit the updated data ---
const updatePaper = async () => {
 try {
   const response = await fetch(`${API_BASE_URL}/papers/${paper.value.paperId}`, {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(paper.value),
   });
  if (!response.ok) throw new Error(await getErrorMessage(response));

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
});
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
</style>
