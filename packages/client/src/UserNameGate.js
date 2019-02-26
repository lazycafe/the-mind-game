import React, { Component } from 'react';
import './App.css';
import withGameState from './withGameState';
import WaitingRoomScreen from './WaitingRoomScreen';
import {setUserName, getUserName} from './userNameFunctions';
import LoginForm from './LoginForm';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

export function withUserNameGate(Wrapped) {
    return class extends Component {


        render() {
            return (<UserNameGate>
                <Wrapped {...this.props}/>
            </UserNameGate>);
        }
    }
}
//ensures the user has a username
class UserNameGate extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            hasUserName: Boolean(getUserName(false))
        }
    }

    render() {
        return (<div>
            {this.state.hasUserName ? this.props.children : <LoginForm 
                showGameIdField={false}
                onSubmit={(gameId, userName) => {
                    if (userName && userName.trim().length > 0) {
                        this.setState({hasUserName: true})
                    }
                }}
            />}

        </div>)
    }
}
