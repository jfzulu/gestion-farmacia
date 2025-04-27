
import { useEffect, useState } from "react";
import { useNotas } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Calendar, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useVentas, useProductos } from "@/lib/store";

const Index = () => {
  const [notas, setNotas] = useNotas();
  const [ventas] = useVentas();
  const [productos] = useProductos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notaActual, setNotaActual] = useState({ id: "", titulo: "", descripcion: "", fecha: "", completada: false });
  const [isEditing, setIsEditing] = useState(false);
  
  // Estadísticas rápidas
  const totalVentas = ventas.length;
  const ventasHoy = ventas.filter(v => v.fecha === new Date().toISOString().split('T')[0]).length;
  const productosBajoStock = productos.filter(p => p.cantidad < 10).length;
  const productosProximosVencer = productos.filter(p => {
    const fechaVencimiento = new Date(p.fechaVencimiento);
    const hoy = new Date();
    const tresMesesDespues = new Date(hoy);
    tresMesesDespues.setMonth(hoy.getMonth() + 3);
    return fechaVencimiento <= tresMesesDespues;
  }).length;
  
  const resetFormulario = () => {
    setNotaActual({
      id: "",
      titulo: "",
      descripcion: "",
      fecha: new Date().toISOString().split('T')[0],
      completada: false
    });
    setIsEditing(false);
  };
  
  useEffect(() => {
    resetFormulario();
  }, [dialogOpen]);
  
  const handleGuardarNota = () => {
    if (!notaActual.titulo) {
      toast.error("El título de la nota es obligatorio");
      return;
    }
    
    if (isEditing) {
      setNotas(prev => prev.map(nota => 
        nota.id === notaActual.id ? notaActual : nota
      ));
      toast.success("Nota actualizada correctamente");
    } else {
      const nuevaNota = {
        ...notaActual,
        id: Math.random().toString(36).substring(2, 15),
        fecha: notaActual.fecha || new Date().toISOString().split('T')[0]
      };
      setNotas(prev => [...prev, nuevaNota]);
      toast.success("Nota creada correctamente");
    }
    
    setDialogOpen(false);
  };
  
  const handleEditarNota = (nota) => {
    setNotaActual(nota);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const handleEliminarNota = (id) => {
    setNotas(prev => prev.filter(nota => nota.id !== id));
    toast.success("Nota eliminada correctamente");
  };
  
  const handleToggleCompletada = (id) => {
    setNotas(prev => prev.map(nota => 
      nota.id === id ? { ...nota, completada: !nota.completada } : nota
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold">Droguería FarmaGestión</h1>
          <p className="text-muted-foreground">Panel de Control</p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentas}</div>
            <p className="text-xs text-muted-foreground">Ventas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasHoy}</div>
            <p className="text-xs text-muted-foreground">Ventas del día</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosBajoStock}</div>
            <p className="text-xs text-muted-foreground">Productos a reponer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximos a Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosProximosVencer}</div>
            <p className="text-xs text-muted-foreground">En los próximos 3 meses</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notas y Recordatorios
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetFormulario}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Nota" : "Nueva Nota"}</DialogTitle>
                <DialogDescription>
                  Crea un recordatorio para actividades de la droguería.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={notaActual.titulo}
                    onChange={(e) => setNotaActual({ ...notaActual, titulo: e.target.value })}
                    placeholder="Ej: Revisar inventario"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={notaActual.descripcion}
                    onChange={(e) => setNotaActual({ ...notaActual, descripcion: e.target.value })}
                    placeholder="Detalles de la tarea a realizar..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={notaActual.fecha}
                    onChange={(e) => setNotaActual({ ...notaActual, fecha: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="completada" 
                    checked={notaActual.completada}
                    onCheckedChange={(checked) => setNotaActual({ ...notaActual, completada: checked === true })}
                  />
                  <label htmlFor="completada" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Marcar como completada
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleGuardarNota}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notas.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No hay notas registradas. Crea una nueva nota para empezar.
            </p>
          ) : (
            notas.map((nota) => (
              <Card key={nota.id} className={nota.completada ? "bg-muted" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`nota-${nota.id}`} 
                        checked={nota.completada}
                        onCheckedChange={() => handleToggleCompletada(nota.id)}
                      />
                      <CardTitle className={`text-lg ${nota.completada ? "line-through text-muted-foreground" : ""}`}>
                        {nota.titulo}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleEliminarNota(nota.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(nota.fecha).toLocaleDateString('es-ES')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm ${nota.completada ? "line-through text-muted-foreground" : ""}`}>
                    {nota.descripcion}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditarNota(nota)}>
                    Editar
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
