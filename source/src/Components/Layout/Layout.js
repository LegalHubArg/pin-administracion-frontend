import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { Container } from 'react-bootstrap'
import { ErrorBoundary } from '../Error/Error';

const Layout = props => (
    <main className={`${props.className !== undefined ? props.className : ''}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {(props.isHeader && props.isBotonUsuario) ? <Header isBotonUsuario={true} /> : <Header isBotonUsuario={false} />}
        <Container fluid>
            <ErrorBoundary>{props.children}</ErrorBoundary>
        </Container>
        {props.isFooter && <Footer />}
    </main>
)

export default Layout;