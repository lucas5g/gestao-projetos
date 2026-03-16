# PRD — GitRadar: Monitoramento Inteligente de Projetos via GitLab

## 1. Visão Geral

O **GitRadar** é uma plataforma que permite monitorar projetos de software a partir de seus repositórios GitLab. O usuário apenas adiciona o link do repositório e o sistema **automaticamente detecta tecnologias, dependências, versões e vulnerabilidades**.

A proposta é **zero fricção**: sem cadastro manual de tecnologias, sem preenchimento de formulários extensos. Cole o link, e o radar faz o resto.

### Proposta de valor

- **Centralização**: Todos os projetos monitorados em um só lugar
- **Automação**: Detecção automática de dependências e versões
- **Segurança**: Alertas proativos sobre vulnerabilidades (CVEs)
- **Visibilidade**: Dashboard com visão geral da saúde tecnológica dos projetos

---

## 2. Problema

Em ambientes corporativos com múltiplos projetos, é comum:

- Não saber quais tecnologias e versões cada projeto utiliza
- Descobrir vulnerabilidades tarde demais
- Não ter visibilidade centralizada sobre o estado das dependências
- Depender de processos manuais para rastrear atualizações

---

## 3. Usuários

| Perfil | Necessidade principal |
|---|---|
| Desenvolvedores | Saber se suas dependências estão atualizadas |
| Tech Leads | Visão geral dos projetos do time |
| Arquitetos de Software | Padronização e governança tecnológica |
| Times de Segurança | Identificar projetos vulneráveis rapidamente |

---

## 4. Fluxo Principal (Simplificado)

```
┌─────────────────────────────────────────────────────────┐
│  1. Usuário cola o link do repositório GitLab           │
│     ex: https://gitlab.empresa.com/time/meu-projeto     │
│                                                         │
│  2. Sistema conecta via GitLab API e extrai:            │
│     • Nome do projeto                                   │
│     • Dependências (package.json, Gemfile, etc.)        │
│     • Versões utilizadas                                │
│                                                         │
│  3. Sistema analisa:                                    │
│     • Compara versões com as mais recentes              │
│     • Consulta bases de CVEs (NVD, OSV, etc.)           │
│                                                         │
│  4. Dashboard exibe:                                    │
│     • Status de cada projeto                            │
│     • Dependências desatualizadas                       │
│     • Alertas de vulnerabilidades                       │
│                                                         │
│  5. Sync manual no MVP e automação em evolução futura   │
│     para manter os dados atualizados                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Funcionalidades

### 5.1 Adicionar Projeto (via link do GitLab)

O usuário informa **apenas o link do repositório GitLab**. O sistema faz o resto.

**Entrada:**
- URL do repositório GitLab (ex: `https://gitlab.empresa.com/grupo/projeto`)
- Token de acesso GitLab (configurado uma vez nas configurações)

**O sistema extrai automaticamente:**
- Nome do projeto
- Identificador do projeto no GitLab

### 5.2 Detecção Automática de Dependências

O sistema analisa os arquivos de dependência do repositório:

| Ecossistema | Arquivo analisado |
|---|---|
| Node.js / Bun | `package.json`, `bun.lockb`, `package-lock.json` |
| Ruby | `Gemfile`, `Gemfile.lock` |
| Python | `requirements.txt`, `Pipfile`, `pyproject.toml` |
| Java | `pom.xml`, `build.gradle` |
| PHP | `composer.json` |
| .NET | `*.csproj`, `packages.config` |
| Go | `go.mod` |
| Rust | `Cargo.toml` |

**Dados extraídos por dependência:**
- Nome do pacote
- Versão utilizada
- Tipo (dependência de produção / desenvolvimento)

### 5.3 Comparação de Versões

Para cada dependência detectada, o sistema consulta a **versão mais recente disponível** nos registries públicos:

| Registry | Ecossistema |
|---|---|
| npmjs.com | Node.js / Bun |
| rubygems.org | Ruby |
| pypi.org | Python |
| mvnrepository.com | Java |
| packagist.org | PHP |

**Classificação do status:**

