import type { ComponentType } from 'react'

import { ArchivarAvatar, ArchivarGrenze, ArchivarIso, ArchivarLinie, ArchivarSinnbild } from './archivar'
import { ArnoldAvatar, ArnoldGrenze, ArnoldIso, ArnoldLinie, ArnoldSinnbild } from './arnold'
import { EntwicklerAvatar, EntwicklerGrenze, EntwicklerIso, EntwicklerLinie, EntwicklerSinnbild } from './entwickler'
import { FritzAvatar, FritzGrenze, FritzIso, FritzLinie, FritzSinnbild } from './fritz'
import { GregorAvatar, GregorGrenze, GregorIso, GregorLinie, GregorSinnbild } from './gregor'
import { HermesAvatar, HermesGrenze, HermesIso, HermesLinie, HermesSinnbild } from './hermes'
import { JuliaAvatar, JuliaGrenze, JuliaIso, JuliaLinie, JuliaSinnbild } from './julia'
import { ReporterAvatar, ReporterGrenze, ReporterIso, ReporterLinie, ReporterSinnbild } from './reporter'
import { TheoAvatar, TheoGrenze, TheoIso, TheoLinie, TheoSinnbild } from './theo'

/** Die fünf Grafiken eines KI-Kollegen: bei der Arbeit, Arbeitsplatz, was er
 *  nie tut, Sinnbild und Kopf. */
export interface Figuren {
  linie: ComponentType
  arbeitsplatz: ComponentType
  grenze: ComponentType
  sinnbild: ComponentType
  kopf: ComponentType
}

/** Nach der Kennung in `mannschaft.koepfe`. Wer hier fehlt, hat noch keine. */
export const FIGUREN: Record<string, Figuren> = {
  orchestrator: { linie: HermesLinie, arbeitsplatz: HermesIso, grenze: HermesGrenze, sinnbild: HermesSinnbild, kopf: HermesAvatar },
  reviewer: { linie: FritzLinie, arbeitsplatz: FritzIso, grenze: FritzGrenze, sinnbild: FritzSinnbild, kopf: FritzAvatar },
  researcherin: { linie: JuliaLinie, arbeitsplatz: JuliaIso, grenze: JuliaGrenze, sinnbild: JuliaSinnbild, kopf: JuliaAvatar },
  reporter: { linie: ReporterLinie, arbeitsplatz: ReporterIso, grenze: ReporterGrenze, sinnbild: ReporterSinnbild, kopf: ReporterAvatar },
  architekt: { linie: ArnoldLinie, arbeitsplatz: ArnoldIso, grenze: ArnoldGrenze, sinnbild: ArnoldSinnbild, kopf: ArnoldAvatar },
  archivar: { linie: ArchivarLinie, arbeitsplatz: ArchivarIso, grenze: ArchivarGrenze, sinnbild: ArchivarSinnbild, kopf: ArchivarAvatar },
  entwickler: { linie: EntwicklerLinie, arbeitsplatz: EntwicklerIso, grenze: EntwicklerGrenze, sinnbild: EntwicklerSinnbild, kopf: EntwicklerAvatar },
  seiten: { linie: GregorLinie, arbeitsplatz: GregorIso, grenze: GregorGrenze, sinnbild: GregorSinnbild, kopf: GregorAvatar },
  tester: { linie: TheoLinie, arbeitsplatz: TheoIso, grenze: TheoGrenze, sinnbild: TheoSinnbild, kopf: TheoAvatar },
}
