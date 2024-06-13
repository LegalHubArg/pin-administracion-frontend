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

const ObservacionSolicitudBO = props => {

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
        idObservacionMotivo: null,
        observacion: '',
        usuario: localStorage.idUsuarioBO,
        idNorma: location.state.idNorma,
        solicitud: location.state.solicitud
    })

    const getMotivos = async () => {
        let data = []
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit")
            }
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/observaciones/motivos', body, token).then(res => {
                data = res.data.respuesta
                setMotivos(data)
            }).catch(e => { throw new Error(e) })

            setLoading(false)

        }
        catch (error) {
            setLoading(true)
            // console.log(error)
        }
    }

    const ingresarObservacion = async () => {
        setLoading(true)
        try {
            let body = form
            let token = localStorage.getItem("token");
            await ApiPinPost('/api/v1/boletin-oficial/normas/observaciones/crear', body, token).then(_ => {
                navigate("..")
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
            case 'idObservacionMotivo':
                value = parseInt(e.target.value);
                setForm({
                    ...form,
                    ['idObservacionMotivo']: value
                });
                break;
            case 'observacion':
                value = String(e.target.value);
                setForm({
                    ...form,
                    ['observacion']: value
                });
                break;
        }
    }

    useEffect(() => {
        if (form &&
            form.idObservacionMotivo !== null &&
            form.observacion.length > 5) {
            setValidaForm(true)
        }
        else{
            setValidaForm(false)
        }
    }, [form])

    useEffect(() => {
        if (location.state != null) {
            getMotivos()
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
        // console.log('SUBMIT')
        ingresarObservacion();
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
                                <li className="breadcrumb-item">Observación de Solicitud</li>
                            </ol>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <header>
                        <h1 className="mb-3">Agregar Observación a Solicitud { }</h1>
                        <p className="lead" align="justify">{ }</p>
                    </header>
                    <hr />
                    <div className="container responsive">
                        <form className="form" onSubmit={e => handleSubmit(e)}>
                            <div className="form-group">
                                <label for="idObservacionMotivo">Motivo</label>
                                <select className="custom-select" id="idObservacionMotivo" name="idObservacionMotivo" onChange={e => handleFormChange(e)} value={(form.idObservacionMotivo != null) ? form.idObservacionMotivo : -1}
                                >
                                    {motivos && (motivos != {}) ? (
                                        <>
                                            <option value={-1} selected disabled>Seleccione el motivo de la observación</option>
                                            {motivos.map((p, index) => (
                                                <option value={p.idObservacionMotivo} key={'opt-sec-' + index}>{p.motivo}</option>
                                            ))
                                            }
                                        </>
                                    ) : (<option selected disabled>No hay motivos para mostrar</option>)
                                    }
                                </select>
                            </div>
                            <div className="form-group sumario">
                                <label for="observacion">Observación</label>
                                <textarea placeholder="Ingrese una descripción" className="form-control" id="observacion" name="observacion" rows="10" onChange={e => handleFormChange(e)} value={form.observacion}></textarea>
                            </div>
                            <div class="alert-wrapper" id="error-ingresar" hidden>
                                <div class="alert alert-danger" role="alert">
                                    <p>
                                        Error al ingresar observación
                                    </p>
                                </div>
                            </div>
                            <div style={{ marginBlock: "2em" }}>
                                <button type="submit" className="btn btn-primary btn-lg" disabled={!validaForm} id="enviar-observacion" style={{ minWidth: "200px" }}>Enviar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        );

    }

};

export default ObservacionSolicitudBO;
