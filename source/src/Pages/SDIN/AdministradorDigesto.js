import React, { useEffect, useState } from "react";
//Obelisco
import '@gcba/obelisco/dist/obelisco.css';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom'
import AdministradorDigesto from "./AdministradorDigesto.css";

const Anexos = props => {
    const navigate = useNavigate()

    const [isLoading, setLoading] = useState(false)
    const [leyesDigesto, setLeyesDigesto] = useState([])
    const [operacionExitosa, setOperacionExitosa] = useState(false);
    const [errorCorte, setErrorCorte] = useState(false);
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
    const [listado, setListado] = useState(['elemento 1', 'elemento 2']);

    const realizarCorte = async () => {
        setLoading(true)
        let token = localStorage.getItem("token");
        let body = {
            usuario: localStorage.getItem('user_cuit'),
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
        }
        try {
            await ApiPinPost('/api/v1/dj/corte-digesto', body, token)
                .then(_ => {
                    traerListado()
                    setShowModalConfirmacion(false)
                    setOperacionExitosa(true)
                    setErrorCorte(false)
                    setLoading(false)
                })
                .catch((err) => {
                    throw err
                })
        }
        catch (error) {
            setLoading(false)
            setErrorCorte(true)
            setOperacionExitosa(false)
            setShowModalConfirmacion(false)
        }
    }

    //cortes del digesto
    const traerListado = async () => {
        let token = localStorage.getItem("token");
        let body = {
            usuario: localStorage.getItem('user_cuit'),
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
        }
        await ApiPinPost('/api/v1/dj/cortes', body, token)
            .then(res => {
                setListado(res.data.data)
            })
            .catch((err) => {
                throw err
            })
    }

    //cortes del digesto
    const handleChange = (e, index) => {
        let listadoAux = listado;
        switch (e.target.name) {
            case 'enviadoLegislatura':
                listadoAux[index]['enviadoLegislatura'] = e.target.checked;
                setListado([...listadoAux])
                editarCorte(listadoAux[index])
                break;
            case 'aprobadoLegislatura':
                listadoAux[index]['aprobadoLegislatura'] = e.target.checked;
                setListado([...listadoAux])
                editarCorte(listadoAux[index])
                break;
        }
        return;
    }

    const editarCorte = async (corte) => {
        let token = localStorage.getItem("token");
        let body = {
            usuario: localStorage.getItem('user_cuit'),
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
            ...corte
        }
        await ApiPinPost('/api/v1/dj/cortes/editar', body, token)
            .catch((err) => {

            })
    }

    const getLeyesDigesto = async () => {
        let body = {
          usuario: localStorage.getItem('user_cuit'),
          idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario,
        };
        let token = localStorage.getItem("token");
        try {
          await ApiPinGet('/api/v1/dj/leyes-digesto', body, token)
            .then((res) => {
              const sortedData = res.data.data.sort((a, b) => b.idLeyDigesto - a.idLeyDigesto);
              
              setLeyesDigesto(sortedData);
            })
            .catch((err) => {
              throw err;
            });
        } catch (e) {
          // Handle errors if needed
          //console.log(e);
        }
      };

    useEffect(async () => {
        setLoading(true)
        await traerListado();
        await getLeyesDigesto()
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (
            <>
                <div className="container responsive mb-5">
                    <h3>Leyes Digesto</h3>
                    <hr />
                    <table class="table table-bordered table-hover" >
                        <thead>
                            <tr>
                                <th className="col-2">Ley Número</th>
                                <th className="col-3">Leyenda</th>
                                <th className="col-3">Modificaciones</th>
                                <th className="col-1">Año</th>
                                <th className="col-2">Vigencia</th>
                                <th className="col-2">Fecha Fin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                leyesDigesto.length > 0 ? (
                                    leyesDigesto.map(n => (
                                        <tr>
                                            <td>{n.numeroLey}</td>
                                            <td>{n.leyendaLey}</td>
                                            <td>{n.leyendaModificaciones}</td>
                                            <td>{n.anio}</td>
                                            <td>{n.esUltima ? <span class="badge badge-success">Vigente</span> : <span class="badge badge-secondary">No Vigente</span>}</td>
                                            <td>{moment(n.fechaFin).format('DD/MM/YYYY')}</td>
                                        </tr>
                                    ))
                                )
                                    : (<tr><td>Sin datos...</td></tr>)
                            }
                        </tbody>
                    </table>
                    <hr />

                    <div className="bg-light d-flex p-4 align-items-center justify-content-between">
                        <h4>Fecha de corte: &nbsp;&nbsp;{moment().format('DD/MM/YYYY')}</h4>
                        <button className="btn btn-primary p-3" id="boton-generar-digesto" onClick={() => setShowModalConfirmacion(true)} disabled>
                            Generar Nuevo Digesto{/* <hr /> */}

                        </button>
                    </div>
                    <br />
                    <div className="alert alert-success d-flex justify-content-between" hidden={!operacionExitosa} role="alert">
                        Operación realizada correctamente <div className="boton-cerrar" onClick={() => setOperacionExitosa(false)}>x</div>
                    </div>
                    <div className="alert alert-danger d-flex justify-content-between" hidden={!errorCorte} role="alert">
                        Ocurrió un error <div className="boton-cerrar" onClick={() => setErrorCorte(false)}>x</div>
                    </div>
                    <h3>Listado</h3>
                    <div className="card-deck max-cards-1">
                        {listado.map((elem, index) => <>
                            <div className="card">
                                <div className="card-body corte-digesto">
                                    <div className="card-title d-flex justify-content-between">
                                        Fecha de corte: {moment(elem.fechaCorte, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                                        <div>
                                            <input type="checkbox" className="custom-checkbox mr-2" name="enviadoLegislatura" id="enviadoLegislatura"
                                                checked={elem.enviadoLegislatura} onChange={(e) => handleChange(e, index)} />
                                            <label for="enviadoLegislatura">Enviado a la Legislatura</label>
                                            <input type="checkbox" className="custom-checkbox ml-5 mr-2" name="aprobadoLegislatura" id="aprobadoLegislatura"
                                                checked={elem.aprobadoLegislatura} onChange={(e) => handleChange(e, index)} />
                                            <label for="aprobadoLegislatura">Aprobado por la Legislatura</label>
                                            <button className="btn btn-link ml-5"
                                                onClick={() => navigate("../anexos/" + moment(elem.fechaCorte, 'YYYY-MM-DD').format('YYYY-MM-DD'))}>
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>)}
                    </div>

                    <Modal show={showModalConfirmacion} onHide={() => setShowModalConfirmacion(false)}>
                        <Modal.Header>
                            <Modal.Title>¿Está seguro que desea realizar esta operación?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Se generará una copia de las normas y sus metadatos (SDIN y Digesto).
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-secondary" onClick={() => setShowModalConfirmacion(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={() => realizarCorte()}>
                                Continuar
                            </button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </>
        );
};

export default Anexos;
