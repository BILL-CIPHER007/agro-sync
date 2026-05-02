# Documentacao do Sistema - AgroSync

## 1. Visao geral

O AgroSync e um sistema web para gerenciamento de estoque de agentes agricolas. A aplicacao permite controlar produtos/agentes, quantidades em estoque, estoque minimo, movimentacoes de entrada e saida, pedidos de abastecimento e status de reposicao.

O foco do sistema e manter um controle simples, profissional e seguro do estoque operacional, sem incluir modulos fora do escopo como vendas, clientes, financeiro, safras ou producao agricola.

## 2. Objetivo do sistema

O objetivo do AgroSync e oferecer uma interface centralizada para:

- Cadastrar agentes agricolas.
- Consultar o estoque atual.
- Identificar itens com estoque baixo.
- Registrar entradas e saidas de estoque.
- Criar e acompanhar pedidos de abastecimento.
- Controlar o recebimento de pedidos.
- Aplicar permissoes diferentes para administradores e operadores.

## 3. Tecnologias utilizadas

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Componentes no padrao Shadcn UI.
- Prisma ORM.
- PostgreSQL.
- NextAuth para autenticacao por credenciais.
- bcryptjs para hash de senha.
- Zod para validacao de dados.
- react-hook-form para formularios.
- lucide-react para icones.

## 4. Perfis de usuario

O sistema possui dois perfis:

### ADMIN

Pode:

- Visualizar todos os dados.
- Cadastrar agentes agricolas.
- Editar agentes agricolas.
- Excluir agentes agricolas, desde que nao tenham dependencias.
- Registrar movimentacoes de estoque.
- Criar pedidos de abastecimento.
- Aprovar pedidos.
- Cancelar pedidos.
- Marcar pedidos aprovados como recebidos.
- Gerenciar usuarios.

### OPERADOR

Pode:

- Visualizar dashboard, agentes, estoque e pedidos.
- Registrar movimentacoes de estoque.
- Criar pedidos de abastecimento.
- Marcar pedidos aprovados como recebidos.

Nao pode:

- Cadastrar, editar ou excluir agentes agricolas.
- Aprovar ou cancelar pedidos.
- Gerenciar usuarios.

## 5. Modulos do sistema

### 5.1 Login

Rota principal:

- `/login`

O login e feito por e-mail e senha. A senha e validada no servidor usando bcrypt. A sessao e gerenciada pelo NextAuth.

Depois do login, o usuario e direcionado para o dashboard.

### 5.2 Dashboard

Rota:

- `/dashboard`

Exibe:

- Total de agentes agricolas cadastrados.
- Quantidade de itens com estoque baixo.
- Quantidade de pedidos pendentes.
- Quantidade de pedidos recentes.
- Tabela resumida do estoque atual.
- Lista dos ultimos pedidos.

### 5.3 Agentes Agricolas

Rotas:

- `/agentes`
- `/agentes/novo`
- `/agentes/[id]/editar`

Dados principais:

- Nome.
- Categoria.
- Unidade de medida.
- Descricao opcional.
- Quantidade atual.
- Quantidade minima.
- Data de cadastro.
- Data de atualizacao.

Funcionalidades:

- Listar agentes.
- Buscar por nome.
- Filtrar por categoria.
- Filtrar por status de estoque.
- Cadastrar agente.
- Editar agente.
- Excluir agente sem dependencias.

Status de estoque:

- OK: quantidade atual maior que o estoque minimo.
- Estoque Baixo: quantidade atual menor ou igual ao estoque minimo.

### 5.4 Controle de Estoque

Rota:

- `/estoque`

Funcionalidades:

- Visualizar saldo atual dos agentes.
- Registrar entrada de estoque.
- Registrar saida de estoque.
- Consultar historico de movimentacoes.
- Filtrar historico por agente agricola.
- Filtrar historico por tipo de movimentacao.
- Filtrar historico por periodo.

Tipos de movimentacao:

- ENTRADA.
- SAIDA.

Cada movimentacao registra:

- Agente agricola.
- Usuario responsavel.
- Tipo.
- Quantidade.
- Observacao opcional.
- Data da movimentacao.

Regra importante:

- Uma saida de estoque so e permitida se houver saldo suficiente.

### 5.5 Pedidos de Abastecimento

Rotas:

- `/pedidos`
- `/pedidos/novo`

Dados principais:

- Agente agricola relacionado.
- Quantidade solicitada.
- Status.
- Data do pedido.
- Data prevista de entrega.
- Data de recebimento.
- Observacoes.

