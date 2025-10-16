import { useEffect, useState } from 'react'
import { listarUsuarios, type Usuario, actualizarEstadoUsuario } from '../services/UsuariosService';
import Tablas from '../components/Tablas';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ModalWrapper from '../components/ModalWrapper';
import UsuarioForm from '../components/forms/UsuarioForm';
import ActualizarUsuarioForm from '../components/forms/ActualizarUsuarioForm';
import { Toast } from 'primereact/toast';
import { useToast } from '../hooks/useToast';
import { Tag } from 'primereact/tag';

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState<boolean>(false);
    const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const { showToast, toast } = useToast();

    const handleCreated = async () => {
        console.log("Usuario creado, recargando lista...");
        setVisible(false);
        setLoading(true);
        try {
            const data = await listarUsuarios();
            setUsuarios(data);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdated = async () => {
        console.log("Usuario actualizado, recargando lista...");
        setVisibleEdit(false);
        setSelectedUser(null);
        setLoading(true);
        try {
            const data = await listarUsuarios();
            setUsuarios(data);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: Usuario) => {
        setSelectedUser(user);
        setVisibleEdit(true);
    };

    // Función para cambiar estado (activar/desactivar)
    const handleCambiarEstado = async (usuario: Usuario) => {
        try {
            const nuevoEstado = !usuario.estado;
            await actualizarEstadoUsuario(usuario.id, nuevoEstado);
            // Actualizar el estado local
            setUsuarios(prev => prev.map(u =>
                u.id === usuario.id ? { ...u, estado: nuevoEstado } : u
            ));

            showToast({
                severity: 'success',
                summary: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`
            });
        } catch (error: any) {
            const msg = error?.message || error?.response?.data?.mensaje || 'Error al cambiar estado';
            showToast({ severity: 'error', summary: msg });
        }
    };

    // Función para confirmar cambio de estado
    const confirmarCambioEstado = (usuario: Usuario) => {
        const accion = usuario.estado ? 'desactivar' : 'activar';
        confirmDialog({
            message: `¿Estás seguro de que quieres ${accion} a ${usuario.nombre} ${usuario.apellido}?`,
            header: 'Confirmar acción',
            icon: 'pi pi-exclamation-triangle',
            accept: () => handleCambiarEstado(usuario),
            acceptLabel: 'Sí',
            rejectLabel: 'No'
        });
    };

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const data = await listarUsuarios();
                console.log("Usuarios cargados:", data);
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
            body: (row: Usuario) => (
                <Tag value={row.estado ? "Activo" : "Inactivo"} severity={row.estado ? "success" : "danger"} />
            )
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
        {
            field: "acciones",
            header: "Acciones",
            body: (row: Usuario) => (
                <div className="flex gap-1">
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-success p-button-text"
                        onClick={() => openEditModal(row)}
                        tooltip="Editar usuario"
                        tooltipOptions={{ position: 'top' }}
                    />
                    <Button
                        icon={row.estado ? "pi pi-ban" : "pi pi-check"}
                        className={`p-button-rounded p-button-text ${row.estado ? 'p-button-warning' : 'p-button-info'
                            }`}
                        onClick={() => confirmarCambioEstado(row)}
                        tooltip={row.estado ? "Desactivar usuario" : "Activar usuario"}
                        tooltipOptions={{ position: 'top' }}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="surface-ground min-h-screen p-4">
            <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>
            <div className="mb-4">
                <Button label="Nuevo usuario" icon="pi pi-plus" onClick={() => setVisible(true)} />
            </div>

            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Modal para crear usuario */}
            <ModalWrapper header="Formulario de usuario" visible={visible} onHide={() => setVisible(false)}>
                <UsuarioForm onSuccess={handleCreated} />
            </ModalWrapper>

            {/* Modal para editar usuario */}
            <ModalWrapper header="Editar Usuario" visible={visibleEdit} onHide={() => setVisibleEdit(false)}>
                {selectedUser && (
                    <ActualizarUsuarioForm
                        usuarioId={selectedUser.id}
                        onSuccess={handleUpdated}
                        onCancel={() => setVisibleEdit(false)}
                    />
                )}
            </ModalWrapper>

            {loading ? (
                <p>Cargando usuarios...</p>
            ) : (
                <Tablas data={usuarios} columns={columns} rows={5} />
            )}
        </div>
    )
}

export default UsuariosPage
// import { useEffect, useState } from 'react'
// import { actualizarEstadoUsuario, listarUsuarios, type Usuario } from '../services/UsuariosService';
// import Tablas from '../components/Tablas';
// import { Button } from 'primereact/button';
// import ModalWrapper from '../components/ModalWrapper';
// import UsuarioForm from '../components/forms/UsuarioForm'; // Importamos el formulario de edición
// import ActualizarUsuarioForm from '../components/forms/ActualizarUsuarioForm';

// const UsuariosPage = () => {
//     const [usuarios, setUsuarios] = useState<Usuario[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [visible, setVisible] = useState<boolean>(false);
//     const [visibleEdit, setVisibleEdit] = useState<boolean>(false); // Modal de edición
//     const [selectedUser, setSelectedUser] = useState<Usuario | null>(null); // Usuario seleccionado para editar

//     const handleCreated = async () => {
//         console.log("Usuario creado, recargando lista...");
//         setVisible(false);
//         setLoading(true);
//         try {
//             const data = await listarUsuarios();
//             setUsuarios(data);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUpdated = async () => {
//         console.log("Usuario actualizado, recargando lista...");
//         setVisibleEdit(false);
//         setSelectedUser(null);
//         setLoading(true);
//         try {
//             const data = await listarUsuarios();
//             setUsuarios(data);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openEditModal = (user: Usuario) => {
//         setSelectedUser(user);
//         setVisibleEdit(true);
//     };

//     useEffect(() => {
//         const fetchUsuarios = async () => {
//             try {
//                 const data = await listarUsuarios();
//                 setUsuarios(data);
//             } catch (error) {
//                 console.error("Error al cargar usuarios:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsuarios();
//     }, []);


//     const handleActualizarEstado = async (id: number, nuevoEstado: boolean) => {
//         try {
//             await actualizarEstadoUsuario(id, nuevoEstado);
//             // Recargar la lista de usuarios
//             const data = await listarUsuarios();
//             setUsuarios(data);
//             showToast({ severity: 'success', summary: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'}` });
//         } catch (error) {
//             console.error("Error al actualizar estado:", error);
//             showToast({ severity: 'error', summary: 'Error al actualizar estado' });
//         }
//     };

//     const columns = [
//         { field: "id", header: "ID" },
//         { field: "nombre", header: "Nombre" },
//         { field: "apellido", header: "Apellido" },
//         { field: "email", header: "Email" },
//         { field: "rolNombre", header: "Rol" },
//         {
//             field: "estado",
//             header: "Estado",
//             body: (row: Usuario) => (row.estado ? "Activo ✅" : "Inactivo ❌")
//         },
//         {
//             field: "createdAt",
//             header: "Creado",
//             body: (row: Usuario) => row.createdAt.toLocaleDateString()
//         },
//         {
//             field: "updatedAt",
//             header: "Actualizado",
//             body: (row: Usuario) => row.updatedAt.toLocaleDateString()
//         },
//         {
//             field: "acciones",
//             header: "Acciones",
//             body: (row: Usuario) => (
//                 <div className="flex gap-2">
//                     <Button
//                         icon="pi pi-pencil"
//                         className="p-button-rounded p-button-success p-button-text"
//                         onClick={() => openEditModal(row)}
//                     />
//                     <Button
//                         icon={row.estado ? "pi pi-times" : "pi pi-check"}
//                         className={`p-button-rounded p-button-text ${row.estado ? 'p-button-danger' : 'p-button-success'}`}
//                         onClick={() => handleActualizarEstado(row.id, !row.estado)}
//                     />
//                 </div>
//             )
//         }
//         // {
//         //     field: "acciones",
//         //     header: "Acciones",
//         //     body: (row: Usuario) => (
//         //         <Button
//         //             icon="pi pi-pencil"
//         //             className="p-button-rounded p-button-success p-button-text"
//         //             onClick={() => openEditModal(row)}
//         //         />
//         //     )
//         // }
//     ];

//     return (
//         <div className="surface-ground min-h-screen p-4">
//             <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>
//             <div className="mb-4">
//                 <Button label="Nuevo usuario" icon="pi pi-plus" onClick={() => setVisible(true)} />
//             </div>

//             {/* Modal para crear usuario */}
//             <ModalWrapper header="Formulario de usuario" visible={visible} onHide={() => setVisible(false)}>
//                 <UsuarioForm onSuccess={handleCreated} />
//             </ModalWrapper>

//             {/* Modal para editar usuario */}
//             <ModalWrapper header="Editar Usuario" visible={visibleEdit} onHide={() => setVisibleEdit(false)}>
//                 {selectedUser && (
//                     <ActualizarUsuarioForm
//                         usuarioId={selectedUser.id}
//                         onSuccess={handleUpdated}
//                         onCancel={() => setVisibleEdit(false)}
//                     />
//                 )}
//             </ModalWrapper>

//             {loading ? (
//                 <p>Cargando usuarios...</p>
//             ) : (
//                 <Tablas data={usuarios} columns={columns} rows={5} />
//             )}
//         </div>
//     )
// }

// export default UsuariosPage

