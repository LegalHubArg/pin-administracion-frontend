import React, { useState, useEffect } from 'react';
import moment from "moment";
import { ApiPinPost } from '../../Helpers/ApiComunicator';

const ModalFechaLimite = ({ checkedNormas, normaCambiarFechaLimite, setNormaCambiarFechaLimite }) => {
    const [nuevaFechaLimite, setNuevaFechaLimite] = useState('');

    function handleCancelar() {
        setNuevaFechaLimite('')
        setNormaCambiarFechaLimite(null)
    }

    async function cambiarFechaLimite(e) {
        e.preventDefault();
        let body = {
            fechaLimite: nuevaFechaLimite,
            normas: [],
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario
        }
        if (normaCambiarFechaLimite !== null) {
            body.normas.push(normaCambiarFechaLimite.idNorma)
        }
        else {
            body.normas.push(...checkedNormas)
        }
        let token = localStorage.getItem("token"); //console.log(body)
        await ApiPinPost('/api/v1/boletin-oficial/normas/editar/fechaLimite', body, token)
            .then(respuesta => {
                //console.log(respuesta)
                window.location.reload();
            })
            .catch(error => {
                //console.log(error)
            })
    }

    return (
        <div class="modal fade" tabIndex="-1" role="dialog" id="modalFechaLimite">
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">
                            Cambiar fecha límite
                        </h4>
                    </div>
                    <div class="modal-body">
                        <input type="date" className="form-control" id="nuevaFechaLimite" onChange={e => setNuevaFechaLimite(e.target.value)} value={nuevaFechaLimite} />
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-link"
                            data-dismiss="modal"
                            onClick={() => handleCancelar()}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary"
                            disabled={!nuevaFechaLimite}
                            onClick={(e) => { cambiarFechaLimite(e) }}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ModalFechaLimite;