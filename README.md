# Agenda Renato & Nicole

Calendário compartilhado da família, com login único compartilhado, eventos
pontuais e recorrentes (diários, semanais em dias específicos da semana,
mensais e anuais), e categorização por tipo de evento (festa, compromisso
fixo, tarefa doméstica, aniversário, outro).

## Funcionalidades

- **Login compartilhado**: uma única senha para a família. Ao entrar, cada
  pessoa seleciona se é "Renato" ou "Nicole", para que os eventos criados
  fiquem identificados por autor (com uma cor diferente para cada um).
- **Calendário mensal**: navegação entre meses, destaque do dia atual.
- **Eventos pontuais e recorrentes**: diário, semanal (com escolha dos dias
  da semana, ex: "toda segunda e quinta" para tirar o lixo), mensal e anual,
  com intervalo configurável ("a cada 2 semanas", por exemplo) e data final
  opcional.
- **Tipo de evento** (dropdown): Festa / evento especial, Compromisso fixo,
  Tarefa doméstica, Aniversário, Outro — cada um com cor própria no
  calendário.
- Editar e excluir eventos (excluir um evento recorrente remove a série
  inteira).
- **Notificações no WhatsApp** (opcional, via CallMeBot): quando alguém
  cria um evento, a outra pessoa recebe uma mensagem na hora; e todo dia
  de manhã sai um lembrete com os eventos daquele dia.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io/) + PostgreSQL
- Sessão de login via cookie assinado (JWT, biblioteca `jose`)

---

## Rodando localmente

1. Tenha um Postgres disponível (local ou na nuvem) e configure `.env` a
   partir do `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Instale as dependências e aplique as migrations:

   ```bash
   npm install
   npx prisma migrate dev
   ```

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse http://localhost:3000 e entre com a `SHARED_PASSWORD` definida no
   `.env`.

---

## Publicando de graça (Vercel + banco Postgres na nuvem)

### 1. Criar o banco de dados (Neon, grátis)

1. Crie uma conta em https://neon.tech (ou use Supabase, se preferir) e
   crie um novo projeto/banco.
2. Copie a **connection string com pooler** (geralmente contém
   `-pooler` no host) — essa será a `DATABASE_URL`.
3. Copie também a **connection string direta** (sem `-pooler`) — essa será
   a `DIRECT_URL`, usada apenas para rodar as migrations.

### 2. Publicar o projeto na Vercel

1. Crie uma conta em https://vercel.com e importe este repositório
   (`renatojarochinski-a11y/agenda`, branch com o código da agenda).
2. Nas configurações do projeto, em **Environment Variables**, adicione:
   - `DATABASE_URL` — a connection string com pooler do passo 1.
   - `DIRECT_URL` — a connection string direta do passo 1.
   - `SHARED_PASSWORD` — a senha que você e a Nicole vão usar para entrar.
   - `SESSION_SECRET` — um valor aleatório longo (gere com
     `openssl rand -base64 32`).
3. Clique em **Deploy**.

   O projeto tem um script `vercel-build` que roda
   `prisma migrate deploy && next build` — ou seja, a cada deploy a Vercel
   já aplica automaticamente as tabelas/alterações do banco antes de
   publicar. Não é preciso rodar nada manualmente.

4. Pronto — a Vercel vai te dar um link público (ex:
   `https://agenda-renato-nicole.vercel.app`) para acessar de qualquer
   lugar, inclusive do celular.

### 3. Notificações no WhatsApp (opcional)

Usa o [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/),
um serviço gratuito pra uso pessoal. **Cada pessoa (Renato e Nicole) precisa
fazer isso separadamente, no próprio celular:**

1. Salve o número **+34 613 01 49 37** nos contatos do WhatsApp (pode salvar
   como "CallMeBot"). Se esse número não responder, confira o número atual
   em https://www.callmebot.com/blog/free-api-whatsapp-messages/ — ele pode
   mudar de vez em quando.
2. Mande pra esse contato, pelo WhatsApp, a mensagem:
   `I allow callmebot to send me messages`
3. Em até 2 minutos o bot responde com a frase "API Activated..." e uma
   **API Key** (um número). Guarde essa chave e o número de telefone usado
   (com código do país, só números, ex: `5511999999999`).
4. Repita os passos 1-3 na outra pessoa.

Depois, na Vercel, em **Environment Variables**, adicione:

- `RENATO_WHATSAPP_PHONE` e `RENATO_WHATSAPP_APIKEY`
- `NICOLE_WHATSAPP_PHONE` e `NICOLE_WHATSAPP_APIKEY`
- `CRON_SECRET` — um valor aleatório longo (gere com `openssl rand -base64 32`).
  A Vercel usa isso automaticamente pra autenticar as chamadas do lembrete
  diário — não precisa fazer mais nada, só cadastrar a variável.

Depois de adicionar, faça um novo deploy (**Deployments → ... → Redeploy**)
pra essas variáveis passarem a valer.

O lembrete diário roda todo dia às 8h (horário de Brasília) — configurado em
`vercel.json`. Se nenhuma variável de WhatsApp estiver configurada, o app
funciona normalmente, só não manda as mensagens.

### Atualizações futuras

Basta publicar a nova versão na Vercel — as migrations do
`prisma/schema.prisma` são aplicadas automaticamente a cada deploy.
