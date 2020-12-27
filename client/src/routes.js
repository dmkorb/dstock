import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const Settings = React.lazy(() => import('./views/Settings/Settings'));
const Trades = React.lazy(() => import('./views/Trades/Trades'));
const Holdings = React.lazy(() => import('./views/Holdings/Holdings'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/trades', name: 'Trades', component: Trades },
  { path: '/holdings', name: 'Holdings', component: Holdings },
  { path: '/settings', exact: true,  name: 'Configurações', component: Settings },
];

export default routes;
