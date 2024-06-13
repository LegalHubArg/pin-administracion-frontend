import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaBoletines from '../../Pages/BO/BoletinesPublicados';

const GenerarBoletin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaBoletines />
        </Layout>

    );
};

export default GenerarBoletin;