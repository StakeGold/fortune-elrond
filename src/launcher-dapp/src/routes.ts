import { RouteType } from '@elrondnetwork/dapp-core/types';
import { dAppName } from 'config';
import { withPageTitle } from './components/PageTitle';

import { Escrow, Home } from './pages';

export const routeNames = {
  home: '/',
  dashboard: '/dashboard',
  unlock: '/unlock'
};

interface RouteWithTitleType extends RouteType {
  title: string;
}

export const routes: RouteWithTitleType[] = [
  {
    path: routeNames.home,
    title: 'Home',
    component: Home
  },
  {
    path: routeNames.dashboard,
    title: 'Escrow',
    component: Escrow,
    authenticatedRoute: true
  }
];

export const mappedRoutes = routes.map((route) => {
  const title = route.title ? `${route.title} • ${dAppName}` : `${dAppName}`;

  const requiresAuth = Boolean(route.authenticatedRoute);
  const wrappedComponent = withPageTitle(title, route.component);

  return {
    path: route.path,
    component: wrappedComponent,
    authenticatedRoute: requiresAuth
  };
});
