# Design System - Fit Moderno

Arquivo extraido da landing em `index.html`, com base principalmente em:

- `wp-content/uploads/elementor/css/post-197.css`
- `wp-content/uploads/elementor/css/post-11.css`
- `use.typekit.net/dnm0imh.css`

## Direcao visual

Landing de suplemento com estetica fitness/e-commerce: alto contraste, fundos escuros, produto em destaque, verde-lima como cor de acao e tipografia condensada grande. A comunicacao visual e direta, promocional e orientada para conversao.

## Tokens de cor

```css
:root {
  --fm-black: #111111;
  --fm-white: #ffffff;
  --fm-gray-bg: #f2f2f2;
  --fm-gray-text: #6b6b6b;
  --fm-muted: #c3c3c3;
  --fm-card-dark: #1e1e1e;
  --fm-card-dark-2: #1d1d1d;

  --fm-brand: #a1c41e;
  --fm-brand-alt: #a3c617;
  --fm-cta-text: #000000;

  --fm-button-icon-border: #092934;
  --fm-hover-accent: #e79523;
  --fm-border-soft: #dfe9ef50;

  --fm-shadow-card: 0 15px 80px rgba(0, 0, 0, 0.1);
}
```

### Uso das cores

- `#111111`: fundo escuro principal e texto forte.
- `#ffffff`: texto sobre fundos escuros e cards claros.
- `#f2f2f2`: fundos de secoes claras.
- `#a1c41e`: CTAs, palavras destacadas, marca e elementos de conversao.
- `#a3c617`: faixa verde secundaria.
- `#6b6b6b`, `#c3c3c3`, `#474747`: textos secundarios e informacoes de apoio.
- `#e79523`: estado hover do icone do botao.

## Tipografia

```css
:root {
  --fm-font-display: "obviously-narrow", sans-serif;
  --fm-font-body: "Archivo", sans-serif;
  --fm-font-support: "Montserrat", sans-serif;
}
```

### Escala tipografica

```css
.fm-hero-title {
  font-family: var(--fm-font-display);
  font-size: 80px;
  font-weight: 600;
  color: var(--fm-white);
}

.fm-section-title {
  font-family: var(--fm-font-display);
  font-size: 40px;
  font-weight: 700;
}

.fm-kicker {
  font-family: var(--fm-font-display);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 6px;
}

.fm-body {
  font-family: var(--fm-font-body);
  font-size: 16px;
  font-weight: 400;
}

.fm-small {
  font-family: var(--fm-font-body);
  font-size: 14px;
  font-weight: 400;
  line-height: 17px;
}

.fm-price {
  font-family: var(--fm-font-body);
  font-size: 35px;
  font-weight: 700;
  line-height: 35px;
}

.fm-support-title {
  font-family: var(--fm-font-support);
  font-size: 40px;
  font-weight: 500;
}
```

### Mobile

```css
@media (max-width: 767px) {
  .fm-hero-title {
    font-size: 35px;
    line-height: 1.1;
  }

  .fm-section-title {
    font-size: 35px;
  }

  .fm-support-title {
    font-size: 30px;
  }
}
```

## Layout

```css
:root {
  --fm-container-desktop: 1140px;
  --fm-container-tablet: 1024px;
  --fm-container-mobile: 767px;
  --fm-widget-gap: 20px;
  --fm-section-gap: 50px;
}
```

### Padroes de secao

```css
.fm-section {
  width: 100%;
}

.fm-container {
  max-width: var(--fm-container-desktop);
  margin-inline: auto;
}

.fm-section-dark {
  background-color: var(--fm-black);
  color: var(--fm-white);
}

.fm-section-light {
  background-color: var(--fm-gray-bg);
  color: var(--fm-black);
}

.fm-hero {
  min-height: 930px;
  background-color: var(--fm-black);
  background-position: top center;
  background-size: cover;
}

.fm-proof-section {
  min-height: 675px;
}

.fm-product-section {
  min-height: 1520px;
  background-color: var(--fm-black);
  background-position: top center;
  background-size: cover;
}

@media (max-width: 767px) {
  .fm-section {
    padding-inline: 20px;
  }

  .fm-hero {
    min-height: 230px;
    padding: 50px 20px 400px;
    background-position: bottom center;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
}
```

## Botoes

CTA principal em formato pill, verde-lima, texto preto e icone circular a direita.

