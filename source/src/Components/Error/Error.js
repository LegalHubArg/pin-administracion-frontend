import React from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
    }

    render() {
        if (this.state.errorInfo) {
            let mensaje = this?.state?.error ? this.state.error : "Ocurrió un error. Por favor, intente nuevamente.";
            //Fallback
            return (
                <div className="container responsive mt-3" style={{ minHeight: "400px" }}>
                    <div class="alert-wrapper">
                        <div class="alert alert-danger" role="alert">
                            <p>
                                <strong><u>Error</u></strong>
                                <br />
                                {mensaje}
                            </p>
                        </div>
                    </div>
                    <br />
                    <Link to={-1}>Volver</Link>
                </div>
            )
        }

        return this.props.children;
    }
}