# Backlog

## Concluído

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
