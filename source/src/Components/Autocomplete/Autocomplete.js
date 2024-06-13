import React, { useState, useEffect } from 'react';
import './Autocomplete.css';

//Recibo valores=[{id, nombre},...] para que sea reutilizable
export const Autocomplete = ({ valores, setValue, defaultValue }) => {
    const [array, setArray] = useState(valores)
    const [selectedValue, setSelectedValue] = useState(defaultValue)

    function filtrarValores(inputValue) {
        let auxArray = valores.filter(n => n.nombre.toUpperCase().includes(inputValue.toUpperCase()));
        setArray(auxArray)
        setSelectedValue(inputValue)
    }

    useEffect(() => {
        if (selectedValue && setValue && valores) {
            let aux = valores.find(item => item.nombre === selectedValue)
            if (aux && aux.id && aux.nombre) {
                setValue(aux)
            }
        }
    }, [selectedValue])

    useEffect(() => {
        if (valores) {
            setArray(valores)
            if (!array?.some(n => n.nombre === selectedValue)) {setSelectedValue()}
        }
    }, [valores])

    return (
        <div id="autocomplete">
            <div className="dropdown-container" >
                <div className="dropdown">
                    <input className="form-control buscador" value={selectedValue ? selectedValue : ''}
                        onChange={e => filtrarValores(e.target.value)} data-toggle="dropdown" />
                    <div className={"dropdown-menu"} id="autocomplete-options">
                        {array && array.length > 0 &&
                            array.map(elem =>
                                <button className="dropdown-item btn btn-sm" type="button" onClick={() => filtrarValores(elem.nombre)}>{elem.nombre}</button>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}