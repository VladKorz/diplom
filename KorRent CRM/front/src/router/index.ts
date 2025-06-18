import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ErrorView from '../views/ErrorView.vue'
import ClientsView from '../views/ClientsView.vue'
import ObjectsView from '../views/ObjectsView.vue'
import BookingsView from '../views/BookingsView.vue'
import ProductsView from '../views/ProductsView.vue'
import ServicesView from '../views/ServicesView.vue'
import UsersView from '../views/UsersView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import CreateBookingView from '../views/CreateBookingView.vue'
import UserDetailsView from '../views/UserDetailsView.vue'
import OrdersView from '../views/OrdersView.vue'
import AppLayout from '../components/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorView
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: 'admin',
          name: 'admin',
          component: AdminPanel,
          meta: { requiresAuth: true }
        },
        {
          path: 'orders/',
          name: 'orders',
          component: OrdersView,
          meta: { requiresAuth: true }
        },
        {
          path: 'orders/:id',
          name: 'booking-orders',
          component: OrdersView,
          meta: { requiresAuth: true }
        },
        {
          path: 'bookings',
          name: 'bookings',
          component: BookingsView,
          meta: { requiresAuth: true }
        },
        {
          path: 'create-booking',
          name: 'create-booking',
          component: CreateBookingView,
          meta: { requiresAuth: true }
        },
        {
          path: 'objects',
          name: 'objects',
          component: ObjectsView,
          meta: { requiresAuth: true }
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView,
          meta: { requiresAuth: true }
        },
        {
          path: 'users/:id',
          name: 'user-details',
          component: UserDetailsView,
          meta: { requiresAuth: true }
        },
        {
          path: 'clients',
          name: 'clients',
          component: ClientsView,
          meta: { requiresAuth: true }
        },
        {
          path: 'products',
          name: 'products',
          component: ProductsView,
          meta: { requiresAuth: true }
        },
        {
          path: 'services',
          name: 'services',
          component: ServicesView,
          meta: { requiresAuth: true }
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    // Catch all route for invalid URLs
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'error', query: { status: '401' } })
  } else {
    next()
  }
})

export default router
