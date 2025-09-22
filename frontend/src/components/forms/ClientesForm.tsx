const ClientesForm = () => {
  return (
    <form className="p-fluid">
      <div className="field">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" className="p-inputtext" placeholder="Nombre" />
      </div>

      <div className="field">
        <label htmlFor="apellido">Apellido</label>
        <input id="apellido" className="p-inputtext" placeholder="Apellido" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" className="p-inputtext" placeholder="email@dominio.com" />
      </div>

      <div className="field">
        <label htmlFor="telefono">Teléfono</label>
        <input id="telefono" className="p-inputtext" placeholder="+51 987654321" />
      </div>

      <div className="field">
        <label htmlFor="direccion">Dirección</label>
        <input id="direccion" className="p-inputtext" placeholder="Av. Principal 123, Lima" />
      </div>

      <div className="field">
        <label htmlFor="latitud">Latitud</label>
        <input type="number" step="0.000001" id="latitud" className="p-inputtext" placeholder="-12.046374" />
      </div>

      <div className="field">
        <label htmlFor="longitud">Longitud</label>
        <input type="number" step="0.000001" id="longitud" className="p-inputtext" placeholder="-77.042793" />
      </div>

      <button type="submit" className="p-button p-component">Guardar</button>
    </form>
  );
};

export default ClientesForm;