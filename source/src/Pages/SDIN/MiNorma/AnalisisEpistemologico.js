import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../../Components/Spinner/Spinner';
import { FaArrowRight, FaCheck, FaSmile, FaTimes } from 'react-icons/fa';
import Toggle from '../../../Components/Toggle/Toggle';
import { rutasDJ } from '../../../routes';
import { Pagination } from '@gcba/obelisco'

const AnalisisEpistemologico = ({ norma }) => {
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(false);
    const [guardadoCorrectamente, setGuardadoCorrectamente] = useState(false);
    const [mostrarErrorGuardado, setMostrarErrorGuardado] = useState(false);
    const [anexos, setAnexos] = useState([]);
    const [historial, setHistorial] = useState([])
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    //Array que contendrá los formularios que deben deshabilitarse de acuerdo con las combinaciones posibles 
    const [deshabilitados, setDeshabilitados] = useState([]);
    const initForm = {
        abrogacion: false,
        conflictos_normativos: false,
        perdida_vigencia_juridica: false,
        necesidad_refundir: false,
        necesidad_abrogacion: false,
        antecedentes_equivalencias: false,
        texto_definitivo: false,
        aprobadoEpistemologicamente: norma.aprobadoEpistemologicamente,
        observaciones: '',
        idAnexoDJ: null
    }

    const [form, setForm] = useState(initForm);


    const handleFormChange = (e) => {
        let value;
        switch (e.target.name) {
            case 'idAnexoDJ':
                value = parseInt(e.target.value);
                if (isNaN(value)) {
                    value = ''
                }
                setForm({ ...form, ['idAnexoDJ']: value })
                break;
            case 'observaciones':
                value = e.target.value;
                setForm({ ...form, ['observaciones']: value })
                break;
            case 'aprobadoEpistemologicamente':
                value = e.target.checked;
                setForm({ ...form, ['aprobadoEpistemologicamente']: value })
                break;
        }
    }

    const traerAnexosDJ = async () => {
        try {
            let token = localStorage.getItem("token");
            await ApiPinGet('/api/v1/dj/anexos', token).then((res) => {
                setAnexos(Array.from(res.data.data))
            }).catch(function (error) {
                throw error
            });
        }
        catch (error) {
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGuardadoCorrectamente(false);
        setMostrarErrorGuardado(false);
        let body = {
            ...form,
            usuario: localStorage.getItem('user_cuit'),
            idNormaSDIN: norma.idNormaSDIN,
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
        }
        let token = localStorage.getItem("token");
        try {
            await ApiPinPost('/api/v1/dj/analisis-epistemologico/guardar', body, token)
                .then(_ => {
                    setGuardadoCorrectamente(true)
                })
                .catch((err) => {
                    throw err
                })
        }
        catch (e) {
            setMostrarErrorGuardado(true)
        }
        setLoading(false)
    }
    const traerAnalisisEpistemologico = async () => {
        let body = {
            usuario: localStorage.getItem('user_cuit'),
            idNormaSDIN: norma.idNormaSDIN,
            idUsuario: JSON.parse(localStorage.getItem('perfiles'))[0].idUsuario
        }
        let token = localStorage.getItem("token");
        try {
            await ApiPinPost('/api/v1/dj/analisis-epistemologico', body, token)
                .then(res => {
                    const data = res.data.data;
                    if (data.length > 0) {
                        setForm({
                            ...form,
                            ['abrogacion']: !!data[0].formulario1,
                            ['conflictos_normativos']: !!data[0].formulario2,
                            ['perdida_vigencia_juridica']: !!data[0].formulario3,
                            ['necesidad_refundir']: !!data[0].formulario4,
                            ['necesidad_abrogacion']: !!data[0].formulario5,
                            ['texto_definitivo']: !!data[0].formulario6,
                            ['antecedentes_equivalencias']: !!data[0].formulario7,
                            ['observaciones']: data[0].observaciones,
                            ['idAnexoDJ']: data[0].idAnexoDJ
                        })
                        if (data[0].formulario1) setDeshabilitados([2, 3, 4, 5, 6, 7])
                        if (data[0].formulario2 && data[0].formulario3 && data[0].formulario5) setDeshabilitados([1, 4, 6, 7])
                    }
                })
                .catch((err) => {
                    throw err
                })
        }
        catch (e) {
        }
    }

    const traerHistorialDJ = async () => {
        let token = localStorage.getItem("token")
        let body = {
            ...paginacion
        }
        try {
            await ApiPinPost(`/api/v1/sdin/norma/historialDigesto?norma=${norma.idNormaSDIN}`, body, token) //cambiar param a norma.idNormaSDIN
                .then(res => {
                    const historial = res.data.historialDJ
                    setHistorial(historial)
                    let auxPaginacion = paginacion;
                    auxPaginacion.totalPaginas = Math.ceil(historial[0].totalHistorial / auxPaginacion.limite);
                    auxPaginacion.botones = [];
                    for (let i = 1; i <= paginacion.totalPaginas; i++) {
                        auxPaginacion.botones.push(i)
                    }
                    setPaginacion({ ...auxPaginacion });
                })
        } catch (error) {
            console.log(error)
        }
    }

    function toggle(formulario) {
        if (!form || !formulario) return;
        let formAux = { ...form }
        let deshabilitadosAux = []

        formAux[formulario] = !formAux[formulario]

        //Formulario 1 en Sí --> se deshabilitan todos los demas
        if (formAux.abrogacion) {
            deshabilitadosAux = [2, 3, 4, 5, 6];
            formAux.conflictos_normativos = formAux.perdida_vigencia_juridica = formAux.necesidad_refundir =
                formAux.necesidad_abrogacion = formAux.texto_definitivo = false;
        }

        //Formularios 2, 3 y 5 (abrogación implícita) --> Se dehsabilitan el resto
        if (formAux.conflictos_normativos && formAux.perdida_vigencia_juridica && formAux.necesidad_abrogacion) {
            deshabilitadosAux = [1, 4, 6, 7];
            formAux.abrogacion = formAux.necesidad_refundir = formAux.texto_definitivo = formAux.antecedentes_equivalencias = false;
        }
        setForm(formAux)
        setDeshabilitados(deshabilitadosAux)
    }

    useEffect(async () => {
        if (paginacion.cambiarPagina === true) {
            let auxPaginacion = paginacion;
            auxPaginacion.cambiarPagina = false;
            setPaginacion({ ...auxPaginacion })
            await traerHistorialDJ()
        }
    }, [paginacion])

    //Hook inicial
    useEffect(async () => {
        setLoading(true)
        await traerAnexosDJ()
        await traerAnalisisEpistemologico()
        await traerHistorialDJ()
        setLoading(false)
    }, [])

    if (isLoading) {
        return (<Spinner />)
    }
    else {
        return (
            <div className="card" id="analisis-epistemologico">
                <form className="form card-body" onSubmit={(e) => handleSubmit(e)}>
                    <div className={"form-group toggle-formulario"}>
                        <span><b>1.</b>&nbsp; Abrogación</span>
                        <Toggle toggled={form.abrogacion} onToggle={() => toggle('abrogacion')} disabled={deshabilitados.includes(1)} />
                        {form.abrogacion && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.abrogacion.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className={"form-group toggle-formulario"}>
                        <span><b>2.</b>&nbsp; Existencia De Conflictos Normativos</span>
                        <Toggle toggled={form.conflictos_normativos} onToggle={() => toggle('conflictos_normativos')} disabled={deshabilitados.includes(2)} />
                        {form.conflictos_normativos && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.conflictos_normativos.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className={"form-group toggle-formulario"}>
                        <span><b>3.</b>&nbsp; Pérdida de vigencia jurídica</span>
                        <Toggle toggled={form.perdida_vigencia_juridica} onToggle={() => toggle('perdida_vigencia_juridica')} disabled={deshabilitados.includes(3)} />
                        {form.perdida_vigencia_juridica && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.perdida_vigencia_juridica.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className={"form-group toggle-formulario"}>
                        <span><b>4.</b>&nbsp; Necesidad de refundir en uno o más textos legales</span>
                        <Toggle toggled={form.necesidad_refundir} onToggle={() => toggle('necesidad_refundir')} disabled={deshabilitados.includes(4)} />
                        {form.necesidad_refundir && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.necesidad_refundir.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className={"form-group toggle-formulario"}>
                        <span><b>5.</b>&nbsp; Necesidad de abrogación, derogación o caducidad expresa</span>
                        <Toggle toggled={form.necesidad_abrogacion} onToggle={() => toggle('necesidad_abrogacion')} disabled={deshabilitados.includes(5)} />
                        {form.necesidad_abrogacion && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.necesidad_abrogacion.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className={"form-group toggle-formulario"}>
                        <span><b>6.</b>&nbsp; Elaboración de texto definitivo</span>
                        <Toggle toggled={form.texto_definitivo} onToggle={() => toggle('texto_definitivo')} disabled={deshabilitados.includes(6)} />
                        {form.texto_definitivo && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.texto_definitivo.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className={"form-group toggle-formulario"}>
                        <span><b>7.</b>&nbsp; Tablas de Antecedentes y Equivalencias</span>
                        <Toggle toggled={form.antecedentes_equivalencias} onToggle={() => toggle('antecedentes_equivalencias')} disabled={deshabilitados.includes(7)} />
                        {form.antecedentes_equivalencias && <a className="btn btn-primary btn-sm ml-5"
                            href={rutasDJ.home + '/' + rutasDJ.antecedentes_equivalencias.replace(':idNormaSDIN', norma.idNormaSDIN)} target="_blank">
                            <FaArrowRight />
                        </a>}
                    </div>
                    <hr />
                    <div className="d-flex align-items-center">
                        <div className="form-group">
                            <label for="idAnexoDJ">Anexo</label>
                            <select className="custom-select" id="idAnexoDJ" name="idAnexoDJ"
                                onChange={e => handleFormChange(e)} value={form.idAnexoDJ}
                            ><option selected value=""></option>
                                {anexos && anexos.length > 0 ?
                                    anexos.map(elem => (
                                        <option key={"opt-"} value={elem.idAnexoDJ}>{elem.nombre}</option>
                                    )) : <option disabled>No hay anexos para seleccionar.</option>}
                            </select>
                        </div>
                        <div className="custom-control custom-checkbox">
                            <input
                                className="custom-control-input"
                                type="checkbox"
                                id="aprobadoEpistemologicamente"
                                name="aprobadoEpistemologicamente"
                                checked={form.aprobadoEpistemologicamente}
                                onChange={(e) => handleFormChange(e)}
                            />
                            <label className="custom-control-label ml-2" for="aprobadoEpistemologicamente">
                                Aprobado Epistemológicamente
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label for="observaciones">Observaciones</label>
                        <textarea className="form-control" id="observaciones" name="observaciones"
                            onChange={e => handleFormChange(e)} value={form.observaciones}
                        />
                    </div>
                    <button type="submit" className="btn btn-success mr-2 mb-2">Guardar cambios</button>
                    {guardadoCorrectamente && <div className="alert alert-success d-flex justify-content-between">
                        <p>Guardado correctamente!</p><div type='button' onClick={() => setGuardadoCorrectamente(false)}><b>x</b></div>
                    </div>}
                    {mostrarErrorGuardado && <div className="alert alert-danger d-flex justify-content-between">
                        <p>Ocurrió un error al intentar guardar los cambios. Intente nuevamente.</p><div type='button' onClick={() => setMostrarErrorGuardado(false)}><b>x</b></div>
                    </div>}
                    {/* HISTORIAL DIGESTO JURIDICO*/}
                    <br/>
                    <br/>
                    <br/>
                    <div>
                        <h3>Historial Digesto Jurídico</h3>
                        <h4>Total: {historial[0]?.totalHistorial}</h4>
                        <table className="table table-bordered" >
                            <thead>
                                <tr>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Acción</th>
                                    <th scope="col">Nombre completo</th>
                                    <th scope="col">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(h => {
                                    return <tr key={h.id}>
                                        <td>{h.fecha}</td>
                                        <td>{h.accion}</td>
                                        <td>{h.apellidoNombre || h.usuarioMigracion}</td>
                                        <td>{h.observaciones}</td>
                                    </tr>
                                })}

                            </tbody>
                        </table>
                        {paginacion && historial.length > 0 && 
                        <div style={{ display: "flex", justifyContent: "center" }}>
                                    <Pagination 
                                        pages={paginacion.totalPaginas}
                                        onPageSelected={page => setPaginacion({...paginacion, 
                                            paginaActual: page + 1, 
                                            cambiarPagina: true 
                                        })} 
                                    />
                                </div>}
                    </div>  
                </form>
            </div>
        )
    }

}

export default AnalisisEpistemologico;