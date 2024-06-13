import React, { useEffect, useState } from "react";
import "./Toggle.css";

const Toggle = ({ toggled, onToggle, disabled }) => {
    if (disabled) {
        return (
            <>
                <div className="toggle-component disabled">
                    <button type="button" className="btn btn-sm btn-success" disabled>SÍ</button>
                    <button type="button" className="btn btn-sm btn-danger" disabled>NO</button>
                </div>
            </>
        )
    }
    if (toggled) {
        return (
            <>
                <div className="toggle-component">
                    <button type="button" className="btn btn-sm btn-success toggled">SÍ</button>
                    <button type="button" className="btn btn-sm btn-danger not-toggled" onClick={() => onToggle()}>NO</button>
                </div>
            </>
        )
    }
    return (
        <>
            <div className="toggle-component">
                <button type="button" className="btn btn-sm btn-success not-toggled" onClick={() => onToggle()}>SÍ</button>
                <button type="button" className="btn btn-sm btn-danger toggled">NO</button>
            </div>
        </>
    )
}

export default Toggle;