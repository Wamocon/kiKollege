/** Die Arten von Werkzeugen, nach denen die Steckbriefe und die Werkzeugmatrix
 *  auf /mannschaft gruppieren. Jede Art hat ein Symbol in
 *  components/WerkzeugSymbol.tsx. Eine neue Art kommt hier und dort dazu. */
export const werkzeugArten = [
  'dateien',
  'kommandozeile',
  'board',
  'websuche',
  'browser',
  'bilder',
  'skills',
  'gedaechtnis',
  'aufgabenliste',
  'rueckfrage',
  'bot',
  'verzeichnis',
  'modell',
] as const

export type WerkzeugArt = (typeof werkzeugArten)[number]
