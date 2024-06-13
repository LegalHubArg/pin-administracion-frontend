import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaFirmarBoletin from '../../Pages/BO/FirmarBoletin';

const FirmarBoletin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaFirmarBoletin />
        </Layout>

    );
};

export default FirmarBoletin;