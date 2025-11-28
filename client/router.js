import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from './src/helpers/auth'

import Words from './src/views/Words.vue'
import Show from './src/views/Show.vue'
import New from './src/views/New.vue'
import Edit from './src/views/Edit.vue'
import Login from './src/views/Login.vue'
import Register from './src/views/Register.vue'
import AdminUsers from './src/views/AdminUsers.vue'
import AdminLanguages from './src/views/AdminLanguages.vue'
import QuizSetup from './src/views/QuizSetup.vue'
import QuizTaking from './src/views/QuizTaking.vue'
import QuizResult from './src/views/QuizResult.vue'
import QuizHistory from './src/views/QuizHistory.vue'
import QuizDetail from './src/views/QuizDetail.vue'
import Matching from './src/views/Matching.vue'

const routes = [
   {
      path: '/',
      redirect: '/words'
   },
   {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresGuest: true }
   },
   {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { requiresGuest: true }
   },
   {
      path: '/words',
      name: 'Words',
      component: Words,
      meta: { requiresAuth: true }
   },
   {
      path: '/words/new',
      name: 'New',
      component: New,
      meta: { requiresAuth: true }
   },
   {
      path: '/words/show/:id',
      name: 'Show',
      component: Show,
      meta: { requiresAuth: true }
   },
   {
      path: '/words/edit/:id',
      name: 'Edit',
      component: Edit,
      meta: { requiresAuth: true }
   },
   {
      path: '/admin/users',
      name: 'AdminUsers',
      component: AdminUsers,
      meta: { requiresAuth: true, requiresAdmin: true }
   },
   {
      path: '/admin/languages',
      name: 'AdminLanguages',
      component: AdminLanguages,
      meta: { requiresAuth: true, requiresAdmin: true }
   },
   {
      path: '/quiz',
      name: 'QuizSetup',
      component: QuizSetup,
      meta: { requiresAuth: true }
   },
   {
      path: '/quiz/taking',
      name: 'QuizTaking',
      component: QuizTaking,
      meta: { requiresAuth: true }
   },
   {
      path: '/quiz/result',
      name: 'QuizResult',
      component: QuizResult,
      meta: { requiresAuth: true }
   },
   {
      path: '/quiz/history',
      name: 'QuizHistory',
      component: QuizHistory,
      meta: { requiresAuth: true }
   },
   {
      path: '/quiz/detail/:id',
      name: 'QuizDetail',
      component: QuizDetail,
      meta: { requiresAuth: true }
   },
   {
      path: '/matching',
      name: 'Matching',
      component: Matching,
      meta: { requiresAuth: true }
   }
]

const router = createRouter({
   history: createWebHistory(),
   routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
   // Ensure auth is initialized before checking
   if (!authStore.isInitialized) {
      await authStore.init();
      authStore.isInitialized = true;
   }
   
   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
   const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
   const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
   
   if (requiresAuth && !authStore.isLoggedIn) {
      next('/login');
   } else if (requiresGuest && authStore.isLoggedIn) {
      next('/words');
   } else if (requiresAdmin && authStore.user?.role !== 'admin') {
      next('/words'); // Redirect non-admin users
   } else {
      next();
   }
});

export default router