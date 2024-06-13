import React, { useState, useEffect } from 'react';
import moment from "moment";
import { ApiPinPost } from '../../Helpers/ApiComunicator';

const ModalAsociarAviso = ({ norma, setNorma }) => {
    let initForm = {
        idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit"),
        idNorma: null,
        idNormaAviso: null,
        motivoAsociacion: ''
    };
    const [formAsociarAviso, setFormAsociarAviso] = useState(initForm);
    const [validaForm, setValidaForm] = useState(false);

    useEffect(() => {
        if (norma !== null) {
            if (norma.idNormaAviso !== null) {
                setFormAsociarAviso({
                    ...formAsociarAviso,
                    ['idNorma']: norma.idNorma,
                    ['idNormaAviso']: norma.idNormaAviso,
                    ['motivoAsociacion']: norma.motivoAsociacion
                })
            }
            else {
                setFormAsociarAviso({
                    ...formAsociarAviso,
                    ['idNorma']: norma.idNorma,
                    ['idNormaAviso']: null,
                    ['motivoAsociacion']: null
                })
            }
        }
    }, [norma])

    useEffect(() => {
        if (formAsociarAviso.idNorma !== null &&
            formAsociarAviso.idNormaAviso !== null &&
            formAsociarAviso.idNormaAviso !== '' &&
            norma.idNormaAviso === null) {
            setValidaForm(true)
        }
        else {
            setValidaForm(false)
        }
        //console.log(formAsociarAviso)
    }, [formAsociarAviso])

    const handleFormAsociarAviso = (e) => {
        let value;
        switch (e.target.name) {
            case 'motivoAsociacion':
                value = e.target.value;
                setFormAsociarAviso({
                    ...formAsociarAviso,
                    ['motivoAsociacion']: value
                })
                break;
            case 'idNormaAviso':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setFormAsociarAviso({
                    ...formAsociarAviso,
                    ['idNormaAviso']: value
                })
                break;
        }
    }

    function handleCancelar() {
        setFormAsociarAviso({idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        usuario: localStorage.getItem("user_cuit"),
        idNorma: null,
        idNormaAviso: null,
        motivoAsociacion: ''})
        setNorma(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await asociarNormaConAviso(e)
    }

    async function asociarNormaConAviso(e) {
        e.preventDefault();
        let body = { ...formAsociarAviso }
        let token = localStorage.getItem("token");
        await ApiPinPost('/api/v1/boletin-oficial/normas/norma/asociarAviso', body, token)
            .then(respuesta => {
                //console.log(respuesta)
                window.location.reload();
            })
            .catch(error => {
                //console.log(error)
            })
    }

    return (
        <div class="modal fade" tabIndex="-1" role="dialog" id="modalAsociarAviso">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <form className="form" onSubmit={e => handleSubmit(e)}>
                        <div class="modal-header">
                            <h4 class="modal-title">
                                Asociar la Norma con un Aviso
                            </h4>
                        </div>
                        <div class="modal-body">
                            <div className="form-group">
                                <label for="idNorma">idNorma</label>
                                <input className="form-control" type="text" pattern="[0-9]*"
                                    id="idNorma" name="idNorma" value={formAsociarAviso.idNorma} disabled>
                                </input>
                            </div>
                            <div className="form-group">
                                <label for="idNormaAviso">id del Aviso</label>
                                <input className="form-control" type="text" pattern="[0-9]*"
                                    id="idNormaAviso" name="idNormaAviso"
                                    onChange={(e) => handleFormAsociarAviso(e)} value={formAsociarAviso.idNormaAviso}></input>
                            </div>
                            <div className="form-group">
                                <label for="motivoAsociacion">Motivo</label>
                                <textarea className="form-control" id="motivoAsociacion" name="motivoAsociacion"
                                    onChange={(e) => handleFormAsociarAviso(e)} rows="5"
                                    value={formAsociarAviso.motivoAsociacion}
                                />
                            </div>

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
                                type="submit"
                                disabled={!validaForm}
                                class="btn btn-primary">
                                Aceptar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

}

export default ModalAsociarAviso;