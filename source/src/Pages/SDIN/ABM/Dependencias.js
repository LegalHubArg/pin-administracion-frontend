import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { decode } from 'html-entities';
import { Autocomplete } from '../../../Components/Autocomplete/Autocomplete';
import { Pagination } from '@gcba/obelisco'

const DependenciasABM = props => {
    const [dependenciasABM, setDependenciasABM] = useState([])
    const [dependencias, setDependencias] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [habilitarEdicion, setHabilitarEdicion] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showExiste, setShowExiste] = useState(false)
    const [showEditar, setShowEditar] = useState(false)
    const [dependenciaBorrar, setDependenciaBorrar] = useState(null)
    const [orgEmisores, setOrgEmisores] = useState([])
    const [niveles, setNiveles] = useState([])
    const [totalResultados, setTotalResultados] = useState()
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getDependenciasABM()
        }
    }, [paginacion])

    const getDependencias = () => {
        try {
            ApiPinGet(`/api/v1/sdin/dependencias`, localStorage.getItem("token"))
            .then((n) => {
                setDependencias(n.data.data)
            })
            .catch((e) => {
                throw(e)
            })
        } catch (error) {
            console.log('error:', error)
        }
    }

    const initForm = {
        dependencia: "",
        sigla: "",
        orden: null,
        idOrganismo: null,
        fechaHasta: '',
        fechaDesde: '',
        padre: null,
        nivel: null,
        idNormaSDIN: null
    }
    const [form, setForm] = useState(initForm)

    const initFormEdicion = {
        idDependencia: null,
        dependencia: "",
        sigla: "",
        orden: null,
        idOrganismoEmisor: null,
        fechaHasta: '',
        fechaDesde: '',
        padre: null,
        nivel: null,
        idNormaSDIN: null
    }
    const [formEdicion, setFormEdicion] = useState(initFormEdicion)
    const [filtros, setFiltros] = useState({ estado: '', padre: '', idOrganismoEmisor: '', texto: '', id: '' })

    const handleForm = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'dependencia':
                setForm({ ...form, dependencia: value })
                break;
            case 'sigla':
                setForm({ ...form, sigla: value })
                break;
            case 'orden':
                setForm({ ...form, orden: value })
                break;
            case 'orgEmisor':
                setForm({ ...form, idOrganismo: value })
                break;
            case 'fechaDesde':
                setForm({ ...form, fechaDesde: value })
                break;
            case 'fechaHasta':
                setForm({ ...form, fechaHasta: value })
                break;
            case 'padre':
                setForm({ ...formEdicion, padre: value })
                break;
            case 'idNormaSDIN':
                setForm({ ...formEdicion, idNormaSDIN: value })
                break;
            case 'nivel':
                setForm({ ...formEdicion, nivel: value })
                break;
        }
    }

    const handleFormEdicion = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case 'dependencia':
                setFormEdicion({ ...formEdicion, dependencia: value })
                break;
            case 'sigla':
                setFormEdicion({ ...formEdicion, sigla: value })
                break;
            case 'orden':
                setFormEdicion({ ...formEdicion, orden: value })
                break;
            case 'organismoEmisor':
                setFormEdicion({ ...formEdicion, idOrganismoEmisor: value })
                break;
            case 'fechaDesde':
                setFormEdicion({ ...formEdicion, fechaDesde: value })
                break;
            case 'fechaHasta':
                setFormEdicion({ ...formEdicion, fechaHasta: value })
                break;
            case 'padre':
                setFormEdicion({ ...formEdicion, padre: value })
                break;
            case 'nivel':
                setFormEdicion({ ...formEdicion, nivel: value })
                break;
            case 'idNormaSDIN':
                setFormEdicion({ ...formEdicion, idNormaSDIN: parseInt(value) })
                break;
        }

    }


    const getDependenciasABM = async () => {
        try {
            let params = Object.entries({ ...filtros, ...paginacion }).filter(n => n[1]).map(([key, value]) => (value ? key + '=' + value : '')).join('&')
            await ApiPinGet(`/api/v1/sdin/dependencias?${params}`, localStorage.getItem("token"))
                .then((res) => {
                    setDependenciasABM(res.data.data)
                    setTotalResultados(res.data.total)
                    setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
                })
        }
        catch (error) {
        }
    }

    const getOrgEmisores = async () => {
        await ApiPinGet('/api/v1/sdin/organismos', localStorage.getItem("token"))
            .then((res) => {
                setOrgEmisores(res.data.data)
            })
            .catch()
    }

    const getNiveles = async () => {
        await ApiPinGet('/api/v1/sdin/dependencias/niveles', localStorage.getItem("token"))
            .then((res) => {
                setNiveles(res.data.data)
            })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            ...form
        }
        await ApiPinPost('/api/v1/sdin/abm/dependencias/agregar', body, localStorage.getItem("token"))
            .then(_ => {
                setForm(initForm)
                getDependenciasABM()
            })
            .catch(error =>
                setShowExiste(true)
            )
        setLoading(false)
    }

    const handleBusqueda = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let params = Object.entries(filtros).filter(n => n[1]).map(([key, value]) => (value ? key + '=' + value : '')).join('&')
            await ApiPinGet(`/api/v1/sdin/dependencias?${params}`, localStorage.getItem("token"))
                .then((res) => {
                    setDependenciasABM(res.data.data)
                    setTotalResultados(res.data.total)
                    setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
                })
        }
        catch (e) {

        }
        finally {
            setLoading(false)
        }
    }
    const handleFiltros = (e) => {
        switch (e.target.name) {
            case ('estado'):
                setFiltros({ ...filtros, estado: e.target.value })
                break;
            case ('padre'):
                setFiltros({ ...filtros, padre: e.target.value })
                break;
            case ('id'):
                setFiltros({ ...filtros, id: e.target.value })
                break;
            case ('texto'):
                setFiltros({ ...filtros, texto: e.target.value })
                break;
            case ('FiltroOrgEmisor'):
                setFiltros({ ...filtros, idOrganismoEmisor: e.target.value })
                break;
        }
        return;
    }

    async function borrarDependencia(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            idDependencia: id
        }
        await ApiPinPost('/api/v1/sdin/abm/dependencias/eliminar', body, localStorage.getItem("token"))
            .then(_ => {
                setShowModal(false);
                getDependenciasABM()
            })
            .catch()

        setLoading(false)
    }

    async function guardarEdicion(e, id) {
        e.preventDefault();
        setLoading(true)
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idDependencia: id,
            ...formEdicion,
            fechaDesde: moment(formEdicion.fechaDesde).format('YYYY-MM-DD'),
            fechaHasta: formEdicion.fechaHasta ? moment(formEdicion.fechaHasta).format('YYYY-MM-DD') : null
        }

        await ApiPinPost('/api/v1/sdin/abm/dependencias/editar', body, localStorage.getItem("token"))
            .then(_ => {
                getDependenciasABM()
                setFormEdicion(initFormEdicion)
                getDependenciasABM()
                setLoading(false)
                setHabilitarEdicion(false)
                setShowEditar(false)
            })
            .catch(err => {
                setHabilitarEdicion(false)
                setLoading(false)
                setShowEditar(false)
            })

    }

    async function edicion(e, elem) {
        e.preventDefault();
        setFormEdicion({
            idDependencia: elem.idDependencia,
            dependencia: elem.dependencia,
            sigla: elem.sigla,
            orden: elem.orden,
            fechaDesde: elem.fechaDesde ? new Date(elem.fechaDesde).toISOString().substring(0, 10) : null,
            fechaHasta: elem.fechaHasta ? new Date(elem.fechaHasta).toISOString().substring(0, 10) : null,
            idOrganismoEmisor: elem.idOrganismoEmisor,
            nivel: elem.nivel,
            idNormaSDIN: elem.idNormaSDIN,
            padre: elem.padre
        })
        /* if (habilitarEdicion) {
            setFormEdicion({ idDependencia: null, dependencia: "", sigla: "", orden: null, fechaDesde: '', fechaHasta: '', idOrganismoEmisor: null })
        }
        setHabilitarEdicion(!habilitarEdicion) */
    }

    async function handleDepende(elem) {
        setFiltros({ estado: '', idOrganismoEmisor: '', texto: '', id: '', padre: elem.idDependencia });
        await ApiPinGet(`/api/v1/sdin/dependencias?&padre=${elem.idDependencia}`, localStorage.getItem("token"))
            .then((res) => {
                setDependenciasABM(res.data.data)
                setTotalResultados(res.data.total)
                setPaginacion({ ...paginacion, totalPaginas: res.data.totalPaginas })
            })
    }

    useEffect(async () => {
        setLoading(true)
        await getDependenciasABM()
        getDependencias()
        await getOrgEmisores()
        await getNiveles()
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
                                >
                                    Nueva Dependencia
                                </button>
                                <div id="collapseOne" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper" onSubmit={e => handleSubmit(e)}>
                                            <div className="row">
                                                <div class="form-group col-7">
                                                    <label for="normaTipo">Dependencia *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="dependencia"
                                                        name="dependencia"
                                                        value={form.dependencia}
                                                        onChange={e => handleForm(e)}
                                                        required
                                                    />
                                                </div>
                                                <div class="form-group col">
                                                    <label for="sigla">Sigla *</label>
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
                                                <div className="form-group col-3">
                                                    <label for="orgEmisor">Organismo Emisor *</label>
                                                    <select className="custom-select" id="orgEmisor" name="orgEmisor" required
                                                        value={form.idOrganismo}
                                                        onChange={(e) => handleForm(e)}>
                                                        <option value={""} hidden></option>
                                                        {orgEmisores && orgEmisores.map(n =>
                                                            <option key={n.idOrganismo} value={n.idOrganismo}>{decode(n.organismo)}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div class="form-group col-5">
                                                    <label for="nivel">Nivel *</label>
                                                    <select className="custom-select" id="nivel" name="nivel" required
                                                        value={form.nivel}
                                                        onChange={(e) => handleForm(e)}>
                                                        <option value={""} hidden></option>
                                                        {niveles && niveles.map(n =>
                                                            <option key={n.nivel} value={n.id}>{n.nivel}</option>
                                                        )}
                                                    </select>
                                                </div>
                                                <div class="form-group col">
                                                    <label for="fechaDesde">Vigente desde *</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="fechaDesde"
                                                        name="fechaDesde"
                                                        value={form.fechaDesde}
                                                        onChange={e => handleForm(e)}
                                                    />
                                                </div>
                                                <div class="form-group col">
                                                    <label for="fechaHasta">Vigente hasta</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="fechaHasta"
                                                        name="fechaHasta"
                                                        value={form.fechaHasta}
                                                        onChange={e => handleForm(e)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-5">
                                                    <label>Padre</label>
                                                    <Autocomplete
                                                        valores={dependencias.map(n => ({ id: n.idDependencia, nombre: decode(n.dependencia) }))}
                                                        setValue={e => setForm({ ...form, padre: e.id })} />
                                                </div>
                                                <div class="form-group col">
                                                    <label for="idNormaSDIN">Id de la norma</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="idNormaSDIN"
                                                        name="idNormaSDIN"
                                                        value={form.idNormaSDIN}
                                                        onChange={e => handleForm(e)}
                                                    />
                                                </div>
                                                <div class="form-group col">
                                                    <label for="orden">Orden</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="orden"
                                                        name="orden"
                                                        value={form.orden}
                                                        onChange={e => handleForm(e)}
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary">Guardar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="accordion">
                    <div class="accordion-wrapper">
                        <div class="accordion">
                            <div class="card">
                                <button
                                    type="button"
                                    class="card-header collapsed card-link"
                                    data-toggle="collapse"
                                    data-target="#collapse2"
                                >
                                    Filtros
                                </button>
                                <div id="collapse2" class="collapse" data-parent="#accordion">
                                    <div class="card-body">
                                        <form className="form-wrapper" onSubmit={handleBusqueda}>
                                            <div className="row">
                                                <div className="form-group col-6">
                                                    <label for="texto">Texto</label>
                                                    <input type="text" name="texto" className="form-control form-control-sm"
                                                        placeholder='Nombre o sigla de la dependencia'
                                                        onChange={handleFiltros} value={filtros.texto} />
                                                </div>
                                                <div className="form-group col-2">
                                                    <label for="padre">ID</label>
                                                    <input type="number" name="id" className="form-control form-control-sm"
                                                        onChange={handleFiltros} value={filtros.id} />
                                                </div>
                                                <div className="form-group col-3">
                                                    <label for="estado">Vigencia</label>
                                                    <select className="custom-select custom-select-sm" id="estado" name="estado"
                                                        value={filtros.estado} onChange={(e) => handleFiltros(e)}>
                                                        <option value="">Todas</option>
                                                        <option value="vigentes">Vigentes</option>
                                                        <option value="no vigentes">No vigentes</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-6">
                                                    <label for="FiltroOrgEmisor">Organismo Emisor</label>
                                                    <select className="custom-select custom-select-sm" id="FiltroOrgEmisor" name="FiltroOrgEmisor"
                                                        value={filtros.idOrganismoEmisor}
                                                        onChange={(e) => handleFiltros(e)}>
                                                        <option value=""></option>
                                                        {orgEmisores && orgEmisores.map(n =>
                                                            <option key={n.idOrganismo} value={n.idOrganismo}>{decode(n.organismo)}</option>
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="form-group col-2">
                                                    <label for="padre">ID Padre</label>
                                                    <input type="number" name="padre" className="form-control form-control-sm"
                                                        onChange={handleFiltros} value={filtros.padre} />
                                                </div>
                                            </div>
                                            <button className="btn btn-sm btn-primary" type="submit">Aplicar</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p>Resultados ({totalResultados}): </p>
                <table className="table table-bordered table-sm" style={{ fontSize: 12 }}>
                    <thead style={{ top: 0, position: 'sticky' }}>
                        <tr>
                            <th>ID</th>
                            <th>Org.</th>
                            <th>Sigla</th>
                            <th>Dependencia</th>
                            <th>Dp.</th>
                            <th>Orden</th>
                            <th>Vigente Desde</th>
                            <th>Vigente Hasta</th>
                            <th>Padre</th>
                            <th>Nivel</th>
                            <th style={{ width: "60px"}}>Norma</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {dependenciasABM.map((elem) => (<tr>
                            {habilitarEdicion && formEdicion.idDependencia === elem.idDependencia ? <>
                                <td>{elem.idDependencia}</td>
                                <td>
                                    <select className="form-control form-control-sm" id="organismoEmisor" name="organismoEmisor" required
                                        value={formEdicion.idOrganismoEmisor}
                                        onChange={(e) => handleFormEdicion(e)}>
                                        <option value={""} hidden></option>
                                        {orgEmisores && orgEmisores.map(n =>
                                            <option key={n.idOrganismo} value={n.idOrganismo}>{decode(n.organismo)}</option>
                                        )}
                                    </select>
                                </td>
                                <td><input type="text" className="form-control form-control-sm" name="sigla" id="sigla"
                                    value={formEdicion.sigla} onChange={(e) => handleFormEdicion(e)} />
                                </td>
                                <td><input type="text" className="form-control form-control-sm" name="dependencia" id="dependencia"
                                    value={formEdicion.dependencia} onChange={(e) => handleFormEdicion(e)} />
                                </td>
                                <td>{elem.Dp} [{elem.DpVigentes}]</td>
                                <td><input type="number" className="form-control form-control-sm" name="orden" id="orden"
                                    value={formEdicion.orden} onChange={(e) => handleFormEdicion(e)} />
                                </td>
                                <td><input type="date" className="form-control form-control-sm" name="sigla" id="fechaDesde"
                                    value={formEdicion.fechaDesde} onChange={(e) => handleFormEdicion(e)} />
                                </td>
                                <td><input type="date" className="form-control form-control-sm" name="orden" id="fechaHasta"
                                    value={formEdicion.fechaHasta} onChange={(e) => handleFormEdicion(e)} />
                                </td>
                                <td>
                                    <Autocomplete
                                        valores={dependenciasABM.map(n => ({ id: n.idDependencia, nombre: decode(n.dependencia) }))}
                                        setValue={e => setFormEdicion({ ...formEdicion, padre: e.id })}
                                        defaultValue={decode(dependenciasABM.find(n => n.idDependencia === formEdicion.padre)?.dependencia)} />
                                </td>
                                <td>
                                    <select className="custom-select" id="nivel" name="nivel" required
                                        value={formEdicion.nivel}
                                        onChange={(e) => handleFormEdicion(e)}>
                                        <option value={""} hidden></option>
                                        {niveles && niveles.map(n =>
                                            <option key={n.nivel} value={n.id}>{n.nivel}</option>
                                        )}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        id="idNormaSDIN"
                                        name="idNormaSDIN"
                                        value={formEdicion.idNormaSDIN}
                                        onChange={e => handleFormEdicion(e)}
                                    />
                                </td>
                            </>
                                : <>
                                    <td>{elem.idDependencia}</td>
                                    <td>{elem.organismoSigla}</td>
                                    <td>{elem.sigla}</td>
                                    <td>{decode(elem.dependencia)}</td>
                                    <td><div role="button" onClick={_ => handleDepende(elem)}>{elem.Dp} [{elem.DpVigentes}]</div></td>
                                    <td>{elem.orden}</td>
                                    <td>{elem.fechaDesde ? moment(elem.fechaDesde).format('DD/MM/YYYY') : ''}</td>
                                    <td>{elem.fechaHasta ? moment(elem.fechaHasta).format('DD/MM/YYYY') : ''}</td>
                                    <td>{elem.padreNombre ? decode(elem.padreNombre) : ''}</td>
                                    <td>{elem.nombreNivel}</td>
                                    <td>
                                        <Link to={"/sdin/ficha-norma/" + String(elem.idNormaSDIN)}>
                                            {elem.idNormaSDIN}
                                        </Link>
                                    </td>
                                </>}
                            <td className="d-flex justify-content-end">
                                {habilitarEdicion && formEdicion.idDependencia === elem.idDependencia &&
                                    <button type="button" className="btn btn-primary btn-sm mr-2"
                                        onClick={(e) => guardarEdicion(e, elem.idDependencia)}>
                                        Guardar
                                    </button>}
                                <button type="button" className="btn btn-secondary btn-sm mr-2" onClick={(e) => {edicion(e, elem); setShowEditar(true)}}>
                                    <i className="bx bx-edit" />
                                </button>
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => { setDependenciaBorrar(elem.idDependencia); setShowModal(true) }}>
                                    <i className="bx bx-trash" />
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination pages={paginacion.totalPaginas}
                    onPageSelected={page => setPaginacion({ ...paginacion, paginaActual: page + 1, cambiarPagina: true })} />
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este tema?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowModal(false)}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => borrarDependencia(e, dependenciaBorrar)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={showExiste} onHide={() => setShowExiste(true)}>
                <Modal.Header>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <h1>
                        Este tema ya existe
                    </h1>
                    <button className="btn btn-link" onClick={() => setShowExiste(false)}>
                        Volver
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditar} size="lg" onHide={() => setShowEditar(false)}>
                <Modal.Header>
                    <Modal.Title>Edición</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <br/>
                    <div class='row'>
                        <div class='col col-md-9'>
                            <label for="organismoEmisor">Organismo Emisor</label>
                            <select 
                                className="form-control form-control-sm" 
                                id="organismoEmisor" 
                                name="organismoEmisor" 
                                required
                                value={formEdicion.idOrganismoEmisor}
                                onChange={(e) => handleFormEdicion(e)}
                            >
                                <option value={""} hidden></option>
                                {orgEmisores && orgEmisores.map(n =>
                                    <option key={n.idOrganismo} value={n.idOrganismo}>{decode(n.organismo)}</option>
                                )}
                            </select>
                        </div>
                        <div class='col col-md-3'>
                            <label for="sigla">Sigla</label>
                            <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                name="sigla" 
                                id="sigla"
                                value={formEdicion.sigla} 
                                onChange={(e) => handleFormEdicion(e)} 
                            />
                        </div>
                    </div>
                    <br/>
                    <div class='row'>
                        <div class='col col-md-3'>
                            <label for="orden">Orden</label>
                            <input 
                                type="number" 
                                className="form-control form-control-sm" 
                                name="orden" 
                                id="orden"
                                value={formEdicion.orden} 
                                onChange={(e) => handleFormEdicion(e)} 
                            />
                        </div>
                        <div class='col col-md-9'>
                            <label for="dependencia">Dependencia</label>
                            <input 
                                type="text" 
                                className="form-control form-control-sm" 
                                name="dependencia" 
                                id="dependencia"
                                value={formEdicion.dependencia} 
                                onChange={(e) => handleFormEdicion(e)} 
                            />
                        </div>
                    </div>
                    <br/>
                    <div class='row'>
                        <div class='col'>
                            <label for="fechaDesde">Fecha Desde</label>
                            <input 
                                type="date" 
                                className="form-control form-control-sm" 
                                name="fechaDesde" 
                                id="fechaDesde"
                                value={formEdicion.fechaDesde} 
                                onChange={(e) => handleFormEdicion(e)} 
                            />
                        </div>
                        <div class='col'>
                            <label for="fechaHasta">Fecha Hasta</label>
                            <input 
                                type="date" 
                                className="form-control form-control-sm" 
                                name="fechaHasta" 
                                id="fechaHasta"
                                value={formEdicion.fechaHasta} 
                                onChange={(e) => handleFormEdicion(e)} 
                            />
                        </div>
                    </div>
                    <br/>
                    <div class='row'>
                        <div class='col col-md-7'>
                            <label for=''>Padre</label>
                            <Autocomplete
                                valores={dependencias.map(n => ({ id: n.idDependencia, nombre: decode(n.dependencia) }))}
                                setValue={e => setFormEdicion({ ...formEdicion, padre: e.id })}
                                defaultValue={decode(dependencias.find(n => n.idDependencia === formEdicion.padre)?.dependencia)} 
                            />
                        </div>
                        <div class='col col-md-3'>
                            <label for='nivel'>Nivel</label>
                            <select 
                                className="custom-select" 
                                id="nivel" 
                                name="nivel" 
                                required
                                value={formEdicion.nivel}
                                onChange={(e) => handleFormEdicion(e)}
                            >
                                <option value={""} hidden></option>
                                {niveles && niveles.map(n =>
                                    <option key={n.nivel} value={n.id}>{n.nivel}</option>
                                )}
                            </select>
                        </div>
                        <div class='col col-md-2'>
                            <label for='idNormaSDIN'>Norma</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                id="idNormaSDIN"
                                name="idNormaSDIN"
                                value={formEdicion.idNormaSDIN}
                                onChange={e => handleFormEdicion(e)}
                            />
                        </div>
                    </div>
                    <br/>
                    <hr/>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setShowEditar(false)}>
                        Volver
                    </button>
                    <button 
                        className="btn btn-primary btn-sm mr-2"
                        onClick={(e) => guardarEdicion(e, formEdicion.idDependencia)}
                    >
                        Guardar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default DependenciasABM;