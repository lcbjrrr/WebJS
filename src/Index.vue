<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const nameInput = ref('');  
const router = useRouter(); 

const submitName = () => {
  if (nameInput.value.trim() !== '') {
    router.push({ 
      name: 'Hello', 
      params: { 
        name: nameInput.value 
      } 
    });
  } else {
    alert('Please enter your name!');
  }
};
</script>

<template>
  <div>
    <h1>👋 Welcome to the App!</h1>
    <form @submit.prevent="submitName">
      <label for="name">What is your name?</label>
      <input 
        id="name"
        type="text" 
        v-model="nameInput" 
        placeholder="Enter your name"
      />
      <button type="submit">Say Hello</button>
    </form>
  </div>
</template>
