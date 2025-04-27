
import { Producto, Cliente, Venta, Proveedor, Pedido, Nota, ProductoVenta } from "./store";

// Función para generar un ID único
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Función para generar una fecha aleatoria en los últimos 6 meses
function randomDate(start: Date = new Date(new Date().setMonth(new Date().getMonth() - 6)), end: Date = new Date()): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Función para generar una fecha de vencimiento futura
function futureDateString(monthsAhead: number = 12): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return date.toISOString().split('T')[0];
}

// Datos de muestra para productos
const sampleProductos: Producto[] = [
  {
    id: generateId(),
    nombre: "Paracetamol 500mg",
    numeroReferencia: "MED-001",
    fechaVencimiento: futureDateString(24),
    numeroLote: "LOT-123456",
    cantidad: 100,
    precioCompra: 0.5,
    precioVenta: 1.2,
    margenGanancia: 140,
    descripcion: "Analgésico y antipirético para aliviar el dolor leve o moderado",
    categoria: "Medicamento"
  },
  {
    id: generateId(),
    nombre: "Ibuprofeno 400mg",
    numeroReferencia: "MED-002",
    fechaVencimiento: futureDateString(18),
    numeroLote: "LOT-789012",
    cantidad: 80,
    precioCompra: 0.75,
    precioVenta: 1.8,
    margenGanancia: 140,
    descripcion: "Antiinflamatorio no esteroideo (AINE)",
    categoria: "Medicamento"
  },
  {
    id: generateId(),
    nombre: "Jeringa 5ml",
    numeroReferencia: "EQ-001",
    fechaVencimiento: futureDateString(36),
    numeroLote: "LOT-567890",
    cantidad: 150,
    precioCompra: 0.3,
    precioVenta: 0.8,
    margenGanancia: 166.67,
    descripcion: "Jeringa estéril de 5ml",
    categoria: "Equipo"
  },
  {
    id: generateId(),
    nombre: "Mascarillas Quirúrgicas",
    numeroReferencia: "EQ-002",
    fechaVencimiento: futureDateString(24),
    numeroLote: "LOT-345678",
    cantidad: 200,
    precioCompra: 0.2,
    precioVenta: 0.5,
    margenGanancia: 150,
    descripcion: "Mascarilla de 3 capas para uso médico",
    categoria: "Equipo"
  },
  {
    id: generateId(),
    nombre: "Omeprazol 20mg",
    numeroReferencia: "MED-003",
    fechaVencimiento: futureDateString(12),
    numeroLote: "LOT-901234",
    cantidad: 60,
    precioCompra: 0.65,
    precioVenta: 1.5,
    margenGanancia: 130.77,
    descripcion: "Inhibidor de la bomba de protones para reducir el ácido estomacal",
    categoria: "Medicamento"
  }
];

// Datos de muestra para clientes
const sampleClientes: Cliente[] = [
  {
    id: generateId(),
    nombre: "María García",
    documento: "1234567890",
    email: "maria@example.com",
    telefono: "555-1234",
    direccion: "Calle 123 #45-67",
    medicamentos: [sampleProductos[0].id, sampleProductos[1].id],
    totalCompras: 125.5
  },
  {
    id: generateId(),
    nombre: "Juan Pérez",
    documento: "0987654321",
    email: "juan@example.com",
    telefono: "555-5678",
    direccion: "Avenida 789 #12-34",
    medicamentos: [sampleProductos[0].id],
    totalCompras: 45.2
  },
  {
    id: generateId(),
    nombre: "Ana Martínez",
    documento: "5678901234",
    email: "ana@example.com",
    telefono: "555-9012",
    direccion: "Carrera 456 #78-90",
    medicamentos: [sampleProductos[2].id, sampleProductos[3].id],
    totalCompras: 78.3
  }
];

// Datos de muestra para proveedores
const sampleProveedores: Proveedor[] = [
  {
    id: generateId(),
    nombre: "Farmacéuticos Unidos S.A.",
    contacto: "Carlos Ruiz",
    telefono: "555-2468",
    email: "contacto@farmauni.com",
    direccion: "Zona Industrial, Bloque 3",
    productos: [sampleProductos[0].id, sampleProductos[1].id, sampleProductos[4].id]
  },
  {
    id: generateId(),
    nombre: "Suministros Médicos Express",
    contacto: "Lucía Vega",
    telefono: "555-1357",
    email: "ventas@sumimedexpress.com",
    direccion: "Calle Comercio 789",
    productos: [sampleProductos[2].id, sampleProductos[3].id]
  }
];

