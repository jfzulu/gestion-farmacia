
import { useLocalStorage } from "@/hooks/use-local-storage";

// Definición de tipos
export interface Producto {
  id: string;
  nombre: string;
  numeroReferencia: string;
  fechaVencimiento: string;
  numeroLote: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  margenGanancia: number;
  descripcion: string;
  categoria?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  medicamentos: string[]; // IDs de los medicamentos que ha comprado
  totalCompras: number;
}

export interface ProductoVenta {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  clienteId: string;
  productos: ProductoVenta[];
  precioTotal: number;
  fecha: string;
  metodoPago: "efectivo" | "transferencia" | "tarjeta" | "otro";
  descuento?: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  productos: string[]; // IDs de los productos que provee
}

export interface Pedido {
  id: string;
  proveedorId: string;
  productos: ProductoVenta[];
  precioTotal: number;
  fecha: string;
}

export interface Nota {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  completada: boolean;
}

// Hooks para acceder a los datos
export function useProductos() {
  return useLocalStorage<Producto[]>("pharmacy-productos", []);
}

export function useClientes() {
  return useLocalStorage<Cliente[]>("pharmacy-clientes", []);
}

export function useVentas() {
  return useLocalStorage<Venta[]>("pharmacy-ventas", []);
}

export function useProveedores() {
  return useLocalStorage<Proveedor[]>("pharmacy-proveedores", []);
}

export function usePedidos() {
  return useLocalStorage<Pedido[]>("pharmacy-pedidos", []);
}

export function useNotas() {
  return useLocalStorage<Nota[]>("pharmacy-notas", []);
}