```css
.fm-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  background: var(--fm-brand);
  color: var(--fm-cta-text);
  font-family: var(--fm-font-body);
  font-size: 16px;
  font-weight: 500;
  border-radius: 999px;
  padding: 25px 120px 25px 30px;
  text-decoration: none;
  border: 0;
  z-index: 1;
}

.fm-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--fm-brand);
  border-radius: 500px;
  opacity: 0;
  transition: opacity 0.5s linear;
  z-index: -1;
}

.fm-button:hover::before {
  opacity: 1;
  animation: fm-pulse 1.5s infinite;
}

.fm-button-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 1px solid var(--fm-button-icon-border);
  border-radius: 10em;
  background: transparent;
}

.fm-button-icon svg {
  width: 18px;
  fill: var(--fm-black);
  transition: 0.6s ease;
}

.fm-button:hover .fm-button-icon svg {
  transform: rotate(360deg);
  fill: var(--fm-hover-accent);
}

@keyframes fm-pulse {
  0% {
    box-shadow: 0 0 0 0 var(--fm-brand);
  }
  70% {
    box-shadow: 0 0 0 10px rgb(255 255 255 / 0%);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(255 255 255 / 0%);
  }
}
```

## Cards

```css
.fm-card {
  background: #fcfcfc;
  color: var(--fm-black);
  border-radius: 20px;
  box-shadow: var(--fm-shadow-card);
}

.fm-card-dark {
  background: var(--fm-card-dark);
  color: var(--fm-white);
}

.fm-product-card {
  min-height: 670px;
  border-radius: 20px;
  box-shadow: var(--fm-shadow-card);
}

.fm-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 99999px;
  padding: 7px 10px 5px;
  font-family: var(--fm-font-body);
  font-size: 13px;
  font-weight: 500;
}

.fm-image-rounded {
  border-radius: 10px;
}
```

## Icones

- Icones grandes em beneficios: `52px`.
- Icones decorativos em secoes: `80px`, `100px`, `130px` e ate `425px`.
- Icones dos botoes: `18px` dentro de circulo de `50px`.

## Imagens principais

```txt
Hero desktop: wp-content/uploads/2025/11/Frame-2cx-copiar.webp
Hero mobile: wp-content/uploads/2025/11/Frame-390as-copiar.webp
Secao produto: wp-content/uploads/2025/11/Frame-371xz-copiar.webp
Produto unitario: wp-content/uploads/2025/11/Group-404-copiar.webp
Kit 3 meses: wp-content/uploads/2025/11/Group-399-copiar.webp
Kit 2 meses: wp-content/uploads/2025/11/Group-401-copiar.webp
Garantia: wp-content/uploads/2025/11/Group-406-copiar.webp
Logo: wp-content/uploads/2025/11/logo-soufit_2025-01.svg
```

## Componentes

### Hero

- Fundo escuro com imagem full-bleed.
- Logo verde no topo.
- Titulo grande e condensado.
- Texto de apoio em `Archivo 16px`.
- Lista de beneficios com icones grandes.
- CTA verde com icone circular.

### Prova social

- Fundo cinza claro.
- Kicker com estrelas e `letter-spacing: 6px`.
- Titulo com palavra destacada em verde.
- Carrossel de imagens com cantos de `10px`.
- Slides laterais com blur e opacidade reduzida em desktop.

### Beneficios

- Fundo preto ou imagem escura.
- Cards/textos alternados.
- Titulos condensados `35px` ou `40px`.
- Texto `Archivo 16px`.
- Icones grandes como apoio visual.

### Precos

- Cards claros com raio `20px` e sombra.
- Produto no topo.
- Nome em `obviously-narrow`.
- Periodo em botao/pill.
- Preco em `Archivo 35px bold`.
- Preco antigo em `18px`, peso `400`.
- CTA verde no rodape do card.
- Badge de desconto em pílula.

### FAQ

- Fundo claro.
- Perguntas em `Archivo 15px`.
- Itens com separadores leves.
- Layout limpo, sem excesso de borda.

## Regras de aplicacao

- Usar `#A1C41E` apenas para acao, marca e palavras de destaque.
- Manter titulos curtos, grandes e condensados.
- Usar `Archivo` para qualquer texto funcional ou explicativo.
- CTAs devem ser sempre verdes, arredondados e com icone circular a direita.
- Cards devem usar raio de `20px`; imagens internas usam raio de `10px`.
- Em mobile, reduzir laterais para `20px`, empilhar colunas e manter titulos perto de `35px`.
- Evitar gradientes decorativos; a pagina trabalha com contraste, produto, fotos reais e blocos solidos.
