import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { Modal, InputGroup, Col, Row } from 'react-bootstrap';
import { Pagination } from '@gcba/obelisco'

const OrganismoEmisor = props => {
    const [organismosEmisores, setOrganismosEmisores] = useState([])
    const [totalOrg, setTotalOrg] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModalBorrar, setShowModalBorrar] = useState(false)
    const [showModalConfirmar, setShowModalConfirmar] = useState(false)
    const [idBorrar, setIdBorrar] = useState(null)
    const [orgBorrar, setOrgBorrar] = useState(null)
    const [errorCarga, setErrorCarga] = useState()

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })
    
    const [buscador, setBuscador] = useState({
        busqueda: ""
    })

    const [form, setForm] = useState({
        idOrgEmisor: null,
        nombre: "",
        sigla: ""
    })

    const [formEdicion, setFormEdicion] = useState({
        idOrgEmisor: null,
        nombre: "",
        sigla: ""
    })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'nombre':
                setForm({ ...form, nombre: value })
                break;
            case 'sigla':
                setForm({ ...form, sigla: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'nombre':
                setFormEdicion({ ...formEdicion, nombre: value })
                break;
            case 'sigla':
                setFormEdicion({ ...formEdicion, sigla: value })
                break;
        }
    }

    const getOrganismosEmisores = async () => {
        let body = {
            ...paginacion,
            ...buscador
        }
        await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores', body, localStorage.getItem("token"))
            .then((res) => {
                setOrganismosEmisores(res.data.data)
                setTotalOrg(res.data.totalOrg)
                let auxPaginacion = paginacion;
                auxPaginacion.totalPaginas = Math.ceil(res.data.totalOrg / auxPaginacion.limite);
                auxPaginacion.botones = [];
                for (let i = 1; i <= paginacion.totalPaginas; i++) {
                    auxPaginacion.botones.push(i)
                }
                setPaginacion({ ...auxPaginacion });
            })
            .catch()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrorCarga()
            setLoading(true);
            let body = {
                usuario: localStorage.getItem("user_cuit"),
                idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
                sigla: form.sigla,
                nombre: form.nombre
            }
            await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores/crear', body, localStorage.getItem("token"))
                .then(_ => {
                    setForm({
                        nombre: "",
                        sigla: ""
                    })
                    getOrganismosEmisores()
                })
            setLoading(false)
        }
        catch (e) {
            setErrorCarga(e?.data?.mensaje ? e.data.mensaje : "Ocurrió un error al crear la repartición. Verifique los datos ingresados o inténtelo de nuevo.")
            setLoading(false)
            document.getElementById("boton-formulario-repa").click()
        }
    }

    async function borrar(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idOrgEmisor: id
        }
        await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores/borrar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModalBorrar(false);
                window.location.reload();
            })
            .catch()

        setLoading(false)
    }

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idOrgEmisor: elem.idOrgEmisor,
            nombre: elem.nombre,
            sigla: elem.sigla
        })
        if (habilitarEdicion) {
            setFormEdicion({ idOrgEmisor: null, nombre: "", sigla: "" })
        }
        setHabilitarEdicion(!habilitarEdicion)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idOrgEmisor: id,
            nombre: formEdicion.nombre,
            sigla: formEdicion.sigla
        }
        
        await ApiPinPost('/api/v1/boletin-oficial/organismos-emisores/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getOrganismosEmisores();
                setLoading(false)
                setHabilitarEdicion(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
            })

    }

    const busqueda = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'busqueda':
                setBuscador({ busqueda: value })
                break;
        }
    }

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getOrganismosEmisores()
        }
    }, [paginacion])

    useEffect(async () => {
        setLoading(true)
        await getOrganismosEmisores().catch()
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5">
                <div id="accordion">
                    <div class="accordion-wrapper">
                        <div class="accordion">
                            <div class="card">
                                <button
                                    type="button"
                                    class="card-header collapsed card-link"
                                    data-toggle="collapse"
                                    data-target="#collapseOne"
                                    id="boton-formulario-repa"
                                >
                                    Nuevo Organismo Emisor
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper d-flex align-items-center" onSubmit={e => handleSubmit(e)}>
                                            <div class="form-group" style={{ width: "60%" }}>
                                                <label for="nombre">Organismo Emisor</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nombre"
                                                    name="nombre"
                                                    value={form.nombre}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <div class="form-group ml-5">
                                                <label for="sigla">Sigla</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="sigla"
                                                    name="sigla"
                                                    value={form.sigla}
                                                    onChange={e => handleForm(e)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary ml-5">Guardar</button>
                                        </form>
                                        {errorCarga && <div className="alert alert-danger">{errorCarga}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <br></br>
                <div>
                    <h2>Buscador</h2>

                    <div className="card-body">
                        <div className="form-group ml-1" /* style={{ width: "35%" }} */>
                            <div className="row">
                                <div className="col-md-9">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        id="busqueda"
                                        name="busqueda"
                                        placeholder="Filtrar por nombre o sigla"
                                        onKeyDown={e => e.code === "Enter" ? getOrganismosEmisores() : null}
                                        onChange={busqueda}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary ml-5"
                                        onClick={getOrganismosEmisores}
                                    >
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <br></br>

                {organismosEmisores && organismosEmisores.length > 0 &&
                    <div className="d-flex flex-column align-items-center">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Organismo Emisor</th>
                                    <th>Sigla</th>
                                    <th></th>
                                    {habilitarEdicion && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {organismosEmisores.map((elem) => (<tr>
                                    {habilitarEdicion && formEdicion.idOrgEmisor === elem.idOrgEmisor? <>
                                        <td><input type="text" className="form-control" name="nombre" id="nombre"
                                            defaultValue={elem.nombre} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td><input type="text" className="form-control" name="sigla" id="sigla"
                                            defaultValue={elem.sigla} onChange={(e) => handleFormEdicion(e)} />
                                        </td>
                                        <td>
                                            <button 
                                                type="button" className="btn btn-primary btn-sm mr-2"
                                                onClick={(e) => guardarEdicion(e, elem.idOrgEmisor)}
                                            >
                                                <FaCheck />
                                            </button>
                                        </td>
                                    </>
                                        : <>
                                            <td>{elem.nombre}</td>
                                            <td>{elem.sigla}</td>
                                        </>}
                                    <td style={{ maxWidth: "fit-content" }}>
                                        <button type="button" className="btn btn-success btn-sm" onClick={(e) => { setHabilitarEdicion(true); edicion(e, elem) }}>
                                            <FaEdit />
                                        </button>&nbsp;&nbsp;
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => { setIdBorrar(elem.idOrgEmisor); setOrgBorrar(elem.nombre); setShowModalBorrar(!showModalBorrar) }}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                            <Pagination pages={paginacion.totalPaginas}
                                onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
                    </div>
                }
            </div>
            <Modal 
                show={showModalBorrar} 
                //size="lg" 
                onHide={() => setShowModalBorrar(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este Organismo Emisor?</Modal.Title>
                </Modal.Header>
                <Modal.Footer style={{ justifyContent: "center" }}>
                    <div>
                        <p>{orgBorrar}</p>
                    </div>
                    <br/>
                    <div style={{ marginLeft: "auto" }}>
                        <button className="btn btn-link" onClick={() => setShowModalBorrar(false)}>
                            Volver
                        </button>
                        <button className="btn btn-danger" onClick={(e) => setShowModalConfirmar(true)}>
                            Confirmar
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal 
                show={showModalConfirmar} 
                //size="lg" 
                onHide={() => setShowModalBorrar(false)}>
                <Modal.Header>
                    <Modal.Title>Esta completamente seguro?</Modal.Title>
                </Modal.Header>
                <Modal.Footer style={{ justifyContent: "center" }}>
                    <div>
                        <p>Una vez realizada la acción no podra <strong>deshacerla</strong></p>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <button className="btn btn-link" onClick={() => setShowModalConfirmar(false)}>
                            Cancelar
                        </button>
                        <button className="btn btn-danger" onClick={(e) => {borrar(e, idBorrar); setShowModalBorrar(false)}}>
                            Confirmar
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>)
};

export default OrganismoEmisor;