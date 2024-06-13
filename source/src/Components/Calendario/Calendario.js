import React, { useState } from 'react';

import moment from 'moment';
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import './Calendario.css';

export const Calendario = ({ fechasSeleccionadas, setFechasSeleccionadas, defaultValues, yaPublicadas, fechaMinima, feriados }) => {

    function tileClassName({ date }) {
        if (yaPublicadas?.some(n => n === moment(date).format('YYYY-MM-DD'))) {
            return "fecha-ya-publicada"
        }
        if (fechasSeleccionadas?.some(n => n === moment(date.toString()).format('YYYY-MM-DD'))) {
            return "fecha-seleccionada"
        }

        let listaDeFeriados = feriados?.map(f => { return moment(f.feriadoFecha).format('YYYY-MM-DD') })
        let fechasCalendario = moment(date).format('YYYY-MM-DD')
        if(listaDeFeriados.some(f => f === fechasCalendario)) {
            return "fecha-feriado"
        }
        
        return "fecha-no-seleccionada"
    }

    function tileDisabled({ date }) {
        // PARA HACER: Falta ver como funciona tiledisabled, aplicar la lógica para que recorra los feriados y que deshabilite los días del calendario que coincida con dias feriados o fines de semana.
        let listaDeFeriados = feriados?.map(f => { return moment(f.feriadoFecha).format('YYYY-MM-DD') })
        let fechasCalendario = moment(date).format('YYYY-MM-DD')
        return listaDeFeriados.some(f => f === fechasCalendario) || date.getDay() === 0 || date.getDay() === 6
    }

    function handleChangeCalendar(e) {
        /* if (defaultValues.some(n => n === moment(e).format('YYYY-MM-DD'))) {
            return
        } */
        const index = fechasSeleccionadas?.indexOf(moment(e).format('YYYY-MM-DD'));
        if (index > -1) {
            const auxArray = [...fechasSeleccionadas];
            auxArray.splice(index, 1)
            setFechasSeleccionadas(auxArray)
            return;
        }
        setFechasSeleccionadas([...new Set([...fechasSeleccionadas, moment(e).format('YYYY-MM-DD')])])
    }

    return (
        <div className="react-calendar">
            <Calendar
                value={fechasSeleccionadas}
                onChange={handleChangeCalendar}
                tileClassName={tileClassName}
                tileDisabled={tileDisabled}
                selectRange={false}
                showFixedNumberOfWeeks={true}
                minDate={fechaMinima}
            />
        </div>
    )
}
