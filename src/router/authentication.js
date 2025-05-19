const authentication = [
  {
    path: '/login',
      component: () => import('pages/LoginComponent.vue'),
  },
  {
    path: '/authentication/',
    component: () => import('pages/LoginComponent.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('src/modules/security/LoginComponent.vue') },
      { path: 'register', name: 'register', component: () => import('src/modules/security/RegisterComponent.vue') },
    ],
  },
]

export default authentication
