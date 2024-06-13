import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Login from '../../Login/login';

class Body extends Component {
    render() {
        return (
            <>
                <main>
                <Login />
                </main>
            </>
        );
    }
}

export default Body;