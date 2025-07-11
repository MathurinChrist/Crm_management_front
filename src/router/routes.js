import authentication from './authentication.js'

const routes = [
    ...authentication,
  {
    path: '/',
    redirect: 'authentication/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/about', default: true, component: () => import('pages/IndexPage.vue'), name: 'about' },
      { path: '/projects', component: () => import('src/modules/Projects/ProjectComponent.vue'), name: 'projects'},
      { path: '/project/:id', component: () => import('src/modules/Projects/ProjectOverViewComponent.vue'), name: 'project-overview'},
      { path: '/allTask', component: () => import('src/modules/Tasks/Components/TaskComponent.vue'), name: 'tasks_all'},
      { path: '/dashboard', component: () => import('src/modules/Dashboard/DashBoard.vue'), name: 'dashboard' },
      { path: '/message/communication', component: () => import('src/modules/Messages/Components/MessagesComponent.vue'), name: 'communication' },
      { path: '/users/manage', component: () => import('src/modules/Users/Components/UsersComponent.vue'), name: 'users' }
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
