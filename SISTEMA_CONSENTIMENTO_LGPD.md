# Sistema de Consentimento LGPD - DireitoHub

## Visão Geral

Este documento descreve a implementação do sistema de consentimento LGPD (Lei Geral de Proteção de Dados) no DireitoHub, que garante que os clientes sejam devidamente informados e concedam consentimento explícito antes de suas informações pessoais serem inseridas na base de clientes do advogado.

## Conformidade Legal

### Lei Geral de Proteção de Dados (LGPD)
- **Lei nº 13.709/2018**
- **Vigência**: Agosto de 2020
- **Aplicação**: Tratamento de dados pessoais no território brasileiro

### Princípios Aplicados
1. **Transparência**: Informações claras sobre o tratamento
2. **Finalidade**: Propósitos específicos e legítimos
3. **Adequação**: Compatibilidade com as finalidades
4. **Necessidade**: Limitação ao mínimo necessário
5. **Consentimento**: Livre, informado e inequívoco

## Implementação Técnica

### Fluxo de Consentimento

1. **Momento**: Durante o processo de pagamento
2. **Informação**: Cliente é informado sobre o uso de dados
3. **Escolha**: Cliente deve marcar checkbox para consentir
4. **Validação**: Sistema valida o consentimento antes de prosseguir
5. **Registro**: Consentimento é salvo com timestamp

### Dados Coletados com Consentimento

```javascript
// Informações básicas do cliente
{
  name: "Nome completo",
  email: "Email para contato", 
  phone: "Telefone (opcional)",
  appointmentDate: "Data da consulta",
  caseDescription: "Descrição do caso",
  finalPrice: "Valor pago"
}

// Metadados de consentimento
{
  lgpdConsent: true,
  lgpdConsentDate: timestamp,
  dataProtectionInfo: {
    consentGiven: true,
    consentDate: timestamp,
    dataController: "Nome do Advogado",
    purpose: "Finalidades específicas",
    legalBasis: "Base legal",
    retentionPeriod: "Período de retenção"
  }
}
```

## Interface de Consentimento

### Modal de Pagamento - Seção LGPD

```jsx
// Componente de consentimento no PaymentModal
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <h4>Consentimento para Uso de Dados Pessoais</h4>
  <p>Informação clara sobre o uso dos dados...</p>
  <ul>
    <li>Gestão e acompanhamento do histórico</li>
    <li>Comunicação sobre agendamentos</li>
    <li>Melhoria da qualidade do atendimento</li>
    <li>Cumprimento de obrigações legais</li>
  </ul>
</div>
```

### Detalhes Expandíveis

O sistema oferece informações detalhadas sobre:
- **Direitos do titular** (acesso, correção, exclusão, etc.)
- **Responsável pelo tratamento** (nome do advogado)
- **Base legal** (execução de contrato, legítimo interesse)
- **Período de retenção** (conforme legislação)

### Checkbox Obrigatória

```jsx
<input
  type="checkbox"
  checked={lgpdConsent}
  onChange={(e) => setLgpdConsent(e.target.checked)}
/>
<label>
  Declaro que li e aceito que meus dados pessoais sejam 
  inseridos na base de clientes...
</label>
```

## Validações Implementadas

### 1. Validação no Frontend

```javascript
const generatePayment = async (method) => {
  if (!lgpdConsent) {
    alert('Para prosseguir com o pagamento, é necessário aceitar os termos de uso de dados pessoais.');
    return;
  }
  // Procede com o pagamento
};
```

### 2. Validação no Backend

```javascript
// Salva consentimento junto com o pagamento
const updateData = {
  status: 'pago',
  lgpdConsent: paymentData.lgpdConsent || false,
  lgpdConsentDate: paymentData.lgpdConsentDate ? serverTimestamp() : null,
  // ... outros dados
};
```

## Armazenamento de Dados

### Collection: `appointments`
```javascript
{
  // ... dados do agendamento
  lgpdConsent: true,
  lgpdConsentDate: timestamp,
  // Registro do consentimento no agendamento
}
```

### Collection: `clients`
```javascript
{
  // ... dados básicos do cliente
  lgpdConsent: true,
  lgpdConsentDate: timestamp,
  dataProtectionInfo: {
    consentGiven: true,
    consentDate: timestamp,
    dataController: "Advogado Responsável",
    purpose: "Gestão de clientes, histórico de consultas...",
    legalBasis: "Execução de contrato e legítimo interesse",
    retentionPeriod: "Conforme legislação aplicável"
  }
}
```

