import moment from 'moment'

async function validarFormAltaSolicitud(form, feriados, validaGEDO, permisos, sinSubtipo, seccionSeleccionada, organismos) {
    let validaForm = true;
    //Condiciones comunes
    validaForm = validaForm && (!isNaN(parseInt(form.idNormaTipo)));
    if (!sinSubtipo) {
        validaForm = validaForm && (!isNaN(parseInt(form.idNormaSubtipo)));
    }
    validaForm = validaForm && (!isNaN(parseInt(form.idReparticion)));
    if (!validaGEDO) {
        validaForm = validaForm && organismos?.some(org => org.sigla === form.organismoEmisor);
    }
    validaForm = validaForm && (!isNaN(parseInt(form.normaNumero)));
    validaForm = validaForm && (!isNaN(parseInt(form.normaAnio))) && form.normaAnio.toString().length === 2;
    validaForm = validaForm && (form.normaArchivoOriginal).length > 0;

    //Condiciones de fecha
    if (JSON.parse(localStorage.perfil).idPerfil !== 5 && !JSON.parse(localStorage.getItem('perfiles')).find(n => n.idPerfil === 5)) {
        //Hora de carga por permisos de usuario
        let date = new Date()
        /* let horaActual = date.getHours() + ":" + date.getMinutes().toString().padStart(2, '0') + ":" + date.getSeconds(); */
        /*         if (permisos) {
                    let permisosNorma = permisos.filter(element => element.idNormaTipo === form.idNormaTipo)
                    for (const permiso of permisosNorma) {
                        let horaInicial = new Date();
                        let normaTipoHoraCargaInicial = permiso.normaTipoHoraCargaInicial.split(':');
                        horaInicial.setHours(normaTipoHoraCargaInicial[0],
                            normaTipoHoraCargaInicial[1],
                            normaTipoHoraCargaInicial[2])
                        let horaFinal = new Date();
                        let normaTipoHoraCargaFinal = permiso.normaTipoHoraCargaFinal.split(':');
                        horaFinal.setHours(normaTipoHoraCargaFinal[0],
                            normaTipoHoraCargaFinal[1],
                            normaTipoHoraCargaFinal[2])
                        validaForm = validaForm && (horaInicial < date) && (date < horaFinal)
                    }
                } */

        if (form.fechaDesde) {
            validaForm = validaForm && moment(form.fechaDesde).isValid()
            validaForm = validaForm && moment(form.fechaDesde).day() !== 6
            validaForm = validaForm && moment(form.fechaDesde).day() !== 0
            validaForm = validaForm &&
                feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaDesde).length === 0
        }
        if (form.fechaHasta) {
            validaForm = validaForm && moment(form.fechaHasta).isValid()
            validaForm = validaForm && moment(form.fechaHasta).day() !== 6
            validaForm = validaForm && moment(form.fechaHasta).day() !== 0
            validaForm = validaForm &&
                feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaHasta).length === 0
        }
        if (form.fechaSugerida) {
            validaForm = validaForm && moment(form.fechaSugerida).isValid()
            validaForm = validaForm && moment(form.fechaSugerida).day() !== 6
            validaForm = validaForm && moment(form.fechaSugerida).day() !== 0
            validaForm = validaForm &&
                feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaSugerida).length === 0
        }
        if (form.fechaLimite) {
            validaForm = validaForm && moment(form.fechaLimite).isValid()
            validaForm = validaForm && moment(form.fechaLimite).day() !== 6
            validaForm = validaForm && moment(form.fechaLimite).day() !== 0
            validaForm = validaForm &&
                feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaLimite).length === 0
        }
    }

    //Condiciones específicas
    switch (seccionSeleccionada?.cod_proceso) {
        case "PR_PL": //Poder Legislativo
        case "PR_PJ": //Poder Judicial
        case "PR_OC": //Organos de Control
        case "PR_TRI": //Trimestrales
            validaForm = validaForm && moment(form.fechaLimite).isValid()
            validaForm = validaForm && moment(form.fechaSugerida).isValid();
            break;
        case "PR_PE": //Poder Ejecutivo
            if (validaGEDO === true) {
                validaForm = validaForm && form.normaAcronimoReferencia.length > 0;
            }
            validaForm = validaForm && moment(form.fechaLimite).isValid()
            validaForm = validaForm && moment(form.fechaSugerida).isValid();
            break;
        case "PR_COM": //Comunicados y Avisos
            if (JSON.parse(localStorage.perfil).idPerfil !== 5 && form.fechaDesde && form.fechaHasta) {
                validaForm = validaForm
                    && feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaDesde).length === 0
                    && feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaHasta).length === 0
            }
            if (validaGEDO === true) {
                validaForm = validaForm && form.normaAcronimoReferencia.length > 0;
            }
            validaForm = validaForm && moment(form.fechaDesde).isValid()
            validaForm = validaForm && moment(form.fechaHasta).isValid();
            break;
        case "PR_LIC": //Licitaciones
            if (JSON.parse(localStorage.perfil).idPerfil !== 5) {
                if (form.fechaDesde) {
                    validaForm = validaForm && feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaDesde).length === 0
                }
                if (form.fechaHasta) {
                    validaForm = validaForm && feriados.filter(element => ((element['DATE(feriadoFecha)']).split('T')[0]) === form.fechaHasta).length === 0
                }
            }
            if ([70, 78, 79].includes(form.idNormaSubtipo)) {
                validaForm = validaForm && form.numeroEdicionSubtipo
            }
            if (validaGEDO === true && form.idTipoProceso === 1) {
                validaForm = validaForm && form.normaAcronimoReferencia.length > 0;
            }
            validaForm = validaForm && moment(form.fechaDesde).isValid()
            validaForm = validaForm && moment(form.fechaHasta).isValid();
            break;
        case "PR_EDI": //Edictos Oficiales
        case "PR_EP": //Edictos Particulares
            validaForm = validaForm && moment(form.fechaDesde).isValid()
            validaForm = validaForm && moment(form.fechaHasta).isValid();
            break;
        case "PR_FN": //Fuera de Nivel
            validaForm = validaForm && moment(form.fechaLimite).isValid()
            validaForm = validaForm && moment(form.fechaSugerida).isValid();
            break;
        default:
            validaForm = false;
            break;
    }
    return validaForm
}

export { validarFormAltaSolicitud };