Status possiveis:

- PENDENTE.
- APROVADO.
- RECEBIDO.
- CANCELADO.

Funcionalidades:

- Criar pedido.
- Listar pedidos.
- Filtrar por status.
- Aprovar pedido.
- Cancelar pedido.
- Marcar pedido como recebido.

Ao marcar um pedido como recebido:

- O status muda para RECEBIDO.
- A data de recebimento e preenchida.
- A quantidade solicitada e somada ao estoque do agente.
- Uma movimentacao de ENTRADA e registrada automaticamente.

### 5.6 Usuarios

Rota:

- `/usuarios`

Acesso:

- Apenas ADMIN.

Funcionalidades:

- Criar usuarios.
- Listar usuarios cadastrados.
- Definir perfil ADMIN ou OPERADOR.

## 6. Regras de negocio

1. A quantidade atual de um agente agricola nunca pode ficar negativa.
2. Uma movimentacao de SAIDA so pode ser registrada se houver estoque suficiente.
3. Uma movimentacao de ENTRADA soma a quantidade informada ao estoque atual.
4. Um pedido novo sempre inicia com status PENDENTE.
5. Apenas ADMIN pode aprovar pedidos.
6. Apenas pedidos PENDENTES podem ser aprovados.
7. Apenas pedidos PENDENTES ou APROVADOS podem ser cancelados.
8. Pedidos CANCELADOS nao podem ser aprovados nem recebidos.
9. Pedidos RECEBIDOS nao podem ser recebidos novamente.
10. Apenas pedidos APROVADOS podem ser marcados como recebidos.
11. Ao receber um pedido, o estoque e atualizado automaticamente.
12. Ao receber um pedido, uma movimentacao de ENTRADA e criada.
13. Apenas ADMIN pode excluir agentes agricolas.
14. Um agente agricola com movimentacoes ou pedidos vinculados nao pode ser excluido.
15. Usuarios OPERADOR nao podem gerenciar usuarios.

## 7. Regras de seguranca

O sistema aplica as seguintes medidas:

- Autenticacao com NextAuth.
- Sessao JWT protegida por segredo em variavel de ambiente.
- Hash de senha com bcrypt.
- Middleware para proteger rotas privadas.
- Validacao de entrada no servidor com Zod.
- Autorizacao por perfil nas server actions.
- Uso de Prisma ORM para reduzir risco de SQL Injection.
- Regras de permissao verificadas no servidor.
- Mensagens de erro tratadas sem expor stack trace ao usuario.
- Dados sensiveis, como hash de senha, nao sao enviados ao frontend.
- Variaveis sensiveis ficam em `.env`.

## 8. Banco de dados

Banco utilizado:

- PostgreSQL.

ORM:

- Prisma.

Arquivo principal:

- `prisma/schema.prisma`

### 8.1 Modelo User

Representa usuarios do sistema.

Campos:

- id.
- name.
- email.
- passwordHash.
- role.
- createdAt.
- updatedAt.

Relacionamentos:

- Um usuario pode ter varias movimentacoes de estoque.
- Um usuario pode ter varios pedidos de abastecimento.

### 8.2 Modelo AgriculturalAgent

Representa o agente agricola controlado em estoque.

Campos:

- id.
- name.
- category.
- unit.
- description.
- currentQuantity.
- minimumQuantity.
- createdAt.
- updatedAt.

Relacionamentos:

- Um agente pode ter varias movimentacoes.
- Um agente pode ter varios pedidos.

### 8.3 Modelo StockMovement

Representa o historico de entrada e saida de estoque.

Campos:

- id.
- agentId.
- userId.
- restockRequestId.
- type.
- quantity.
- note.
- createdAt.

Relacionamentos:

- Pertence a um agente agricola.
- Pertence a um usuario.
- Pode estar vinculada a um pedido recebido.

### 8.4 Modelo RestockRequest

Representa um pedido de abastecimento.

Campos:

- id.
- agentId.
- userId.
- requestedQuantity.
- status.
- requestDate.
- expectedDate.
- receivedDate.
- notes.
- createdAt.
- updatedAt.

Relacionamentos:

- Pertence a um agente agricola.
- Pertence a um usuario.
- Pode ter movimentacoes vinculadas ao recebimento.

## 9. Estrutura principal de pastas

