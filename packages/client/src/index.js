import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import JoinGameScreen from './JoinGameScreen';
import GameScreen from './GameScreen';
import * as serviceWorker from './serviceWorker';
import { HashRouter } from 'react-router-dom'
import { Switch, Route, Link } from 'react-router-dom'
ReactDOM.render(
    <HashRouter>
        <Switch>
            <Route exact path='/' component={JoinGameScreen}/>
            <Route path='/game/:id' component={GameScreen}/>
        </Switch>
    </HashRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
