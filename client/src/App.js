import React, { Component } from 'react';
import { Route, Switch, Router, Redirect } from 'react-router-dom';
import './App.scss';

import { history } from './helpers';
import { authService } from './services/auth.service'

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Auth/Login'));
const Register = React.lazy(() => import('./views/Auth/Register'));

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    authService.isLoggedIn() 
      ? <Component {...props} />
      : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  )} />
)

export class App extends Component {
  render() {
    return (
      <Router history={history}>
        <React.Suspense fallback={loading()}>
          <div>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute path="/" component={DefaultLayout} />
            </Switch>
          </div>
        </React.Suspense>
      </Router>
    );
  }
}