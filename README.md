# DireitoHub - Sistema Completo de Advocacia

Uma plataforma web moderna e completa para advocacia, construída com React, Firebase e Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Firebase** - Backend as a Service (Auth, Firestore, Storage)
- **Tailwind CSS** - Framework CSS utilitário para estilização
- **Vite** - Build tool para desenvolvimento rápido
- **Inter Font** - Tipografia moderna do Google Fonts

## 📋 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- ✅ Login e registro de usuários
- ✅ Controle de acesso baseado em perfis
- ✅ Gerenciamento de sessão

### 👥 Gestão de Páginas de Advogados
- ✅ Criação de páginas personalizadas
- ✅ Suporte para advogados individuais e escritórios
- ✅ Sistema de colaboração entre advogados
- ✅ Controle de permissões (owner, lawyer, intern, financial)

### 💰 Sistema Financeiro
- ✅ Dashboard financeiro com permissões
- ✅ Controle de receitas e saques
- ✅ Regra D+30 para liberação de valores
- ✅ Histórico de transações

### 🤖 Assistente Jurídico (Juri.AI)
- ✅ Chat AI para assistência jurídica
- ✅ Análise de documentos
- ✅ Sugestões automatizadas

### 📅 Sistema de Agendamentos
- ✅ Agendamento de consultas
- ✅ Calendário integrado
- ✅ Gestão de eventos e processos

### 🔍 Busca no DataJud
- ✅ Integração com API do DataJud
- ✅ Busca de processos por número
- ✅ Cache inteligente de resultados

### 📄 Gestão de Documentos
- ✅ Upload e organização de documentos
- ✅ Suporte a múltiplos formatos
- ✅ Sistema de prompts jurídicos

## 🎨 Identidade Visual

- **Cores primárias**: Azul (#0ea5e9) e Amarelo (#facc15)
- **Tipografia**: Inter (Google Fonts)
- **Tema**: Profissional, moderno e acessível
- **Design**: Responsivo e mobile-first

## 🛠️ Instalação e Execução

1. Clone o repositório:
   ```bash
   git clone https://github.com/reisrodrigo1-dev/DireitoHub.git
   cd DireitoHub
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Configure as chaves do Firebase
   ```

4. Execute o projeto em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:5173` no seu navegador

## 📦 Build para Produção

```bash
npm run build
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/         # Componentes React
├── contexts/          # Contextos (Auth, etc.)
├── firebase/          # Configuração Firebase
├── services/          # Serviços e APIs
├── assets/           # Imagens e recursos
├── App.jsx           # Componente principal
├── index.css         # Estilos globais
└── main.jsx          # Ponto de entrada
```

## 🔧 Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication, Firestore e Storage
3. Configure as variáveis de ambiente no arquivo `.env`

## 📱 Funcionalidades por Perfil

### 👑 Owner (Proprietário)
- Todas as permissões
- Gerenciar colaboradores
- Configurações da página

### ⚖️ Lawyer (Advogado)
- Acesso a clientes e agendamentos
- Visualizar informações financeiras
- Usar assistente AI

### 📚 Intern (Estagiário)
- Acesso a clientes e agendamentos
- Assistente AI limitado

### 💼 Financial (Financeiro)
- Apenas visualizar informações financeiras
- Relatórios de receitas e saques

## 🚀 Deploy

O projeto está configurado para deploy em plataformas como:
- Vercel
- Netlify
- Firebase Hosting

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Rodrigo Reis**
- GitHub: [@reisrodrigo1-dev](https://github.com/reisrodrigo1-dev)
- Email: reis.mrodrigo@gmail.com
