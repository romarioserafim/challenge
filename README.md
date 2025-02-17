## Setup do projeto de backend

### Pré-requisitos

O que você precisa para configurar o projeto:

- [NPM](https://www.npmjs.com/)
- [Node](https://nodejs.org/en/) `>=22.0.0` (Instale usando [NVM](https://github.com/nvm-sh/nvm))
- [Docker Compose](https://docs.docker.com/compose/)

### Setup

1. **Instale o Docker e o Docker Compose**, caso ainda não tenha.
2. Suba os serviços necessários (PostgreSQL e Redis) com:
   ```bash
   docker-compose up -d
   ```
3. Instale as dependências do projeto:
   ```bash
   nvm use && npm install
   ```
4. Configure o banco de dados:
   ```bash
   npm run db:migrate && npm run db:seed
   ```
5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```
6. Acesse o **Playground do GraphQL**:
   - 👉 [http://localhost:3000/graphql](http://localhost:3000/graphql)

### Tests

Para rodar os testes:

```bash
npm run test
```

### Migrations

Caso precise criar novas migrations, utilize o comando:

```bash
npm run db:create_migration --name=create-xpto-table
```


### Mudanças

Mudanças aplicadas:

Encontrado o problema de segurança no repository de content, era um sql injection, feito a tratativa para resolver o problema.

Feito melhorias no content.service adicionando Enum e mudando a escrita do código com segregações de funções.

Adicionado novo tipo de provisionamento para TXT.

Ajuste nos testes que estavam quebrando.




