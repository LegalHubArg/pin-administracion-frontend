import React from 'react';

import logoBA from '../../../Assets/header/header-logo.svg'

import { FiGrid } from "react-icons/fi";

import { Container, Offcanvas, Button } from 'react-bootstrap';

import BotonUsuario from '../../BotonUsuario/BotonUsuario';
import { Link } from "react-router-dom";

const Header = props => {
    return (
        <>
            <header className={'navbar navbar-light search-active'}>
                <Container>
                    <Link className="navbar-brand" to={'/'}>
                        <img className={'header-logo'} src={logoBA} alt="Ciudad de Buenos Aires" />
                    </Link>
                    <button
                        type="button"
                        className="btn btn-dropdown"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >

                        {/* <FiGrid /> */}
                    </button>
                    {props.isBotonUsuario && <BotonUsuario />}
                    {/* <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="nav nav-pills">
                             <li class="nav-item">
                                <a href="#" class="nav-link active"><span>Inicio</span></a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link"><span>Mi actividad</span></a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link"><span>Mi cuenta</span></a>
                            </li>
                            <li class="nav-item">
                                <a href="#" aria-label="Notificaciones" class="nav-link">
                                    <i class="bx bxs-bell"></i>
                                </a>
                            </li> 
                            <li class="nav-item d-responsive">
                                <a
                                    href="#"
                                    aria-label="Cerrar sesión"
                                    class="list-group-item list-group-item-logout logout-sm"
                                >
                                    &nbsp;
                                </a>
                            </li>
                        </ul>
                    </div>*/}
                </Container>
            </header>
        </>
    );
}

export default Header;