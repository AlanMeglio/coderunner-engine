# 🏗️ MASTER PLAN: CodeRunner Engine (Mini-LeetCode)

> **ARCHIVO DE CONTROL DE PROYECTO**
> ESTE DOCUMENTO DEBE SER LEÍDO POR CUALQUIER AGENTE DE IA (COPILOT, CHATGPT, ETC) ANTES DE GENERAR CÓDIGO.
> CONTIENE EL CONTEXTO, REGLAS Y ESTADO ACTUAL DEL DESARROLLO.

---

## 🧠 1. CONTEXTO DEL SISTEMA
Estamos construyendo una **Plataforma de Ejecución de Código Remota** (similar al motor de LeetCode).
El sistema permite a usuarios enviar código (Python/JS) desde un frontend, encolar la petición, y ejecutarla de forma segura en contenedores Docker efímeros y aislados.

### 🏛️ Arquitectura de Microservicios
1.  **API Orchestrator (Next.js API Routes):** Recibe request, valida y envía trabajo a Redis.
2.  **Message Queue (BullMQ + Redis):** Buffer para manejar picos de tráfico.
3.  **Execution Workers (Node.js):** Consumen trabajos, levantan Docker, ejecutan y devuelven resultados.
4.  **Frontend (Next.js + Monaco Editor):** Interfaz de usuario en tiempo real.

---

## 📏 2. REGLAS DE ORO (AI GUIDELINES)
Cualquier código generado debe cumplir estrictamente:

1.  **STRICT TYPESCRIPT:** Prohibido usar `any`. Definir interfaces para todo (Payloads, Respuestas, Errores).
2.  **MODULARIDAD:** Un archivo, una responsabilidad. No crear "God Files" de 500 líneas.
3.  **NO BORRAR CÓDIGO FUNCIONAL:** Antes de refactorizar, verifica si rompes la POC actual (`src/execute.ts`).
4.  **SEGURIDAD PRIMERO:**
    * Nunca ejecutar código de usuario con `eval()`.
    * Siempre usar `NetworkMode: 'none'` en Docker.
    * Siempre imponer límites de memoria y CPU.
5.  **LIBRERÍAS:**
    * Docker: `dockerode` (IMPORTANTE: usar `import Docker = require('dockerode')`).
    * Colas: `bullmq`.
    * Validación: `zod`.

---

## 🛠️ 3. TECH STACK OFICIAL
* **Lenguaje:** TypeScript (Node.js 18+).
* **Container Engine:** Docker Desktop / Docker Engine.
* **Queue:** Redis (Imagen `redis:alpine`).
* **Frontend:** Next.js 14 (App Router).

---

## 📋 4. CHECKLIST DE PROGRESO (Bitácora)
*Marca con [x] lo completado. Agentes de IA: Revisar esto para saber dónde continuar.*

### 🟢 FASE 1: PROTOTIPO DEL MOTOR (CORE)
- [x] Configuración de entorno (TypeScript, Dockerode).
- [x] **POC 1:** Conexión exitosa con Docker Daemon.
- [x] **POC 2:** Ejecución de código Python aislado (`src/execute.ts`).
- [x] Captura de Logs (stdout) desde el contenedor.
- [x] Refactorización a Clase `Executor` robusta con Try/Finally.

### 🟡 FASE 2: SISTEMA DE COLAS (BACKEND)
- [x] Levantar Redis localmente (Docker).
- [x] Configurar `BullMQ` en el proyecto.
- [x] Crear `src/workers/CodeWorker.ts`: Lógica de procesamiento asíncrona.
- [x] Crear `src/producer.ts`: Script para pruebas de carga.
- [x] Test: Encolar trabajos y verificar ejecución en Docker.

### 🔴 FASE 3: API Y FRONTEND (NEXT.JS)
- [ ] Inicializar Next.js en carpeta `/web`.
- [ ] Instalar dependencias (`bullmq`, `ioredis`) en el frontend.
- [ ] Crear API Route `POST /api/execute` que llame al Producer.
- [ ] Integrar Monaco Editor en el frontend.
- [ ] Mostrar resultados en tiempo real (Polling o WebSockets).

---

## 📂 5. ESTRUCTURA DE ARCHIVOS (Target)
/coderunner-engine
├── src/
│   ├── config/         
│   ├── lib/            # Executor.ts (Lógica Docker)
│   ├── workers/        # CodeWorker.ts (Consumidor BullMQ)
│   ├── producer.ts     # Script de prueba
│   └── index.ts        # Entry point
├── web/                # NUEVO: Frontend Next.js
├── CONSTRUCCION.md     # ESTE ARCHIVO
├── package.json
└── tsconfig.json

---

## 📝 NOTAS DE SESIÓN
* **11/01/2026 (Fase 1):** Motor de ejecución (Executor) funcional y estable.
* **11/01/2026 (Fase 2):** Sistema de Colas implementado con éxito. El Worker consume trabajos de Redis y los ejecuta en Docker correctamente.
* **Próximo paso:** Construir la interfaz web en Fase 3.