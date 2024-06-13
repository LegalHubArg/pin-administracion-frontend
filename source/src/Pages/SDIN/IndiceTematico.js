import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
//API PIN
import { ApiPinPost, ApiPinGet } from '../../Helpers/ApiComunicator'
//Spinner
import Spinner from '../../Components/Spinner/Spinner';
import './IndiceTematico.css'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { rutasSDIN } from '../../routes';
import { decode } from "html-entities";

const Temas = props => {
    const [isLoading, setLoading] = useState(false)
    const [temas, setTemas] = useState([])
    const [jerarquia, setJerarquia] = useState([])
    const [jerarquiaNormas, setJerarquiaNormas] = useState([])
    const [normas, setNormas] = useState()
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        limite: 15,
        totalPaginas: 1,
        botones: [],
        cambiarPagina: false
    })

    const getTemas = async () => {
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
        }
        try {
            await ApiPinPost('/api/v1/sdin/temas', body, localStorage.getItem("token"))
                .then((res) => {
                    setTemas(res.data.temas)
                })
                .catch()
        }
        catch (e) { }
    }

    const buscarNormas = async (e, idTema) => {
        e.preventDefault();
        if (normas?.idTema === idTema) { setNormas(null); return; }
        document.body.style.cursor = 'wait'
        let body = {
            usuario: localStorage.getItem("user_cuit"),
            idUsuario: JSON.parse(localStorage.perfiles)[0].idUsuario,
            temas: [idTema],
            ...paginacion
        }
        try {
            await ApiPinPost('/api/v1/sdin/normas', body, localStorage.getItem("token"))
                .then((res) => {
                    if (res.data.normas.length > 0) {
                        setNormas({ idTema: idTema, normas: res.data.normas })
                    }
                    document.body.style.cursor = 'default'
                })
        }
        catch (e) { document.body.style.cursor = 'default' }
    }

    const getJerarquia = async () => {
        try {
            const { data: { data } } = await ApiPinGet('/api/v1/sdin/temas/jerarquia/arbol', localStorage.getItem('token'))
            setJerarquia(data.map(n => ({ ...n, show: false })))
        }
        catch (err) { }
    }

    const getJerarquiaNormas = async () => {
        try {
            const { data: { data } } = await ApiPinGet('/api/v1/sdin/temas/jerarquia/normas', localStorage.getItem('token'))
            setJerarquiaNormas(data.map(n => ({ ...n, show: false })))
        }
        catch (err) { }
    }

    const getChildren = (e, idTema) => {
        e.preventDefault();
        let auxJerarquia = jerarquia;
        auxJerarquia = auxJerarquia.map(n => (n.idTema === idTema ? { ...n, show: !n.show } : { ...n }))
        setJerarquia(auxJerarquia)
    }

    const Arbol = (children) => {
        let jerarquiaAux = [...jerarquia];

        if (!children) {

            //Busco los nodos raíz, tienen padre null
            let raices = jerarquiaAux.filter(elem => jerarquiaAux.findIndex(n => n.idTemaHijo === elem.idTema) === -1);
            //Elimino repetidos
            raices = [...new Set(raices.map(n => n.idTema))].map(item => jerarquiaAux.find(n => n.idTema === item))

            let arboles = [];

            for (const raiz of raices) {

                let temasHijos = jerarquiaAux.filter(elem => elem.idTema === raiz.idTema).map(n => ({ idTema: n.idTemaHijo, tema: n.temaHijo, show: n.show }));

                temasHijos.sort((a, b) => a.tema.localeCompare(b.tema))
                arboles.push(
                    <div>
                        <div className="tarjeta">{decode(raiz.tema)}
                            {temasHijos.length > 0 && ( // Verificar si hay hijos antes de mostrar el botón
                                <button  className="btn btn-primary btn-sm" onClick={e => getChildren(e, raiz.idTema)}>
                                    <FaArrowDown />
                                </button>
                            )}
                            {jerarquiaNormas && (jerarquiaNormas.length > 0) && 
                                jerarquiaNormas.some((n) => n.idTema === raiz.idTema) ? (
                                    <button 
                                        id='raiz'
                                        className="btn btn-secondary btn-sm" onClick={(e) => buscarNormas(e, raiz.idTema)}>
                                        Normas&nbsp;{normas?.idTema === raiz.idTemaHijo ? <FaArrowUp /> : <FaArrowDown />}
                                    </button>
                                ) : null
                            }
                        </div>
                        {temasHijos.length > 0 ? Arbol(temasHijos) : null}
                        {normas && normas.idTema === raiz.idTema && normas.normas.map(n =>
                            <div className="tarjeta-norma">
                                <a href={"/sdin/" + rutasSDIN.ficha_norma.replace(':idNormaSDIN', n.idNormaSDIN)} target="_blank">
                                    {n?.normaTipo}&nbsp;N°{n?.normaNumero}
                                    {n.reparticion ? <>&nbsp;/&nbsp;{n.reparticion}</> : null}
                                    {n.organismo ? <>&nbsp;/&nbsp;{n.organismo}</> : null}
                                    {n.normaAnio ? <>&nbsp;/&nbsp;{n.normaAnio}</> : null}
                                </a>
                                <div style={{ fontSize: 12 }}>{n?.normaSumario}</div>
                            </div>)}
                    </div>)
            }

            return (arboles)
        }

        let nodos = [];
        for (const child of children) {

            let temasHijos = jerarquiaAux.filter(elem => elem.idTema === child.idTema).map(n => ({ idTema: n.idTemaHijo, tema: n.temaHijo, show: n.show }));
            temasHijos.sort((a, b) => a.tema.localeCompare(b.tema))
            if (child.show) {
                nodos.push(<div style={{ paddingLeft: "2em" }}>
                    <div className="tarjeta">{decode(child.tema)}
                        {temasHijos.length > 0 && ( // Verificar si hay hijos antes de mostrar el botón
                            <button className="btn btn-primary btn-sm" onClick={e => getChildren(e, child.idTema)}>
                                <FaArrowDown />
                            </button>
                        )}
                        {jerarquiaNormas && (jerarquiaNormas.length > 0) && 
                            jerarquiaNormas.some((n) => n.idTema === child.idTema) ? (
                                <button 
                                    className="btn btn-secondary btn-sm" onClick={(e) => buscarNormas(e, child.idTema)}>
                                    Normas&nbsp;{normas?.idTema === child.idTema ? <FaArrowUp /> : <FaArrowDown />}
                                </button>
                            ) : null
                        }
                    </div>
                    {temasHijos.length > 0 ? Arbol(temasHijos) : null}
                    {normas && normas.idTema === child.idTema && normas.normas.map(n =>
                        <div className="tarjeta-norma">
                            <a href={"/sdin/" + rutasSDIN.ficha_norma.replace(':idNormaSDIN', n.idNormaSDIN)} target="_blank">
                                {decode(n?.normaTipo)}&nbsp;N°{n?.normaNumero}
                                {decode(n.reparticion) ? <>&nbsp;/&nbsp;{decode(n.reparticion)}</> : null}
                                {decode(n.organismo) ? <>&nbsp;/&nbsp;{decode(n.organismo)}</> : null}
                                {n.normaAnio ? <>&nbsp;/&nbsp;{n.normaAnio}</> : null}
                            </a>
                            <div style={{ fontSize: 12 }}>{decode(n?.normaSumario)}</div>
                        </div>)}
                </div>)
            }
        }
        return nodos;
    }
    
    useEffect(async () => {
        setLoading(true)
        await getJerarquia()
        await getJerarquiaNormas()
        setLoading(false)
    }, [])

    if (isLoading)
        return <Spinner />
    else
        return (<>
            <div className="container responsive mb-5">
                {jerarquia.length > 0 && Arbol()}
            </div>
        </>)
};

export default Temas;