## Visualização do Consentimento

### Tela de Clientes do Advogado

```jsx
// Seção especial para informações LGPD
<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
  <h4>📋 Informações de Proteção de Dados (LGPD)</h4>
  <p>Consentimento: ✅ Concedido</p>
  <p>Data do consentimento: 15/01/2025</p>
  <p>Finalidade: Gestão de clientes...</p>
  <p>Base legal: Execução de contrato...</p>
</div>
```

## Direitos dos Titulares

### Direitos Garantidos

1. **Acesso** - Consultar dados pessoais
2. **Correção** - Corrigir dados incorretos  
3. **Exclusão** - Solicitar remoção dos dados
4. **Portabilidade** - Obter cópia dos dados
5. **Oposição** - Contestar o tratamento
6. **Revogação** - Revogar consentimento

### Como Exercer os Direitos

```text
Para exercer seus direitos, o titular pode:
1. Contatar diretamente o advogado responsável
2. Enviar solicitação formal por email
3. Usar canais de atendimento da plataforma

Prazo para resposta: 15 dias úteis
```

## Bases Legais Utilizadas

### 1. Execução de Contrato (Art. 7º, V)
- **Aplicação**: Dados necessários para prestação do serviço
- **Dados**: Nome, email, telefone, agendamento
- **Finalidade**: Execução da consulta jurídica

### 2. Legítimo Interesse (Art. 7º, IX)
- **Aplicação**: Melhoria dos serviços e comunicação
- **Dados**: Histórico de consultas, preferências
- **Finalidade**: Otimização do atendimento

### 3. Consentimento (Art. 7º, I)
- **Aplicação**: Marketing e comunicações adicionais
- **Dados**: Todos os dados pessoais
- **Finalidade**: Promoção de serviços e comunicação

## Medidas de Segurança

### Técnicas
- **Criptografia**: Dados sensíveis criptografados
- **Firewall**: Proteção de rede
- **Backup**: Cópias de segurança regulares
- **Monitoramento**: Logs de acesso e alterações

### Administrativas
- **Treinamento**: Equipe treinada em LGPD
- **Políticas**: Políticas internas de proteção
- **Contratos**: Cláusulas de proteção de dados
- **Auditoria**: Revisões periódicas de conformidade

## Retenção e Exclusão

### Período de Retenção
```text
Dados mantidos por:
- Durante a prestação do serviço
- Prazo legal para documentos jurídicos (20 anos)
- Até solicitação de exclusão pelo titular
- Conforme necessidade do legítimo interesse
```

### Exclusão Automática
```javascript
// Processo de exclusão (a implementar)
const deleteClientData = async (clientId, reason) => {
  // 1. Anonimização de dados sensíveis
  // 2. Manutenção de dados legalmente obrigatórios
  // 3. Log da exclusão para auditoria
  // 4. Notificação ao titular
};
```

## Conformidade e Auditoria

### Registros Mantidos
- **Log de consentimentos**: Todos os consentimentos dados
- **Log de acessos**: Acessos aos dados pessoais
- **Log de alterações**: Modificações nos dados
- **Log de exclusões**: Exclusões solicitadas

### Relatórios de Conformidade
```javascript
// Relatório de conformidade LGPD
const generateComplianceReport = async (lawyerId) => {
  return {
    totalClients: number,
    clientsWithConsent: number,
    consentRate: percentage,
    dataRequests: number,
    deletionRequests: number,
    lastAuditDate: date
  };
};
```

## Melhorias Futuras

### Portal do Titular
- Interface para exercer direitos
- Visualização de dados coletados
- Histórico de consentimentos
- Solicitações de exclusão

### Automação de Processos
- Exclusão automática após período
- Renovação de consentimentos
- Notificações de vencimento
- Relatórios automáticos

### Integrações
- Sistema de tickets para solicitações
- API para exercício de direitos
- Dashboard de conformidade
- Alertas de não conformidade

## Conclusão

O sistema de consentimento LGPD implementado no DireitoHub garante:

1. **Transparência total** sobre o uso de dados
2. **Consentimento livre e informado** dos clientes
3. **Registro detalhado** de todos os consentimentos
4. **Facilidade para exercer direitos** do titular
5. **Conformidade legal** com a LGPD

A implementação segue as melhores práticas de proteção de dados e oferece uma base sólida para a conformidade legal, protegendo tanto os clientes quanto os advogados que utilizam a plataforma.
