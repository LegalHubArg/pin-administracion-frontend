import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from '../../Components/Spinner/Spinner';
//API PIN
import { ApiPinPost } from '../../Helpers/ApiComunicator'
import Config from '../../config';
import './BotonUsuario.css';

const BotonUsuario = props => {
    
    const [isLoading, setLoading] = useState(true)
    const [idUsuario, setIdUsuario] = useState({
        idUsuario: localStorage.idUsuarioBO
    })
    const [usuarios, setUsuarios] = useState('')
    const [cuenta, setCuenta] = useState('')
    const [perfil, setPerfil] = useState ('')

    const getUsuarios = async () => {

        try {
            let body = { 
                ...idUsuario,    
                usuario: localStorage.getItem("user_cuit") 
            };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/boletin-oficial/usuarios/relacion', body, token).then((res) => {
                setUsuarios(res.data.respuesta)

            }).catch(function (error) {
                throw error
            });

        }
        catch (error) {
        }
    }

    const getPerfil = async () => {

        try {
            let body = { 
                ...idUsuario,    
                usuario: localStorage.getItem("user_cuit") 
            };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/boletin-oficial/usuarios/perfil', body, token).then((res) => {
                setPerfil(res.data.respuesta)

            }).catch(function (error) {
                throw error
            });

        }
        catch (error) {
        }
    }

    const getCuenta = async () => {

        try {
            let body = { 
                ...idUsuario,    
                usuario: localStorage.getItem("user_cuit") 
            };
            let token = localStorage.getItem("token");

            await ApiPinPost('/api/v1/boletin-oficial/usuarios/cuenta', body, token).then((res) => {
                setCuenta(res.data.respuesta)

            }).catch(function (error) {
                throw error
            });

        }
        catch (error) {
        }
    }

    //Hook inicial
    useEffect(async () => {
        setLoading(true)
        getUsuarios()
        getPerfil()
        getCuenta()
        setLoading(false)
    }, [])

    let navigate = useNavigate();

    const onLogout = () => {
        localStorage.clear();
        navigate("/login", { replace: true })
    }

    if (isLoading) {
        return (<Spinner />)
    }
    else { return (
        <>

        <div className="dropdown-container">

            {perfil && (perfil.length > 0) ? (

                <div class="dropdown">
                    <div class="dropdown mb-3">
                        <button
                        id="boton-principal"
                        type="button"
                        class="btn btn-dropdown"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        >
                        { localStorage.getItem("user")}
                        <span className="dropdown-user-icon"></span>
                        </button>
                        <div class="dropdown-menu">

                        <button 
                                id="boton-0"
                                class="dropdown-item" 
                                type="button">
                                <span>Version: </span> 
                                {  Config.version }
                            </button>
                        
                            <button 
                                id="boton-1"
                                class="dropdown-item" 
                                type="button">
                                <span>Perfil: </span> 
                                {  localStorage.getItem("perfil") !== null ? JSON.parse(localStorage.getItem("perfil")).descripcion : '' }
                            </button>

                            <button 
                                id="boton-2"
                                class="dropdown-item" 
                                type="button">
                                Cuenta: {cuenta.length > 0 ? cuenta[0].nombre : ''}
                            </button>
                            
                            <button
                                id="boton-3"
                                class="dropdown-item dropdown-toggle"
                                type="button"
                                data-toggle="dropdown"
                            >
                                Usuarios Relacionados
                            </button>
                            <div class="dropdown-menu">
                                {usuarios && (usuarios.length > 0) ? (
                                    usuarios.map((u, index) => (
                                        <button class="dropdown-item" type="button">{u.apellidoNombre}</button>
                                    ))  
                                    ) : <p>No hay usuarios relacionados a este usuario</p>
                                }
                            </div>

                            <div>
                                <button 
                                    id="boton-4"
                                    class="dropdown-item red-button" 
                                    onClick={onLogout} 
                                    type="button">
                                        <span><b>Cerrar sesión</b></span>
                                        <i className="bx bx-log-in red-button-icon" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            ) : (

                <div className="dropdown">

                    <button
                        type="button"
                        className="btn btn-dropdown"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">
                        { localStorage.getItem("user")}
                        <span className="dropdown-user-icon"></span>
                    </button>

                    <div className="dropdown-menu">
                        
                        <></>
                        <button 
                                id="boton-0"
                                class="dropdown-item" 
                                type="button">
                                <span>Version: </span> 
                                {  Config.version }
                            </button>

                        <button 
                            id="boton-1"
                            class="dropdown-item" 
                            type="button">
                            <span>Perfil: </span> 
                            {  localStorage.perfiles !== null ? JSON.parse(localStorage.perfiles)[0].descripcion : '' }
                        </button>
                        
                        <div>
                            <button 
                                id="boton-2"
                                class="dropdown-item red-button" 
                                onClick={onLogout} 
                                type="button">
                                    <span><b>Cerrar sesión</b></span>
                                    <i className="bx bx-log-in red-button-icon" />
                            </button>
                        </div>

                    </div>
                </div>

            )
        }

        </div>

        </>
        );
    }
};

export default BotonUsuario;
