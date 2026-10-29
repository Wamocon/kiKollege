import { Fussleiste } from '@/components/landing/Fussleiste'
import { Kopfleiste } from '@/components/landing/Kopfleiste'
import { LandingAbschnitte } from '@/components/landing/LandingAbschnitte'

export default function Landing() {
  return (
    <>
      <Kopfleiste />

      <main id="inhalt">
        <LandingAbschnitte />
      </main>

      <Fussleiste />
    </>
  )
}
