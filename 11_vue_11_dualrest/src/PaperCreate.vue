<template>
 <div class="paper-create">
   <h1>➕ Create New Paper</h1>

   <div v-if="error" class="alert error">
     <p>{{ error }}</p>
   </div>

   <form @submit.prevent="createPaper">
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
     <p><button type="submit">Save New Paper</button></p>
   </form>

   <p>
     <router-link to="/papers/list">🔙 Back to Paper List</router-link>
   </p>
 </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const API_URL = 'https://papers-knol.onrender.com/papers';

// --- State Definitions using ref ---
const router = useRouter();

const paper = ref({
 entryId: '',
 title: '',
 abstract: '',
});
const error = ref('');

// --- Functions ---
const createPaper = async () => {
 try {
   const response = await fetch(API_URL, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(paper.value),
   });
   if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

   // Redirect on success, using query parameters for the message
   router.push({
     path: '/papers/list',
     query: {
       message: `Paper '${paper.value.title}' created successfully!`,
     },
   });
 } catch (e) {
   error.value = 'Error creating paper: ' + e.message;
 }
};
</script>
