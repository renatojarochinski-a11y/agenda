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

### Atualizações futuras

Basta publicar a nova versão na Vercel — as migrations do
`prisma/schema.prisma` são aplicadas automaticamente a cada deploy.
