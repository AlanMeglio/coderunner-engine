"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [code, setCode] = useState('import time\nprint("Iniciando proceso complejo...")\ntime.sleep(2)\nprint("¡Calculo finalizado con éxito!")');
  const [output, setOutput] = useState("// El resultado aparecerá aquí...");
  const [status, setStatus] = useState("IDLE"); // IDLE, RUNNING, COMPLETED, ERROR

  // Función para preguntar al servidor si ya terminó
  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?id=${id}`);
        const data = await res.json();

        if (data.state === "completed") {
          // ¡TERMINÓ!
          clearInterval(interval);
          setStatus("COMPLETED");
          // Parseamos el resultado que viene del worker
          const resultObj = data.result; 
          // Recuerda que el worker devuelve { output, isError, executionTimeMs }
          setOutput(resultObj.output || "Sin salida");
        } else if (data.state === "failed") {
          clearInterval(interval);
          setStatus("ERROR");
          setOutput(`❌ Falló: ${data.failedReason}`);
        } else {
          // Sigue procesando...
          setStatus("RUNNING");
          setOutput(`⏳ Estado: ${data.state}...`);
        }
      } catch (err) {
        clearInterval(interval);
        setStatus("ERROR");
      }
    }, 1000); // Preguntar cada 1 segundo
  };

  const runCode = async () => {
    setStatus("RUNNING");
    setOutput("🚀 Enviando a la cola...");
    
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(`✅ Encolado (ID: ${data.jobId}). Esperando Worker...`);
        // Iniciar el polling
        pollStatus(data.jobId);
      } else {
        setStatus("ERROR");
        setOutput(`❌ Error al enviar: ${data.error}`);
      }
    } catch (error) {
      setStatus("ERROR");
      setOutput("❌ Error de conexión.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0d1117] text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#161b22]">
        <h1 className="font-mono font-bold text-xl text-blue-400">
          CODERUNNER<span className="text-white">_ENGINE</span>
        </h1>
        <button
          onClick={runCode}
          disabled={status === "RUNNING"}
          className={`px-6 py-2 font-bold rounded flex items-center gap-2 transition-all ${
            status === "RUNNING"
              ? "bg-yellow-600 cursor-wait"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {status === "RUNNING" ? "⏳ EJECUTANDO..." : "▶ RUN CODE"}
        </button>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        <div className="w-1/2 border-r border-gray-800">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
          />
        </div>
        <div className="w-1/2 bg-[#0d1117] p-4 font-mono text-sm overflow-auto">
          <pre className={`${status === "ERROR" ? "text-red-400" : "text-green-400"}`}>
            {output}
          </pre>
        </div>
      </div>
    </main>
  );
}