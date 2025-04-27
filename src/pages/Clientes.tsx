import { useState } from "react";
import { useClientes, Cliente, useVentas, Producto, useProductos } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Trash2, Search, User } from "lucide-react";
import { toast } from "sonner";

const Clientes = () => {
  const [clientes, setClientes] = useClientes();
  const [ventas] = useVentas();
  const [productos] = useProductos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [ordenPor, setOrdenPor] = useState("nombre");
  
  const [clienteActual, setClienteActual] = useState<Cliente>({
    id: "",
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    direccion: "",
    medicamentos: [],
    totalCompras: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const resetFormulario = () => {
    setClienteActual({
      id: "",
      nombre: "",
      documento: "",
      email: "",
      telefono: "",
      direccion: "",
      medicamentos: [],
      totalCompras: 0
    });
    setIsEditing(false);
  };
  
  const handleGuardarCliente = () => {
    // Validar campos obligatorios
    if (!clienteActual.nombre || !clienteActual.documento) {
      toast.error("El nombre y el documento son obligatorios");
      return;
    }
    
    if (isEditing) {
      setClientes(prev => prev.map(c => c.id === clienteActual.id ? clienteActual : c));
      toast.success("Cliente actualizado correctamente");
    } else {
      // Verificar si el documento ya existe
      const documentoExiste = clientes.some(c => c.documento === clienteActual.documento);
      if (documentoExiste) {
        toast.error("Ya existe un cliente con ese documento");
        return;
      }
      
      const nuevoCliente = {
        ...clienteActual,
        id: Math.random().toString(36).substring(2, 15),
      };
      setClientes(prev => [...prev, nuevoCliente]);
      toast.success("Cliente agregado correctamente");
    }
    
    setDialogOpen(false);
  };
  
  const handleEditarCliente = (cliente: Cliente) => {
    setClienteActual(cliente);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const handleEliminarCliente = (id: string) => {
    // Verificar si el cliente tiene ventas asociadas
    const clienteTieneVentas = ventas.some(v => v.clienteId === id);
    if (clienteTieneVentas) {
      toast.error("No se puede eliminar el cliente porque tiene ventas asociadas");
      return;
    }
    
    setClientes(prev => prev.filter(c => c.id !== id));
    toast.success("Cliente eliminado correctamente");
  };
  
  // Función para obtener los productos de un cliente
  const getProductosCliente = (cliente: Cliente) => {
    const ventasCliente = ventas.filter(v => v.clienteId === cliente.id);
    const productosComprados = new Set<string>();
    
    ventasCliente.forEach(venta => {
      venta.productos.forEach(p => {
        const producto = productos.find(prod => prod.id === p.productoId);
        if (producto) {
          productosComprados.add(producto.nombre);
        }
      });
    });
    
    return Array.from(productosComprados);
  };

  // Filtrar y ordenar clientes
  const clientesFiltrados = clientes
    .filter(cliente =>
      cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.documento.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.email.toLowerCase().includes(filtro.toLowerCase()) ||
      cliente.telefono.toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) => {
      switch (ordenPor) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "totalCompras":
          return b.totalCompras - a.totalCompras;
        default:
          return 0;
      }
    });
  
  // Actualizar información de medicamentos y total de compras
  const clientesConComprasActualizadas = clientesFiltrados.map(cliente => {
    const ventasCliente = ventas.filter(v => v.clienteId === cliente.id);
    const totalCompras = ventasCliente.reduce((sum, v) => sum + v.precioTotal, 0);
    
    // Obtener IDs únicos de medicamentos comprados
    const medicamentosComprados = new Set<string>();
    ventasCliente.forEach(venta => {
      venta.productos.forEach(p => {
        medicamentosComprados.add(p.productoId);
      });
    });
    
    // Solo actualizar en memoria, no en el estado
    return {
      ...cliente,
      medicamentos: Array.from(medicamentosComprados),
      totalCompras
    };
  });
  
  // Estadísticas de clientes
  const totalClientes = clientes.length;
  const clientesConCompras = clientes.filter(c => c.totalCompras > 0).length;
  const mejorCliente = clientes.reduce((mejor, actual) => 
    actual.totalCompras > (mejor?.totalCompras || 0) ? actual : mejor, clientes[0]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <Users className="h-8 w-8 mr-2 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de clientes</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={resetFormulario}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
              <DialogDescription>
                Complete la información del cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={clienteActual.nombre}
                    onChange={(e) => setClienteActual({ ...clienteActual, nombre: e.target.value })}
                    placeholder="Ej: María García"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documento">Documento *</Label>
                  <Input
                    id="documento"
                    value={clienteActual.documento}
                    onChange={(e) => setClienteActual({ ...clienteActual, documento: e.target.value })}
                    placeholder="Ej: 1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clienteActual.email}
                    onChange={(e) => setClienteActual({ ...clienteActual, email: e.target.value })}
                    placeholder="Ej: cliente@ejemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={clienteActual.telefono}
                    onChange={(e) => setClienteActual({ ...clienteActual, telefono: e.target.value })}
                    placeholder="Ej: 555-1234"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={clienteActual.direccion}
                  onChange={(e) => setClienteActual({ ...clienteActual, direccion: e.target.value })}
                  placeholder="Ej: Calle 123 #45-67"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGuardarCliente}>{isEditing ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesConCompras}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mejor Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mejorCliente ? mejorCliente.nombre : "N/A"}
            </div>
            {mejorCliente && (
              <p className="text-xs text-muted-foreground">
                ${mejorCliente.totalCompras.toFixed(2)} en compras
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="tabla" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tabla">Vista de Tabla</TabsTrigger>
          <TabsTrigger value="tarjetas">Vista de Tarjetas</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-2/3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-1/3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value)}
            >
              <option value="nombre">Ordenar por Nombre</option>
              <option value="totalCompras">Ordenar por Total de Compras</option>
            </select>
          </div>
        </div>
        
        <TabsContent value="tabla" className="w-full">
          {clientesConComprasActualizadas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron clientes.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Productos Comprados</TableHead>
                    <TableHead>Total Compras</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesConComprasActualizadas.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>{cliente.documento}</TableCell>
                      <TableCell>
                        <div>{cliente.email}</div>
                        <div className="text-muted-foreground">{cliente.telefono}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs space-y-1">
                          {getProductosCliente(cliente).length > 0 ? (
                            getProductosCliente(cliente).map((producto, index) => (
                              <div key={index} className="text-sm">
                                • {producto}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No hay compras</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${cliente.totalCompras.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditarCliente(cliente)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleEliminarCliente(cliente.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tarjetas" className="w-full">
          {clientesConComprasActualizadas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron clientes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesConComprasActualizadas.map((cliente) => (
                <Card key={cliente.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleEliminarCliente(cliente.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Documento:</span>
                      <span>{cliente.documento}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{cliente.email || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span>{cliente.telefono || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dirección:</span>
                      <span>{cliente.direccion || "-"}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-muted-foreground text-sm">Productos Comprados:</span>
                      <div className="space-y-1 text-sm">
                        {getProductosCliente(cliente).length > 0 ? (
                          getProductosCliente(cliente).map((producto, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span>•</span>
                              <span>{producto}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No hay compras</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Total Compras:</span>
                      <span className="font-bold">${cliente.totalCompras.toFixed(2)}</span>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" className="w-full" onClick={() => handleEditarCliente(cliente)}>
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clientes;
