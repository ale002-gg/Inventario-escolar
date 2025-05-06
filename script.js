const usuarios = {
  admin: { clave: "1234", rol: "admin" },
  usuario: { clave: "abcd", rol: "user" }
};
let usuarioActual = null;
let registros = JSON.parse(localStorage.getItem("registros") || "[]");
let historial = JSON.parse(localStorage.getItem("historial") || "[]");
let modoOscuro = false;

function iniciarSesion() {
  const user = document.getElementById("usuario").value;
  const pass = document.getElementById("clave").value;
  if (usuarios[user] && usuarios[user].clave === pass) {
    usuarioActual = { nombre: user, rol: usuarios[user].rol };
    document.getElementById("login-panel").style.display = "none";
    document.getElementById("app").style.display = "block";
    mostrarRegistros();
    mostrarEstadisticas();
    mostrarHistorial();
  } else {
    alert("Credenciales incorrectas.");
  }
}

function agregarRegistro() {
  const nuevo = {
    origen: document.getElementById("origen").value,
    serie: document.getElementById("serie").value,
    fecha: document.getElementById("fecha").value,
    factura: document.getElementById("factura").value,
    costo: document.getElementById("costo").value,
    inventario: document.getElementById("inventario").value,
    seccion: document.getElementById("seccion").value,
    imagen: "",
    id: Date.now()
  };

  const file = document.getElementById("imagen").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      nuevo.imagen = reader.result;
      guardarYRefrescar(nuevo);
    };
    reader.readAsDataURL(file);
  } else {
    guardarYRefrescar(nuevo);
  }
}

function guardarYRefrescar(registro) {
  registros.push(registro);
  historial.push({ accion: "Agregar", registro, por: usuarioActual.nombre, fecha: new Date().toLocaleString() });
  localStorage.setItem("registros", JSON.stringify(registros));
  localStorage.setItem("historial", JSON.stringify(historial));
  mostrarRegistros();
  mostrarEstadisticas();
  mostrarHistorial();
}

function mostrarRegistros(lista = registros) {
  const ul = document.getElementById("lista-registros");
  ul.innerHTML = "";
  lista.forEach((r) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${r.imagen ? `<img class="preview" src="${r.imagen}">` : ""}
      <b>${r.inventario}</b> | ${r.origen} | ${r.seccion} | $${r.costo}
      <button onclick="editarRegistro(${r.id})">✏️</button>
      ${usuarioActual.rol === "admin" ? `<button onclick="eliminarRegistro(${r.id})">❌</button>` : ""}
    `;
    ul.appendChild(li);
  });
}

function editarRegistro(id) {
  const r = registros.find(reg => reg.id === id);
  if (!r) return;
  document.getElementById("origen").value = r.origen;
  document.getElementById("serie").value = r.serie;
  document.getElementById("fecha").value = r.fecha;
  document.getElementById("factura").value = r.factura;
  document.getElementById("costo").value = r.costo;
  document.getElementById("inventario").value = r.inventario;
  document.getElementById("seccion").value = r.seccion;
  eliminarRegistro(id, false);
}

function eliminarRegistro(id, registrar = true) {
  const r = registros.find(r => r.id === id);
  registros = registros.filter(r => r.id !== id);
  if (registrar) {
    historial.push({ accion: "Eliminar", registro: r, por: usuarioActual.nombre, fecha: new Date().toLocaleString() });
    localStorage.setItem("historial", JSON.stringify(historial));
  }
  localStorage.setItem("registros", JSON.stringify(registros));
  mostrarRegistros();
  mostrarEstadisticas();
  mostrarHistorial();
}

function filtrarRegistros() {
  const texto = document.getElementById("buscar").value.toLowerCase();
  const filtrados = registros.filter(r => Object.values(r).some(val => String(val).toLowerCase().includes(texto)));
  mostrarRegistros(filtrados);
}

function exportarJSON() {
  const blob = new Blob([JSON.stringify(registros)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario.json";
  a.click();
}

function importarJSON(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    registros = JSON.parse(reader.result);
    localStorage.setItem("registros", JSON.stringify(registros));
    mostrarRegistros();
    mostrarEstadisticas();
  };
  reader.readAsText(file);
}

function exportarPDF() {
  const elemento = document.getElementById("lista");
  const opt = { margin: 0.5, filename: 'inventario.pdf', html2canvas: {}, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }};
  html2pdf().set(opt).from(elemento).save();
}

function mostrarEstadisticas() {
  const total = registros.length;
  const totalValor = registros.reduce((s, r) => s + Number(r.costo || 0), 0);
  const porSeccion = {};
  registros.forEach(r => {
    porSeccion[r.seccion] = (porSeccion[r.seccion] || 0) + 1;
  });
  let html = `<p>Total artículos: ${total} | Valor total: $${totalValor.toFixed(2)}</p>`;
  for (let s in porSeccion) html += `<p>${s}: ${porSeccion[s]} artículos</p>`;
  document.getElementById("estadisticas-contenido").innerHTML = html;
}

function mostrarHistorial() {
  const ul = document.getElementById("lista-historial");
  ul.innerHTML = "";
  historial.slice().reverse().forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.fecha} | ${h.accion} por ${h.por}: ${h.registro.inventario}`;
    ul.appendChild(li);
  });
}

function cambiarTema() {
  modoOscuro = !modoOscuro;
  document.documentElement.classList.toggle("dark", modoOscuro);
}

function cerrarSesion() {
  location.reload();
}

function mostrarTab(id) {
  document.querySelectorAll(".tab").forEach(div => div.style.display = "none");
  document.getElementById(id).style.display = "block";
}

document.getElementById("fecha").value = new Date().toISOString().split("T")[0];
