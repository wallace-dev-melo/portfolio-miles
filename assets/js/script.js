/*
  PORTFÓLIO DEV - ETEPD | script.js
  Desenvolvedor: Wallace Michael
  Descrição: Script principal para funcionalidades do portfólio.

  Funcionalidades:
  
  1. initTema()        — dark/light com localStorage
  2. initNavbar()      — scroll + link ativo
  3. initMenuMobile()  — hambúrguer
  4. initReveal()      — fade ao entrar na tela
  5. initAnoAtual()    — ano no footer
  6. initProjetos()    — carrega JSON, filtra, busca
  7. initFormContato() — validação do formulário
*/

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  initTema();
  initNavbar();
  initMenuMobile();
  initReveal();
  initAnoAtual();

  if (document.getElementById("grid-projetos")) initProjetos();
  if (document.getElementById("form-contato")) initFormContato();
});

/* ════════════════════════════════════════
   1. TEMA — dark / light 
════════════════════════════════════════ */
function initTema() {
  var btn = document.getElementById("theme-btn");
  var html = document.documentElement;

  var temaSalvo = localStorage.getItem("tema") || "dark";

  if (temaSalvo === "light") {
    html.classList.add("light");
  } else {
    html.classList.remove("light");
  }

  if (!btn) return;

  btn.addEventListener("click", function () {
    html.classList.toggle("light");
    var isLight = html.classList.contains("light");
    localStorage.setItem("tema", isLight ? "light" : "dark");

    btn.setAttribute(
      "aria-label",
      isLight ? "Mudar para modo escuro" : "Mudar para modo claro",
    );
  });
}

/* ════════════════════════════════════════
   2. NAVBAR — sombra ao rolar + link ativo
════════════════════════════════════════ */
function initNavbar() {
  var navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener(
    "scroll",
    function () {
      navbar.classList.toggle("rolada", window.scrollY > 20);
    },
    { passive: true },
  );

  // Ativa o link da página atual
  var pagina = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === pagina || (pagina === "" && href === "index.html")) {
      link.classList.add("ativo");
    }
  });
}

/* ════════════════════════════════════════
   3. MENU MOBILE
════════════════════════════════════════ */
function initMenuMobile() {
  var btn = document.getElementById("btn-menu");
  var mobile = document.getElementById("nav-mobile");
  if (!btn || !mobile) return;

  btn.addEventListener("click", function () {
    var aberto = mobile.classList.toggle("aberto");
    btn.textContent = aberto ? "✕" : "☰";
    document.body.style.overflow = aberto ? "hidden" : "";
  });

  mobile.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      mobile.classList.remove("aberto");
      btn.textContent = "☰";
      document.body.style.overflow = "";
    });
  });
}

/* ════════════════════════════════════════
   4. SCROLL REVEAL
   Adiciona .visivel quando o elemento entra na tela.
════════════════════════════════════════ */
function initReveal() {
  var els = document.querySelectorAll(".revelar");
  if (!els.length) return;

  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
  );

  els.forEach(function (el) {
    obs.observe(el);
  });
}

/* ════════════════════════════════════════
   5. ANO NO FOOTER
════════════════════════════════════════ */
function initAnoAtual() {
  var el = document.getElementById("ano-atual");
  if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════════════
   6. PROJETOS — fetch + filtro + busca
════════════════════════════════════════ */
var todosProjetos = [];

async function initProjetos() {
  var grid = document.getElementById("grid-projetos");
  if (!grid) return;

  try {
    var res = await fetch("data/projects.json");
    var data = await res.json();
    todosProjetos = data.projetos;

    var path = window.location.pathname;
    var isHome =
      path.endsWith("/") || path.endsWith("index.html");

    montarFiltros(todosProjetos);
    renderizarProjetos(isHome ? todosProjetos.slice(0, 3) : todosProjetos);
    initBusca();
  } catch (e) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 0">Erro ao carregar <code>data/projects.json</code>.</p>';
    console.error(e);
  }
}

function montarFiltros(projetos) {
  var cont = document.getElementById("filtros");
  if (!cont) return;

  var techs = [];
  projetos.forEach(function (p) {
    p.techs.forEach(function (t) {
      if (!techs.includes(t)) techs.push(t);
    });
  });
  techs.sort();

  cont.innerHTML =
    '<button class="filtro-btn ativo" data-f="todos">Todos</button>' +
    techs
      .map(function (t) {
        return (
          '<button class="filtro-btn" data-f="' + t + '">' + t + "</button>"
        );
      })
      .join("");

  cont.addEventListener("click", function (e) {
    var btn = e.target.closest(".filtro-btn");
    if (!btn) return;
    cont.querySelectorAll(".filtro-btn").forEach(function (b) {
      b.classList.remove("ativo");
    });
    btn.classList.add("ativo");
    var f = btn.getAttribute("data-f");
    renderizarProjetos(
      f === "todos"
        ? todosProjetos
        : todosProjetos.filter(function (p) {
            return p.techs.includes(f);
          }),
    );
  });
}

