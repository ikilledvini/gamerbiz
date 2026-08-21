# Sitemap em /sitemap.xml

O arquivo enviado está vazio (apenas o cabeçalho XML, sem nenhuma URL). Em vez de servir esse arquivo vazio, crio a rota `/sitemap.xml` gerando o mesmo formato XML, porém já preenchido com as páginas reais do site — inclusive as dinâmicas.

## O que será feito

Nova rota de servidor `src/routes/sitemap[.]xml.ts` respondendo em `https://idea-to-site-muse.lovable.app/sitemap.xml` com `Content-Type: application/xml`.

URLs incluídas:

- Estáticas: `/`, `/links`, `/blogs`, `/mediakit`, `/politica-de-privacidade`, `/termos-de-servico`, `/privacy/{pt,en,es,zh}`, `/tos/{pt,en,es,zh}`
- Dinâmicas: um item por post publicado (`/blogs/{slug}`) e um por talento publicado (`/mediakit/{slug}`), usando as mesmas fontes e filtros (`status = published`) das páginas correspondentes
- Fora do sitemap: `/auth`, `/admin`, `/creator`, `/change-password` (áreas internas/autenticadas)

Prioridades: home `1.0`, diretórios (`/mediakit`, `/blogs`) `0.8`, demais `0.5`–`0.6`. Sem `<lastmod>` inventado — só será usado se houver data real de publicação do post.

## Detalhes técnicos

- Rota criada com `createFileRoute("/sitemap.xml")` e handler `GET`, seguindo o padrão de rotas de servidor do TanStack Start (o `[.]` no nome do arquivo escapa o ponto).
- Os slugs dinâmicos são lidos diretamente pelo cliente público do backend dentro do handler, filtrando por `status = published`.
- Se a consulta ao backend falhar, o sitemap ainda retorna as rotas estáticas.
- Cache: `public, max-age=3600`.
- `public/robots.txt` fica como está (crawlers encontram `/sitemap.xml` no caminho padrão); adiciono a diretiva `Sitemap:` se você preferir.
