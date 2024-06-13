import React from 'react';

import Layout  from '../../Components/Layout/Layout';
import VistaDiseniadorBoletin from '../../Pages/BO/DiseniadorBoletin';

const DiseniadorBoletin = props => {
    return (
        <Layout isHeader={true} isBotonUsuario={true} isFooter={true}>
            <VistaDiseniadorBoletin />
        </Layout>

    );
};

export default DiseniadorBoletin;