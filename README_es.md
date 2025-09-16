# Procesador de Archivos CSV Grandes

Una aplicación TypeScript diseñada para manejar archivos CSV grandes que no pueden ser cargados en memoria. Este proyecto genera y procesa datos de ventas utilizando técnicas de streaming para un rendimiento óptimo.

## 📋 Características

- **Generación de Datos**: Crea archivos CSV con 1,000,000+ registros usando streaming por lotes
- **Procesamiento de Reportes**: Procesa archivos CSV grandes usando streams de Node.js para evitar problemas de memoria
- **Análisis Estadístico**: Calcula estadísticas completas incluyendo desviación estándar
- **Eficiente en Memoria**: Maneja archivos de cualquier tamaño sin cargarlos completamente en memoria
- **Seguimiento de Progreso**: Indicadores de progreso en tiempo real durante el procesamiento
- **Testing Completo**: Suite de pruebas completa con validación y pruebas de rendimiento

## 🏗️ Estructura del Proyecto

```
├── src/
│   ├── generator.ts      # Generador de datos de ventas
│   ├── main.ts          # Procesador de reportes
│   └── index.ts         # Punto de entrada principal
├── test/
│   └── test.ts          # Suite de pruebas
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración de TypeScript
└── README.md           # Este archivo
```

## 📊 Esquema de Datos

### Datos de Ventas (`sales.csv`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | int | ID secuencial (1 a 1,000,000) |
| order_id | int | Identificador de orden aleatorio |
| customer_id | int | Identificador de cliente aleatorio (1-50,000) |
| total | float | Monto aleatorio ($500.00 - $1800.00) |
| date | datetime | Fecha aleatoria (2020-2025) |

### Reporte de Ventas (`sales_report.csv`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| year | int | Año |
| month | int | Mes (1-12) |
| month_name | string | Nombre del mes |
| number_of_orders | int | Cantidad de órdenes |
| max_amount | float | Monto máximo de venta |
| min_amount | float | Monto mínimo de venta |
| sales_average | float | Promedio de ventas |
| standard_deviation | float | Desviación estándar de ventas |

## 🚀 Instalación

1. **Clonar o crear el directorio del proyecto**
2. **Instalar dependencias**:
   ```bash
   npm install
   ```

## 📖 Uso

### Generar Datos de Ventas
Crea `sales.csv` con 1,000,000 registros:
```bash
npm run generate-data
```

### Procesar Reporte de Ventas
Procesa `sales.csv` y crea `sales_report.csv`:
```bash
npm run process-report
```

### Ejecutar Pruebas
Ejecuta la suite completa de pruebas:
```bash
npm test
```

### Compilar Proyecto
Compilar TypeScript a JavaScript:
```bash
npm run build
```

### Ejecución Manual
También puedes ejecutar los programas directamente con ts-node:
```bash
# Generar datos
npx ts-node src/generator.ts

# Procesar reporte
npx ts-node src/main.ts

# Ejecutar pruebas
npx ts-node test/test.ts
```

## 🔧 Configuración

### Generación de Datos Personalizada
```typescript
import { SalesDataGenerator } from './src/generator';

// Crear generador con parámetros personalizados
const generator = new SalesDataGenerator(
  'ventas_personalizadas.csv',  // Archivo de salida
  2000000,                     // Número de registros
  20000                        // Tamaño del lote
);

await generator.generate();
```

### Procesamiento de Reportes Personalizado
```typescript
import { SalesProcessor } from './src/main';

// Crear procesador con rutas personalizadas
const processor = new SalesProcessor(
  'ventas_entrada.csv',    // Archivo de entrada
  'reporte_salida.csv'     // Archivo de salida
);

await processor.process();
```

## 🧪 Pruebas

La suite de pruebas incluye:
- **Pruebas de Generación de Datos**: Valida estructura de registros, rangos y restricciones
- **Pruebas de Procesamiento de Reportes**: Asegura cálculos estadísticos precisos
- **Pruebas de Validación de Datos**: Verifica integridad y unicidad de datos
- **Pruebas de Rendimiento**: Mide velocidad de procesamiento y eficiencia

Ejecutar con: `npm test`

## 🚀 Rendimiento

### Benchmarks (Rendimiento Típico)
- **Generación de Datos**: ~50,000-100,000 registros/segundo
- **Procesamiento de Reportes**: ~80,000-120,000 registros/segundo
- **Uso de Memoria**: Constante ~50-100MB independientemente del tamaño del archivo
- **Tamaño de Archivo**: ~80MB para 1M de registros

