# 🏆 Copa do Mundo - 2026

Aplicativo web completo para acompanhar a Copa do Mundo FIFA 2026. Combine classificações em tempo real, simulador de chaveamento, bolão personalizado com amigos e sua própria seleção virtual.

---

## 📸 Visão Geral

| Feature                   | Descrição                                                   |
| ------------------------- | ----------------------------------------------------------- |
| 📅 **Calendário**         | Todos os jogos com data, hora, estádio e placar ao vivo     |
| 📊 **Classificação**      | Tabela de grupos atualizada automaticamente                 |
| 🏟️ **Chaveamento**        | Bracket interativo das fases eliminatórias                  |
| 🎯 **Bolão**              | Ligas privadas com palpites, ranking e comentários por jogo |
| 🏆 **Palpite no Campeão** | Apostas no campeão com bônus de 30 pontos                   |
| 👕 **Seleção Virtual**    | Crie seu time com uniforme, escudo, formação e jogador      |
| 🔴 **Ao Vivo**            | Placar em tempo real durante os jogos                       |

---

## 🛠️ Stack Técnica

| Camada         | Tecnologia                                                          |
| -------------- | ------------------------------------------------------------------- |
| Frontend       | React 19 + TypeScript + Vite                                        |
| UI             | Tailwind CSS 4 + shadcn/ui + Radix UI                               |
| Roteamento     | React Router v7                                                     |
| Backend / Auth | Firebase (Firestore + Authentication)                               |
| API de futebol | [football-data.org](https://www.football-data.org) (plano gratuito) |
| Cloud Function | Firebase Functions v2 (Node.js 22)                                  |
| Cache          | Firestore como camada de cache intermediária                        |

---

## 📁 Estrutura do Projeto

```
copadomundo/
├── src/
│   ├── app/                    # Providers e router
│   ├── core/
│   │   ├── api/
│   │   │   ├── adapter.ts          # Roteador: real vs mock
│   │   │   ├── types.ts            # Tipos globais (Match, Standing, etc.)
│   │   │   ├── football-data/      # Adapter para football-data.org
│   │   │   ├── firestore-cache/    # Hook genérico de leitura do cache Firestore
│   │   │   └── mock/               # Dados estáticos do sorteio (fallback)
│   │   └── firebase/               # Config e autenticação
│   ├── features/
│   │   ├── auth/               # Login com Google
│   │   ├── bracket/            # Chaveamento eliminatório
│   │   ├── calendar/           # Calendário de jogos
│   │   ├── custom-team/        # Criador de seleção virtual
│   │   ├── pool/               # Bolão (ligas, palpites, ranking)
│   │   ├── simulator/          # Simulador de grupos e bracket
│   │   └── standings/          # Tabela de grupos
│   └── shared/                 # Componentes e layouts reutilizáveis
├── functions/                  # Cloud Function (sincroniza API → Firestore)
│   ├── src/
│   │   └── index.ts            # syncFootballData — roda a cada 1 minuto
│   ├── package.json
│   └── tsconfig.json
├── firebase.json
├── firestore.rules
└── .env                        # Tokens (nunca commitar)
```

---

## ⚙️ Configuração Local

### 1. Variáveis de ambiente

Crie um `.env` na raiz:

```env
# football-data.org — cadastro gratuito em https://www.football-data.org/client/register
VITE_FOOTBALL_DATA_TOKEN=sua_chave_aqui

# Firebase — copie do Console: console.firebase.google.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

E um `functions/.env` para a Cloud Function:

```env
FOOTBALL_DATA_TOKEN=sua_chave_aqui
```

### 2. Instalar dependências

```bash
# Frontend
npm install

# Cloud Functions
cd functions && npm install && cd ..
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

> Em desenvolvimento, o app usa o `VITE_FOOTBALL_DATA_TOKEN` para chamar a API diretamente do navegador via proxy Vite (configurado em `vite.config.ts`). Quando o cache do Firestore ainda não foi populado, o fallback direto à API entra automaticamente.

---

## 🔴 Como funciona o placar ao vivo

O app usa uma **arquitetura de cache via Firestore** para garantir dados atualizados sem estourar o limite da API gratuita (10 chamadas/minuto):

```
football-data.org API
        │
        ▼  (1 vez por minuto — Cloud Function)
  Firestore cache
  └── cache/matches
  └── cache/standings
  └── cache/bracket
        │
        ▼  (onSnapshot — tempo real)
  Todos os usuários
```

**Por quê isso é importante?**

Sem o cache, cada usuário que abre o app faria suas próprias chamadas à API. Com 3 usuários simultâneos fazendo 3 chamadas cada = 9 calls/min, quase no limite. Com o cache:

- A Cloud Function faz **3 calls/min fixas**, independente de quantos usuários estão online
- Quando a função atualiza o Firestore, **todos os navegadores conectados recebem os dados instantaneamente** via `onSnapshot` (sem polling, sem refresh)
- O badge `🔴 AO VIVO` aparece automaticamente quando um jogo está em andamento

**Durante jogos ao vivo** o placar é exibido em vermelho no card do jogo, com o badge pulsante no topo.

> **Nota:** O plano gratuito da football-data.org entrega scores com pequeno delay (não é tempo real instantâneo). Isso é uma limitação da API, não do app.

---

## ☁️ Deploy da Cloud Function

### Pré-requisitos

A Cloud Function precisa fazer chamadas HTTP externas (para a football-data.org), o que **requer o plano Blaze do Firebase**. O plano Blaze tem uma camada gratuita equivalente ao plano Spark — dentro dos limites abaixo, não há cobrança:

| Recurso                  | Gratuito no Blaze/mês |
| ------------------------ | --------------------- |
| Invocações de função     | 2.000.000             |
| Nossa função (1/min)     | ~43.200               |
| Networking de saída      | 5 GB                  |
| Nossa função (3 KB/call) | < 5 MB                |

**→ Custo real esperado: R$ 0,00**

### Passo a passo

**1. Fazer upgrade para Blaze**

Acesse o [Console Firebase do projeto](https://console.firebase.google.com/project/copadomundo-2026/usage/details) → clique em "Fazer upgrade" → associe um cartão de crédito.

**2. Corrigir permissão do Cloud Build** _(necessário uma única vez em projetos novos)_

```bash
gcloud projects add-iam-policy-binding copadomundo-2026 \
  --member="serviceAccount:SEU_PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"
```

Ou via Console: [console.cloud.google.com/iam-admin/iam?project=copadomundo-2026](https://console.cloud.google.com/iam-admin/iam?project=copadomundo-2026) → Conceder acesso → conta `SEU_PROJECT_NUMBER@cloudbuild.gserviceaccount.com` → papel **Cloud Build Service Account**.

> Seu `PROJECT_NUMBER` está no `.env`: é o número em `VITE_FIREBASE_MESSAGING_SENDER_ID`.

**3. Build e deploy**

```bash
# Compilar a Cloud Function
cd functions
npm run build
cd ..

# Deploy: functions + regras do Firestore
firebase deploy --only functions,firestore:rules
```

**4. Verificar**

- **Logs da função:** [console.firebase.google.com → Functions → Logs](https://console.firebase.google.com/project/copadomundo-2026/functions/logs)
- **Dados no Firestore:** [console.firebase.google.com → Firestore → Dados → cache](https://console.firebase.google.com/project/copadomundo-2026/firestore/data/cache)

A partir do deploy, o documento `cache/matches` é atualizado a cada minuto e você pode ver os logs `[sync] matches: 104 | live: false` a cada execução.

---

## 🎯 O Bolão

### Como funciona

Cada usuário pode criar ou entrar em ligas privadas com um **código de convite**. Dentro de cada liga:

- **Palpites por jogo** — placar exato antes do jogo começar (trava 10 min antes)
- **Comentário por jogo** — 1 linha de texto que aparece junto com o palpite
- **Palpite no Campeão** — qual seleção vai ganhar o torneio (bônus de 30 pts)
- **Ranking em tempo real** — classificação atualizada conforme os jogos terminam
- **Streak counter** — 🔥 sequência de palpites certos consecutivos
- **Head-to-Head** — comparativo direto de palpites entre dois participantes
- **Exportar ranking** — gera imagem PNG para compartilhar

### Sistema de pontuação (configurável pelo admin da liga)

| Acerto                | Padrão |
| --------------------- | ------ |
| 🎯 Placar exato       | 5 pts  |
| ✅ Acertou o vencedor | 3 pts  |
| 🤝 Acertou o empate   | 1 pt   |
| 🏆 Campeão correto    | 30 pts |

### Escopo de jogos

O admin pode configurar quais jogos fazem parte da liga:

- **Todos** — todos os 104 jogos da Copa
- **Por seleção** — apenas jogos de uma ou mais seleções específicas
- **Personalizado** — o admin escolhe jogo a jogo

---

## 👕 Seleção Virtual

Cada participante pode criar sua própria "seleção" com:

- **Identidade** — nome do clube, sigla de 3 letras, time real favorito
- **Escudo** — forma, padrão, cores primária/secundária, estrelas
- **Uniforme** — padrão, gola, cores, número e nome nas costas
- **Tática** — formação (4-3-3, 3-5-2, etc.) com diagrama visual
- **Favoritas** — times reais preferidos para seguir no calendário

A seleção aparece no perfil do participante dentro do bolão.

---

## 🔒 Regras de Segurança (Firestore)

| Coleção                          | Leitura              | Escrita                           |
| -------------------------------- | -------------------- | --------------------------------- |
| `cache/*`                        | Pública              | Apenas Cloud Function (Admin SDK) |
| `leagues/*`                      | Membros autenticados | Dono da liga                      |
| `leagues/*/predictions`          | Membros              | Próprio usuário                   |
| `leagues/*/champion_predictions` | Membros              | Próprio usuário                   |
| `customTeams/*`                  | Autenticados         | Próprio dono                      |
| `users/*`                        | Próprio usuário      | Próprio usuário                   |

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Type check
npx tsc --noEmit

# Cloud Function — build
cd functions && npm run build

# Deploy completo
firebase deploy --only functions,firestore:rules
```

---

## 📡 API football-data.org

### Plano gratuito

- **10 chamadas por minuto** por chave de API (total, não por usuário)
- Placares com pequeno delay (não instantâneos)
- Acesso a fixtures, tabelas e fase eliminatória
- Cadastro gratuito em: [football-data.org/client/register](https://www.football-data.org/client/register)

### Endpoints usados

| Endpoint                                      | Cache             | Frequência   |
| --------------------------------------------- | ----------------- | ------------ |
| `GET /competitions/WC/matches`                | `cache/matches`   | A cada 1 min |
| `GET /competitions/WC/standings`              | `cache/standings` | A cada 1 min |
| `GET /competitions/WC/matches?stage=KNOCKOUT` | `cache/bracket`   | A cada 1 min |

### O que é "1 call"?

Cada requisição HTTP ao servidor da football-data.org conta como 1 call. O limite de 10/min é **por chave de API**, somando todos os usuários e processos que usam a mesma chave. Por isso o cache via Cloud Function é essencial em produção: 3 calls/min fixas, independente da audiência.

---

## 🚀 Proxy de desenvolvimento

Para evitar erros de CORS ao chamar a API em desenvolvimento, o Vite redireciona `/fd-api` para `https://api.football-data.org`. Isso está configurado em `vite.config.ts` e funciona automaticamente com `npm run dev`. Em produção (Firebase Hosting), as chamadas vêm apenas da Cloud Function — o browser nunca acessa a API diretamente.

---

---

## 🌐 Deploy

**Produção:** [copadomundo-2026.vercel.app](https://copadomundo-2026.vercel.app)

---

## 👨‍💻 Autor

**VM CODES** — Victor Emanuel  
[github.com/VictorEmanuel08](https://github.com/VictorEmanuel08)

_Projeto desenvolvido para a Copa do Mundo FIFA 2026 🌍_
