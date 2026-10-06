// Richtpreise Wien (Faktor 1,15 bereits enthalten), nur Arbeitsleistung, €/m².
// Einzige Quelle für den Preisrechner und die Leistungsseiten.
window.ANADRI_LEISTUNGEN = [
  { id: 'abbruch-entsorgung',     name: 'Abbruch & Entsorgung',    min: 35,  max: 60,  ph: 'z.B. 50',
    desc: 'Fliesen, Böden, Wände und Einbauten entfernen, Bauschutt entsorgen', basis: 'Grundfläche' },
  { id: 'innenrenovierung',       name: 'Innenrenovierung',        min: 250, max: 550, ph: 'z.B. 100',
    desc: 'Teil- oder Komplettrenovierung, alle Gewerke koordiniert', basis: 'Wohnfläche' },
  { id: 'fassade-waermedaemmung', name: 'Fassade & Wärmedämmung',  min: 70,  max: 120, ph: 'z.B. 150',
    desc: 'Wärmedämmverbundsystem, Armierung, Oberputz und Anstrich', basis: 'Fassadenfläche' },
  { id: 'dacharbeiten',           name: 'Dacharbeiten',            min: 60,  max: 140, ph: 'z.B. 120',
    desc: 'Neueindeckung, Reparatur, Dachdämmung, Rinnen und Fallrohre', basis: 'Dachfläche' },
  { id: 'elektroinstallation',    name: 'Elektroinstallation',     min: 95,  max: 200, ph: 'z.B. 100',
    desc: 'Leitungen, Steckdosen, Schalter, Verteiler und FI-Schutzschalter', basis: 'Wohnfläche' },
  { id: 'wasser-sanitaer',        name: 'Wasser & Sanitär',        min: 80,  max: 160, ph: 'z.B. 50',
    desc: 'Wasser- und Abwasserleitungen, Bad komplett, Vorwand – ohne Gas', basis: 'Raumfläche' },
  { id: 'maler-anstrich',         name: 'Maler & Anstrich',        min: 6,   max: 13,  ph: 'z.B. 250',
    desc: 'Wände und Decken grundieren und zweimal streichen', basis: 'Wand- und Deckenfläche' },
  { id: 'gipskarton-trockenbau',  name: 'Gipskarton & Trockenbau', min: 37,  max: 74,  ph: 'z.B. 80',
    desc: 'Trennwände, abgehängte Decken und Vorsatzschalen', basis: 'Wand- bzw. Deckenfläche' },
  { id: 'fliesen-bodenbelag',     name: 'Fliesen & Bodenbelag',    min: 24,  max: 44,  ph: 'z.B. 60',
    desc: 'Fliesen, Laminat, Parkett und Vinyl verlegen', basis: 'Verlegefläche' }
];
window.ANADRI_EMAIL = 'info@anadri.ro';
