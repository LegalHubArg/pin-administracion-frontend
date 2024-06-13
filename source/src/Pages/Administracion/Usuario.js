import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaMinus, FaTrash, FaUserCog } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { getOrganismos, getSecciones, getNormaTipos, getNormaSubtipos } from '../../Helpers/consultas'

const Usuario = props => {
    const [dataUsuario, setDataUsuario] = useState()
    const [isLoading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [reparticiones, setReparticiones] = useState(null)
    const [secciones, setSecciones] = useState(null)
    const [jerarquia, setJerarquia] = useState(null)
    const [sumario, setSumario] = useState(null)
    const [perfiles, setPerfiles] = useState()
    const [perfilSelect, setPerfilSelect] = useState(null)
    const [modalPerfil, setModalPerfil] = useState({ show: false, idUsuariosPerfil: null })
    const [repaSelect, setRepaSelect] = useState(null)
    const [modalRepa, setModalRepa] = useState({ show: false, itemBorrar: null })

    const initFormPermisoCarga = {
        idSeccion: null,
        idNormaTipo: null,
        idNormaSubtipo: null,
        idReparticion: null,
        idReparticionOrganismo: null,
    }
    const [formPermisoCarga, setFormPermisoCarga] = useState(initFormPermisoCarga)
    const [validaFormPermisoCarga, setValidaFormPermisoCarga] = useState(false)
    const { idUsuario } = useParams();

    const handleFormPermisoCarga = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'idSeccion':
                setFormPermisoCarga({ ...formPermisoCarga, idSeccion: parseInt(value) })
                break;
            case 'idReparticion':
                setFormPermisoCarga({ ...formPermisoCarga, idReparticion: parseInt(value) })
                break;
            case 'idReparticionOrganismo':
                setFormPermisoCarga({ ...formPermisoCarga, idReparticionOrganismo: parseInt(value) })
                break;
            case 'idNormaTipo':
                setFormPermisoCarga({ ...formPermisoCarga, idNormaTipo: parseInt(value) })
                break;
            case 'idNormaSubtipo':
                setFormPermisoCarga({ ...formPermisoCarga, idNormaSubtipo: parseInt(value) })
                break;
        }
    }

    const getUsuario = async () => {
        try {
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario,
            }
            let data;

            await ApiPinPost('/api/v1/usuarios/usuario-sdin', body, localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.data
                    data.perfiles = res.data.perfiles
                })
            /* await ApiPinPost('/api/v1/usuarios/usuario/perfil', { usuario: data.usuario }, localStorage.getItem("token"))
                .then((res) => {
                    data.perfiles = res.data
                })
            await ApiPinPost('/api/v1/usuarios/permisos/usuario', { usuario: data.usuario }, localStorage.getItem("token"))
                .then((res) => {
                    data.permisos = res.data.data
                }) */
            /* await ApiPinPost('/api/v1/usuarios/usuario/reparticiones', { usuario: data.usuario }, localStorage.getItem("token"))
                .then((res) => {
                    data.reparticiones = res.data.data
                }) */
            return data
        }
        catch (e) { setError(true) }
    }

    const getPerfiles = async () => {
        try {
            let data;
            await ApiPinGet('/api/v1/usuarios/perfiles', localStorage.getItem("token"))
                .then((res) => {
                    data = res.data.data
                })
            return data
        }
        catch (e) { }
    }

    const handleSubmitPerfil = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let body = {
                idUsuario: dataUsuario.idUsuario,
                usuario: localStorage.user_cuit,
                idUsuarioAdmin: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
                idPerfil: perfilSelect
            }
            await ApiPinPost('/api/v1/usuarios/usuario-sdin/asignar-perfil', body, localStorage.getItem("token"))
                .then(_ => {
                    getUsuario().then(r => setDataUsuario(r))
                })
            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    const borrarPerfil = async (e, idUsuariosPerfil) => {
        e.preventDefault();
        setLoading(true);
        try {
            let body = {
                usuario: localStorage.user_cuit,
                idUsuarioAdmin: parseInt(JSON.parse(localStorage.perfiles)[0].idUsuario),
                idUsuariosPerfil: idUsuariosPerfil
            }

            await ApiPinPost('/api/v1/usuarios/usuario-sdin/borrar-perfil', body, localStorage.getItem("token"))
                .then(_ => {
                    setModalPerfil({ show: false, idUsuariosPerfil: null })
                    getUsuario().then(r => setDataUsuario(r))
                })
            setLoading(false)
        }
        catch (e) { setLoading(false) }
    }

    useEffect(async () => {
        setLoading(true)
        let dataUsuarioAux = await getUsuario();
        let perfilesAux = await getPerfiles();
        setDataUsuario(dataUsuarioAux)
        //Filtro los perfiles que ya tiene, para que no los muestre en el select.
        let perfilesUsuario = dataUsuarioAux.perfiles?.map(n => n.idPerfil);
        setPerfiles(perfilesAux.filter(n => !perfilesUsuario?.includes(n.idPerfil)))
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            {dataUsuario &&
                <div className="container responsive mb-5">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td style={{ width: "40%" }}><b>Nombre:</b></td>
                                <td>{dataUsuario.apellidoNombre}</td>
                            </tr>
                            <tr>
                                <td><b>CUIL/CUIT:</b></td>
                                <td>{dataUsuario.usuario}</td>
                            </tr>
                            <tr>
                                <td><b>Email:</b></td>
                                <td>{dataUsuario.email}</td>
                            </tr>
                            {dataUsuario.mig_nombre &&
                                <tr>
                                    <td><b>Nombre (migración):</b></td>
                                    <td>{dataUsuario.mig_nombre}</td>
                                </tr>
                            }
                            {/* <tr>
                                <td><b>SADE:</b></td>
                                <td>{dataUsuario.existeEnSADE ?
                                    <span className="badge badge-success">Existe en SADE</span> :
                                    <span className="badge badge-danger">No existe en SADE</span>
                                }</td>
                            </tr> */}
                            {!!dataUsuario.numeroCOAlta &&
                                <tr>
                                    <td><b>Número CO Alta:</b></td>
                                    <td>{dataUsuario.numeroCOAlta}</td>
                                </tr>}
                            {!!dataUsuario.numeroCOBaja &&
                                <tr>
                                    <td><b>Número CO Baja:</b></td>
                                    <td>{dataUsuario.numeroCOBaja}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    <br />
                    <h2>Perfiles</h2>
                    <div className="d-flex align-items-start">
                        {dataUsuario?.perfiles?.length > 0 ?
                            <table className="table mr-5" style={{ width: "fit-content" }}>
                                <thead><tr><th colspan={2}>Activos</th></tr></thead>
                                {dataUsuario?.perfiles.map(n => <tr><td>{n?.descripcion}</td>
                                    <td><button className="btn btn-sm btn-danger"
                                        onClick={() => setModalPerfil({ show: true, idUsuariosPerfil: n.idUsuariosPerfil })}>
                                        <FaTrash />
                                    </button></td>
                                </tr>)}
                            </table>
                            :
                            <table className="table mr-5" style={{ width: "fit-content" }}>
                                <tr><td>Este usuario no tiene perfiles asignados...</td></tr>
                            </table>
                        }
                        <form className="card p-3" onSubmit={(e) => handleSubmitPerfil(e)} style={{ width: "fit-content" }}>
                            <div class="form-group">
                                <label for="idPerfil">Nuevo Perfil</label>
                                <select
                                    className="custom-select custom-select-sm"
                                    id="idPerfil"
                                    name="idPerfil"
                                    value={perfilSelect !== null ? perfilSelect : -1}
                                    onChange={e => setPerfilSelect(e.target.value)}
                                    required
                                >
                                    <option value={-1} selected></option>
                                    {perfiles && (perfiles.length > 0 ? perfiles.map(perfil =>
                                        <option value={perfil.idPerfil} key={"opt-sec-" + perfil.idPerfil}>{perfil.descripcion}</option>)
                                        : "No se encontraron perfiles disponibles para agregar a este usuario")}
                                </select>
                            </div>
                            <button className="btn btn-sm btn-primary">Agregar Perfil</button>
                        </form>
                    </div>
                    <br />
                </div>
            }
            {error && <div className="alert alert-danger">Se produjo un error al buscar los datos del usuario</div>}
            <Modal show={modalPerfil?.show} onHide={() => setModalPerfil({ show: false, idUsuariosPerfil: null })}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este perfil?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setModalPerfil({ show: false, idUsuariosPerfil: null })}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarPerfil(e, modalPerfil.idUsuariosPerfil)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default Usuario;