```txt
src/
  app/
    (auth)/
      login/
    (protected)/
      dashboard/
      agentes/
      estoque/
      pedidos/
      usuarios/
    api/
      auth/
  components/
    agentes/
    auth/
    estoque/
    layout/
    pedidos/
    providers/
    shared/
    ui/
    usuarios/
  lib/
    actions/
    validations/
    auth.ts
    permissions.ts
    prisma.ts
    utils.ts
  types/
  middleware.ts
prisma/
  migrations/
  schema.prisma
  seed.ts
  demo-data.ts
```

## 10. Variaveis de ambiente

Arquivo:

- `.env`

Variaveis:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agrosync?schema=public"
AUTH_SECRET="segredo-forte"
NEXTAUTH_URL="http://localhost:3000"
```

Observacoes:

- `DATABASE_URL` aponta para o PostgreSQL ou Railway.
- `AUTH_SECRET` protege a sessao do NextAuth.
- `NEXTAUTH_URL` indica a URL local da aplicacao.

## 11. Instalacao e execucao

### 11.1 Instalar dependencias

```bash
npm install
```

### 11.2 Gerar Prisma Client

```bash
npm run prisma:generate
```

### 11.3 Aplicar migrations

```bash
npm run prisma:migrate
```

### 11.4 Rodar seed inicial

```bash
npm run prisma:seed
```

O seed inicial cria o usuario ADMIN:

```txt
admin@agrosync.local
Admin@12345
```

### 11.5 Inserir dados demonstrativos

```bash
npm run prisma:demo
```

Esse comando cria dados operacionais de exemplo:

- Agentes agricolas.
- Movimentacoes.
- Pedidos com status variados.
- Usuario operador demo.

Usuario operador demo:

```txt
operador@agrosync.local
Operador@12345
```

### 11.6 Executar em desenvolvimento

```bash
npm run dev
```

URL local:

```txt
http://localhost:3000
```

## 12. Comandos uteis

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:demo
```

## 13. Fluxos principais

### 13.1 Cadastro de agente agricola

1. ADMIN acessa `/agentes`.
2. Clica em novo agente.
3. Preenche nome, categoria, unidade, quantidade atual e estoque minimo.
4. O sistema valida os dados com Zod.
5. O agente e salvo no banco.

### 13.2 Movimentacao de estoque

1. Usuario acessa `/estoque`.
2. Seleciona o agente agricola.
3. Escolhe ENTRADA ou SAIDA.
4. Informa a quantidade.
5. O servidor valida a operacao.
6. O estoque e atualizado.
7. A movimentacao e registrada no historico.

### 13.3 Criacao de pedido

1. Usuario acessa `/pedidos/novo`.
2. Seleciona o agente agricola.
3. Informa quantidade solicitada e data prevista.
4. O pedido e criado com status PENDENTE.

### 13.4 Aprovacao de pedido

1. ADMIN acessa `/pedidos`.
2. Localiza um pedido PENDENTE.
3. Aprova o pedido.
4. O status muda para APROVADO.

### 13.5 Recebimento de pedido

1. Usuario acessa `/pedidos`.
2. Localiza um pedido APROVADO.
3. Marca como recebido.
4. O status muda para RECEBIDO.
5. A quantidade solicitada e adicionada ao estoque.
6. O sistema cria uma movimentacao de ENTRADA.

## 14. Tratamento de erros

O sistema trata erros de forma controlada:

- Erros de validacao retornam mensagens claras.
- Erros de permissao redirecionam ou bloqueiam a operacao.
- Erros de regra de negocio retornam mensagens especificas.
- Erros inesperados retornam mensagens genericas.

Exemplos:

- Estoque insuficiente para registrar saida.
- Pedido cancelado nao pode ser recebido.
- Pedido recebido nao pode ser recebido novamente.
- Agente com historico nao pode ser excluido.

## 15. Observacoes de manutencao

- Alteracoes de regra de negocio devem ser feitas nas server actions em `src/lib/actions`.
- Alteracoes de validacao devem ser feitas em `src/lib/validations`.
- Alteracoes no banco devem ser feitas no `prisma/schema.prisma`, seguidas de migration.
- Permissoes devem ser mantidas no servidor, nao apenas na interface.
- Dados demonstrativos devem ser inseridos apenas em ambiente de desenvolvimento.

## 16. Escopo atual

Incluido:

- Estoque de agentes agricolas.
- Movimentacoes.
- Pedidos de abastecimento.
- Usuarios e permissoes.
- Dashboard.

Fora do escopo neste momento:

- Vendas.
- Clientes.
- Financeiro.
- Safras.
- Producao agricola.
- Emissao de notas.
- Relatorios avancados.