// Crear algunas ventas de muestra
function createSampleVentas(): Venta[] {
  const ventas: Venta[] = [];

  // Para cada cliente, crear algunas ventas
  sampleClientes.forEach(cliente => {
    const numVentas = Math.floor(Math.random() * 3) + 1; // 1-3 ventas por cliente
    
    for (let i = 0; i < numVentas; i++) {
      const productosVenta: ProductoVenta[] = [];
      let precioTotal = 0;
      
      // Añadir 1-3 productos a la venta
      const numProductos = Math.floor(Math.random() * 3) + 1;
      const productosDisponibles = [...sampleProductos];
      
      for (let j = 0; j < numProductos; j++) {
        if (productosDisponibles.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * productosDisponibles.length);
        const producto = productosDisponibles[randomIndex];
        
        // Eliminar el producto de los disponibles para evitar duplicados
        productosDisponibles.splice(randomIndex, 1);
        
        const cantidad = Math.floor(Math.random() * 5) + 1; // 1-5 unidades
        const subtotal = producto.precioVenta * cantidad;
        
        productosVenta.push({
          productoId: producto.id,
          cantidad,
          precioUnitario: producto.precioVenta,
          subtotal
        });
        
        precioTotal += subtotal;
      }
      
      // Aplicar descuento aleatorio en algunas ventas
      const tieneDescuento = Math.random() > 0.7; // 30% de probabilidad de tener descuento
      const descuento = tieneDescuento ? Math.floor(Math.random() * 15) + 5 : undefined; // 5-20% de descuento
      
      if (descuento) {
        precioTotal = precioTotal * (1 - descuento / 100);
      }
      
      const metodoPago = ["efectivo", "transferencia", "tarjeta", "otro"][Math.floor(Math.random() * 4)] as "efectivo" | "transferencia" | "tarjeta" | "otro";
      
      ventas.push({
        id: generateId(),
        clienteId: cliente.id,
        productos: productosVenta,
        precioTotal,
        fecha: randomDate(),
        metodoPago,
        descuento
      });
    }
  });
  
  return ventas;
}

// Crear algunos pedidos de muestra
function createSamplePedidos(): Pedido[] {
  const pedidos: Pedido[] = [];
  
  // Para cada proveedor, crear 1-2 pedidos
  sampleProveedores.forEach(proveedor => {
    const numPedidos = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numPedidos; i++) {
      const productosProveedor = sampleProductos.filter(p => proveedor.productos.includes(p.id));
      if (productosProveedor.length === 0) continue;
      
      const productosPedido: ProductoVenta[] = [];
      let precioTotal = 0;
      
      // Añadir productos que provee este proveedor
      productosProveedor.forEach(producto => {
        const cantidad = Math.floor(Math.random() * 50) + 10; // 10-60 unidades
        const subtotal = producto.precioCompra * cantidad;
        
        productosPedido.push({
          productoId: producto.id,
          cantidad,
          precioUnitario: producto.precioCompra,
          subtotal
        });
        
        precioTotal += subtotal;
      });
      
      pedidos.push({
        id: generateId(),
        proveedorId: proveedor.id,
        productos: productosPedido,
        precioTotal,
        fecha: randomDate(new Date(new Date().setMonth(new Date().getMonth() - 12))) // Últimos 12 meses
      });
    }
  });
  
  return pedidos;
}

// Datos de muestra para notas
const sampleNotas: Nota[] = [
  {
    id: generateId(),
    titulo: "Revisar inventario de antibióticos",
    descripcion: "Verificar la cantidad y fecha de vencimiento de todos los antibióticos en stock",
    fecha: randomDate(),
    completada: Math.random() > 0.5
  },
  {
    id: generateId(),
    titulo: "Contactar al proveedor de insumos",
    descripcion: "Llamar a Suministros Médicos Express para consultar disponibilidad de mascarillas N95",
    fecha: randomDate(),
    completada: false
  },
  {
    id: generateId(),
    titulo: "Actualizar precios de medicamentos",
    descripcion: "Revisar y actualizar los precios de venta según las nuevas disposiciones",
    fecha: randomDate(),
    completada: true
  },
  {
    id: generateId(),
    titulo: "Mantenimiento del refrigerador de medicamentos",
    descripcion: "Programar la revisión técnica del refrigerador para la próxima semana",
    fecha: new Date().toISOString().split('T')[0],
    completada: false
  }
];

// Función principal para inicializar la base de datos
export function SeedDatabase() {
  // Almacenar en localStorage
  const ventas = createSampleVentas();
  const pedidos = createSamplePedidos();
  
  localStorage.setItem("pharmacy-productos", JSON.stringify(sampleProductos));
  localStorage.setItem("pharmacy-clientes", JSON.stringify(sampleClientes));
  localStorage.setItem("pharmacy-ventas", JSON.stringify(ventas));
  localStorage.setItem("pharmacy-proveedores", JSON.stringify(sampleProveedores));
  localStorage.setItem("pharmacy-pedidos", JSON.stringify(pedidos));
  localStorage.setItem("pharmacy-notas", JSON.stringify(sampleNotas));
  
  console.log("Base de datos inicializada con datos de muestra");
}
