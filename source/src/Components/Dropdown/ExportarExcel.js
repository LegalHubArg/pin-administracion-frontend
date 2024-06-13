import { SiMicrosoftexcel } from 'react-icons/si'
import React, { useState, useEffect } from 'react';
import { ApiPinGet, ApiPinPost } from '../../Helpers/ApiComunicator'
var b64toBlob = require('b64-to-blob');

export const ExportarExcel = ({ form, ruta, ...props }) => {
    const [exportacion, setExportacion] = useState({ show: false, registroDesde: 1, registroHasta: 10000 })

    const exportarExcel = (e) => {
        e.preventDefault();
        ApiPinPost(ruta, { ...form, ...exportacion }, localStorage.getItem('token'))
            .then((res) => {
                let blob = b64toBlob(res.data.data, 'application/pdf');
                let url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${Date.now()}.xlsx`);
                document.body.appendChild(link);
                link.click();
            })
            .catch(e => { })
    }

    return (
        <div class="dropdown-container align-self-end" {...props}>
            <div class="dropdown">
                <button className="btn btn-dropdown btn-dropdown-sm dropdown-toggle" disabled={props.disabled}
                    type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Exportar
                </button>
                <div class="dropdown-menu p-2" style={{ width: "250px" }}>
                    <label className="pb-0 mb-0">Rango de Registros</label>
                    <hr className="mt-0 pt-0 mb-1" />
                    <div className="row">
                        <div className="col">
                            Desde
                            <input type="number" min="1" className="form-control" id="registroDesde" style={{ maxHeight: "2em" }}
                                value={exportacion.registroDesde} onChange={e => setExportacion({ ...exportacion, registroDesde: e.target.value })} />
                        </div>
                        <div className="col pl-0">
                            Hasta
                            <input type="number" min="1" max={parseInt(exportacion.registroDesde) + 9999}
                                className="form-control" id="registroHasta" style={{ maxHeight: "2em" }}
                                value={exportacion.registroHasta} onChange={e => setExportacion({ ...exportacion, registroHasta: e.target.value })} />
                        </div>
                    </div>
                    <button className="btn btn-success btn-sm mt-2 col" onClick={e => exportarExcel(e)}>Exportar excel &nbsp;<SiMicrosoftexcel /></button>
                </div>
            </div>
        </div>
    )
}