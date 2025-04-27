
import { useState } from "react";
import { useProveedores, usePedidos, Proveedor, Pedido, useProductos } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Plus, Trash2, Calendar, Search } from "lucide-react";
import { toast } from "sonner";

const Proveedores = () => {
  const [proveedores, setProveedores] = useProveedores();
  const [pedidos] = usePedidos();
  const [productos] = useProductos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  
  const [proveedorActual, setProveedorActual] = useState<Proveedor>({
    id: "",
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    productos: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const resetFormulario = () => {
    setProveedorActual({
      id: "",
      nombre: "",
      contacto: "",
      telefono: "",
      email: "",
      direccion: "",
      productos: []
    });
    setIsEditing(false);
  };
  
  const handleGuardarProveedor = () => {
    // Validar campos obligatorios
    if (!proveedorActual.nombre) {
      toast.error("El nombre del proveedor es obligatorio");
      return;
    }
    
    if (isEditing) {
      setProveedores(prev => prev.map(p => p.id === proveedorActual.id ? proveedorActual : p));
      toast.success("Proveedor actualizado correctamente");
    } else {
      const nuevoProveedor = {
        ...proveedorActual,
        id: Math.random().toString(36).substring(2, 15),
      };
      setProveedores(prev => [...prev, nuevoProveedor]);
      toast.success("Proveedor agregado correctamente");
    }
    
    setDialogOpen(false);
  };
  
  const handleEditarProveedor = (proveedor: Proveedor) => {
    setProveedorActual(proveedor);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const handleEliminarProveedor = (id: string) => {
    // Verificar si el proveedor tiene pedidos asociados
    const proveedorTienePedidos = pedidos.some(p => p.proveedorId === id);
    if (proveedorTienePedidos) {
      toast.error("No se puede eliminar el proveedor porque tiene pedidos asociados");
      return;
    }
    
    setProveedores(prev => prev.filter(p => p.id !== id));
    toast.success("Proveedor eliminado correctamente");
  };
  
  // Filtrar proveedores
  const proveedoresFiltrados = proveedores
    .filter(proveedor =>
      proveedor.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(filtro.toLowerCase()) ||
      proveedor.email.toLowerCase().includes(filtro.toLowerCase())
    );
  
  const getProductosProveedor = (proveedorId: string): Pedido[] => {
    return pedidos.filter(pedido => pedido.proveedorId === proveedorId);
  };
  
  const getProductoNombre = (productoId: string): string => {
    const producto = productos.find(p => p.id === productoId);
    return producto ? producto.nombre : "Producto no encontrado";
  };
  
  // Estadísticas de proveedores
  const totalProveedores = proveedores.length;
  const totalPedidos = pedidos.length;
  const totalGastado = pedidos.reduce((sum, pedido) => sum + pedido.precioTotal, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <User className="h-8 w-8 mr-2 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Proveedores</h1>
            <p className="text-muted-foreground">Gestión de proveedores y pedidos</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={resetFormulario}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
              <DialogDescription>
                Complete la información del proveedor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={proveedorActual.nombre}
                  onChange={(e) => setProveedorActual({ ...proveedorActual, nombre: e.target.value })}
                  placeholder="Ej: Farmacéuticos Unidos S.A."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contacto">Persona de Contacto</Label>
                  <Input
                    id="contacto"
                    value={proveedorActual.contacto}
                    onChange={(e) => setProveedorActual({ ...proveedorActual, contacto: e.target.value })}
                    placeholder="Ej: Carlos Ruiz"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={proveedorActual.telefono}
                    onChange={(e) => setProveedorActual({ ...proveedorActual, telefono: e.target.value })}
                    placeholder="Ej: 555-1234"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={proveedorActual.email}
                    onChange={(e) => setProveedorActual({ ...proveedorActual, email: e.target.value })}
                    placeholder="Ej: contacto@ejemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={proveedorActual.direccion}
                    onChange={(e) => setProveedorActual({ ...proveedorActual, direccion: e.target.value })}
                    placeholder="Ej: Zona Industrial, Bloque 3"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGuardarProveedor}>{isEditing ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProveedores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPedidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGastado.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="proveedores" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
          <TabsTrigger value="pedidos">Historial de Pedidos</TabsTrigger>
        </TabsList>
        
        <div className="flex mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <TabsContent value="proveedores" className="w-full">
          {proveedoresFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron proveedores.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proveedoresFiltrados.map((proveedor) => {
                const pedidosProveedor = getProductosProveedor(proveedor.id);
                const totalPedidosProveedor = pedidosProveedor.length;
                const ultimoPedido = pedidosProveedor.sort((a, b) => 
                  new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
                const totalGastadoProveedor = pedidosProveedor.reduce((sum, pedido) => sum + pedido.precioTotal, 0);
                
                return (
                  <Card key={proveedor.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{proveedor.nombre}</CardTitle>
                          {proveedor.contacto && (
                            <p className="text-sm text-muted-foreground">Contacto: {proveedor.contacto}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleEliminarProveedor(proveedor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {proveedor.telefono && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Teléfono:</span>
                          <span>{proveedor.telefono}</span>
                        </div>
                      )}
                      {proveedor.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{proveedor.email}</span>
                        </div>
                      )}
                      {proveedor.direccion && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dirección:</span>
                          <span>{proveedor.direccion}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Pedidos:</span>
                          <span>{totalPedidosProveedor}</span>
                        </div>
                        {ultimoPedido && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Último Pedido:</span>
                            <span>{new Date(ultimoPedido.fecha).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-muted-foreground">Total Gastado:</span>
                          <span>${totalGastadoProveedor.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="w-full" onClick={() => handleEditarProveedor(proveedor)}>
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pedidos" className="w-full">
          {pedidos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No hay pedidos registrados.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .map((pedido) => {
                      const proveedor = proveedores.find(p => p.id === pedido.proveedorId);
                      return (
                        <TableRow key={pedido.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {proveedor ? proveedor.nombre : "Proveedor no encontrado"}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {pedido.productos.map(p => getProductoNombre(p.productoId)).join(", ")}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${pedido.precioTotal.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Ver Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detalles del Pedido</DialogTitle>
                                  <DialogDescription>
                                    Fecha: {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-sm font-medium">Proveedor</h3>
                                    <p>{proveedor ? proveedor.nombre : "Proveedor no encontrado"}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium">Productos</h3>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Producto</TableHead>
                                          <TableHead>Cantidad</TableHead>
                                          <TableHead>Precio Unit.</TableHead>
                                          <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {pedido.productos.map((item) => (
                                          <TableRow key={item.productoId}>
                                            <TableCell>{getProductoNombre(item.productoId)}</TableCell>
                                            <TableCell>{item.cantidad}</TableCell>
                                            <TableCell>${item.precioUnitario.toFixed(2)}</TableCell>
                                            <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-right font-medium">
                                            Total:
                                          </TableCell>
                                          <TableCell className="font-bold">
                                            ${pedido.precioTotal.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Proveedores;
