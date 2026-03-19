OR
<template>
 <h1>You did it!</h1>
 <p>
   Visit <a :href="url">vuejs.org</a> 
 </p>
 <p v-if="isUSA">
  Today: {{today.getMonth()+1}} / {{today.getDate()}} / {{today.getFullYear()}}
</p>
<p v-else>
  Today (non-USA): {{today.getDate()}} / {{today.getMonth()+1}} / {{today.getFullYear()}}
</p>
<div v-show="isUSA">🇺🇸</div>
<ul>
  <li v-for="n in nums">{{ n }}</li>
</ul>
<button v-on:click="count++">Click</button> {{ count }}
<div id="app">
<form>
    <p>Label: <input type="textbox" v-model="obj.text" /> 
    </p>
</form>
</div>
</template>
<script setup>
const obj = ref({
        agree: false,
        text: ''
      });
const count = ref(0);
const nums = [1,2,3,4,5];
const isUSA = ref(Intl.DateTimeFormat().resolvedOptions().locale.endsWith('US'));
const today = new Date();
import { ref } from 'vue';
const url = ref('https://vuejs.org');
</script>
<style scoped></style>

  