function initBusca() {
  var input = document.getElementById("campo-busca");
  if (!input) return;
  input.addEventListener("input", function () {
    var q = input.value.toLowerCase().trim();
    if (!q) {
      renderizarProjetos(todosProjetos);
      return;
    }
    renderizarProjetos(
      todosProjetos.filter(function (p) {
        return (
          p.titulo.toLowerCase().includes(q) ||
          p.descricao.toLowerCase().includes(q) ||
          p.techs.some(function (t) {
            return t.toLowerCase().includes(q);
          })
        );
      }),
    );
    document.querySelectorAll(".filtro-btn").forEach(function (b) {
      b.classList.remove("ativo");
    });
  });
}

function renderizarProjetos(projetos) {
  var grid = document.getElementById("grid-projetos");
  var total = document.getElementById("total-projetos");
  if (!grid) return;
  if (total) total.textContent = projetos.length;

  if (!projetos.length) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 0">Nenhum projeto encontrado.</p>';
    return;
  }

  grid.innerHTML = projetos
    .map(function (p, i) {
      var classBadge =
        p.status === "Concluído"
          ? "badge-verde"
          : p.status === "Em desenvolvimento"
            ? "badge-amarelo"
            : "badge-cinza";
      return `
      <article class="card revelar d${(i % 3) + 1}">
        <div class="card-thumb">${p.emoji || "💻"}</div>
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="badge ${classBadge}">${p.status}</span>
            <span style="font-family:var(--mono);font-size:.68rem;color:var(--text-muted)">${p.ano}</span>
          </div>
          <h3 class="card-titulo">${p.titulo}</h3>
          <p class="card-desc">${p.descricao}</p>
          <div class="tags">
            ${p.techs
              .map(function (t) {
                return '<span class="tag">' + t + "</span>";
              })
              .join("")}
          </div>
          <div class="card-footer">
            <div style="display:flex;gap:.5rem">
              ${p.github ? '<a href="' + p.github + '" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">GitHub ↗</a>' : ""}
              ${p.demo ? '<a href="' + p.demo + '" target="_blank" rel="noopener" class="btn btn-prim btn-sm">Demo ↗</a>' : ""}
            </div>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  initReveal();
}

/* ════════════════════════════════════════
   7. FORMULÁRIO DE CONTATO
════════════════════════════════════════ */
function initFormContato() {
  var form = document.getElementById("form-contato");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    var nome = document.getElementById("nome").value.trim();
    var email = document.getElementById("email").value.trim();
    var assunto = document.getElementById("assunto").value.trim();
    var mensagem = document.getElementById("mensagem").value.trim();

    limparErros();
    var ok = true;

    if (!nome || nome.length < 2) {
      errar("nome", "Informe seu nome.");
      ok = false;
    }
    if (!email || !okEmail(email)) {
      errar("email", "E-mail inválido.");
      ok = false;
    }
    if (!assunto) {
      errar("assunto", "Informe o assunto.");
      ok = false;
    }
    if (!mensagem || mensagem.length < 10) {
      errar("mensagem", "Mensagem muito curta.");
      ok = false;
    }

    if (!ok) return;

    var btn = form.querySelector('[type="submit"]');
    var ok_div = document.getElementById("form-ok");

    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
      await emailjs.send("service_z34vhb8", "template_pwirusg", { // Troque pelo seu service ID e template ID do EmailJS
        nome: nome,
        email: email,
        assunto: assunto,
        mensagem: mensagem,
        time: new Date().toLocaleString(),
        reply_to: email,
      });

      form.reset();
      limparErros();

      if (ok_div) {
        ok_div.style.display = "block";

        setTimeout(function () {
          ok_div.style.display = "none";
        }, 5000);
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar mensagem";
    }
  });

  // Limpa erro ao digitar
  form.querySelectorAll(".campo-input").forEach(function (c) {
    c.addEventListener("input", function () {
      c.classList.remove("erro");
      var e = document.getElementById("erro-" + c.id);
      if (e) e.textContent = "";
    });
  });
}

function errar(id, msg) {
  var c = document.getElementById(id);
  var e = document.getElementById("erro-" + id);

  if (c) c.classList.add("erro");
  if (e) e.textContent = msg;
}

function limparErros() {
  document.querySelectorAll(".campo-input").forEach(function (c) {
    c.classList.remove("erro");
  });

  document.querySelectorAll(".campo-erro").forEach(function (e) {
    e.textContent = "";
  });
}

function okEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
