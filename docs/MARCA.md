# Presuly — manual de marca (mínimo viable)

## La idea

Una **P maciza** con un **check** al lado: el presupuesto aprobado. Verde profundo en vez del azul que usan todas las herramientas de propuestas, porque el color se apropia del momento que vende el producto: *aceptado*.

El logotipo está **vectorizado**: no depende de que Poppins esté instalada en ningún lado.

## Archivos

| Archivo | Cuándo se usa |
|---|---|
| `presuly-logo.svg` | Uso principal, fondo claro (isotipo verde + texto tinta) |
| `presuly-logo-blanco.svg` | Fondo oscuro o foto |
| `presuly-logo-tinta.svg` | Una sola tinta negra: PDF, fax, sellos, impresión barata |
| `presuly-logo-verde.svg` | Una sola tinta verde |
| `presuly-isotipo.svg` (+ `-blanco`, `-tinta`) | Solo el símbolo: avatar, sello, marca de agua |
| `presuly-app-icon.svg` / `-1024.png` / `-512.png` | Ícono de app, tarjeta OpenGraph, redes |
| `apple-touch-icon-180.png` | iOS |
| `presuly-favicon.svg`, `favicon.ico`, `favicon-16/32/48.png` | Navegador |
| `presuly-logo-1200.png` y variantes | Cuando hace falta PNG en vez de SVG |
| `presuly-tokens.css` / `.json` | Colores y tipografía para el proyecto |

Preferí siempre el SVG. Los PNG son para lugares que no aceptan vectores.

## Color

| | Hex | Uso |
|---|---|---|
| Verde Presuly | `#0C6E63` | Marca, botón principal, estado "aceptado" |
| Verde oscuro | `#0A5A51` | Hover y pulsado |
| Verde claro | `#E3F0ED` | Fondos suaves, badges |
| Tinta | `#101917` | Texto principal |
| Papel | `#FBFAF8` | Fondo de la app |
| Borde | `#E3E9E7` | Separadores y bordes de tarjeta |

Estados del presupuesto: borrador `#8A9794` · enviado `#1F6FB2` · visto `#C08A17` · aceptado `#0C6E63` · vencido `#B0402E`.

## Tipografía

**Poppins** (Google Fonts, gratis). 700 para titulares, 500 para etiquetas, 400 para texto. Es geométrica y redonda, igual que el isotipo, así que el conjunto se lee como un sistema y no como un logo pegado a una tipografía cualquiera.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
```

## Reglas de uso

- **Aire libre alrededor:** dejá como mínimo el ancho de la barra vertical de la P a cada lado. Nada entra en ese margen.
- **Tamaño mínimo:** logotipo horizontal, 90 px de ancho en pantalla / 25 mm impreso. Isotipo solo, 16 px.
- **Al pie del presupuesto del cliente**, que es donde más se va a ver, usá el isotipo a 16-18 px en gris `#8A9794` junto al texto "Hecho con **Presuly**". Discreto: si molesta, el emisor paga para sacarlo, y eso también sirve — pero si es feo, se va antes de pagar.
- **Sobre foto o fondo con textura:** usá `presuly-logo-blanco.svg`, nunca el verde.

## Lo que no se hace

- No cambiar el color del isotipo por fuera de la paleta.
- No separar el check de la P ni cambiarle el ángulo.
- No poner el logotipo en vertical, en arco, con sombra, con degradé ni con contorno.
- No reescribir "Presuly" con la fuente del sistema: el logotipo es el archivo, no el texto.
- No encerrar el logotipo horizontal dentro de una caja o pastilla; para eso está el ícono de app.

## Favicon en el HTML

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/presuly-favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
```
