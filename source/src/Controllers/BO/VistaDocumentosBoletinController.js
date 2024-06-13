import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaDocumentosBoletin from '../../Pages/BO/VistaDocumentosBoletin';

const DocumentosBoletin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaDocumentosBoletin />
        </Layout>

    );
};

export default DocumentosBoletin;