// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import EmployeeData from "../views/EmployeeData.vue";
import ExpensesData from "../views/ExpensesData.vue";
import Login from '../views/Login.vue';
import { authService } from '../services/authService';
import EmptyLayout from "../layouts/EmptyLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue"; // Import AdminLayout

const isAuthenticated = () => {
    return authService.isAuthenticated();
};

const getUserRole = () => {
    return authService.getUserRole();
};

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/admin', // Parent path for empty layout routes
            component: EmptyLayout, // Apply EmptyLayout for all child routes
            children: [
                {
                    path: 'login', // Relative path, becomes /admin/login
                    name: 'admin-login',
                    component: Login,
                    meta: { public: true, layout: 'empty' } // Layout meta is redundant here but kept for clarity
                },
                {
                    path: '', // Redirect /admin to /admin/login
                    redirect: '/admin/login'
                }
            ]
        },
        {
            path: '/', // Parent path for admin layout routes
            component: AdminLayout, // Apply AdminLayout for all child routes
            children: [
                {
                    path: 'dashboard', // Relative path, becomes /dashboard
                    name: 'dashboard',
                    component: Dashboard,
                    meta: { roles: ['admin', 'accountant'] }
                },
                {
                    path: '', // Redirect / to /dashboard
                    name: 'home', // Named 'home' as it's effectively the homepage after login
                    component: Dashboard,
                    meta: { roles: ['admin', 'accountant'] }
                },
                {
                    path: 'users', // Relative path, becomes /users
                    name: 'users',
                    component: Users,
                    meta: { roles: ['admin'] }
                },
                {
                    path: 'employees', // Relative path, becomes /employees
                    name: 'employees',
                    component: EmployeeData,
                    meta: { roles: ['admin', 'accountant'] }
                },
                {
                    path: 'expenses', // Relative path, becomes /expenses
                    name: 'expenses',
                    component: ExpensesData,
                    meta: { roles: ['admin','accountant'] }
                },
                // {
                //     path: 'settings', // Relative path, becomes /settings
                //     name: 'settings',
                //     component: () => import('../views/Settings.vue'),
                //     meta: { roles: ['admin'] }
                // },
            ]
        },
        // ... other top-level routes (if any, e.g., public marketing pages outside admin)
    ]
});

router.beforeEach((to, from, next) => {
    const isPublicRoute = to.meta.public;
    const routeRoles = to.meta.roles;
    const authenticated = isAuthenticated();
    const userRole = getUserRole();

    if (!isPublicRoute && !authenticated) {
        console.log("Route guard: Not logged in, redirect to login");
        next({
            name: 'admin-login', // Use the name of the nested login route
            params: { nextUrl: to.fullPath }
        });
    } else if (routeRoles && authenticated) {
        if (!routeRoles.includes(userRole)) {
            console.log(`Route guard: Unauthorized role (${userRole}) for route ${to.path}`);
            next('/'); // Redirect to home (which will be /dashboard due to redirect)
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;