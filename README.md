# Gabarita+ 🎓

![Gabarita+ Logo](Gabarita/client/src/assets/images/logo_gabarita.png)

> **Sua plataforma completa de preparação para o ENEM.**

O **Gabarita+** é uma aplicação Full Stack desenvolvida para ajudar estudantes a praticarem para o ENEM. A plataforma oferece um banco de questões organizado por ano e disciplina, simulados, estatísticas de desempenho e um sistema inteligente de persistência de respostas.

---

## 🚀 Funcionalidades

### 🔐 Autenticação e Segurança
- **Cadastro e Login:** Sistema seguro utilizando **JWT (JSON Web Tokens)** e criptografia de senha com **Bcrypt**.
- **Proteção de Rotas:** Acesso restrito a usuários logados.
- **Logout Seguro:** Limpeza de tokens e redirecionamento automático.

### 📚 Banco de Questões
- **Filtros Dinâmicos:** Seleção de questões por **Ano** (2023, 2022...) e **Disciplina**.
- **Suporte a Língua Estrangeira:** Lógica exclusiva para alternar entre **Inglês** e **Espanhol** (questões 1 a 5).
- **Feedback Visual:** Indicação imediata de acerto (verde) ou erro (vermelho).
- **Ferramenta de Eliminação:** Opção "tesoura" para riscar alternativas incorretas visualmente.

### 💾 Persistência de Dados
- **Histórico de Respostas:** O sistema salva automaticamente o progresso do aluno.
- **Chaves Compostas:** Solução inteligente para evitar conflitos de IDs entre provas de anos diferentes.

### 🎨 Interface (UI/UX)
- **Sidebar Responsiva:** Menu lateral retrátil com animações suaves e ícones intuitivos via `react-icons`.
- **Design Moderno:** Paleta de cores focada em usabilidade e conforto visual (Tema Dark/Roxo).

---

## 🛠️ Tecnologias Utilizadas

### Front-end
- **React.js:** Biblioteca principal para construção da interface.
- **React Router DOM:** Gerenciamento de rotas e navegação.
- **CSS3:** Estilização com variáveis CSS e Flexbox.
- **React Icons:** Biblioteca de ícones vetoriais.

### Back-end
- **Node.js & Express:** Servidor e construção da API REST.
- **Prisma ORM:** Gerenciamento e interação com o Banco de Dados.
- **PostgreSQL / MySQL:** (Especifique seu banco aqui) Banco de dados relacional.
- **JsonWebToken (JWT):** Autenticação stateless.
- **Bcrypt.js:** Hashing de senhas.

---

## ⚙️ Como Rodar o Projeto

Pré-requisitos: Você precisa ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### 1. Clonar o Repositório

```bash
git clone [https://github.com/seu-usuario/gabarita-plus.git](https://github.com/seu-usuario/gabarita-plus.git)
cd gabarita-plus
```
### 2. Configurar o Back-end (Server)

Acesse a pasta do servidor e instale as dependências do projeto:

```bash
cd server
npm install
```

Crie um arquivo chamado .env na raiz da pasta server. Este arquivo armazenará suas credenciais sensíveis. Adicione o seguinte conteúdo:
```bash
# Defina a porta onde o servidor irá rodar
PORT=3000

# Chave secreta para a autenticação JWT (Crie uma senha forte)
JWT_SECRET="gabarita_secret_key_123"

# URL de conexão com o banco de dados (Exemplo para PostgreSQL)
# Substitua 'usuario', 'senha' e 'nome_do_banco' pelos seus dados reais
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gabarita_db?schema=public"
```

Com o banco de dados configurado, execute as migrações do Prisma para criar as tabelas:

```bash
npx prisma migrate dev --name init
```

Por fim, inicie o servidor:

```bash
# Para desenvolvimento (com auto-reload):
npm run dev

# Ou para produção:
npm start
```
