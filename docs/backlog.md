# Backlog

## Concluído

### [2026-10-01] Redesign Login/Cadastro, remoção de emojis e remoção de VIP 2 votos

**Arquivos alterados:**
- `src/paginas/Login_Cadastro.jsx` — Redesign completo da tela de login e cadastro
- `src/paginas/Login_cadastro.css` — CSS reescrito para novo visual baseado em mockup
- `src/paginas/Perfil.jsx` — Remoção de emojis (👑, ⭐, 🆓, 🔄, 💬, 📷), atualização da descrição de planos
- `src/paginas/Batalhas.jsx` — Remoção de emojis (👑, ⭐) nos badges de comentários
- `src/paginas/Personagens.jsx` — Remoção de emoji 🔍 na busca
- `src/components/NavBar.css` — Centralização do nav-center com position absolute

**O que foi feito:**

1. **Redesign das páginas de Login e Cadastro (Login_Cadastro.jsx / Login_cadastro.css)**
   - Visual redesenhado para combinar com mockup fornecido: fundo azul-cinza (#5c6381), card com borda sólida, inputs com fundo escuro (#3b3f54)
   - Títulos simplificados: "Cadastrar Usuário" (cadastro) e "Entrar na conta" (login)
   - Labels removidas dos inputs; placeholders usados como texto descritivo dentro dos campos
   - Botão principal agora diz "CONTINUAR" em ambas as telas, com estilo escuro e fonte branca (sem gradiente amarelo)
   - Botão secundário "Já tenho uma conta?" / "Criar novo usuário" com estilo ghost
   - Botões ficam lado a lado (row) em vez de empilhados (column)
   - Removidos: blobs decorativos (bolhas de fundo), ícone de cabeçalho (⚔/🔐), subtítulo
   - Removidos do cadastro: upload de foto de perfil, seleção de plano (agora sempre plano 0)
   - Card levemente maior: max-width de 560px → 620px

2. **Remoção de emojis desnecessários restantes**
   - `Perfil.jsx`: 🔄 removido, 💬→"•", 📷→texto "Alterar foto"
   - `Personagens.jsx`: 🔍→"•" no ícone de busca, removido do texto informativo
   - Mantidos: ⚔ (espada temática), ★ (tela inicial), 🦇/🦾 (ícones temáticos de personagens em Batalha.jsx), ✓/✕ (feedback de formulário), e Emojis dos planos (👑, ⭐, 🆓) conforme solicitado.

3. **Remoção da funcionalidade VIP votar 2 vezes**
   - `PLANO_INFO` em Perfil.jsx: VIP desc alterada de "2 votos por batalha" → "Personalização do perfil"
   - `planoOpcoes` no modal de trocar plano: VIP desc alterada de "2 votos por batalha + personalização" → "Personalização do perfil"
   - O plano VIP nunca teve lógica real de 2 votos no código (era apenas texto descritivo), mas a descrição foi corrigida para não prometer essa funcionalidade
   - Login_Cadastro.jsx: a lista de planos e o seletor de plano foram removidos da tela de cadastro

4. **Centralização do navbar e exibição de foto do usuário**
   - `NavBar.css`: `.nav-center` agora usa `position: absolute; left: 50%; transform: translateX(-50%)` para ficar exatamente centralizado
   - `.nav-left` e `.nav-right` receberam `z-index: 2` para ficarem acima do nav-center absoluto
   - Adicionada a imagem de perfil do usuário ao lado do nome na barra de navegação (`NavBar.jsx`).

5. **Correção do filtro de busca em Personagens**
   - Na página `Personagens.jsx`, quando um usuário clica numa sugestão do autocomplete, o personagem sugerido é agora adicionado à lista local (se já não estiver lá), garantindo que ele não exiba falsamente "Nenhum personagem encontrado".

6. **Ajuste na modal de Trocar Plano (Perfil)**
   - Texto do botão alterado de "Confirmar Troca" para "Confirmar troca e pagar" para refletir a imagem mock.


7. **Melhorias Visuais no Perfil e Retorno dos Planos no Cadastro**
   - Retornada a seleção de planos de assinatura no formulário de Cadastro de Usuário (`Login_Cadastro.jsx` e `Login_cadastro.css`).
   - Melhorada a legibilidade do plano "Gratuito" no Perfil (mudou a cor de `#4a5568` para `#ffffff` branco puro para máximo contraste).
   - Botão "Trocar Plano" e rótulo "Plano Atual" receberam cores e fundos mais claros (`#ffffff`) para se destacarem muito mais contra o fundo escuro da página (`Perfil.jsx` e `Perfil.css`).
   - Aumentado o tamanho da foto de perfil, ajustado o botão de "Alterar foto" para não sobrepor, e aumentada a fonte do badge do plano no `Perfil.css`.

### [2026-09-29] Correções de upload, modal, imagens e remoção de emojis

**Arquivos alterados:**
- `src/paginas/NovaBatalha.jsx` — Modal e lógica de upload de personagens
- `src/paginas/NovaBatalha.css` — Estilos do modal
- `src/paginas/Personagens.jsx` — Exibição de imagens de personagens
- `src/paginas/Batalhas.jsx` — Remoção de emojis
- `src/paginas/Batalha.jsx` — Remoção de emojis
- `src/paginas/Perfil.jsx` — Remoção de emojis
- `src/paginas/TelaInicial.jsx` — Remoção de emojis
- `src/components/MenuSuperior.jsx` — Remoção de emojis
- `src/components/NavBar.jsx` — Remoção de emojis

**O que foi feito:**

1. **Upload de personagens corrigido (NovaBatalha.jsx)**
   - Quando o usuário seleciona uma foto, ela é enviada ao Supabase Storage no bucket `personagens`, pasta `outros/`
   - O caminho relativo (`outros/timestamp_nome.ext`) é salvo na coluna `imagem` da tabela `personagens`
   - Quando não há foto, uma URL externa de placeholder (`https://placehold.co/...`) é salva na coluna `imagem`
   - Nunca salva base64 no banco de dados

2. **Modal de personagens ampliado (NovaBatalha.jsx / NovaBatalha.css)**
   - `ITENS_POR_PAGINA` aumentado de 10 para 50
   - `max-height` do modal aumentado para `90vh`
   - Lista do modal recebeu `max-height: 60vh` com scroll
   - Paginação mantida para navegação caso haja mais de 50

3. **Exibição de imagens na tela de personagens (Personagens.jsx)**
   - `getImagemUrl()` agora reconhece URLs com `data:` (ex: base64) além de `http`
   - Personagens novos adicionados via NovaBatalha agora mostram imagem corretamente

4. **Remoção de emojis desnecessários (todas as páginas e componentes)**
   - Removidos emojis como 🔍, 🔥, 💬, 👤, 👇, ⏳, 🔑, 🔒, ⚠️, 🏆, 📝, 🚪, ➕, 👍, 👎
   - Substituídos por texto simples ou caracteres unicode básicos (•, ▲, ▼, ⚔, +)
   - Mantidos apenas `⚔` (espada) como ícone temático do sistema e `★` na tela inicial

**Como funciona o upload de fotos de personagens novos:**
- Na tela NovaBatalha, quando o personagem não existe no banco:
  1. O usuário pode selecionar uma foto do computador → foto é enviada ao Storage em `personagens/outros/`
  2. Ou clicar "Usar placeholder padrão" → uma URL externa de placeholder é salva no campo `imagem`
  3. O caminho salvo no banco é sempre um path relativo (ex: `outros/123456_nome.png`) ou uma URL HTTP completa para o placeholder
  4. A função `getImagemUrl()` monta a URL final concatenando `BUCKET_URL + path` para caminhos relativos
