# Corrigir o favicon para o Google

## O que o relatório mostra

O HTML publicado está correto no essencial: a tag do favicon existe no `<head>` do site (`<link rel="icon" type="image/png" href="/favicon.png">`), o arquivo responde normalmente em `https://gamerbiz.com.br/favicon.png` (200, image/png) e o `robots.txt` não bloqueia nada.

O único ponto fora das exigências do Google: o arquivo tem **64x64 px**. O Google pede um ícone quadrado com lado **múltiplo de 48 px** (48, 96, 144, 192...). Ícones fora dessa medida costumam ser ignorados e o Google mostra o globo padrão.

## O que vou fazer

1. Gerar o favicon em 96x96 e 192x192 a partir da arte atual (escudo vermelho Gamerbiz), mantendo a mesma identidade.
2. Salvar `public/favicon.png` (96x96), `public/favicon-192.png` e um `public/favicon.ico` como fallback clássico.
3. Declarar os três no `head()` da rota raiz (`src/routes/__root.tsx`), com `sizes` corretos e um `apple-touch-icon`.
4. Adicionar a linha `Sitemap: https://gamerbiz.com.br/sitemap.xml` ao `public/robots.txt`, que hoje está sem ela.

## Depois de publicar

O Google só troca o favicon quando rastreia a home de novo — pode levar de dias a algumas semanas. Dá para acelerar pedindo reindexação da home no Search Console.
