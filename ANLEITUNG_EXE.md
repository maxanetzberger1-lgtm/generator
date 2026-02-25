# TexSheet Builder — Echtes Windows-Programm (.exe)

## Einmalig vorbereiten

Eingabeaufforderung im Projektordner öffnen:

```
npm install
```

## Exe bauen

```
npm run electron:build
```

Wenn der Build beim Code-Signing hängt → mit diesem Befehl starten:

```
set CSC_IDENTITY_AUTO_DISCOVERY=false && npm run electron:build
```

## Ergebnis

```
release/
  TexSheet Builder 1.0.0.exe   ← Fertiges Programm, direkt startbar
```

Doppelklick → Programm öffnet sich als echtes Windows-Fenster,
kein Browser, kein Server, nichts weiteres nötig.

Die .exe kann kopiert und weitergegeben werden.
