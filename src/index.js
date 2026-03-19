import { createRouter, createWebHistory } from 'vue-router';
import AuthorList from './AuthorList.vue';
import AuthorCreate from './AuthorCreate.vue';
import AuthorUpdate from './AuthorUpdate.vue';

const routes = [
  {
    path: '/',
    redirect: '/authors/list'
  },
  {
    path: '/authors/list',
    name: 'AuthorList',
    component: AuthorList
  },
  {
    path: '/authors/create',
    name: 'AuthorCreate',
    component: AuthorCreate
  },
  {
    // :authorId is a dynamic segment, equivalent to @PathVariable
    path: '/authors/update/:authorId',
    name: 'AuthorUpdate',
    component: AuthorUpdate
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;