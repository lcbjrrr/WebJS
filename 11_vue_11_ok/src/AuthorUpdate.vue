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

   <p>
     <router-link to="/authors/list">🔙 Back to Author List</router-link>
   </p>
 </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { request } from './api.js';

const route = useRoute();
const router = useRouter();

const author = ref({
 authorId: null,
 name: '',
 email: '',
});
const error = ref('');

// --- 1. Fetch data to pre-load the form ---
const fetchAuthorDetails = async () => {
 const idFromUrl = route.params.authorId;
 try {
   const data = await request(`/authors/${idFromUrl}`);
   if (!data) throw new Error('Could not find that author.');

   // Keep only the editable fields (the API also returns the author's papers)
   author.value = { authorId: data.authorId, name: data.name, email: data.email };
 } catch (e) {
   error.value = "Error pre-loading: " + e.message;
 }
};

// --- 2. Submit the updated data ---
const updateAuthor = async () => {
 try {
   await request(`/authors/${author.value.authorId}`, { method: 'PUT', body: author.value });

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
});
</script>

<style scoped>
.alert { padding: 10px; border: 1px solid; margin-bottom: 15px; }
.error { color: red; border-color: red; }
</style>