### Eficiencia de Memoria
- Utiliza streaming para lectura y escritura
- Procesa datos en lotes configurables
- Uso de memoria constante independientemente del tamaño del archivo
- Adecuado para archivos con millones o billones de registros

## 🛠️ Implementación Técnica

### Estrategia de Streaming
- **Streams de Escritura**: Para generar archivos CSV grandes sin acumulación de memoria
- **Streams de Lectura**: Para procesar archivos CSV grandes línea por línea
- **Transform Streams**: Para procesamiento y validación de datos
- **Procesamiento por Lotes**: Tamaños de lote configurables para rendimiento óptimo

### Manejo de Errores
- Manejo completo de errores con mensajes detallados
- Seguimiento de progreso con recuperación de interrupciones
- Gestión de errores del sistema de archivos
- Validación de datos con reportes de errores informativos

## 📝 Ejemplo de Salida

### Progreso de Generación
```
🚀 Iniciando generación de 1,000,000 registros...
📁 Archivo de salida: sales.csv
📦 Tamaño del lote: 10,000
📊 Progreso: 10.0% (100,000/1,000,000) - 85,234 registros/seg
📊 Progreso: 20.0% (200,000/1,000,000) - 87,532 registros/seg
...
✅ ¡Generación completada exitosamente!
⏱️  Tiempo total: 11.73 segundos
🚀 Velocidad promedio: 85,248 registros/segundo
📦 Tamaño del archivo: 79.2 MB
```

### Progreso de Procesamiento
```
🔄 Procesando datos de ventas desde: sales.csv
📊 Generando reporte a: sales_report.csv
📈 Procesados 100,000 registros - 92,847 registros/seg
📈 Procesados 200,000 registros - 94,339 registros/seg
...
✅ ¡Generación de reporte completada exitosamente!
⏱️  Tiempo total de procesamiento: 10.84 segundos
🚀 Velocidad promedio de procesamiento: 92,251 registros/segundo
📈 Generados 72 resúmenes mensuales
📦 Tamaño del archivo de reporte: 3.2 KB
```

### Ejemplo de Salida del Reporte
```
year,month,month_name,number_of_orders,max_amount,min_amount,sales_average,standard_deviation
2020,1,January,13842,1799.99,500.01,1149.87,375.42
2020,2,February,12634,1799.85,500.15,1151.23,374.89
2020,3,March,13901,1799.92,500.07,1148.94,376.12
...
```

## 🤝 Contribuciones

1. Hacer fork del repositorio
2. Crear una rama de característica
3. Realizar tus cambios
4. Ejecutar la suite de pruebas
5. Enviar un pull request

## 📄 Licencia

Licencia MIT - siéntete libre de usar este proyecto para cualquier propósito.

## 🐛 Solución de Problemas

### Problemas Comunes

**Errores de Memoria**: 
- Asegúrate de no intentar cargar todo el archivo de una vez
- Reduce el tamaño del lote si experimentas presión de memoria

**Archivo No Encontrado**:
- Asegúrate de que `sales.csv` existe antes de ejecutar el procesador de reportes
- Verifica que las rutas de archivos sean correctas para tu sistema operativo

**Problemas de Rendimiento**:
- Ajusta el tamaño del lote basado en la memoria disponible
- Asegúrate de tener suficiente espacio en disco para operaciones temporales

### Soporte
Para problemas o preguntas, por favor revisa la suite de pruebas para ejemplos de patrones de uso apropiados.

## 🌟 Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Generar datos de ventas (1M registros)
npm run generate-data

# Procesar reporte de ventas
npm run process-report

# Ejecutar todas las pruebas
npm test

# Compilar a JavaScript
npm run build

# Pipeline completo
npm run generate-data && npm run process-report
```

## 📈 Casos de Uso

Este sistema es ideal para:
- **Análisis de Big Data**: Procesar conjuntos de datos que no caben en memoria
- **Reportes Financieros**: Generar resúmenes estadísticos de datos de ventas
- **Testing de Rendimiento**: Crear conjuntos de datos grandes para pruebas
- **Migración de Datos**: Procesar archivos CSV grandes de forma eficiente
- **Análisis Temporal**: Generar reportes agrupados por períodos de tiempo

¡El proyecto está listo para usar y puede escalar para manejar conjuntos de datos mucho más grandes si es necesario!



