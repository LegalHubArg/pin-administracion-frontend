
export const arrayToTag =  (tags) => {
  if (tags != null)
  {
    let etiquetitas = []
    let jsonTags = String(tags).split(",")
    if( jsonTags.length > 0)
    {
      jsonTags.forEach(function(tag, keyIndex) { etiquetitas.push(<span key={ 'tag' + String(keyIndex)}  className="badge badge-info">{tag}</span>) });
      return <> {etiquetitas} </>;
    }
  }
 return <></>;
};