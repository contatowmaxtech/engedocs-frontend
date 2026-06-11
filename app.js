// =============================================
// EngeDocs — API Client & State
// =============================================

const API = 'https://engedocs-backend-production.up.railway.app'

// ---------- Auth ----------
function getToken() { return localStorage.getItem('token') }
function getUsuario() {
  try { return JSON.parse(localStorage.getItem('usuario')) } catch { return null }
}
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = 'login.html'
}

// Redireciona se não logado
;(function() {
  if (!getToken()) window.location.href = 'login.html'
})()

// ---------- Fetch helper ----------
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers
    }
  })

  if (res.status === 401) { logout(); return }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.erro || `Erro ${res.status}`)
  return data
}

// ---------- API calls ----------
const Api = {
  // Auth
  perfil: () => api('/api/auth/perfil'),

  // Projetos
  listarProjetos: (params = {}) => api('/api/projetos?' + new URLSearchParams(params)),
  buscarProjeto: id => api(`/api/projetos/${id}`),
  criarProjeto: body => api('/api/projetos', { method: 'POST', body: JSON.stringify(body) }),
  atualizarProjeto: (id, body) => api(`/api/projetos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removerProjeto: id => api(`/api/projetos/${id}`, { method: 'DELETE' }),

  // Documentos
  listarDocumentos: (params = {}) => api('/api/documentos?' + new URLSearchParams(params)),
  downloadDocumento: id => api(`/api/documentos/${id}/download`),
  uploadDocumento: formData => api('/api/documentos', { method: 'POST', body: formData }),
  atualizarDocumento: (id, body) => api(`/api/documentos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removerDocumento: id => api(`/api/documentos/${id}`, { method: 'DELETE' }),

  // Usuários
  listarUsuarios: () => api('/api/usuarios'),
  criarUsuario: body => api('/api/usuarios', { method: 'POST', body: JSON.stringify(body) }),
  atualizarUsuario: (id, body) => api(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removerUsuario: id => api(`/api/usuarios/${id}`, { method: 'DELETE' }),

  // Histórico
  listarHistorico: (params = {}) => api('/api/historico?' + new URLSearchParams(params)),

  // Relatórios
  resumoGeral: () => api('/api/relatorios/resumo'),
  docsPorProjeto: () => api('/api/relatorios/por-projeto'),
  docsPorPeriodo: (inicio, fim) => api(`/api/relatorios/por-periodo?data_inicio=${inicio}&data_fim=${fim}`)
}

// ---------- UI Helpers ----------
function showToast(msg, tipo = 'success') {
  const t = document.getElementById('toast')
  const icon = tipo === 'success' ? 'ti-check' : 'ti-alert-triangle'
  t.innerHTML = `<i class="ti ${icon}"></i> ${msg}`
  t.className = `toast show ${tipo}`
  clearTimeout(window._toastTimer)
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000)
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none'
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatDataHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
}

function badgeStatus(status) {
  const map = {
    ativo: ['green','Ativo'],
    revisao: ['amber','Revisão'],
    concluido: ['blue','Concluído'],
    parado: ['gray','Parado']
  }
  const [cor, label] = map[status] || ['gray', status]
  return `<span class="badge ${cor}">${label}</span>`
}

function badgePerfil(perfil) {
  const map = {
    administrador: ['blue','Administrador'],
    engenheiro: ['green','Engenheiro'],
    visualizador: ['gray','Visualizador']
  }
  const [cor, label] = map[perfil] || ['gray', perfil]
  return `<span class="badge ${cor}">${label}</span>`
}

function fileIcon(tipo) {
  const map = { pdf:'pdf', dwg:'dwg', docx:'docx', xlsx:'xlsx', img:'img' }
  const cls = map[tipo] || 'gray'
  const label = (tipo || '?').toUpperCase().slice(0, 3)
  return `<div class="file-icon ${cls}">${label}</div>`
}

function temPermissao(...perfis) {
  const u = getUsuario()
  return u && perfis.includes(u.perfil)
}

// Confirmar ação destrutiva
function confirmar(msg) {
  return window.confirm(msg)
}
