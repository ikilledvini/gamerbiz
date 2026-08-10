# Plano: Páginas de Media Kit individuais profissionais

## Objetivo
Deixar a rota `/mediakit/$slug` como uma página profissional de venda do creator, com estatísticas, bio, redes sociais, destaques e botão de contato comercial.

## O que será feito

1. **Banco de dados (migração)**
   - Adicionar à tabela `talents` os campos:
     - `instagram_url`, `tiktok_url`, `youtube_url`, `twitch_url`, `twitter_url`
     - `followers` (texto, ex: "1.2M")
     - `avg_views` (média de visualizações)
     - `engagement` (taxa de engajamento)
     - `audience` (demografia/idade/localização)
     - `achievements` (destaques/parcerias anteriores)
     - `contact_email` (e-mail comercial)
   - `GRANT` já cobre a tabela; só atualiza o schema.

2. **Backend**
   - Atualizar `TalentRow`, `TalentInput` e `mapTalentRow` em `src/lib/talent-mapper.ts`.
   - Atualizar `TALENT_COLUMNS` para trazer os novos campos.
   - Ajustar `adminSaveTalent` para persistir os novos dados.

3. **Admin `/admin`**
   - Incluir campos de redes sociais e estatísticas no formulário de criação/edição.

4. **Página pública `/mediakit/$slug`**
   - Hero com foto do creator, nome, username, nicho e cidade.
   - Cards de estatísticas (seguidores, visualizações médias, engajamento, audiência).
   - Bio/destaques em texto corrido + lista de conquistas.
   - Botões de redes sociais (Instagram, TikTok, YouTube, Twitch, X).
   - Botão "Entrar em contato" que abre `mailto:` ou link de contato.
   - Botão de compartilhar já existente será mantido.
   - Layout responsivo, estilo escuro com vermelho Gamerbiz.

5. **i18n**
   - Adicionar chaves de tradução em PT, EN, ES e CH para os novos rótulos e botões.

6. **SEO**
   - Manter `head()` com título, descrição, OG, canonical e adicionar JSON-LD do tipo `ProfilePage` quando houver dados.

## Resultado esperado
Cada creator publicado terá uma página de media kit própria, pronta para ser enviada para marcas, com informações comerciais e botão de contato.
