import { useEffect, useState } from 'react'
import { listarUsuarios, type Usuario } from '../services/UsuariosService';
import Tablas from '../components/Tablas';

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const data = await listarUsuarios();
                setUsuarios(data);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const columns = [
        { field: "id", header: "ID" },
        { field: "nombre", header: "Nombre" },
        { field: "apellido", header: "Apellido" },
        { field: "email", header: "Email" },
        { field: "rolNombre", header: "Rol" },
        {
            field: "estado",
            header: "Estado",
            body: (row: Usuario) => (row.estado ? "Activo ✅" : "Inactivo ❌")
        },
        {
            field: "createdAt",
            header: "Creado",
            body: (row: Usuario) => row.createdAt.toLocaleDateString()
        },
        {
            field: "updatedAt",
            header: "Actualizado",
            body: (row: Usuario) => row.updatedAt.toLocaleDateString()
        },
    ];


    return (
        <div className="surface-ground min-h-screen p-4">
            <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>

            {loading ? (
                <p>Cargando usuarios...</p>
            ) : (
                <Tablas data={usuarios} columns={columns} rows={5} />
            )}
        </div>
    )
}

export default UsuariosPage
