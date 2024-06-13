import { FaEdit, FaFlag, FaRegWindowRestore } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { linkToParams } from "../../Helpers/Navigation";
//API PIN
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
//DateTime
import { timestampToDateFormat } from '../../Helpers/DateTime';
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { rutasBO } from "../../routes";

const CotizacionSolicitudBO = props => {

    const location = useLocation();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true)

    const [validaForm, setValidaForm] = useState(false)

    const [motivos, setMotivos] = useState()

    const [datosSesion, setDatosSesion] = useState({
        usuario: localStorage.getItem("user_cuit"),
        nombre: localStorage.getItem("user"),
        token: localStorage.getItem("token")
    });

    const [form, setForm] = useState({
        valorCotizacion: null,
        usuario: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
        idNorma: location.state.idNorma
    })

    const ingresarCotizacion = async () => {
        setLoading(true)
        try {
            let body = form
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/norma/cotizar', body, token).then(res => {
                navigate(`..`, { replace: true })
            }).catch(e => { throw e })
        }
        catch (error) {
            setLoading(false)
            document.getElementById("error-ingresar").hidden = false

        }
    }

    const handleClick = (e) => {
        e.preventDefault();
    };

    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'valorCotizacion':
                value = (e.target.value).toString().replace(',', '.');
                //console.log(value)
                setForm({
                    ...form,
                    ['valorCotizacion']: value
                });
                break;
        }
    }

    useEffect(() => {
        if (form &&
            form.valorCotizacion !== null) {
            setValidaForm(true)
        }
    }, [form])

    useEffect(() => {
        setLoading(false)
        if (location.state != null) {
            setDatosSesion({
                ...datosSesion,
                usuario: localStorage.getItem("user_cuit"),
                nombre: localStorage.getItem("user"),
                token: localStorage.getItem("token")
            })
        }
        else {
            navigate('/', { state: {}, replace: true })
        }

    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidaForm(false);
        //console.log('SUBMIT')
        ingresarCotizacion();
        setValidaForm(true);

    }

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <>
                <header className="pt-4 pb-3 mb-4">
                    <div className="container">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={rutasBO.home}>Boletín Oficial</Link></li>
                                <li className="breadcrumb-item">Cotización de Solicitud</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">Cotizar Solicitud { }</h1>
                        <p className="lead" align="justify">{ }</p>
                    </header>
                    <hr />
                    <div className="container responsive">
                        <form className="form" onSubmit={e => handleSubmit(e)}>
                            <div className="form-group sumario">
                                <label for="valorCotizacion">Valor:</label>
                                <input type="number" step="0.01" className="form-control" id="valorCotizacion" name="valorCotizacion" onChange={e => handleFormChange(e)} value={form.valorCotizacion}></input>
                            </div>
                            <div class="alert-wrapper" id="error-ingresar" hidden>
                                <div class="alert alert-danger" role="alert">
                                    <p>
                                        Error al enviar la cotización
                                    </p>
                                </div>
                            </div>
                            <div style={{ marginBlock: "2em" }}>
                                <button type="submit" className="btn btn-primary btn-lg" disabled={!validaForm} id="enviar-observacion" style={{ minWidth: "200px" }}>
                                    Enviar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        );

    }

};

export default CotizacionSolicitudBO;
