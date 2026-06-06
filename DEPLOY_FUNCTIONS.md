# Deploy da Cloud Function

## Pré-requisitos

1. **Fazer upgrade para Firebase Blaze** (necessário para chamadas externas):
   - Acesse https://console.firebase.google.com/project/copadomundo-2026/usage/details
   - Clique em "Fazer upgrade" e associe um cartão de crédito
   - Dentro dos limites gratuitos (2M invocações/mês), não há cobrança

2. **Instalar Firebase CLI** (se não tiver):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

## Deploy

```bash
# 1. Compilar a Cloud Function
cd functions
npm run build
cd ..

# 2. Fazer deploy apenas das functions
firebase deploy --only functions

# 3. (Opcional) Deploy completo: functions + regras do Firestore
firebase deploy --only functions,firestore:rules
```

## Como funciona

- A Cloud Function `syncFootballData` roda **a cada 1 minuto** automaticamente
- Ela chama 3 endpoints da football-data.org (3 calls/min de 10 disponíveis)
- Salva os dados transformados em `Firestore > cache/{matches,standings,bracket}`
- O app lê do Firestore via `onSnapshot` — quando a função atualiza, **todos os usuários veem instantaneamente**, sem delay e sem usar mais chamadas de API
- Jogos ao vivo aparecem com badge 🔴 AO VIVO

## Verificar no Console Firebase

- Logs: https://console.firebase.google.com/project/copadomundo-2026/functions/logs
- Dados: https://console.firebase.google.com/project/copadomundo-2026/firestore/data/cache
