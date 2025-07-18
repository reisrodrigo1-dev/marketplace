# Implementação da Exibição da Página de Origem

## Objetivo
Implementar a exibição da página de origem (de onde o cliente veio) tanto nos agendamentos quanto na tela do cliente.

## Alterações Realizadas

### 1. ClientAppointments.jsx
**Arquivo**: `src/components/ClientAppointments.jsx`

**Modificação**: Adicionada seção para exibir a página de origem nos detalhes do agendamento para o cliente.

```jsx
{/* Página de Origem */}
{appointment.paginaOrigem && (
  <div className="flex items-start text-gray-600">
    <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
    </svg>
    <div>
      <p className="font-medium">Página de Origem</p>
      <p className="text-sm">
        {appointment.paginaOrigem.nomePagina} 
        <span className="text-gray-500 ml-1">
          ({appointment.paginaOrigem.tipoPagina === 'escritorio' ? 'Escritório de Advocacia' : 'Página de Advogado'})
        </span>
      </p>
      {appointment.paginaOrigem.slug && (
        <p className="text-xs text-gray-500 mt-1">
          /{appointment.paginaOrigem.slug}
        </p>
      )}
    </div>
  </div>
)}
```

**Localização**: Na seção de informações da consulta, após o status do agendamento.

### 2. ClientsScreen.jsx
**Arquivo**: `src/components/ClientsScreen.jsx`

**Modificação**: Adicionada exibição da página de origem no histórico de agendamentos do modal de detalhes do cliente (visão do advogado).

```jsx
{/* Página de Origem */}
{appointment.paginaOrigem && (
  <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded mt-2">
    <strong>Página de origem:</strong> {appointment.paginaOrigem.nomePagina}
    <span className="text-gray-500 ml-1">
      ({appointment.paginaOrigem.tipoPagina === 'escritorio' ? 'Escritório' : 'Advogado'})
    </span>
    {appointment.paginaOrigem.slug && (
      <span className="text-xs text-gray-500 block">/{appointment.paginaOrigem.slug}</span>
    )}
  </div>
)}
```

**Localização**: No modal de detalhes do cliente, após a descrição do caso de cada agendamento.

## Funcionalidades Implementadas

### Para o Cliente (`ClientAppointments.jsx`)
- ✅ Exibe a página de origem em cada agendamento
- ✅ Mostra o nome da página 
- ✅ Indica se é escritório ou página individual
- ✅ Exibe o slug da página quando disponível
- ✅ Apresentação visual consistente com o resto da interface

### Para o Advogado (`LawyerAppointments.jsx`)
- ✅ **Já implementado anteriormente** - Exibe página de origem nos detalhes do agendamento

### Para Gerenciamento de Clientes (`ClientsScreen.jsx`)
- ✅ Exibe página de origem no histórico de agendamentos
- ✅ Distingue entre escritórios e páginas individuais
- ✅ Formatting visual diferenciado (fundo azul claro)

## Estrutura de Dados da Página de Origem

```javascript
paginaOrigem: {
  id: string,                    // ID da página
  nomePagina: string,           // Nome da página ou do advogado
  tipoPagina: 'advogado' | 'escritorio',  // Tipo da página
  slug: string                  // Slug da página na URL
}
```

## Fluxo de Implementação

1. **Captura**: O `AppointmentModal.jsx` já captura as informações da página quando o agendamento é criado
2. **Armazenamento**: Os dados são salvos no Firestore junto com o agendamento
3. **Exibição Cliente**: `ClientAppointments.jsx` exibe a informação para o cliente
4. **Exibição Advogado**: `LawyerAppointments.jsx` (já implementado) e `ClientsScreen.jsx` exibem para o advogado

## Status
✅ **CONCLUÍDO** - A página de origem é agora exibida em todas as telas relevantes:
- Tela de agendamentos do cliente
- Tela de agendamentos do advogado  
- Modal de detalhes do cliente (visão do advogado)

## Testes Necessários
- [ ] Criar agendamento a partir de uma página de advogado
- [ ] Criar agendamento a partir de uma página de escritório
- [ ] Verificar exibição na tela do cliente
- [ ] Verificar exibição na tela do advogado
- [ ] Verificar exibição no modal de detalhes do cliente
