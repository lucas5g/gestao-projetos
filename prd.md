# PRD - Monitor de Versoes de Projetos

## Nome do produto

Monitor de Versoes de Projetos

## Visao geral

Um sistema para acompanhar projetos baseados em Git e identificar se a versao usada localmente esta desatualizada em relacao a uma nova release disponivel no repositorio de origem. Quando houver nova versao, o sistema deve notificar o usuario no Microsoft Teams via webhook.

## Problema

- Quem mantem varios projetos precisa acompanhar manualmente se surgiram novas releases upstream.
- Muitas vezes o usuario sabe a versao atual do projeto local, mas nao percebe quando sai uma correcao ou nova release, como `4.12.1` apos `4.12.0`.
- Esse acompanhamento manual faz perder atualizacoes importantes de bugfix, seguranca ou compatibilidade.

## Objetivo

- Centralizar a versao atual de cada projeto monitorado.
- Detectar novas releases publicadas no repositorio de origem.
- Notificar automaticamente no Teams quando houver uma nova versao disponivel.

## Publico-alvo

- Desenvolvedores que mantem projetos open source ou forks localmente
- Tech leads responsaveis por manter stacks atualizadas
- Times que precisam acompanhar releases de ferramentas criticas

## Proposta de valor

- Em vez de acompanhar releases manualmente, o usuario recebe um aviso quando uma nova versao aparece.
- O sistema informa qual versao esta em uso e qual versao mais recente foi encontrada.
- O sistema apenas monitora e notifica; nao atualiza nada automaticamente.

## Exemplo de uso

- Projeto monitorado: `chatwoot`
- Versao atual conhecida: `4.12.0`
- Nova release detectada: `4.12.1`
- Resultado esperado: sistema registra a nova versao e envia notificacao no Teams com os dados do projeto e da release encontrada

## MVP

- Cadastrar projetos monitorados
- Informar repositorio de origem do projeto
- Registrar a versao atual conhecida de cada projeto
- Consultar a ultima release disponivel no repositorio de origem
- Comparar versao atual com versao mais recente
- Exibir status consolidado de atualizacao
- Enviar notificacao para Teams quando houver nova versao
- Salvar historico basico da ultima verificacao e ultima notificacao enviada

## Status do projeto

- `Atualizado`: a versao atual e igual a ultima release conhecida
- `Nova versao disponivel`: existe release mais recente que a versao atual registrada
- `Versao desconhecida`: o sistema nao conseguiu identificar a versao atual do projeto
- `Origem nao configurada`: projeto sem repositorio de origem definido
- `Erro`: falha ao consultar a origem ou processar a versao

## Requisitos funcionais

- RF01: o usuario pode cadastrar um projeto para monitoramento
- RF02: o usuario pode informar nome do projeto, caminho local opcional e URL do repositorio de origem
- RF03: o usuario pode registrar manualmente a versao atual do projeto
- RF04: o sistema pode consultar a ultima release disponivel no repositorio de origem
- RF05: o sistema compara a versao atual registrada com a versao mais recente encontrada
- RF06: o sistema exibe o status consolidado de cada projeto
- RF07: o sistema permite atualizar a verificacao de um projeto individualmente
- RF08: o sistema permite atualizar a verificacao de todos os projetos
- RF09: o sistema envia notificacao para um webhook do Microsoft Teams quando detectar nova versao
- RF10: o sistema evita notificacoes duplicadas para a mesma versao
- RF11: o sistema salva a data e hora da ultima verificacao
- RF12: o sistema salva a data e hora da ultima notificacao enviada

## Requisitos nao funcionais

- RNF01: a verificacao deve ser rapida para um conjunto pequeno de projetos no MVP
- RNF02: o sistema nao deve alterar o repositorio local ou remoto
- RNF03: erros de consulta, autenticacao ou parsing devem ser exibidos de forma clara
- RNF04: o envio ao Teams deve usar webhook configurado pelo usuario
- RNF05: a interface deve ser simples e escaneavel

## Fluxo principal

- Usuario cadastra um projeto e informa a versao atual conhecida
- Sistema consulta a origem do projeto para descobrir a ultima release
- Sistema compara a versao atual com a ultima versao encontrada
- Sistema mostra o status no painel
- Se houver nova versao, sistema envia notificacao no Teams
- Sistema registra a ultima verificacao e a ultima notificacao

## Integracoes do MVP

- Origem de versoes: releases/tags do repositorio de origem
- Canal de notificacao: webhook do Microsoft Teams

## Fora do escopo no MVP

- Atualizar o projeto automaticamente
- Executar `git pull`, `merge` ou deploy
- Suporte a multiplos canais de notificacao alem de Teams
- Regras avancadas de escalonamento
- Multiusuario
- Historico avancado de releases

## Criterios de sucesso

- Usuario consegue saber rapidamente quais projetos possuem nova versao disponivel
- Usuario recebe notificacao no Teams sem precisar acompanhar releases manualmente
- Sistema evita alertas duplicados para a mesma versao

## Primeiras historias de usuario

- Como desenvolvedor, quero cadastrar um projeto com sua versao atual para acompanha-lo
- Como desenvolvedor, quero saber quando uma nova release for publicada para um projeto monitorado
- Como desenvolvedor, quero receber esse aviso no Teams para nao depender de verificacao manual
- Como desenvolvedor, quero ver qual versao eu uso hoje e qual versao nova foi encontrada
- Como desenvolvedor, quero evitar notificacoes repetidas para a mesma release

## Hipotese principal do produto

O valor principal nao esta em monitorar o estado do Git local, mas sim em monitorar versoes de projetos e avisar quando houver nova release disponivel.
