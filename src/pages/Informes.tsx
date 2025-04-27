import { useState, useEffect } from "react";
import { useVentas, useProductos, useClientes, useProveedores, usePedidos } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Calendar, BarChart, TrendingUp, Download } from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  TooltipProps
} from 'recharts';

interface VentaFiltrada {
  id: string;
  clienteId: string;
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  precioTotal: number;
  fecha: string;
  metodoPago: "efectivo" | "transferencia" | "tarjeta" | "otro";
  descuento?: number;
}

interface ProductoVendido {
  id: string;
  cantidad: number;
  total: number;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  margenGanancia: number;
}

interface DatosGrafico {
  fecha: string;
  totalVentas: number;
  cantidadVentas: number;
}

interface DatosGanancias {
  fecha: string;
  gananciaBruta: number;
}

const Informes = () => {
  const [ventas] = useVentas();
  const [productos] = useProductos();
  const [clientes] = useClientes();
  const [proveedores] = useProveedores();
  const [pedidos] = usePedidos();
  
  const [tipoInforme, setTipoInforme] = useState("diario");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("_all");
  const [ventasFiltradas, setVentasFiltradas] = useState<VentaFiltrada[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoVendido[]>([]);
  const [datosGraficoVentas, setDatosGraficoVentas] = useState<DatosGrafico[]>([]);
  const [datosGraficoGanancias, setDatosGraficoGanancias] = useState<DatosGanancias[]>([]);
  
  useEffect(() => {
    const hoy = new Date();
    
    if (!fechaFin) {
      setFechaFin(hoy.toISOString().split('T')[0]);
    }
    
    if (!fechaInicio) {
      if (tipoInforme === "diario") {
        setFechaInicio(hoy.toISOString().split('T')[0]);
      } else if (tipoInforme === "mensual") {
        const unMesAtras = new Date();
        unMesAtras.setMonth(hoy.getMonth() - 1);
        setFechaInicio(unMesAtras.toISOString().split('T')[0]);
      } else {
        const unAnioAtras = new Date();
        unAnioAtras.setFullYear(hoy.getFullYear() - 1);
        setFechaInicio(unAnioAtras.toISOString().split('T')[0]);
      }
    }
  }, [tipoInforme]);
  
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);
    
    let ventasFiltradas = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta >= inicio && fechaVenta <= fin;
    });
    
    if (clienteSeleccionado !== "_all") {
      ventasFiltradas = ventasFiltradas.filter(venta => venta.clienteId === clienteSeleccionado);
    }
    
    setVentasFiltradas(ventasFiltradas as VentaFiltrada[]);
    
    calcularProductosMasVendidos(ventasFiltradas as VentaFiltrada[]);
    prepararDatosGraficos(ventasFiltradas as VentaFiltrada[]);
  }, [fechaInicio, fechaFin, clienteSeleccionado, ventas]);
  
  const calcularProductosMasVendidos = (ventasFiltradas: VentaFiltrada[]) => {
    const contadorProductos: Record<string, { id: string; cantidad: number; total: number }> = {};
    
    ventasFiltradas.forEach(venta => {
      venta.productos.forEach(prod => {
        if (contadorProductos[prod.productoId]) {
          contadorProductos[prod.productoId].cantidad += prod.cantidad;
          contadorProductos[prod.productoId].total += prod.subtotal;
        } else {
          contadorProductos[prod.productoId] = {
            id: prod.productoId,
            cantidad: prod.cantidad,
            total: prod.subtotal
          };
        }
      });
    });
    
    const productosArray = Object.values(contadorProductos);
    productosArray.sort((a, b) => b.cantidad - a.cantidad);
    
    const productosMasVendidos = productosArray.map(item => {
      const producto = productos.find(p => p.id === item.id);
      return {
        ...item,
        nombre: producto ? producto.nombre : "Producto no encontrado",
        precioCompra: producto ? producto.precioCompra : 0,
        precioVenta: producto ? producto.precioVenta : 0,
        margenGanancia: producto ? producto.margenGanancia : 0
      };
    });
    
    setProductosMasVendidos(productosMasVendidos);
  };
  
  const prepararDatosGraficos = (ventasFiltradas: VentaFiltrada[]) => {
    if (ventasFiltradas.length === 0) {
      setDatosGraficoVentas([]);
      setDatosGraficoGanancias([]);
      return;
    }
    
    const ventasPorFecha: Record<string, DatosGrafico> = {};
    
    ventasFiltradas.forEach(venta => {
      const fecha = venta.fecha;
      if (ventasPorFecha[fecha]) {
        ventasPorFecha[fecha].totalVentas += venta.precioTotal;
        ventasPorFecha[fecha].cantidadVentas += 1;
      } else {
        ventasPorFecha[fecha] = {
          fecha,
          totalVentas: venta.precioTotal,
          cantidadVentas: 1
        };
      }
    });
    
    const gananciasPorFecha: Record<string, DatosGanancias> = {};
    
    ventasFiltradas.forEach(venta => {
      const fecha = venta.fecha;
      if (!gananciasPorFecha[fecha]) {
        gananciasPorFecha[fecha] = {
          fecha,
          gananciaBruta: 0
        };
      }
      
      venta.productos.forEach(prodVenta => {
        const producto = productos.find(p => p.id === prodVenta.productoId);
        if (producto) {
          const costoTotal = producto.precioCompra * prodVenta.cantidad;
          const ganancia = prodVenta.subtotal - costoTotal;
          gananciasPorFecha[fecha].gananciaBruta += ganancia;
        }
      });
    });
    
    const datosVentas = Object.values(ventasPorFecha).sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    
    const datosGanancias = Object.values(gananciasPorFecha).sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    
    setDatosGraficoVentas(datosVentas);
    setDatosGraficoGanancias(datosGanancias);
  };
  
  const obtenerDatosResumen = () => {
    if (ventasFiltradas.length === 0) {
      return {
        totalVentas: 0,
        totalProductos: 0,
        totalClientes: 0,
        ventaPromedio: 0,
        totalGananciaBruta: 0,
        margenPromedioGanancia: 0
      };
    }
    
    const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + venta.precioTotal, 0);
    const totalProductos = ventasFiltradas.reduce(
      (sum, venta) => sum + venta.productos.reduce((sum, prod) => sum + prod.cantidad, 0), 0
    );
    
    const clientesUnicos = new Set(ventasFiltradas.map(venta => venta.clienteId));
    
    const ventaPromedio = totalVentas / ventasFiltradas.length;
    
    let costoTotal = 0;
    let gananciaTotal = 0;
    
    ventasFiltradas.forEach(venta => {
      venta.productos.forEach(prodVenta => {
        const producto = productos.find(p => p.id === prodVenta.productoId);
        if (producto) {
          const costo = producto.precioCompra * prodVenta.cantidad;
          costoTotal += costo;
          gananciaTotal += prodVenta.subtotal - costo;
        }
      });
    });
    
    const margenPromedioGanancia = costoTotal > 0 ? (gananciaTotal / costoTotal) * 100 : 0;
    
    return {
      totalVentas,
      totalProductos,
      totalClientes: clientesUnicos.size,
      ventaPromedio,
      totalGananciaBruta: gananciaTotal,
      margenPromedioGanancia
    };
  };
  
  const datosResumen = obtenerDatosResumen();
  
  const descargarInforme = () => {
    let texto = `INFORME DE VENTAS\n`;
    texto += `Período: ${fechaInicio} al ${fechaFin}\n`;
    if (clienteSeleccionado !== "_all") {
      const cliente = clientes.find(c => c.id === clienteSeleccionado);
      texto += `Cliente: ${cliente ? cliente.nombre : 'No encontrado'}\n`;
    }
    texto += `\nRESUMEN\n`;
    texto += `Total de ventas: $${datosResumen.totalVentas.toFixed(2)}\n`;
    texto += `Total de productos vendidos: ${datosResumen.totalProductos}\n`;
    texto += `Total de clientes atendidos: ${datosResumen.totalClientes}\n`;
    texto += `Venta promedio: $${datosResumen.ventaPromedio.toFixed(2)}\n`;
    texto += `Ganancia bruta: $${datosResumen.totalGananciaBruta.toFixed(2)}\n`;
    texto += `Margen promedio: ${datosResumen.margenPromedioGanancia.toFixed(2)}%\n`;
    
    texto += `\nPRODUCTOS MÁS VENDIDOS\n`;
    productosMasVendidos.slice(0, 10).forEach((producto, index) => {
      texto += `${index + 1}. ${producto.nombre} - Cantidad: ${producto.cantidad} - Total: $${producto.total.toFixed(2)}\n`;
    });
    
    texto += `\nDETALLE DE VENTAS\n`;
    ventasFiltradas.forEach((venta, index) => {
      const cliente = clientes.find(c => c.id === venta.clienteId);
      texto += `Venta #${index + 1} - Fecha: ${venta.fecha} - Cliente: ${cliente ? cliente.nombre : 'No encontrado'} - Total: $${venta.precioTotal.toFixed(2)}\n`;
    });
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_ventas_${fechaInicio}_${fechaFin}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatearFechaGrafico = (fecha: string) => {
    const date = new Date(fecha);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };
  
  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : "Cliente no encontrado";
  };
  
  const formatTooltipValue = (value: number) => {
    return [`$${value.toFixed(2)}`, 'Total'];
  };

  const formatGananciaValue = (value: number) => {
    return [`$${value.toFixed(2)}`, 'Ganancia'];
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <FileText className="h-8 w-8 mr-2 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Informes</h1>
            <p className="text-muted-foreground">Análisis y reportes de ventas</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${datosResumen.totalVentas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Período seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datosResumen.totalProductos}</div>
            <p className="text-xs text-muted-foreground">Unidades totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Bruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${datosResumen.totalGananciaBruta.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Margen: {datosResumen.margenPromedioGanancia.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datosResumen.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Venta prom: ${datosResumen.ventaPromedio.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Filtros de Informe</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="tipoInforme" className="mb-2 block">Tipo de Informe</Label>
            <Select value={tipoInforme} onValueChange={setTipoInforme}>
              <SelectTrigger id="tipoInforme">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fechaInicio" className="mb-2 block">Fecha Inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fechaFin" className="mb-2 block">Fecha Fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cliente" className="mb-2 block">Cliente</Label>
            <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
              <SelectTrigger id="cliente">
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
          <div className="flex items-end">
            <Button className="w-full" onClick={descargarInforme}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Informe
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="ventas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ventas" className="w-full">
          {ventasFiltradas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No hay ventas en el período seleccionado.</p>
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
                          {venta.productos.length} productos
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{venta.metodoPago}</TableCell>
                      <TableCell>{venta.descuento ? `${venta.descuento}%` : "-"}</TableCell>
                      <TableCell className="font-medium">${venta.precioTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-bold">TOTAL:</TableCell>
                    <TableCell className="font-bold">
                      ${ventasFiltradas.reduce((sum, venta) => sum + venta.precioTotal, 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="productos" className="w-full">
          {productosMasVendidos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No hay productos vendidos en el período seleccionado.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio de Compra</TableHead>
                    <TableHead>Precio de Venta</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>Total Vendido</TableHead>
                    <TableHead>Ganancia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosMasVendidos.map((producto) => {
                    const costoTotal = producto.precioCompra * producto.cantidad;
                    const ganancia = producto.total - costoTotal;
                    return (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell>{producto.cantidad}</TableCell>
                        <TableCell>${producto.precioCompra.toFixed(2)}</TableCell>
                        <TableCell>${producto.precioVenta.toFixed(2)}</TableCell>
                        <TableCell>{producto.margenGanancia.toFixed(2)}%</TableCell>
                        <TableCell>${producto.total.toFixed(2)}</TableCell>
                        <TableCell>${ganancia.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={5} className="text-right font-bold">TOTALES:</TableCell>
                    <TableCell className="font-bold">
                      ${productosMasVendidos.reduce((sum, prod) => sum + prod.total, 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${productosMasVendidos.reduce((sum, prod) => {
                        const costoTotal = prod.precioCompra * prod.cantidad;
                        const ganancia = prod.total - costoTotal;
                        return sum + ganancia;
                      }, 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="graficos" className="w-full space-y-6">
          <Card className="p-4">
            <CardHeader>
              <div className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>Ventas por Día</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {datosGraficoVentas.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No hay datos disponibles</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={datosGraficoVentas}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        tickFormatter={formatearFechaGrafico}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                        labelFormatter={(value) => `Fecha: ${new Date(value).toLocaleDateString('es-ES')}`}
                      />
                      <Legend />
                      <Bar 
                        name="Total de Ventas" 
                        dataKey="totalVentas" 
                        fill="#1E88E5" 
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardHeader>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                <CardTitle>Ganancias por Día</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {datosGraficoGanancias.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No hay datos disponibles</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={datosGraficoGanancias}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        tickFormatter={formatearFechaGrafico}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ganancia']}
                        labelFormatter={(value) => `Fecha: ${new Date(value).toLocaleDateString('es-ES')}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        name="Ganancia Bruta" 
                        dataKey="gananciaBruta" 
                        stroke="#26A69A" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Informes;
