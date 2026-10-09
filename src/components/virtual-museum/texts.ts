import { useLanguage } from "../../i18n/LanguageContext";
import type { Locale } from "../../i18n/translations";

/**
 * Textos del Entorno Virtual (es/en/pt).
 * Viven en el módulo para no depender de claves agregadas a mano en
 * i18n/translations.ts: el sitio existente queda intacto.
 */
const es: Record<string, string> = {
  "room.entrada": "Vestíbulo",
  "room.galeria": "Galería central",
  "room.sala1": "Sala I",
  "room.sala2": "Sala II",
  "room.sala3": "Sala III",
  "room.sala4": "Sala IV",
  "room.principal": "Sala principal",

  "loading.title": "Preparando el entorno virtual",
  "loading.hint": "Cargando arquitectura e iluminación…",

  "welcome.title": "Bienvenido al Entorno Virtual del MUVA",
  "welcome.text":
    "Recorre las salas del museo, descubre las obras y selecciona cada escultura para conocer más sobre ella.",
  "welcome.start": "Comenzar la visita",
  "welcome.controls": "Controles",
  "welcome.wasd": "W A S D — caminar",
  "welcome.mouse": "Ratón — mirar alrededor",
  "welcome.click": "Clic — seleccionar una obra",
  "welcome.esc": "ESC — cerrar paneles",
  "welcome.f": "F — pantalla completa",
  "welcome.touchMove": "Joystick — caminar",
  "welcome.touchLook": "Deslizar — mirar alrededor",
  "welcome.touchTap": "Tocar una obra — ver su ficha",
  "welcome.exit": "Salir del entorno",
  "welcome.slow":
    "Conexión lenta detectada: las obras se cargan a medida que te acercas.",

  "hud.map": "Mapa",
  "hud.help": "Controles",
  "hud.exit": "Salir",
  "hud.fullscreen": "Pantalla completa",
  "hud.exitFullscreen": "Salir de pantalla completa",
  "hud.brand": "Entorno Virtual",
  "hud.lockHint": "Haz clic para mirar alrededor",
  "hud.lockHintTouch": "Desliza el dedo para mirar alrededor",
  "hud.interact": "Ver ficha",
  "hud.nearby": "Obra seleccionada",
  "hud.keyboard": "WASD moverse · Ratón mirar · Clic ver ficha",
  "hud.joystick": "Mover",

  "hover.open": "Ver ficha",
  "hover.title": "Obra",

  "panel.ariaLabel": "Ficha de la obra",
  "panel.close": "Cerrar",
  "panel.view360": "Ver obra en 360°",
  "panel.artist": "Autor",
  "panel.year": "Año",
  "panel.material": "Material",
  "panel.dimensions": "Dimensiones",
  "panel.inventory": "N.° de inventario",
  "panel.description": "Descripción",
  "panel.iconografia": "Iconografía",
  "panel.context": "Contexto histórico",
  "panel.audio": "Audioguía",
  "panel.noImage": "Imagen no disponible",
  "panel.work": "Obra",

  "v360.title": "Obra en 360°",
  "v360.close": "Cerrar vista",
  "v360.zoomIn": "Acercar",
  "v360.zoomOut": "Alejar",
  "v360.reset": "Restablecer vista",
  "v360.hint": "Arrastra para rotar · Rueda o pellizco para zoom",
  "v360.loading": "Cargando modelo…",
  "v360.error": "No se pudo cargar el modelo 3D.",

  "map.title": "Mapa del recorrido",
  "map.close": "Cerrar mapa",
  "map.you": "Estás aquí",
  "map.works": "Obras",
  "map.hint": "Toca una sala del plano para orientarte durante la visita.",

  "help.title": "Controles de la visita",

  "error.title": "No se pudo iniciar el entorno virtual",
  "error.desc":
    "Tu navegador no dispone de WebGL o se produjo un error gráfico. Puedes reintentar o volver al sitio.",
  "error.retry": "Reintentar",
  "error.exit": "Volver al inicio",
  "error.model": "Esta obra no pudo cargarse en el recorrido.",
};

