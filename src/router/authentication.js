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
      { path: 'password-reset-email', name: 'password_forgotten', component: () => import('src/modules/security/ResetPAasswordComponent.vue') },
      { path: 'password-reset', name: 'password-reset', component: () => import('src/modules/security/ChangePAssword.vue') }
    ]
  }
]

export default authentication
