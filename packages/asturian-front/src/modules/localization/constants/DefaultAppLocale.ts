import { type APP_LOCALES } from 'zyra-shared/translations';

// Zyra: idioma padrão do produto (Brasil).
// Diferente do SOURCE_LOCALE (idioma-fonte do código / fallback de build): este é o
// locale que novos usuários e a tela pré-login assumem quando não há preferência definida.
export const DEFAULT_APP_LOCALE: keyof typeof APP_LOCALES = 'pt-BR';
