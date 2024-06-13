import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { FaCheck, FaEdit, FaEllipsisV, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { getOrganismos } from '../../Helpers/consultas';
import './Jerarquia.css';
import { Pagination } from '@gcba/obelisco';
import { Tree, TreeNode } from 'react-organizational-chart';

const Jerarquia = props => {
    const [jerarquiaTabla, setJerarquiaTabla] = useState([])
    const [jerarquia, setJerarquia] = useState([])
    const [repas, setRepas] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalAgregarHijo, setModalAgregarHijo] = useState({ show: false, data: null })
    const [modalBorrar, setModalBorrar] = useState({ show: false, data: null })
    const [formAgregarRepa, setFormAgregarRepa] = useState({ idReparticion: null, aplicaBO: false, aplicaSDIN: false, aplicaDJ: false })
    const [formVistaTabla, setFormVistaTabla] = useState({
        idReparticionHijo: null, idReparticionPadre: null,
        aplicaBO: false, aplicaSDIN: false, aplicaDJ: false
    })

    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await getJerarquiaTabla()
        }
    }, [paginacion])

    const getJerarquia = async () => {
        try {
            const { data: { data } } = await ApiPinGet(`/api/v1/organismos/jerarquia`, localStorage.getItem('token'))
            setJerarquia(data)
        }
        catch (err) { }
    }

    const getJerarquiaTabla = async () => {
        try {
            let { paginaActual, limite } = { ...paginacion }
            const { data: { data, totalPaginas } } = await ApiPinGet(
                `/api/v1/organismos/jerarquia?paginaActual=${paginaActual}&limite=${limite}`,
                localStorage.getItem('token'))
            setJerarquiaTabla(data)
            setPaginacion({ ...paginacion, totalPaginas })
        }
        catch (err) { }
    }

    const handleAgregarRepa = async (e) => {
        e.preventDefault();
        if (!(formAgregarRepa.aplicaBO || formAgregarRepa.aplicaSDIN || formAgregarRepa.aplicaDJ)) return;
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
                idReparticionHijo: formAgregarRepa.idReparticion,
                aplicaBO: formAgregarRepa.aplicaBO,
                aplicaSDIN: formAgregarRepa.aplicaSDIN,
                aplicaDJ: formAgregarRepa.aplicaDJ,
                idReparticionPadre: modalAgregarHijo.data.idReparticion
            }
            await ApiPinPost('/api/v1/organismos/jerarquia/reparticion/crear', body, localStorage.getItem('token'))
                .then(_ => window.location.reload())
                .catch(error => { throw error })
        }
        catch (error) {

        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
                ...formVistaTabla
            }
            await ApiPinPost('/api/v1/organismos/jerarquia/reparticion/crear', body, localStorage.getItem('token'))
                .then(async _ => {
                    await getJerarquiaTabla();
                    setLoading(false)
                })
                .catch(error => { throw error })
        }
        catch (error) { setLoading(false) }
    }

    const handleBorrar = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            let body = {
                usuario: localStorage.getItem('user_cuit'),
                idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
                idOrgJerarquia: modalBorrar.data.idOrgJerarquia
            }

            await ApiPinPost('/api/v1/organismos/jerarquia/reparticion/borrar', body, localStorage.getItem('token'))
                .then(async _ => {
                    await getJerarquiaTabla();
                    setModalBorrar({ show: false, data: null });
                    setLoading(false)
                })
                .catch(error => { throw error })
        }
        catch (error) { setLoading(false) }
    }

    const handleFormAgregar = async (e) => {
        switch (e.target.id) {
            case 'idReparticion':
                setFormAgregarRepa({ ...formAgregarRepa, idReparticion: e.target.value })
                break;
            case 'aplicaBO':
                setFormAgregarRepa({ ...formAgregarRepa, aplicaBO: e.target.checked })
                break;
            case 'aplicaSDIN':
                setFormAgregarRepa({ ...formAgregarRepa, aplicaSDIN: e.target.checked })
                break;
            case 'aplicaDJ':
                setFormAgregarRepa({ ...formAgregarRepa, aplicaDJ: e.target.checked })
                break;
        }
    }

    const handleFormVistaTabla = async (e) => {
        switch (e.target.id) {
            case 'idReparticionHijo':
                setFormVistaTabla({ ...formVistaTabla, idReparticionHijo: e.target.value })
                break;
            case 'idReparticionPadre':
                setFormVistaTabla({ ...formVistaTabla, idReparticionPadre: e.target.value })
                break;
            case 'aplicaBO':
                setFormVistaTabla({ ...formVistaTabla, aplicaBO: e.target.checked })
                break;
            case 'aplicaSDIN':
                setFormVistaTabla({ ...formVistaTabla, aplicaSDIN: e.target.checked })
                break;
            case 'aplicaDJ':
                setFormVistaTabla({ ...formVistaTabla, aplicaDJ: e.target.checked })
                break;
        }
    }

    const TarjetaNodo = ({ data }) => {
        return (
            <div className="nodo" tabIndex="0">
                <div className="nombre">{data.siglaReparticion}</div>
                <div className="opciones hidden-data" data-toggle="dropdown"><FaEllipsisV /></div>
                <ul class="dropdown-menu">
                    <li>
                        <button type="button" className="dropdown-item" onClick={() => setModalAgregarHijo({ show: true, data })}>
                            <FaPlus />&nbsp;&nbsp;Agregar una Reparticion
                        </button>
                        <button type="button" className="dropdown-item" onClick={() => setModalBorrar({ show: true, data })}>
                            <FaTrash />&nbsp;&nbsp;Borrar ítem
                        </button>
                    </li>
                </ul>
                <div className="hidden-data">{data.reparticion}</div>
                <div className="hidden-data">Aplica: <b>{!!data.aplicaBO && "BO"}&nbsp;{!!data.aplicaSDIN && "SDIN"}&nbsp;{!!data.aplicaDJ && "DJ"}</b></div>
                {/* <button type="button" className="agregar-hijo" onClick={() => setModalAgregarHijo({ show: true, data })}><FaPlus /></button> */}
            </div>
        )
    }

    //Construyo el árbol jerárquico con recursividad.
    //Pasa por parámetro el array con los hijos de la repartición.
    const ArbolJerarquico = (children) => {
        let jerarquiaAux = [...jerarquia];
        if (!children) {

            //Busco los nodos raíz, tienen padre null
            let raices = jerarquiaAux.filter(elem => elem.idReparticionOrganismo === null);

            let arboles = [];

            for (const raiz of raices) {

                let repasHijas = jerarquiaAux.filter(elem => elem.idReparticionOrganismo === raiz.idReparticion
                    && elem.idReparticion !== elem.idReparticionOrganismo);

                arboles.push(
                    <div className="tree-wrapper">
                        <Tree
                            lineWidth={'2px'}
                            lineColor={'#9B59B6'}
                            lineBorderRadius={'10px'}
                            label={<TarjetaNodo data={raiz} />}
                        >
                            {repasHijas.length > 0 ? ArbolJerarquico(repasHijas) : null}
                        </Tree>
                    </div>)
            }
            return (arboles)
        }

        let nodos = [];
        for (const child of children) {

            let repasHijas = jerarquiaAux.filter(elem => (elem.idReparticionOrganismo === child.idReparticion
                && elem.idReparticionOrganismo !== elem.idReparticion));

            nodos.push(
                <TreeNode label={<TarjetaNodo data={child} />}
                >
                    {repasHijas.length > 0 ? ArbolJerarquico(repasHijas) : null}
                </TreeNode>)
        }
        return nodos;
    }

    useEffect(async () => {
        setLoading(true)
        await getJerarquia();
        await getJerarquiaTabla();
        await getOrganismos().then(res => setRepas(res))
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5" id="pagina-jerarquia">
                {jerarquia?.length > 0 && !props.verTabla && <div className="d-flex flex-column" style={{ width: "100%" }}>{ArbolJerarquico()}</div>}
                {jerarquiaTabla?.length > 0 && props.verTabla && (
                    <div style={{ width: "100%" }}>
                        <div id="accordion">
                            <div className="accordion-wrapper">
                                <div className="accordion">
                                    <div className="card">
                                        <button
                                            type="button"
                                            className="card-header collapsed card-link"
                                            data-toggle="collapse"
                                            data-target="#collapseOne"
                                        >
                                            Nuevo ítem
                                        </button>
                                        <div id="collapseOne" className="collapse" data-parent="#accordion">
                                            <div className="card-body">
                                                <form onSubmit={e => handleSubmit(e)}>
                                                    <div className="row">
                                                        <div className="form-group col">
                                                            <label for="idReparticionPadre">Organismo</label>
                                                            <select className="custom-select" id="idReparticionPadre" name="idReparticionPadre"
                                                                value={formVistaTabla.idReparticionPadre !== null ? formVistaTabla.idReparticionPadre : -1}
                                                                onChange={(e) => handleFormVistaTabla(e)}>
                                                                <option value={-1} hidden></option>
                                                                {repas && repas.map(n =>
                                                                    <option key={'org-' + n.idReparticion} value={n.idReparticion}>{n.reparticion}</option>
                                                                )}
                                                            </select>
                                                        </div>
                                                        <div className="form-group col">
                                                            <label for="idReparticionHijo">Repartición</label>
                                                            <select className="custom-select" id="idReparticionHijo" name="idReparticionHijo"
                                                                value={formVistaTabla.idReparticionHijo !== null ? formVistaTabla.idReparticionHijo : -1}
                                                                onChange={(e) => handleFormVistaTabla(e)}>
                                                                <option value={-1} hidden></option>
                                                                {repas && repas.map(n =>
                                                                    <option key={'repa-' + n.idReparticion} value={n.idReparticion}>{n.reparticion}</option>
                                                                )}
                                                            </select>
                                                        </div>
                                                        <div className="col-2">
                                                            <div class="custom-control custom-checkbox">
                                                                <input
                                                                    className="custom-control-input"
                                                                    type="checkbox"
                                                                    id="aplicaBO"
                                                                    name="negocio"
                                                                    value="aplicaBO"
                                                                    checked={formVistaTabla.aplicaBO}
                                                                    onChange={(e) => handleFormVistaTabla(e)}
                                                                />
                                                                <label class="custom-control-label" for="aplicaBO">
                                                                    BO
                                                                </label>
                                                            </div>
                                                            <div class="custom-control custom-checkbox">
                                                                <input
                                                                    className="custom-control-input"
                                                                    type="checkbox"
                                                                    id="aplicaSDIN"
                                                                    name="negocio"
                                                                    value="aplicaSDIN"
                                                                    checked={formVistaTabla.aplicaSDIN}
                                                                    onChange={(e) => handleFormVistaTabla(e)}
                                                                />
                                                                <label class="custom-control-label" for="aplicaSDIN">
                                                                    SDIN
                                                                </label>
                                                            </div>
                                                            <div class="custom-control custom-checkbox">
                                                                <input
                                                                    className="custom-control-input"
                                                                    type="checkbox"
                                                                    id="aplicaDJ"
                                                                    name="negocio"
                                                                    value="aplicaDJ"
                                                                    checked={formVistaTabla.aplicaDJ}
                                                                    onChange={(e) => handleFormVistaTabla(e)}
                                                                />
                                                                <label class="custom-control-label" for="aplicaDJ">
                                                                    DJ
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary"
                                                        disabled={!(formVistaTabla.aplicaBO || formVistaTabla.aplicaSDIN || formVistaTabla.aplicaDJ)}>
                                                        Guardar</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                            <table className="table table-bordered table-sm">
                                <thead>
                                    <tr>
                                        <th>Organismo</th>
                                        <th>Repartición</th>
                                        <th>BO</th>
                                        <th>SDIN</th>
                                        <th>DJ</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jerarquiaTabla.map((elem) => (
                                        <tr>
                                            <td>{elem.organismo}</td>
                                            <td>{elem.reparticion}</td>
                                            <td>{elem.aplicaBO ? <FaCheck color="#26874A" /> : <FaMinus />}</td>
                                            <td>{elem.aplicaSDIN ? <FaCheck color="#26874A" /> : <FaMinus />}</td>
                                            <td>{elem.aplicaDJ ? <FaCheck color="#26874A" /> : <FaMinus />}</td>
                                            <td><button type="button" className="btn btn-danger btn-sm"
                                                onClick={() => { setModalBorrar({ show: true, data: elem }) }}>
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
                    </div>
                )}
            </div>
            <Modal show={modalBorrar?.show} onHide={() => setModalBorrar({ show: false, data: null })}>
                <Modal.Header>
                    <Modal.Title>Está seguro que desea eliminar este ítem?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <button className="btn btn-link" onClick={() => setModalBorrar({ show: false, data: null })}>
                        Volver
                    </button>
                    <button className="btn btn-danger" onClick={(e) => handleBorrar(e)}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
            <Modal show={modalAgregarHijo?.show} onHide={() => setModalAgregarHijo({ show: false, data: null })}>
                <Modal.Header>
                    <Modal.Title>
                        Agregar Repartición a: &nbsp;{modalAgregarHijo?.data?.reparticion}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="form-agregar-repa">
                    <div className="form-group">
                        <label for="repas">Repartición</label>
                        <select className="custom-select" id="idReparticion" name="idReparticion"
                            value={formAgregarRepa.idReparticion !== null ? formAgregarRepa.idReparticion : -1} onChange={(e) => handleFormAgregar(e)}>
                            <option value={-1} hidden></option>
                            {repas && repas.map(n =>
                                <option key={'repa-' + n.idReparticion} value={n.idReparticion}>{n.reparticion}</option>
                            )}
                        </select>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input
                            className="custom-control-input"
                            type="checkbox"
                            id="aplicaBO"
                            name="negocio"
                            value="aplicaBO"
                            checked={formAgregarRepa.aplicaBO}
                            onChange={(e) => handleFormAgregar(e)}
                        />
                        <label class="custom-control-label" for="aplicaBO">
                            BO
                        </label>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input
                            className="custom-control-input"
                            type="checkbox"
                            id="aplicaSDIN"
                            name="negocio"
                            value="aplicaSDIN"
                            checked={formAgregarRepa.aplicaSDIN}
                            onChange={(e) => handleFormAgregar(e)}
                        />
                        <label class="custom-control-label" for="aplicaSDIN">
                            SDIN
                        </label>
                    </div>
                    <div class="custom-control custom-checkbox">
                        <input
                            className="custom-control-input"
                            type="checkbox"
                            id="aplicaDJ"
                            name="negocio"
                            value="aplicaDJ"
                            checked={formAgregarRepa.aplicaDJ}
                            onChange={(e) => handleFormAgregar(e)}
                        />
                        <label class="custom-control-label" for="aplicaDJ">
                            DJ
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-link"
                        onClick={() => {
                            setModalAgregarHijo({ show: false, data: null });
                            setFormAgregarRepa({ idReparticion: null, aplicaBO: false, aplicaSDIN: false, aplicaDJ: false })
                        }}>
                        Volver
                    </button>
                    <button className="btn btn-primary" onClick={e => handleAgregarRepa(e)}
                        disabled={!formAgregarRepa.aplicaBO && !formAgregarRepa.aplicaSDIN && !formAgregarRepa.aplicaDJ}>
                        Confirmar
                    </button>
                </Modal.Footer>
            </Modal>
        </>)
};

export default Jerarquia;