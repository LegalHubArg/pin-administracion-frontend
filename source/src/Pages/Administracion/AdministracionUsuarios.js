import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaEye, FaMinus, FaTrash, FaUserCog, FaUndo } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { Pagination } from '@gcba/obelisco'
import { decode } from 'html-entities';
import moment from 'moment'

const AdminUsuarios = props => {
    const [usuarios, setUsuarios] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [usuarioBorrar, setUsuarioBorrar] = useState(null)
    const [error, setError] = useState(false) //Flag de error de la página
    const [usuarioDeshacer, setUsuarioDeshacer] = useState(null)
    const [aux, setAux] = useState(false)
    const [totalResultados, setTotalResultados] = useState(null)
    if (error) throw error //Lo catchea el ErrorBoundary

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    const navigate = useNavigate();

    const [form, setForm] = useState({
        idUsuario: null,
        usuario: "",
        email: "",
        apellidoNombre: "",
        existeEnSADE: false,
        numeroCOAlta: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idUsuario: null,
        usuario: "",
        email: "",
        apellidoNombre: "",
        existeEnSADE: true,
        numeroCOAlta: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'usuario':
                setForm({ ...form, usuario: value })
                break;
            case 'email':
                setForm({ ...form, email: value })
                break;
            case 'apellidoNombre':
                setForm({ ...form, apellidoNombre: value })
                break;
            case 'existeEnSADE':
                value = e.target.checked;
                setForm({
                    ...form,
                    ['existeEnSADE']: value
                })
                break;
            case 'numeroCOAlta':
                setForm({ ...form, numeroCOAlta: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'usuario':
                let valor = parseInt(value);
                if (isNaN(valor)){
                    setFormEdicion({ ...formEdicion, usuario: '' })
                    break;
                }
                setFormEdicion({ ...formEdicion, usuario: valor })
                break;
            case 'email':
                setFormEdicion({ ...formEdicion, email: value })
                break;
            case 'apellidoNombre':
                setFormEdicion({ ...formEdicion, apellidoNombre: value })
                break;
            case 'existeEnSADE':
                setFormEdicion({ ...formEdicion, existeEnSADE: e.target.checked })
                break;
            case 'numeroCOAlta':
                setFormEdicion({ ...formEdicion, numeroCOAlta: value })
                break;
        }
    }


    const getUsuarios = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            ...paginacion
        }
        await ApiPinPost(`/api/v1/usuarios/sdin`, body, localStorage.getItem("token"))
            .then((res) => {
                setUsuarios(res.data.data)
                setTotalResultados(res.data.total)
                setPaginacion({...paginacion, totalPaginas: res.data.totalPaginas})
            })
            .catch(e => { throw e })
            // console.log(paginacion)
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            /* usuario: localStorage.getItem("user_cuit"), */
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            usuario: localStorage.user_cuit,
            cuit: form.usuario,
            email: form.email,
            apellidoNombre: form.apellidoNombre,
            existeEnSADE: form.existeEnSADE,
            numeroCOAlta: form.numeroCOAlta
        }
        await ApiPinPost('/api/v1/usuarios/sdin/crear', body, localStorage.getItem("token"))
            .then(_ => {
                setForm({
                    usuario: "",
                    email: "",
                    apellidoNombre: "",
                    existeEnSADE: "",
                    numeroCOAlta: ""
                })
                getUsuarios()
            })
            .catch(e => setError(e.data.mensaje))
        setLoading(false)
    }

    async function borrarUsuario(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuarioActual: JSON.parse(localStorage.getItem("perfiles"))[0].idUsuario,
            usuario: localStorage.getItem("user_cuit"),
            /* idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario, */
            numeroCOBaja: null,
            idUsuario: id
        }
        await ApiPinPost('/api/v1/usuarios/sdin/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                window.location.reload()
            })
            .catch()

        setLoading(false)
    }

    async function reactivarUsuario(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: id
        }
        await ApiPinPost('/api/v1/usuarios/sdin/reactivar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                window.location.reload()
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: id,
            cuit: formEdicion.usuario,
            email: formEdicion.email,
            apellidoNombre: formEdicion.apellidoNombre,
            /* existeEnSADE: formEdicion.existeEnSADE,
            numeroCOAlta: formEdicion.numeroCOAlta */
        }
        
        await ApiPinPost('/api/v1/usuarios/sdin/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getUsuarios();
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    }

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idUsuario: elem.idUsuario,
            usuario: elem.usuario,
            email: elem.email,
            apellidoNombre: elem.apellidoNombre,
            existeEnSADE: elem.existeEnSADE,
            numeroCOAlta: elem.numeroCOAlta
        })
        if (habilitarEdicion) {
            setFormEdicion({ idUsuario: null, usuario: "", email: "", apellidoNombre: "", existeEnSADE: "", numeroCOAlta: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    useEffect(async () => {
        setLoading(true)
        await getUsuarios().catch(e => setError(e.data.mensaje))
        setLoading(false)
    }, [])

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getUsuarios()
        }
    }, [paginacion])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5" style={{ overflow: "auto" }}>
                <div id="accordion" className="mt-1">
                    <div class="accordion-wrapper">
                        <div class="accordion">
                            <div class="card">
                                <button
                                    type="button"
                                    class="card-header collapsed card-link"
                                    data-toggle="collapse"
                                    data-target="#collapseOne"
                                >
                                    Nuevo Usuario
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center flex-wrap" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "25%" }}>
                                                <label for="usuario">Usuario</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="usuario"
                                                    name="usuario"
                                                    placeholder="Ingrese el número de CUIL"
                                                    value={form.usuario}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "39%" }}>
                                                <label for="email">Email</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="email"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-1" style={{ width: "35%" }}>
                                                <label for="apellidoNombre">Apellido y Nombre</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="apellidoNombre"
                                                    name="apellidoNombre"
                                                    value={form.apellidoNombre}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            {/* <div class="custom-control custom-checkbox ml-1">
                                                <input
                                                    type="checkbox"
                                                    class="custom-control-input"
                                                    id="existeEnSADE"
                                                    name="existeEnSADE"
                                                    checked={form.existeEnSADE}
                                                    onChange={e => handleForm(e)}
                                                />
                                                <label for="existeEnSADE" class="custom-control-label">Existe en SADE</label>
                                            </div>
                                            <div class="form-group ml-1">
                                                <label for="numeroCOAlta">Número CO Alta</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    id="numeroCOAlta"
                                                    name="numeroCOAlta"
                                                    value={form.numeroCOAlta}
                                                    onChange={e => handleForm(e)}
                                                />
                                            </div> */}
                                            <button type="submit" className="btn btn-primary">Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p>Resultados ({totalResultados}): </p>
                {usuarios && usuarios.length > 0 &&
                    <div className="d-flex flex-column align-items-center">
                        <table className="table table-bordered table-striped" style={{ fontSize: 14 }}>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Nombre</th>
                                    {/*<th>SADE</th>
                                     <th>Número CO Alta</th> */}
                                    <th>Última modificación</th>
                                    <th>Acciones</th>
                                    
                                    {habilitarEdicion && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((elem) => (<tr style={{background: elem.estadoUsuario === 4 ? "#C93B3B" : "none", color: elem.estadoUsuario === 4 ? "white": "black"}}>
                                    {habilitarEdicion && formEdicion.idUsuario === elem.idUsuario ? <>
                                        <td><input disabled={elem.usuario} type="text" className="form-control form-control-sm" name="usuario" id="usuario" placeholder="CUIT/CUIL"
                                            value={formEdicion.usuario} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="email" className="form-control form-control-sm" name="email" id="email" placeholder="nombre@ejemplo.com"
                                            value={formEdicion.email} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control form-control-sm" name="apellidoNombre" id="apellidoNombre"
                                            value={formEdicion.apellidoNombre} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        {/*<td><input type="checkbox" name="existeEnSADE" id="existeEnSADE"
                                            checked={!!formEdicion.existeEnSADE} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                         <td><input type="text" className="form-control form-control-sm" name="numeroCOAlta" id="numeroCOAlta"
                                            value={formEdicion.numeroCOAlta} onChange={(e) => handleFormEdicion(e)} />
                                        </td> */}
                                    </>
                                        : <>
                                            <td>{elem.usuario}</td>
                                            <td>{elem.email}</td>
                                            <td>{decode(elem.apellidoNombre)}</td>
                                            {/* <td>{elem.existeEnSADE ? <FaCheck /> : <FaMinus />}</td>
                                            <td>{elem.numeroCOAlta}</td> */}
                                        </>}
                                    {habilitarEdicion && formEdicion.idUsuario === elem.idUsuario &&
                                        <td>
                                            <button type="button" className="btn btn-primary btn-sm mr-2" title="Guardar"
                                                onClick={(e) => guardarEdicion(e, elem.idUsuario)}>
                                                <FaCheck />
                                            </button>
                                        </td>}
                                    {habilitarEdicion && !(formEdicion.idUsuario === elem.idUsuario) &&
                                        <td></td>}
                                        <td>{moment(elem.fechaModificacion).format("DD/MM/YYYY, h:mm:ss")}</td>
                                    <td className="d-flex">
                                        <Link title="Ver" className="btn btn-link btn-sm mr-2" to={String(elem.idUsuario)}>
                                            <FaEye />
                                        </Link>
                                        {elem.estadoUsuario === 4 ? null : <button type="button" title="Editar" className="btn btn-secondary btn-sm mr-2" onClick={(e) => edicion(e, elem)}>
                                            <FaEdit />
                                        </button>}
                                        {elem.estadoUsuario === 4 ? <button type="button" title="Reactivar" className="btn btn-primary btn-sm"
                                            onClick={() => { setAux(true); setUsuarioDeshacer(elem.idUsuario); setShowModal(true) }}>
                                            <FaUndo />
                                        </button> : 
                                        elem.idUsuario !== JSON.parse(localStorage.perfiles)[0].idUsuario ? <button type="button" title="Borrar" className="btn btn-danger btn-sm"
                                            onClick={() => { setAux(false); setUsuarioBorrar(elem.idUsuario); setShowModal(true) }}>
                                            <FaTrash />
                                        </button> : null}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
                {paginacion && <div style={{ display: "flex", justifyContent: "center" }}>
                <Pagination pages={paginacion.totalPaginas}
                    onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
            </div>}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea {aux ? "reactivar" : "borrar"} este usuario?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => { aux ? reactivarUsuario(e, usuarioDeshacer) : borrarUsuario(e, usuarioBorrar)}}>
                        Confirmar
                    </button>
                    
                </Modal.Footer>
            </Modal>
        </>)
};

export default AdminUsuarios;