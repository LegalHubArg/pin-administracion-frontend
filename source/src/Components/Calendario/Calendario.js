import React, { useState } from 'react';

import moment from 'moment';
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import './Calendario.css';

export const Calendario = ({ fechasSeleccionadas, setFechasSeleccionadas, defaultValues, yaPublicadas, fechaMinima }) => {

    function tileClassName({ date }) {
        if (yaPublicadas?.some(n => n === moment(date).format('YYYY-MM-DD'))) {
            return "fecha-ya-publicada"
        }
        if (fechasSeleccionadas?.some(n => n === moment(date.toString()).format('YYYY-MM-DD'))) {
            return "fecha-seleccionada"
        }
        return "fecha-no-seleccionada"
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
                selectRange={false}
                showFixedNumberOfWeeks={true}
                minDate={fechaMinima}
            />
        </div>
    )
}
