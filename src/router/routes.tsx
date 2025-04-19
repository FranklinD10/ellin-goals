import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Manage = lazy(() => import('../pages/Manage'));
const Settings = lazy(() => import('../pages/Settings'));

export const routes: RouteObject[] = [
  { index: true, element: <Dashboard /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'manage', element: <Manage /> },
  { path: 'settings', element: <Settings /> }
];
