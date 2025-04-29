# Gestión de Farmacia

## Descripción del Proyecto

Este proyecto es una aplicación web diseñada para la gestión integral de una farmacia. Permite administrar clientes, inventario, proveedores, ventas e informes de manera eficiente y centralizada. La aplicación está desarrollada utilizando tecnologías modernas como React, TypeScript y Tailwind CSS, lo que garantiza un rendimiento óptimo y una experiencia de usuario intuitiva.

## Tecnologías Utilizadas

- **Vite**: Herramienta de construcción rápida y moderna.
- **TypeScript**: Lenguaje de programación con tipado estático.
- **React**: Biblioteca para construir interfaces de usuario.
- **Tailwind CSS**: Framework de utilidades CSS para estilos rápidos y consistentes.
- **shadcn-ui**: Componentes de interfaz de usuario reutilizables.

## Instalación y Configuración

Sigue los pasos a continuación para configurar el proyecto en tu entorno local:

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd gestion-farmacia
   ```

3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000` o el puerto configurado.

## Estructura del Proyecto

- **`src/components/ui/`**: Componentes reutilizables como botones, formularios, tablas, etc.
- **`src/pages/`**: Páginas principales de la aplicación (Clientes, Inventario, Ventas, etc.).
- **`src/hooks/`**: Hooks personalizados para lógica reutilizable.
- **`src/lib/`**: Utilidades y configuración global.

## Despliegue

Para desplegar la aplicación, puedes utilizar cualquier servicio de hosting compatible con aplicaciones web modernas, como Vercel o Netlify. Asegúrate de construir el proyecto antes de desplegarlo:

```bash
npm run build
```

Esto generará una carpeta `dist/` lista para producción.

## Contribución

Si deseas contribuir al proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección de errores:
   ```bash
   git checkout -b nombre-de-tu-rama
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Descripción de los cambios"
   ```
4. Envía tus cambios al repositorio remoto:
   ```bash
   git push origin nombre-de-tu-rama
   ```
5. Abre un Pull Request en GitHub.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
