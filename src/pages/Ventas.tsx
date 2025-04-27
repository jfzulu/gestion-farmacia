import { useState, useEffect } from "react";
import { useVentas, useProductos, useClientes, ProductoVenta, Venta, Cliente, Producto } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clipboard, Plus, Trash2, Calendar, X, Search } from "lucide-react";
import { toast } from "sonner";

const Ventas = () => {
  const [ventas, setVentas] = useVentas();
  const [productos, setProductos] = useProductos();
  const [clientes] = useClientes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "tarjeta" | "otro">("efectivo");
  const [descuento, setDescuento] = useState<number | undefined>(undefined);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [buscarProducto, setBuscarProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  
  // Filtros para historial de ventas
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");
  
  useEffect(() => {
    // Calcular precio total
    let total = productosVenta.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Aplicar descuento si existe
    if (descuento && descuento > 0) {
      total = total * (1 - descuento / 100);
    }
    
    setPrecioTotal(total);
  }, [productosVenta, descuento]);
  
  const resetFormularioVenta = () => {
    setClienteId("");
    setProductosVenta([]);
    setMetodoPago("efectivo");
    setDescuento(undefined);
    setPrecioTotal(0);
    setBuscarProducto("");
    setProductoSeleccionado("");
    setCantidadProducto(1);
  };
  
  const agregarProductoAVenta = () => {
    if (!productoSeleccionado) {
      toast.error("Debe seleccionar un producto");
      return;
    }
    
    if (cantidadProducto <= 0) {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }
    
    const producto = productos.find(p => p.id === productoSeleccionado);
    if (!producto) {
      toast.error("Producto no encontrado");
      return;
    }
    
    if (cantidadProducto > producto.cantidad) {
      toast.error("No hay suficiente stock disponible");
      return;
    }
    
    // Verificar si el producto ya está en la venta
    const productoExistente = productosVenta.find(p => p.productoId === productoSeleccionado);
    
    if (productoExistente) {
      // Actualizar cantidad y subtotal
      const nuevosProductos = productosVenta.map(p => {
        if (p.productoId === productoSeleccionado) {
          const nuevaCantidad = p.cantidad + cantidadProducto;
          if (nuevaCantidad > producto.cantidad) {
            toast.error("No hay suficiente stock disponible");
            return p;
          }
          return {
            ...p,
            cantidad: nuevaCantidad,
            subtotal: producto.precioVenta * nuevaCantidad
          };
        }
        return p;
      });
      
      setProductosVenta(nuevosProductos);
    } else {
      // Agregar nuevo producto a la venta
      const nuevoProducto: ProductoVenta = {
        productoId: producto.id,
        cantidad: cantidadProducto,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta * cantidadProducto
      };
      
      setProductosVenta([...productosVenta, nuevoProducto]);
    }
    
    setProductoSeleccionado("");
    setCantidadProducto(1);
    setBuscarProducto("");
  };
  
  const eliminarProductoDeVenta = (productoId: string) => {
    setProductosVenta(prev => prev.filter(p => p.productoId !== productoId));
  };
  
  const completarVenta = () => {
    if (!clienteId) {
      toast.error("Debe seleccionar un cliente");
      return;
    }
    
    if (productosVenta.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }
    
    // Crear nueva venta
    const nuevaVenta: Venta = {
      id: Math.random().toString(36).substring(2, 15),
      clienteId,
      productos: productosVenta,
      precioTotal,
      fecha: new Date().toISOString().split('T')[0],
      metodoPago,
      descuento
    };
    
    // Actualizar inventario
    const nuevosProductos = [...productos];
    let inventarioInsuficiente = false;
    
    productosVenta.forEach(item => {
      const index = nuevosProductos.findIndex(p => p.id === item.productoId);
      if (index !== -1) {
        if (nuevosProductos[index].cantidad < item.cantidad) {
          inventarioInsuficiente = true;
          return;
        }
        nuevosProductos[index].cantidad -= item.cantidad;
      }
    });
    
    if (inventarioInsuficiente) {
      toast.error("El inventario ha sido actualizado por otro usuario. Verifique las cantidades disponibles.");
      return;
    }
    
    // Actualizar contadores del cliente
    const medicamentosComprados = productosVenta.map(pv => {
      const producto = productos.find(p => p.id === pv.productoId);
      return producto?.id || "";
    }).filter(id => id !== "");
    
    // Guardar cambios
    setVentas([...ventas, nuevaVenta]);
    setProductos(nuevosProductos);
    
    toast.success("Venta registrada correctamente");
    setDialogOpen(false);
    resetFormularioVenta();
  };
  
  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : "Cliente no encontrado";
  };
  
  const getProductoNombre = (productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    return producto ? producto.nombre : "Producto no encontrado";
  };
  
  // Filtrar ventas para el historial
  const ventasFiltradas = ventas.filter(venta => {
    let cumpleFiltros = true;
    
    if (filtroFecha && venta.fecha !== filtroFecha) {
      cumpleFiltros = false;
    }
    
    if (filtroCliente && venta.clienteId !== filtroCliente) {
      cumpleFiltros = false;
    }
    
    if (filtroPrecioMin && venta.precioTotal < parseFloat(filtroPrecioMin)) {
      cumpleFiltros = false;
    }
    
    if (filtroPrecioMax && venta.precioTotal > parseFloat(filtroPrecioMax)) {
      cumpleFiltros = false;
    }
    
    return cumpleFiltros;
  })
  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Productos filtrados por búsqueda
  const productosFiltrados = productos
    .filter(p => 
      p.cantidad > 0 && 
      (p.nombre.toLowerCase().includes(buscarProducto.toLowerCase()) || 
       p.numeroReferencia.toLowerCase().includes(buscarProducto.toLowerCase()))
    )
    .slice(0, 5);
  
  // Calcular estadísticas
  const ventasHoy = ventas.filter(v => v.fecha === new Date().toISOString().split('T')[0]);
  const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.precioTotal, 0);
  const totalVentas = ventas.reduce((sum, v) => sum + v.precioTotal, 0);
  const promedioVenta = ventas.length > 0 ? totalVentas / ventas.length : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <Clipboard className="h-8 w-8 mr-2 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Ventas</h1>
            <p className="text-muted-foreground">Registro y gestión de ventas</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={resetFormularioVenta}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
              <DialogDescription>
                Seleccione el cliente, agregue productos y complete la venta.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.documento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Agregar Productos</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Buscar producto..."
                      value={buscarProducto}
                      onChange={(e) => setBuscarProducto(e.target.value)}
                    />
                    {buscarProducto && productosFiltrados.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto">
                        {productosFiltrados.map(producto => (
                          <div 
                            key={producto.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setProductoSeleccionado(producto.id);
                              setBuscarProducto(producto.nombre);
                            }}
                          >
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-xs text-muted-foreground">Ref: {producto.numeroReferencia} - Stock: {producto.cantidad}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={cantidadProducto}
                    onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button type="button" onClick={agregarProductoAVenta}>
                    Agregar
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosVenta.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay productos agregados
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosVenta.map((item) => {
                        const producto = productos.find(p => p.id === item.productoId);
                        return (
                          <TableRow key={item.productoId}>
                            <TableCell>{producto?.nombre || "Producto no encontrado"}</TableCell>
                            <TableCell>{item.cantidad}</TableCell>
                            <TableCell>${item.precioUnitario.toFixed(2)}</TableCell>
                            <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => eliminarProductoDeVenta(item.productoId)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    {productosVenta.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Subtotal:
                          </TableCell>
                          <TableCell colSpan={2}>
                            ${productosVenta.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Descuento (%):
                          </TableCell>
                          <TableCell colSpan={2}>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={descuento || ""}
                              onChange={(e) => setDescuento(e.target.value ? parseFloat(e.target.value) : undefined)}
                              className="w-20"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total:
                          </TableCell>
                          <TableCell colSpan={2} className="font-bold">
                            ${precioTotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="metodoPago">Método de Pago</Label>
                <Select value={metodoPago} onValueChange={(value) => setMetodoPago(value as any)}>
                  <SelectTrigger id="metodoPago">
                    <SelectValue placeholder="Seleccione método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={completarVenta}>
                Completar Venta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasHoy.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Ventas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentasHoy.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVentas.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${promedioVenta.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="historial" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="historial">Historial de Ventas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="historial" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/4">
              <Label htmlFor="filtroFecha" className="mb-2 block">Fecha</Label>
              <Input
                id="filtroFecha"
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/4">
              <Label htmlFor="filtroCliente" className="mb-2 block">Cliente</Label>
              <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                <SelectTrigger id="filtroCliente">
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todos los clientes</SelectItem>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/4">
              <Label htmlFor="filtroPrecioMin" className="mb-2 block">Precio mínimo</Label>
              <Input
                id="filtroPrecioMin"
                type="number"
                min="0"
                value={filtroPrecioMin}
                onChange={(e) => setFiltroPrecioMin(e.target.value)}
                placeholder="Precio mínimo"
              />
            </div>
            <div className="w-full md:w-1/4">
              <Label htmlFor="filtroPrecioMax" className="mb-2 block">Precio máximo</Label>
              <Input
                id="filtroPrecioMax"
                type="number"
                min="0"
                value={filtroPrecioMax}
                onChange={(e) => setFiltroPrecioMax(e.target.value)}
                placeholder="Precio máximo"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setFiltroFecha("");
                setFiltroCliente("");
                setFiltroPrecioMin("");
                setFiltroPrecioMax("");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
          
          {ventasFiltradas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron ventas con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasFiltradas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {new Date(venta.fecha).toLocaleDateString('es-ES')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{getClienteNombre(venta.clienteId)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {venta.productos.map(p => getProductoNombre(p.productoId)).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{venta.metodoPago}</TableCell>
                      <TableCell>{venta.descuento ? `${venta.descuento}%` : "-"}</TableCell>
                      <TableCell className="font-medium">${venta.precioTotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalles de la Venta</DialogTitle>
                              <DialogDescription>
                                Fecha: {new Date(venta.fecha).toLocaleDateString('es-ES')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium">Cliente</h3>
                                <p>{getClienteNombre(venta.clienteId)}</p>
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
                                    {venta.productos.map((item) => (
                                      <TableRow key={item.productoId}>
                                        <TableCell>{getProductoNombre(item.productoId)}</TableCell>
                                        <TableCell>{item.cantidad}</TableCell>
                                        <TableCell>${item.precioUnitario.toFixed(2)}</TableCell>
                                        <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow>
                                      <TableCell colSpan={3} className="text-right font-medium">
                                        Subtotal:
                                      </TableCell>
                                      <TableCell>
                                        ${venta.productos.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    {venta.descuento && (
                                      <TableRow>
                                        <TableCell colSpan={3} className="text-right font-medium">
                                          Descuento ({venta.descuento}%):
                                        </TableCell>
                                        <TableCell>
                                          -${((venta.productos.reduce((sum, item) => sum + item.subtotal, 0) * venta.descuento) / 100).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow>
                                      <TableCell colSpan={3} className="text-right font-medium">
                                        Total:
                                      </TableCell>
                                      <TableCell className="font-bold">
                                        ${venta.precioTotal.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="text-sm font-medium">Método de Pago</h3>
                                  <p className="capitalize">{venta.metodoPago}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium">Fecha</h3>
                                  <p>{new Date(venta.fecha).toLocaleDateString('es-ES')}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Ventas;
