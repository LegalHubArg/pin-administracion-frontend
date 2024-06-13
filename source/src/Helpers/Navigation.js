
export const linkToParams =  (ruta, params = {}, navigate) => {
    return navigate(ruta, {state: params, replace: true})
  };