const en: Record<string, string> = {
  "room.entrada": "Entrance Hall",
  "room.galeria": "Central Gallery",
  "room.sala1": "Room I",
  "room.sala2": "Room II",
  "room.sala3": "Room III",
  "room.sala4": "Room IV",
  "room.principal": "Main Hall",

  "loading.title": "Preparing the virtual environment",
  "loading.hint": "Loading architecture and lighting…",

  "welcome.title": "Welcome to the MUVA Virtual Environment",
  "welcome.text":
    "Walk through the museum rooms, discover the works and select each sculpture to learn more about it.",
  "welcome.start": "Start the visit",
  "welcome.controls": "Controls",
  "welcome.wasd": "W A S D — walk",
  "welcome.mouse": "Mouse — look around",
  "welcome.click": "Click — select a work",
  "welcome.esc": "ESC — close panels",
  "welcome.f": "F — full screen",
  "welcome.touchMove": "Joystick — walk",
  "welcome.touchLook": "Swipe — look around",
  "welcome.touchTap": "Tap a work — view its details",
  "welcome.exit": "Leave the environment",
  "welcome.slow":
    "Slow connection detected: works load as you get closer.",

  "hud.map": "Map",
  "hud.help": "Controls",
  "hud.exit": "Exit",
  "hud.fullscreen": "Full screen",
  "hud.exitFullscreen": "Exit full screen",
  "hud.brand": "Virtual Environment",
  "hud.lockHint": "Click to look around",
  "hud.lockHintTouch": "Swipe to look around",
  "hud.interact": "View details",
  "hud.nearby": "Selected work",
  "hud.keyboard": "WASD move · Mouse look · Click view details",
  "hud.joystick": "Move",

  "hover.open": "View details",
  "hover.title": "Work",

  "panel.ariaLabel": "Work details",
  "panel.close": "Close",
  "panel.view360": "View work in 360°",
  "panel.artist": "Artist",
  "panel.year": "Year",
  "panel.material": "Material",
  "panel.dimensions": "Dimensions",
  "panel.inventory": "Inventory no.",
  "panel.description": "Description",
  "panel.iconografia": "Iconography",
  "panel.context": "Historical context",
  "panel.audio": "Audio guide",
  "panel.noImage": "Image not available",
  "panel.work": "Work",

  "v360.title": "Work in 360°",
  "v360.close": "Close view",
  "v360.zoomIn": "Zoom in",
  "v360.zoomOut": "Zoom out",
  "v360.reset": "Reset view",
  "v360.hint": "Drag to rotate · Wheel or pinch to zoom",
  "v360.loading": "Loading model…",
  "v360.error": "The 3D model could not be loaded.",

  "map.title": "Visit map",
  "map.close": "Close map",
  "map.you": "You are here",
  "map.works": "Works",
  "map.hint": "Touch a room on the plan to orient yourself during the visit.",

  "help.title": "Visit controls",

  "error.title": "The virtual environment could not start",
  "error.desc":
    "Your browser does not support WebGL or a graphics error occurred. You can retry or go back to the site.",
  "error.retry": "Retry",
  "error.exit": "Back to home",
  "error.model": "This work could not be loaded in the tour.",
};

const pt: Record<string, string> = {
  "room.entrada": "Vestíbulo",
  "room.galeria": "Galeria central",
  "room.sala1": "Sala I",
  "room.sala2": "Sala II",
  "room.sala3": "Sala III",
  "room.sala4": "Sala IV",
  "room.principal": "Sala principal",

  "loading.title": "Preparando o ambiente virtual",
  "loading.hint": "Carregando arquitetura e iluminação…",

  "welcome.title": "Bem-vindo ao Ambiente Virtual do MUVA",
  "welcome.text":
    "Percorra as salas do museu, descubra as obras e selecione cada escultura para saber mais sobre ela.",
  "welcome.start": "Começar a visita",
  "welcome.controls": "Controles",
  "welcome.wasd": "W A S D — andar",
  "welcome.mouse": "Mouse — olhar ao redor",
  "welcome.click": "Clique — selecionar uma obra",
  "welcome.esc": "ESC — fechar painéis",
  "welcome.f": "F — tela cheia",
  "welcome.touchMove": "Joystick — andar",
  "welcome.touchLook": "Deslizar — olhar ao redor",
  "welcome.touchTap": "Toque numa obra — ver sua ficha",
  "welcome.exit": "Sair do ambiente",
  "welcome.slow":
    "Conexão lenta detectada: as obras carregam conforme você se aproxima.",

  "hud.map": "Mapa",
  "hud.help": "Controles",
  "hud.exit": "Sair",
  "hud.fullscreen": "Tela cheia",
  "hud.exitFullscreen": "Sair da tela cheia",
  "hud.brand": "Ambiente Virtual",
  "hud.lockHint": "Clique para olhar ao redor",
  "hud.lockHintTouch": "Deslize o dedo para olhar ao redor",
  "hud.interact": "Ver ficha",
  "hud.nearby": "Obra selecionada",
  "hud.keyboard": "WASD mover · Mouse olhar · Clique ver ficha",
  "hud.joystick": "Mover",

  "hover.open": "Ver ficha",
  "hover.title": "Obra",

  "panel.ariaLabel": "Ficha da obra",
  "panel.close": "Fechar",
  "panel.view360": "Ver obra em 360°",
  "panel.artist": "Autor",
  "panel.year": "Ano",
  "panel.material": "Material",
  "panel.dimensions": "Dimensões",
  "panel.inventory": "N.° de inventário",
  "panel.description": "Descrição",
  "panel.iconografia": "Iconografia",
  "panel.context": "Contexto histórico",
  "panel.audio": "Audioguia",
  "panel.noImage": "Imagem não disponível",
  "panel.work": "Obra",

  "v360.title": "Obra em 360°",
  "v360.close": "Fechar visão",
  "v360.zoomIn": "Aproximar",
  "v360.zoomOut": "Afastar",
  "v360.reset": "Restaurar visão",
  "v360.hint": "Arraste para girar · Roda ou pinça para zoom",
  "v360.loading": "Carregando modelo…",
  "v360.error": "Não foi possível carregar o modelo 3D.",

  "map.title": "Mapa do percurso",
  "map.close": "Fechar mapa",
  "map.you": "Você está aqui",
  "map.works": "Obras",
  "map.hint": "Toque numa sala do plano para se orientar durante a visita.",

  "help.title": "Controles da visita",

  "error.title": "Não foi possível iniciar o ambiente virtual",
  "error.desc":
    "Seu navegador não tem WebGL ou ocorreu um erro gráfico. Você pode tentar novamente ou voltar ao site.",
  "error.retry": "Tentar novamente",
  "error.exit": "Voltar ao início",
  "error.model": "Esta obra não pôde ser carregada no percurso.",
};

const texts: Record<Locale, Record<string, string>> = { es, en, pt };

export function vmText(key: string, locale: Locale): string {
  return texts[locale]?.[key] ?? es[key] ?? key;
}

export function useVmText() {
  const { locale } = useLanguage();
  return (key: string) => vmText(key, locale);
}
