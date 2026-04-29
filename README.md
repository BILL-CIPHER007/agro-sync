# AgroSync

Sistema web para gerenciamento de estoque de agentes agrícolas, pedidos de abastecimento e movimentações de entrada/saída.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Componentes no padrão Shadcn UI
- Prisma ORM
- PostgreSQL
- NextAuth por credenciais
- Zod, react-hook-form e bcrypt

## Setup local

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
Copy-Item .env.example .env
```

3. Ajuste as variáveis:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agrosync?schema=public"
AUTH_SECRET="um-segredo-forte-com-pelo-menos-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

4. Rode migration e seed em ambiente de desenvolvimento:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Inicie o app:

```bash
npm run dev
```

Usuário inicial de desenvolvimento:

- E-mail: `admin@agrosync.local`
- Senha: `Admin@12345`

## Validações executadas

```bash
npm run prisma:generate
npm run typecheck
npm run build
npm run lint
```
