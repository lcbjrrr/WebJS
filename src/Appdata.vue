<script>
export default {
  data() {
    return {
      currentDate: '' // Start empty
    }
  },
  mounted() {
    this.currentDate = new Date().toLocaleDateString();
    console.log("The component has loaded!");
  }
}
</script>

<template>
  <h1>Hello {{ currentDate }}</h1>
</template>