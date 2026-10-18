<template>
<div class="home">
  <h1>📖 Papers &amp; Authors</h1>

  <!-- Home image: a stack of books with a research paper -->
  <svg class="home-image" viewBox="0 0 240 160" role="img" aria-label="Stack of books with a research paper">
    <!-- books -->
    <rect x="30" y="118" width="130" height="22" rx="3" fill="#2f5d8a" />
    <rect x="40" y="96" width="115" height="22" rx="3" fill="#c0504d" />
    <rect x="34" y="74" width="122" height="22" rx="3" fill="#4f8a4f" />
    <rect x="30" y="118" width="12" height="22" fill="#24496d" />
    <rect x="40" y="96" width="12" height="22" fill="#9c3f3c" />
    <rect x="34" y="74" width="12" height="22" fill="#3d6e3d" />
    <!-- paper -->
    <g transform="rotate(8 190 80)">
      <rect x="160" y="30" width="60" height="80" rx="2" fill="#ffffff" stroke="#888" />
      <rect x="168" y="40" width="44" height="5" fill="#555" />
      <rect x="168" y="52" width="44" height="3" fill="#aaa" />
      <rect x="168" y="60" width="44" height="3" fill="#aaa" />
      <rect x="168" y="68" width="36" height="3" fill="#aaa" />
      <rect x="168" y="80" width="44" height="3" fill="#aaa" />
      <rect x="168" y="88" width="40" height="3" fill="#aaa" />
    </g>
  </svg>

  <p>Manage the authors and papers in your collection.</p>

  <div class="home-links">
    <router-link to="/authors/list" class="home-link">👤 Authors</router-link>
    <router-link to="/papers/list" class="home-link">📄 Papers</router-link>
  </div>
</div>
</template>

<style scoped>
.home {
text-align: center;
}
.home-image {
width: 100%;
max-width: 320px;
margin: 10px auto;
display: block;
}
.home-links {
display: flex;
justify-content: center;
gap: 20px;
margin-top: 20px;
}
.home-link {
padding: 15px 30px;
border: 1px solid #2f5d8a;
border-radius: 6px;
text-decoration: none;
font-size: 1.2em;
}
</style>