| Status | Descrição |
|---|---|
| ✅ Atualizado | Versão utilizada é a mais recente |
| ⚠️ Desatualizado | Existe versão mais nova (minor/patch) |
| 🔴 Muito desatualizado | Existe versão major mais nova |
| ☠️ EOL | Versão chegou ao fim de vida (End of Life) |

### 5.4 Monitoramento de Vulnerabilidades (CVEs)

O sistema consulta bases de vulnerabilidades conhecidas para cada dependência:

**Fontes de dados:**
- [OSV.dev](https://osv.dev/) — API aberta e gratuita (prioridade)
- [NVD (National Vulnerability Database)](https://nvd.nist.gov/)
- GitHub Advisory Database

**Dados exibidos por vulnerabilidade:**
- ID (CVE / GHSA)
- Severidade (Critical / High / Medium / Low)
- Descrição resumida
- Versão corrigida (se disponível)
- Link para detalhes

### 5.5 Sincronização

- **Sync manual**: Botão "Re-sincronizar" disponível por projeto no MVP
- **Automação futura**: O processo de sincronização poderá ser executado por agendamento interno ou por um orquestrador como `n8n`
- **Comportamento inicial**: Cada nova sincronização atualiza o estado atual das dependências do projeto, sem manter histórico de execuções

### 5.6 Dashboard

**Visão geral:**
```
┌──────────────────────────────────────────────────┐
│  📊 GitRadar Dashboard                           │
│                                                  │
│  Projetos: 12     Dependências: 187              │
│  Vulneráveis: 3   Desatualizadas: 24             │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  🔴 Projetos com vulnerabilidades críticas  │ │
│  │  • api-pagamentos (3 CVEs críticos)         │ │
│  │  • portal-cliente (1 CVE alto)              │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  ⚠️  Top dependências desatualizadas        │ │
│  │  • lodash 4.17.15 → 4.17.21 (12 projetos)  │ │
│  │  • express 4.17.1 → 4.21.0 (8 projetos)    │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Visão por projeto:**
- Lista de todas as dependências encontradas
- Versões utilizadas por dependência
- Vulnerabilidades encontradas (quando essa etapa estiver ativa)
- Informações básicas do projeto monitorado

### 5.7 Configurações

- **Token GitLab**: Configuração do Personal Access Token ou Group Token
- **Frequência de sync**: Configurável (6h / 12h / 24h / 48h)
- **Notificações**: Configurar alertas por e-mail (futuro)

---

## 6. Modelo de Dados

```
┌─────────────────────┐       ┌──────────────────────┐       ┌──────────────────────────┐
│      Projeto        │       │     Dependencia      │       │  ProjetoDependencia      │
├─────────────────────┤       ├──────────────────────┤       ├──────────────────────────┤
│ id                  │       │ id                    │       │ id                       │
│ gitlab_url          │       │ nome                  │       │ projeto_id (FK)          │
│ gitlab_project_id   │  N:N  │ created_at            │  N:N  │ dependencia_id (FK)      │
│ name                │◀─────▶│ updated_at            │◀─────▶│ versao_utilizada         │
│ created_at          │       └──────────────────────┘       │ tipo (prod/dev)          │
│ updated_at          │                                      │ created_at               │
└─────────────────────┘                                      │ updated_at               │
                                                             └──────────────────────────┘
```

### Estrutura inicial

O modelo do MVP foi simplificado para armazenar apenas o essencial:

- `projects`: identifica o repositório monitorado
- `dependencies`: representa a dependência como entidade compartilhada entre projetos
- `project_dependencies`: representa o uso da dependência dentro de cada projeto, incluindo versão utilizada e tipo

### Relacionamento

- Um `project` pode possuir muitas `dependencies`
- Uma `dependency` pode aparecer em muitos `projects`
- A tabela `project_dependencies` resolve essa relação muitos-para-muitos

### Exemplo conceitual

- O projeto `cesv` usa `nodejs` na versão `20.x`
- O projeto `seguranca` usa `nodejs` na versão `18.x`
- `nodejs` existe uma vez em `dependencies`
- Cada uso fica registrado em `project_dependencies`

### Evolucao futura

Campos e tabelas mais avancados ficam para etapas posteriores, como:

- comparacao com versoes mais recentes
- vulnerabilidades
- historico de sincronizacao
- configuracoes persistidas em banco

---

## 7. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Runtime** | Bun | Performance superior, suporte nativo a TypeScript |
| **Backend** | Elysia | Framework leve e rápido para Bun |
| **Frontend** | React | Ecossistema maduro, componentização |
| **Banco de dados** | PostgreSQL | Robusto, suporte a JSON, queries complexas |
| **Containerização** | Docker / Docker Compose | Padronização de ambiente |
| **Agendamento** | Cron job via Elysia, BullMQ ou n8n | Evolução da automação de sincronização |
| **HTTP Client** | Fetch nativo (Bun) | Chamadas para GitLab API e registries |

---

## 8. Integrações Externas

| Serviço | Uso | Tipo |
|---|---|---|
| **GitLab API v4** | Dados do projeto, arquivos de dependência | REST API |
| **OSV.dev API** | Consulta de vulnerabilidades | REST API (gratuita) |
| **npmjs Registry API** | Versão mais recente (Node/Bun) | REST API |
| **RubyGems API** | Versão mais recente (Ruby) | REST API |
| **PyPI API** | Versão mais recente (Python) | REST API |
| **n8n** | Orquestração futura de sincronizações e alertas | Workflow automation |

> **Nota sobre VPN**: O acesso ao GitLab corporativo requer conexão via VPN. O sistema deve estar na mesma rede ou ter rota de acesso ao GitLab da empresa.

---

## 9. Roadmap

### MVP (v1.0) — Foco: funcionar de ponta a ponta

- ✅ Adicionar projeto via link do GitLab
- ✅ Extrair dependências automaticamente (`package.json` como prioridade)
- ✅ Listar dependências e versões utilizadas
- ✅ Relacionar projetos e dependências em modelo muitos-para-muitos
- ✅ Dashboard simples com lista de projetos e dependências
- ✅ Sync manual (botão re-sincronizar)
- ✅ Configuração de token GitLab

### v1.1 — Comparação de versões

- ⬜ Consultar versão mais recente nos registries
- ⬜ Classificar status (atualizado / desatualizado / EOL)
- ⬜ Indicadores visuais no dashboard

### v1.2 — Vulnerabilidades

- ⬜ Integração com OSV.dev para consulta de CVEs
- ⬜ Exibir vulnerabilidades por dependência
- ⬜ Alertas visuais no dashboard (severidade)

### v1.3 — Automação

- ⬜ Sync automático periódico (cron configurável)
- ⬜ Orquestração opcional via `n8n`
- ⬜ Suporte a múltiplos ecossistemas (Ruby, Python, Java, etc.)

### v2.0 — Evolução

- ⬜ Notificações por e-mail
- ⬜ Relatórios exportáveis (PDF/CSV)
- ⬜ Security Radar: score de risco por projeto
- ⬜ Integração com CI/CD para bloquear deploys vulneráveis
- ⬜ Suporte a GitHub (além do GitLab)
- ⬜ Multi-usuário com autenticação

---

## 10. Observações Técnicas

### GitLab API — Endpoints principais

```
# Dados do projeto
GET /api/v4/projects/:id

# Árvore de arquivos (para encontrar package.json, etc.)
GET /api/v4/projects/:id/repository/tree

# Conteúdo de um arquivo
GET /api/v4/projects/:id/repository/files/:file_path/raw

# Linguagens detectadas
GET /api/v4/projects/:id/languages
```

### OSV.dev API — Consulta de vulnerabilidades

```json
POST https://api.osv.dev/v1/query
{
  "package": {
    "name": "lodash",
    "ecosystem": "npm"
  },
  "version": "4.17.15"
}
```

---

> 💡 **Filosofia do projeto**: Simplicidade acima de tudo. O usuário cola um link e ganha visibilidade total sobre o projeto. Quanto menos cliques, melhor.
