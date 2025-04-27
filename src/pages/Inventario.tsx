
import { useState } from "react";
import { useProductos } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Database, Plus, Trash2, Search, Calendar } from "lucide-react";
import { toast } from "sonner";

const Inventario = () => {
  const [productos, setProductos] = useProductos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todo");
  const [ordenPor, setOrdenPor] = useState("nombre-asc");
  
  const [productoActual, setProductoActual] = useState({
    id: "",
    nombre: "",
    numeroReferencia: "",
    fechaVencimiento: "",
    numeroLote: "",
    cantidad: 0,
    precioCompra: 0,
    precioVenta: 0,
    margenGanancia: 0,
    descripcion: "",
    categoria: "Medicamento"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const resetFormulario = () => {
    setProductoActual({
      id: "",
      nombre: "",
      numeroReferencia: "",
      fechaVencimiento: new Date().toISOString().split('T')[0],
      numeroLote: "",
      cantidad: 0,
      precioCompra: 0,
      precioVenta: 0,
      margenGanancia: 0,
      descripcion: "",
      categoria: "Medicamento"
    });
    setIsEditing(false);
  };
  
  const handleGuardarProducto = () => {
    // Validar campos obligatorios
    if (!productoActual.nombre || !productoActual.numeroReferencia || !productoActual.fechaVencimiento || !productoActual.numeroLote) {
      toast.error("Todos los campos marcados con * son obligatorios");
      return;
    }
    
    if (productoActual.cantidad < 0 || productoActual.precioCompra < 0 || productoActual.precioVenta < 0) {
      toast.error("Los valores numéricos deben ser mayores o iguales a cero");
      return;
    }
    
    // Calcular margen de ganancia si no se ha especificado
    let producto = { ...productoActual };
    if (producto.precioCompra > 0 && producto.precioVenta > 0) {
      producto.margenGanancia = ((producto.precioVenta - producto.precioCompra) / producto.precioCompra) * 100;
    }
    
    if (isEditing) {
      setProductos(prev => prev.map(p => p.id === producto.id ? producto : p));
      toast.success("Producto actualizado correctamente");
    } else {
      const nuevoProducto = {
        ...producto,
        id: Math.random().toString(36).substring(2, 15),
      };
      setProductos(prev => [...prev, nuevoProducto]);
      toast.success("Producto agregado correctamente");
    }
    
    setDialogOpen(false);
  };
  
  const handleEditarProducto = (producto) => {
    setProductoActual(producto);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const handleEliminarProducto = (id) => {
    setProductos(prev => prev.filter(p => p.id !== id));
    toast.success("Producto eliminado correctamente");
  };
  
  const handlePrecioCompraChange = (valor) => {
    const precioCompra = parseFloat(valor);
    setProductoActual(prev => {
      const precioVenta = prev.precioVenta;
      let margenGanancia = 0;
      
      if (precioCompra > 0 && precioVenta > 0) {
        margenGanancia = ((precioVenta - precioCompra) / precioCompra) * 100;
      }
      
      return {
        ...prev,
        precioCompra,
        margenGanancia: Math.round(margenGanancia * 100) / 100
      };
    });
  };
  
  const handlePrecioVentaChange = (valor) => {
    const precioVenta = parseFloat(valor);
    setProductoActual(prev => {
      const precioCompra = prev.precioCompra;
      let margenGanancia = 0;
      
      if (precioCompra > 0 && precioVenta > 0) {
        margenGanancia = ((precioVenta - precioCompra) / precioCompra) * 100;
      }
      
      return {
        ...prev,
        precioVenta,
        margenGanancia: Math.round(margenGanancia * 100) / 100
      };
    });
  };
  
  const handleMargenGananciaChange = (valor) => {
    const margenGanancia = parseFloat(valor);
    setProductoActual(prev => {
      const precioCompra = prev.precioCompra;
      let precioVenta = 0;
      
      if (precioCompra > 0) {
        precioVenta = precioCompra + (precioCompra * margenGanancia / 100);
      }
      
      return {
        ...prev,
        margenGanancia,
        precioVenta: Math.round(precioVenta * 100) / 100
      };
    });
  };
  
  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter(producto => 
      (categoriaFiltro === "todo" || producto.categoria === categoriaFiltro) &&
      (producto.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
       producto.numeroReferencia.toLowerCase().includes(filtro.toLowerCase()) ||
       producto.descripcion.toLowerCase().includes(filtro.toLowerCase()))
    )
    .sort((a, b) => {
      switch (ordenPor) {
        case "nombre-asc":
          return a.nombre.localeCompare(b.nombre);
        case "nombre-desc":
          return b.nombre.localeCompare(a.nombre);
        case "cantidad-asc":
          return a.cantidad - b.cantidad;
        case "cantidad-desc":
          return b.cantidad - a.cantidad;
        case "vencimiento-asc":
          return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
        case "vencimiento-desc":
          return new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime();
        default:
          return 0;
      }
    });
  
  // Estadísticas del inventario
  const totalProductos = productos.length;
  const totalMedicamentos = productos.filter(p => p.categoria === "Medicamento").length;
  const totalEquipos = productos.filter(p => p.categoria === "Equipo").length;
  const bajoStock = productos.filter(p => p.cantidad < 10).length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <Database className="h-8 w-8 mr-2 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Gestión de medicamentos y equipos médicos</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={resetFormulario}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>
                Complete la información del producto para agregarlo al inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={productoActual.nombre}
                    onChange={(e) => setProductoActual({ ...productoActual, nombre: e.target.value })}
                    placeholder="Ej: Paracetamol 500mg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numeroReferencia">Número de Referencia *</Label>
                  <Input
                    id="numeroReferencia"
                    value={productoActual.numeroReferencia}
                    onChange={(e) => setProductoActual({ ...productoActual, numeroReferencia: e.target.value })}
                    placeholder="Ej: MED-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
                  <Input
                    id="fechaVencimiento"
                    type="date"
                    value={productoActual.fechaVencimiento}
                    onChange={(e) => setProductoActual({ ...productoActual, fechaVencimiento: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numeroLote">Número de Lote *</Label>
                  <Input
                    id="numeroLote"
                    value={productoActual.numeroLote}
                    onChange={(e) => setProductoActual({ ...productoActual, numeroLote: e.target.value })}
                    placeholder="Ej: LOT-12345"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    value={productoActual.cantidad}
                    onChange={(e) => setProductoActual({ ...productoActual, cantidad: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precioCompra">Precio de Compra</Label>
                  <Input
                    id="precioCompra"
                    type="number"
                    value={productoActual.precioCompra}
                    onChange={(e) => handlePrecioCompraChange(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precioVenta">Precio de Venta</Label>
                  <Input
                    id="precioVenta"
                    type="number"
                    value={productoActual.precioVenta}
                    onChange={(e) => handlePrecioVentaChange(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="margenGanancia">Margen de Ganancia (%)</Label>
                  <Input
                    id="margenGanancia"
                    type="number"
                    value={productoActual.margenGanancia}
                    onChange={(e) => handleMargenGananciaChange(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={productoActual.categoria}
                    onValueChange={(value) => setProductoActual({ ...productoActual, categoria: value })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medicamento">Medicamento</SelectItem>
                      <SelectItem value="Equipo">Equipo Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={productoActual.descripcion}
                  onChange={(e) => setProductoActual({ ...productoActual, descripcion: e.target.value })}
                  placeholder="Descripción del producto..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGuardarProducto}>{isEditing ? "Actualizar" : "Agregar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedicamentos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Equipos Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bajoStock}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="tabla" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tabla">Vista de Tabla</TabsTrigger>
          <TabsTrigger value="tarjetas">Vista de Tarjetas</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-1/3">
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todas las categorías</SelectItem>
                <SelectItem value="Medicamento">Medicamentos</SelectItem>
                <SelectItem value="Equipo">Equipos Médicos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/3">
            <Select value={ordenPor} onValueChange={setOrdenPor}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="cantidad-asc">Cantidad (Menor a Mayor)</SelectItem>
                <SelectItem value="cantidad-desc">Cantidad (Mayor a Menor)</SelectItem>
                <SelectItem value="vencimiento-asc">Vencimiento (Próximo)</SelectItem>
                <SelectItem value="vencimiento-desc">Vencimiento (Lejano)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="tabla" className="w-full">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Compra</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.map((producto) => {
                    const fechaVencimiento = new Date(producto.fechaVencimiento);
                    const hoy = new Date();
                    const unMesDespues = new Date(hoy);
                    unMesDespues.setMonth(hoy.getMonth() + 1);
                    
                    const estaVencido = fechaVencimiento < hoy;
                    const proximoAVencer = !estaVencido && fechaVencimiento <= unMesDespues;
                    
                    return (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell>{producto.numeroReferencia}</TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`mr-2 ${estaVencido ? 'text-destructive' : proximoAVencer ? 'text-orange-500' : ''}`}>
                              {new Date(producto.fechaVencimiento).toLocaleDateString('es-ES')}
                            </span>
                            {estaVencido && <span className="text-xs text-destructive">Vencido</span>}
                            {proximoAVencer && <span className="text-xs text-orange-500">Pronto</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={producto.cantidad < 10 ? "text-destructive font-medium" : ""}>
                            {producto.cantidad}
                          </span>
                        </TableCell>
                        <TableCell>${producto.precioCompra.toFixed(2)}</TableCell>
                        <TableCell>${producto.precioVenta.toFixed(2)}</TableCell>
                        <TableCell>{producto.margenGanancia.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditarProducto(producto)}>
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive" 
                              onClick={() => handleEliminarProducto(producto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tarjetas" className="w-full">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosFiltrados.map((producto) => {
                const fechaVencimiento = new Date(producto.fechaVencimiento);
                const hoy = new Date();
                const unMesDespues = new Date(hoy);
                unMesDespues.setMonth(hoy.getMonth() + 1);
                
                const estaVencido = fechaVencimiento < hoy;
                const proximoAVencer = !estaVencido && fechaVencimiento <= unMesDespues;
                
                return (
                  <Card key={producto.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                          <p className="text-sm text-muted-foreground">{producto.numeroReferencia}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive" 
                          onClick={() => handleEliminarProducto(producto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Categoría:</span>
                        <span>{producto.categoria}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vencimiento:</span>
                        <span className={estaVencido ? 'text-destructive' : proximoAVencer ? 'text-orange-500' : ''}>
                          {new Date(producto.fechaVencimiento).toLocaleDateString('es-ES')} 
                          {estaVencido && " (Vencido)"}
                          {proximoAVencer && " (Pronto)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className={producto.cantidad < 10 ? "text-destructive font-medium" : ""}>
                          {producto.cantidad}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio de Compra:</span>
                        <span>${producto.precioCompra.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Precio de Venta:</span>
                        <span>${producto.precioVenta.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Margen:</span>
                        <span>{producto.margenGanancia.toFixed(2)}%</span>
                      </div>
                      {producto.descripcion && (
                        <div className="pt-2 border-t mt-2">
                          <p className="text-sm">{producto.descripcion}</p>
                        </div>
                      )}
                    </CardContent>
                    <div className="px-6 pb-4">
                      <Button variant="outline" className="w-full" onClick={() => handleEditarProducto(producto)}>
                        Editar
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventario;
