import { createRouter, createWebHistory } from 'vue-router';
import Home from './Home.vue';
import AuthorList from './AuthorList.vue';
import AuthorCreate from './AuthorCreate.vue';
import AuthorUpdate from './AuthorUpdate.vue';
import PaperList from './PaperList.vue';
import PaperCreate from './PaperCreate.vue';
import PaperUpdate from './PaperUpdate.vue';
const routes = [
{
  path: '/',
  name: 'Home',
  component: Home
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
  path: '/authors/update/:authorId',
  name: 'AuthorUpdate',
  component: AuthorUpdate
},
{
  path: '/papers/list',
  name: 'PaperList',
  component: PaperList
},
{
  path: '/papers/create',
  name: 'PaperCreate',
  component: PaperCreate
},
{
  path: '/papers/update/:paperId',
  name: 'PaperUpdate',
  component: PaperUpdate
}
];
const router = createRouter({
history: createWebHistory(),
routes
});
export default router;


