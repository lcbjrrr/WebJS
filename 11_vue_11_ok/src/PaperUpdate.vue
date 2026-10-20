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

// --- 1. Fetch data to pre-load the form ---
const fetchPaperDetails = async () => {
 const idFromUrl = route.params.paperId;
 try {
   const data = await request(`/papers/${idFromUrl}`);
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
});
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
</style>
