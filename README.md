# Kio — App de Ahorros

PWA de gestión de gastos e ingresos personales. Permite registrar transacciones, definir presupuestos, establecer metas de ahorro y visualizar estadísticas por mes.

## Stack

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **Supabase** — autenticación y sincronización de datos
- **PWA** — funciona offline con Service Worker

## Pantallas

| Pantalla | Descripción |
|---|---|
| Dashboard | Resumen del mes: saldo, gastos e ingresos |
| Añadir | Registrar nueva transacción (gasto o ingreso) |
| Historial | Lista de todas las transacciones |
| Estadísticas | Gráficas y desglose por categoría |
| Metas | Seguimiento de objetivos de ahorro |
| Presupuesto | Límite mensual y gastos fijos recurrentes |

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (NavBar, etc.)
├── screens/          # Una carpeta por pantalla principal
├── lib/              # Clientes externos (Supabase)
├── constants.js      # Categorías, helpers de formato y cálculo
├── storage.js        # Capa de persistencia (localStorage + Supabase)
├── App.jsx           # Componente raíz y estado global
└── main.jsx          # Punto de entrada

public/
├── icons/            # Iconos PWA (192x192, 512x512)
├── manifest.json     # Configuración PWA
└── sw.js             # Service Worker

scripts/
├── generate-icons.js # Genera los iconos PNG a partir del SVG
└── supabase_setup.sql # Schema inicial de la base de datos
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

## Despliegue

El proyecto está configurado para desplegarse en **Vercel**. Al importar el repositorio, Vercel detecta automáticamente la configuración de Vite:

- **Build command:** `vite build`
- **Output directory:** `dist`

Recuerda añadir las variables de entorno de Supabase en el panel de Vercel.
