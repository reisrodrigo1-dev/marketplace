# Sistema de Agendamento e Pagamento - DireitoHub

Este documento descreve a implementação completa do sistema de agendamento jurídico com pagamento e chamada de vídeo.

## Funcionalidades Implementadas

### 1. Modal de Agendamento (`AppointmentModal.jsx`)
- **Verificação de login**: Apenas clientes logados podem agendar
- **Descrição do caso**: Campo obrigatório para detalhar a situação jurídica
- **Aceite de valor**: Cliente deve aceitar o range de preços
- **Fluxo em steps**: Interface intuitiva com 4 etapas
- **Validações**: Verificação de dados obrigatórios

### 2. Painel do Advogado (`LawyerAppointments.jsx`)
- **Listagem de solicitações**: Visualização de todos os agendamentos
- **Filtros por status**: Pendente, Aguardando Pagamento, Pago, etc.
- **Aprovação com valor**: Definição do valor final dentro do range
- **Link de vídeo**: Campo obrigatório para chamada online
- **Ações**: Aprovar, rejeitar, visualizar detalhes

### 3. Painel do Cliente (`ClientAppointments.jsx`)
- **Acompanhamento de status**: Visualização em tempo real
- **Sistema de pagamento**: PIX, Boleto e Cartão de Crédito
- **Acesso à chamada**: Link direto para videochamada após pagamento
- **Agenda**: Integração com Google Calendar e arquivo .ics

### 4. Sistema de Pagamento (`PaymentModal.jsx`)
- **Múltiplas formas**: PIX, Boleto Bancário, Cartão de Crédito
- **Geração automática**: Links e códigos de pagamento
- **Simulação**: Modo demo para testes
- **Interface amigável**: UX otimizada para conversão

### 5. Serviços Firebase (`firestore.js`)
- **CRUD completo**: Operações de agendamento
- **Status tracking**: Controle de estados
- **Pagamento**: Armazenamento de dados de transação
- **Agenda**: Geração de eventos de calendário

## Fluxo Completo do Sistema

### Para o Cliente:
1. **Agendamento**: Cliente acessa página do advogado
2. **Login**: Sistema verifica se está logado como cliente
3. **Solicitação**: Preenche descrição do caso e aceita valor
4. **Aguarda aprovação**: Advogado analisa a solicitação
5. **Pagamento**: Após aprovação, escolhe forma de pagamento
6. **Confirmação**: Acesso ao link da chamada
7. **Agenda**: Adiciona evento ao calendário pessoal

### Para o Advogado:
1. **Notificação**: Recebe solicitação de agendamento
2. **Análise**: Visualiza caso e informações do cliente
3. **Aprovação**: Define valor final e link de vídeo
4. **Acompanhamento**: Monitora pagamento e status
5. **Consulta**: Realiza atendimento no horário marcado

## Estados do Agendamento

- **`pendente`**: Aguardando resposta do advogado
- **`aguardando_pagamento`**: Aprovado, aguardando pagamento
- **`pago`**: Pagamento confirmado, consulta garantida
- **`confirmado`**: Consulta confirmada (estado legacy)
- **`cancelado`**: Cancelado por qualquer parte
- **`concluido`**: Consulta realizada

## Integrações

### Agenda:
- **Google Calendar**: Link direto para adicionar evento
- **Arquivo .ics**: Download para Outlook, Apple Calendar, etc.
- **Dados completos**: Título, descrição, data, local e link

### Pagamento (Simulado):
- **PIX**: Código copia e cola
- **Boleto**: Link para download e código de barras
- **Cartão**: Redirecionamento para gateway

### Videochamada:
- **Google Meet**: Suporte nativo
- **Zoom**: Links diretos
- **Microsoft Teams**: Compatibilidade total
- **Outras plataformas**: URL genérica

## Arquivos Modificados

### Novos Componentes:
- `src/components/AppointmentModal.jsx`
- `src/components/LawyerAppointments.jsx`
- `src/components/ClientAppointments.jsx`
- `src/components/PaymentModal.jsx`

### Atualizados:
- `src/components/LawyerWebPage.jsx` - Integração com modal
- `src/components/AdminDashboard.jsx` - Link para agendamentos
- `src/components/ClientDashboard.jsx` - Uso do novo painel
- `src/firebase/firestore.js` - Novos serviços

## Melhorias Futuras

### Notificações:
- Email automático para cliente e advogado
- SMS para lembretes de consulta
- Push notifications no navegador

### Pagamento:
- Integração real com gateways (PagSeguro, Stripe, etc.)
- Parcelamento no cartão de crédito
- Wallet digital (PayPal, Mercado Pago)

### Comunicação:
- Chat interno entre cliente e advogado
- Compartilhamento de documentos
- Gravação de consultas (com consentimento)

### Analytics:
- Dashboard de métricas para advogados
- Relatórios de faturamento
- Taxa de conversão de agendamentos

## Configuração

### Variáveis de Ambiente:
```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

# Pagamento (para produção)
VITE_PAGSEGURO_TOKEN=your_token
VITE_STRIPE_PUBLIC_KEY=your_key
```

### Índices Firestore Necessários:
- `appointments`: `lawyerUserId`, `status`, `createdAt`
- `appointments`: `clientUserId`, `status`, `appointmentDate`

## Segurança

### Validações:
- Autenticação obrigatória para agendamentos
- Verificação de tipo de usuário (cliente/advogado)
- Sanitização de URLs de videochamada
- Validação de valores monetários

### Privacidade:
- Dados criptografados no Firebase
- Links de pagamento com expiração
- Logs de auditoria para transações

## Testes

### Cenários de Teste:
1. Agendamento sem login
2. Agendamento como advogado (deve falhar)
3. Aprovação com valor fora do range
4. Pagamento simulado
5. Cancelamento em diferentes status
6. Integração com agenda

### Dados de Teste:
- Cliente: cliente@test.com / 123456
- Advogado: advogado@test.com / 123456
- Valores: R$ 100,00 - R$ 300,00
- Links: https://meet.google.com/test-meeting

---

**Status**: ✅ Implementado e funcional
**Versão**: 1.0.0
**Data**: Julho 2025
