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
      { path: 'LoadingPage', name: 'loadingPage', component: () => import('src/modules/security/LoadingPage.vue') },
      { path: 'register', name: 'register', component: () => import('src/modules/security/RegisterComponent.vue') },
    ],
  },
]

export default authentication
