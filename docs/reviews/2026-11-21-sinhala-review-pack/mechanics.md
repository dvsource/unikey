# Mechanics · Sinhala teacher sheet

89 proposed repairs. Read the linked harder question first. Each option number is its authored position. The key is the proposed answer. Compare both languages and check each flagged field.

Most urgent first. Sort by the number of priority 3 findings, then priority 2, then priority 1. Ties use card ID. An empty flag list still needs a bilingual reading.

## phy.mech.c118

Spinning a rigid disc faster increases its moment of inertia about its fixed axle.

දෘඪ තැටියක් එහි ස්ථිර අක්ෂය වටා වේගයෙන් කරකැවූ විට එහි අවස්ථිති සූර්ණය වැඩි වේ.

1. True · සත්‍ය · `moi-depends-on-omega`
2. False · අසත්‍ය · **Key**

Neither the mass nor its distribution about the axle changes.

ස්කන්ධය හෝ අක්ෂය වටා එහි ව්‍යාප්තිය හෝ වෙනස් නොවේ.

**Harder questions**

- [phy.mech.c043](#hard-phy-mech-c043) · A ring and a disc have equal mass and radius. Which has the larger I about the central axis?

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.
- P3 · meaning-read · `/text/si` · English changes the speed of the same disc. Sinhala says it is spun fast. An absolute speed replaces the comparison in the false claim.

## phy.mech.c061

For an upward launch at speed u under constant gravity g, which expression gives the rise to the turning point?

නියත ගුරුත්වජ ත්වරණය g යටතේ u වේගයෙන් සිරස්ව ඉහළට විසි කළ වස්තුව හැරෙන ස්ථානය දක්වා ඉහළ යන උස කුමන ප්‍රකාශනයෙන් ලැබේ ද?

1. u²/(2g) · u²/(2g) · **Key**
2. u/(2g) · u/(2g) · `forgot-square`
3. u²/g · u²/g · `stopped-early`
   - Set the final vertical speed to zero in v² = u² − 2gh. · v² = u² − 2gh හි අවසාන සිරස් වේගය ශූන්‍ය කරන්න.
4. u²/(4g) · u²/(4g) · `wrong-law`
   - Set the final vertical speed to zero in v² = u² − 2gh. · v² = u² − 2gh හි අවසාන සිරස් වේගය ශූන්‍ය කරන්න.

Set the final vertical speed to zero in v² = u² − 2gh.

v² = u² − 2gh හි අවසාන සිරස් වේගය ශූන්‍ය කරන්න.

**Harder questions**

- [phy.mech.t02](#hard-phy-mech-t02) · A ball thrown straight up from the ground passes a point {h} m high twice, {dt} s apart. Launch speed?

**Checks**

- P1 · term-variation · `/explanation/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/options/2/detail/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/options/3/detail/si` · zero: ශූන්‍ය. See the term decision sheet.
- P3 · meaning-read · `/text/si` · Sinhala specifies a vertical launch. English says upward, which also allows an oblique launch. The keyed u²/(2g) needs u to be the vertical component.

## phy.mech.c062

A stone is thrown upwards from a roof in still air with negligible drag. Its time to the street must equal twice its time to the top, even when the street lies below the roof.

වායු ප්‍රතිරෝධය නොසලකා වහලයක සිට ඉහළට විසි කළ ගලකට වීදියට වැටීමට ගත වන කාලය, වීදිය වහලයට පහළින් තිබුණත්, ඉහළම තැනට යාමට ගත වන කාලය මෙන් දෙගුණයකි.

1. True · සත්‍ය · `ignored-condition`
   - The equal flight times refer to points at the same height. The stone also has to fall below roof level. · කාල සම්මිතිය යෙදෙන්නේ එකම උසේ ලක්ෂ්‍යවලටය. ගල වහල මට්ටමට පහළටත් වැටිය යුතුය.
2. False · අසත්‍ය · **Key**

The equal flight times refer to points at the same height. The stone also has to fall below roof level.

කාල සම්මිතිය යෙදෙන්නේ එකම උසේ ලක්ෂ්‍යවලටය. ගල වහල මට්ටමට පහළටත් වැටිය යුතුය.

**Harder questions**

- [phy.mech.t02](#hard-phy-mech-t02) · A ball thrown straight up from the ground passes a point {h} m high twice, {dt} s apart. Launch speed?

**Checks**

- P1 · term-variation · `/explanation/si` · symmetry: සම්මිතිය. See the term decision sheet.
- P1 · term-variation · `/options/0/detail/si` · symmetry: සම්මිතිය. See the term decision sheet.
- P3 · meaning-read · `/text/si` · English explicitly assumes still air as well as negligible drag. Sinhala asks the reader to ignore air resistance and leaves air motion unspecified. Both give the same flight-time result.

## phy.mech.c063

A ball leaves the ground at speed u at angle θ above the horizontal. Ignore air resistance. What is its speed at the highest point for 0° < θ < 90°?

බෝලයක් තිරසට ඉහළින් θ කෝණයකින් u වේගයෙන් විසි කරයි. වායු ප්‍රතිරෝධය නොසලකන්න. 0° < θ < 90° නම් ඉහළම තැනදී එහි වේගය කීය ද?

1. v(hₘₐₓ) = u cos θ · v(hₘₐₓ) = u cos θ · **Key**
2. v(hₘₐₓ) = u sin θ · v(hₘₐₓ) = u sin θ · `sin-cos-swap`
3. v(hₘₐₓ) = 0 · v(hₘₐₓ) = 0 · `v-zero-at-top`
4. v(hₘₐₓ) = u · v(hₘₐₓ) = u · `speed-constant`

Only the vertical velocity vanishes. The horizontal component is unchanged.

ශූන්‍ය වන්නේ සිරස් ප්‍රවේග සංරචකය පමණි. තිරස් සංරචකය වෙනස් නොවේ.

**Harder questions**

- [phy.mech.c026](#hard-phy-mech-c026) · A ball is launched at 60° above the horizontal. Ignore air resistance. A student says its KE is zero at the highest point. Which correction is valid?
- [phy.mech.p03-01](#hard-phy-mech-p03-01) · A stone is thrown at 40° to the horizontal, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-02](#hard-phy-mech-p03-02) · A marble rolls off a table and falls to the floor, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-03](#hard-phy-mech-p03-03) · A parcel drops from a plane flying level, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-04](#hard-phy-mech-p03-04) · A ball is thrown straight up, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-05](#hard-phy-mech-p03-05) · A ball is thrown at 30° to the horizontal, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-06](#hard-phy-mech-p03-06) · A stone falls from a bridge from rest, with no air resistance. Which quantity stays constant?
- [phy.mech.t09](#hard-phy-mech-t09) · A ball is thrown at {angle}° to the horizontal with {K} J of KE. {ask} (No air resistance)

**Checks**

- P1 · term-variation · `/explanation/si` · zero: ශූන්‍ය. See the term decision sheet.
- P3 · meaning-read · `/text/si` · English launches the ball from the ground. Sinhala gives the angle and speed but leaves the starting height open. The requested speed is unaffected.

## phy.mech.c067

Every ball thrown obliquely has exactly half its initial kinetic energy at the top of its path in a vacuum.

රික්තයක ආනතව විසි කළ සෑම වස්තුවකටම පථයේ ඉහළම තැනදී ඉතිරි වන්නේ මුල් චාලක ශක්තියෙන් හරි අඩකි.

1. True · සත්‍ය · `ke-half-at-top`
2. False · අසත්‍ය · **Key**

The energy fraction depends on launch angle because the horizontal velocity remains.

තිරස් ප්‍රවේගය ඉතිරි වන නිසා චාලක ශක්තියේ ඉතිරි භාගය විසි කළ කෝණය මත රඳා පවතී.

**Harder questions**

- [phy.mech.c026](#hard-phy-mech-c026) · A ball is launched at 60° above the horizontal. Ignore air resistance. A student says its KE is zero at the highest point. Which correction is valid?

**Checks**

- P3 · meaning-read · `/text/si` · English makes the claim for every ball. Sinhala extends it to every object. Both claims are false in the projectile model.

## phy.mech.c078

A rider of mass m accelerates downwards at a in a lift, with 0 < a < g. Which expression gives the scale reading in newtons?

විදුලි සෝපානයක m ස්කන්ධයක් ඇති මගියෙක් a ත්වරණයෙන් පහළට ගමන් කරයි. 0 < a < g නම් තරාදියේ කියවීම නිව්ටන්වලින් කීය ද?

1. N = m(g−a) · N = m(g−a) · **Key**
2. N = m(g+a) · N = m(g+a) · `sign`
3. N = mg · N = mg · `ignored-condition`
   - Weight exceeds the upward support force by ma. The scale reads the support force. · බර ඉහළට යෙදෙන ආධාරක බලයට වඩා ma ප්‍රමාණයකින් වැඩිය. තරාදියෙන් කියවෙන්නේ ආධාරක බලයයි.
4. N = g−a · N = g−a · `forgot-mass`

Weight exceeds the upward support force by ma. The scale reads the support force.

බර ඉහළට යෙදෙන ආධාරක බලයට වඩා ma ප්‍රමාණයකින් වැඩිය. තරාදියෙන් කියවෙන්නේ ආධාරක බලයයි.

**Harder questions**

- [phy.mech.c013](#hard-phy-mech-c013) · A lift moving up is slowing down. Compared with mg, the scale reading is?
- [phy.mech.c014](#hard-phy-mech-c014) · A lift moves down at constant speed. Compared with mg, the scale reading is?
- [phy.mech.t04](#hard-phy-mech-t04) · A lift is moving {motion}. Its speed changes by {dv} m s⁻¹ in {t} s. Force from the floor on a {m} kg block?

**Checks**

- P3 · meaning-read · `/text/si` · English specifies downward acceleration. Sinhala describes downward travel with acceleration a. A descending lift that is slowing down has upward acceleration and a different scale reading.

## phy.mech.c090

On a level truck bed the maximum friction on a box of mass m is μmg. What truck acceleration can friction alone just give the box?

තිරස් ලොරි තට්ටුවක m ස්කන්ධයක් ඇති පෙට්ටියකට යෙදිය හැකි උපරිම ඝර්ෂණ බලය μmg වේ. එම බලය පමණක් පෙට්ටියට ලබා දෙන උපරිම ත්වරණය කීය ද?

1. a = μg · a = μg · **Key**
2. a = μmg · a = μmg · `forgot-mass`
3. a = g/μ · a = g/μ · `inverted`
4. a = μ · a = μ · `forgot-g`

Divide the limiting friction by the mass of the box.

සීමාන්ත ඝර්ෂණ බලය පෙට්ටියේ ස්කන්ධයෙන් බෙදන්න.

**Harder questions**

- [phy.mech.c020](#hard-phy-mech-c020) · All four wheels of a car are driven. Greatest possible acceleration on a level road?
- [phy.mech.t06](#hard-phy-mech-t06) · A car with all wheels driven reaches {kmh} km h⁻¹ from rest in {t} s on a level road, at uniform acceleration. Smallest μₛ needed?

**Checks**

- P3 · meaning-read · `/text/si` · English asks how much truck acceleration the friction can give the box. Sinhala asks only for the maximum box acceleration. The values coincide at the no-slip limit.

## phy.mech.c123

A spinner has Iω = 12 kg m² s⁻¹. Its moment of inertia drops from 6 to 3 kg m² with zero external torque. What is its new angular speed in rad s⁻¹?

භ්‍රමණය වන වස්තුවකට Iω = 12 kg m² s⁻¹ වේ. බාහිර ව්‍යාවර්තය ශූන්‍යව තිබියදී අවස්ථිති සූර්ණය 6 සිට 3 kg m² දක්වා අඩු වේ. නව කෝණික වේගය rad s⁻¹ වලින් කීය ද?

1. 4 rad s⁻¹ · 4 rad s⁻¹ · **Key**
2. 2 rad s⁻¹ · 2 rad s⁻¹ · `ignored-condition`
   - Divide the conserved angular momentum by the new moment of inertia. · සංස්ථිතික කෝණික ගම්‍යතාව නව අවස්ථිති සූර්ණයෙන් බෙදන්න.
3. 12 rad s⁻¹ · 12 rad s⁻¹ · `stopped-early`
   - Divide the conserved angular momentum by the new moment of inertia. · සංස්ථිතික කෝණික ගම්‍යතාව නව අවස්ථිති සූර්ණයෙන් බෙදන්න.
4. 0.25 rad s⁻¹ · 0.25 rad s⁻¹ · `inverted`

Divide the conserved angular momentum by the new moment of inertia.

සංස්ථිතික කෝණික ගම්‍යතාව නව අවස්ථිති සූර්ණයෙන් බෙදන්න.

**Harder questions**

- [phy.mech.c038](#hard-phy-mech-c038) · A skater pulls in their arms, and I halves. ω × ?
- [phy.mech.c039](#hard-phy-mech-c039) · A skater pulls in their arms, and I halves. Rotational KE × ?
- [phy.mech.t14](#hard-phy-mech-t14) · A student spins on a smooth turntable at {w0} rad s⁻¹ with I = {I0} kg m². Pulling in the weights makes I = {I1} kg m². New angular speed?

**Checks**

- P2 · review-wording · `/explanation/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.
- P2 · review-wording · `/options/1/detail/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.
- P2 · review-wording · `/options/2/detail/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.
- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.
- P1 · term-variation · `/text/si` · zero: ශූන්‍යව. See the term decision sheet.

## phy.mech.c108

A uniform heavy bar supported at its ends may always be treated as weightless in a moment equation.

දෙකෙළවරින් දරා ඇති ඒකාකාර බර දණ්ඩක ස්වකීය බර සූර්ණ සමීකරණයේදී සෑම විටම නොසලකා හැරිය හැකිය.

1. True · සත්‍ය · `ignored-condition`
   - Its weight acts at its centre. It produces a moment about either end. · එහි බර මධ්‍ය ලක්ෂ්‍යයේ ක්‍රියා කරයි. එබැවින් ඕනෑම කෙළවරක් වටා සූර්ණයක් ඇති කරයි.
2. False · අසත්‍ය · **Key**

Its weight acts at its centre. It produces a moment about either end.

එහි බර මධ්‍ය ලක්ෂ්‍යයේ ක්‍රියා කරයි. එබැවින් ඕනෑම කෙළවරක් වටා සූර්ණයක් ඇති කරයි.

**Harder questions**

- [phy.mech.c032](#hard-phy-mech-c032) · A person walks along a uniform beam from support P to support Q. Pick the graph of the force at Q against distance walked.

**Checks**

- P2 · review-wording · `/explanation/si` · moment of force. ඝූර්ණය Review line 13.
- P2 · review-wording · `/options/0/detail/si` · moment of force. ඝූර්ණය Review line 13.
- P2 · review-wording · `/text/si` · moment of force. ඝූර්ණය Review line 13.

## phy.mech.c107

Zero resultant force alone ensures that a free rigid bar has no angular acceleration.

නිදහස් දෘඪ දණ්ඩක සම්ප්‍රයුක්ත බලය ශූන්‍ය වීම පමණක් එහි කෝණික ත්වරණය ශූන්‍ය වීමට ප්‍රමාණවත්ය.

1. True · සත්‍ය · `wrong-law`
   - A couple has zero resultant force and a nonzero moment. · බල යුග්මයක සම්ප්‍රයුක්ත බලය ශූන්‍ය වුවත් සූර්ණය ශූන්‍ය නොවේ.
2. False · අසත්‍ය · **Key**

A couple has zero resultant force and a nonzero moment.

බල යුග්මයක සම්ප්‍රයුක්ත බලය ශූන්‍ය වුවත් සූර්ණය ශූන්‍ය නොවේ.

**Harder questions**

- [phy.mech.p04-01](#hard-phy-mech-p04-01) · A beam rests on supports P and Q, with a person on it. You need the force at Q. Most direct first step?
- [phy.mech.p04-02](#hard-phy-mech-p04-02) · A plank rests on supports A and B, with a painter on it. You need the force at A. Most direct first step?
- [phy.mech.p04-03](#hard-phy-mech-p04-03) · A rod is hinged at one end and held level by a string at the other. You need the string's tension. Most direct first step?
- [phy.mech.p04-04](#hard-phy-mech-p04-04) · A ladder leans on a smooth wall and stands on rough ground. You need the wall's force. Most direct first step?
- [phy.mech.p04-05](#hard-phy-mech-p04-05) · A shelf is hinged to a wall and held by a sloping strut. You need the strut's force. Most direct first step?
- [phy.mech.p04-06](#hard-phy-mech-p04-06) · A bridge deck rests on piers X and Y, with a truck on it. You need the force at Y. Most direct first step?

**Checks**

- P2 · review-wording · `/explanation/si` · moment of force. ඝූර්ණය Review line 13.
- P2 · review-wording · `/options/0/detail/si` · moment of force. ඝූර්ණය Review line 13.
- P1 · term-variation · `/explanation/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/options/0/detail/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/text/si` · zero: ශූන්‍ය. See the term decision sheet.

## phy.mech.c104

A light bar has supports A and B, 4 m apart. A 12 N weight acts 1 m from A between them. While the bar rests horizontally, what upward force does B exert?

සැහැල්ලු දණ්ඩක A හා B ආධාරක අතර දුර 4 m කි. ඒවා අතර A සිට 1 m දුරින් 12 N බරක් ක්‍රියා කරයි. බාල්කය තිරස්ව නිශ්චලව ඇති විට B යොදන ඉහළට බලය කීය ද?

1. 3 N · 3 N · **Key**
2. 6 N · 6 N · `assumed-symmetry`
3. 9 N · 9 N · `swapped-support`
4. 12 N · 12 N · `stopped-early`
   - Taking moments about A gives Fᵦ × 4 = 12 × 1. · A වටා සූර්ණ ගත් විට Fᵦ × 4 = 12 × 1 වේ.

Taking moments about A gives Fᵦ × 4 = 12 × 1.

A වටා සූර්ණ ගත් විට Fᵦ × 4 = 12 × 1 වේ.

**Harder questions**

- [phy.mech.c032](#hard-phy-mech-c032) · A person walks along a uniform beam from support P to support Q. Pick the graph of the force at Q against distance walked.
- [phy.mech.p04-01](#hard-phy-mech-p04-01) · A beam rests on supports P and Q, with a person on it. You need the force at Q. Most direct first step?
- [phy.mech.p04-02](#hard-phy-mech-p04-02) · A plank rests on supports A and B, with a painter on it. You need the force at A. Most direct first step?
- [phy.mech.p04-03](#hard-phy-mech-p04-03) · A rod is hinged at one end and held level by a string at the other. You need the string's tension. Most direct first step?
- [phy.mech.p04-04](#hard-phy-mech-p04-04) · A ladder leans on a smooth wall and stands on rough ground. You need the wall's force. Most direct first step?
- [phy.mech.p04-05](#hard-phy-mech-p04-05) · A shelf is hinged to a wall and held by a sloping strut. You need the strut's force. Most direct first step?
- [phy.mech.p04-06](#hard-phy-mech-p04-06) · A bridge deck rests on piers X and Y, with a truck on it. You need the force at Y. Most direct first step?
- [phy.mech.t11](#hard-phy-mech-t11) · The figure shows a uniform {M} kg beam on supports at P and Q, with a {m} kg person standing on it. Force from support Q?

**Checks**

- P2 · review-wording · `/explanation/si` · moment of force. ඝූර්ණය Review line 13.
- P2 · review-wording · `/options/3/detail/si` · moment of force. ඝූර්ණය Review line 13.

## phy.mech.c109

For a sloping bar and a vertical weight, the horizontal separation from the pivot to the weight’s line of action gives the moment arm.

ආනත දණ්ඩක් මත සිරස් බරක් සඳහා සූර්ණ භුජය වන්නේ අසව්ව හා බරේ ක්‍රියා රේඛාව අතර තිරස් පරතරයයි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `wrong-quantity`
   - The arm is perpendicular to the vertical force. · බාහුව සිරස් බලයට ලම්බකය.

The arm is perpendicular to the vertical force.

බාහුව සිරස් බලයට ලම්බකය.

**Harder questions**

- [phy.mech.t11](#hard-phy-mech-t11) · The figure shows a uniform {M} kg beam on supports at P and Q, with a {m} kg person standing on it. Force from support Q?

**Checks**

- P2 · review-wording · `/text/si` · moment arm. Use the ඝූර්ණ root. Review line 13.
- P2 · review-wording · `/text/si` · moment of force. ඝූර්ණය Review line 13.

## phy.mech.c106

Taking moments about a pin removes the unknown force acting at that pin from the moment equation.

ඇණයක් වටා සූර්ණ ගත් විට එම ඇණය මත ක්‍රියා කරන නොදන්නා බලය සූර්ණ සමීකරණයෙන් ඉවත් වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `unknown-not-eliminated`

Its line of action passes through the pivot, giving zero perpendicular distance.

එහි ක්‍රියා රේඛාව අසව්ව හරහා යන නිසා ලම්බ දුර ශූන්‍ය වේ.

**Harder questions**

- [phy.mech.p04-01](#hard-phy-mech-p04-01) · A beam rests on supports P and Q, with a person on it. You need the force at Q. Most direct first step?
- [phy.mech.p04-02](#hard-phy-mech-p04-02) · A plank rests on supports A and B, with a painter on it. You need the force at A. Most direct first step?
- [phy.mech.p04-03](#hard-phy-mech-p04-03) · A rod is hinged at one end and held level by a string at the other. You need the string's tension. Most direct first step?
- [phy.mech.p04-04](#hard-phy-mech-p04-04) · A ladder leans on a smooth wall and stands on rough ground. You need the wall's force. Most direct first step?
- [phy.mech.p04-05](#hard-phy-mech-p04-05) · A shelf is hinged to a wall and held by a sloping strut. You need the strut's force. Most direct first step?
- [phy.mech.p04-06](#hard-phy-mech-p04-06) · A bridge deck rests on piers X and Y, with a truck on it. You need the force at Y. Most direct first step?

**Checks**

- P2 · review-wording · `/text/si` · moment of force. ඝූර්ණය Review line 13.
- P1 · term-variation · `/explanation/si` · zero: ශූන්‍ය. See the term decision sheet.

## phy.mech.c127

With zero external torque angular velocity stays fixed even if the moment of inertia changes.

බාහිර ව්‍යාවර්තය ශූන්‍ය නම් අවස්ථිති සූර්ණය වෙනස් වුවත් කෝණික ප්‍රවේගය නියතව පවතී.

1. True · සත්‍ය · `wrong-law`
   - The conserved product is Iω. · සංස්ථිතිකව පවතින්නේ Iω ගුණිතයයි.
2. False · අසත්‍ය · **Key**

The conserved product is Iω.

සංස්ථිතිකව පවතින්නේ Iω ගුණිතයයි.

**Harder questions**

- [phy.mech.p05-01](#hard-phy-mech-p05-01) · A diver tucks in mid-air and spins faster. Most direct principle for the new spin rate?
- [phy.mech.p05-02](#hard-phy-mech-p05-02) · Clay drops onto a spinning disc and sticks. Most direct principle for the new spin rate?
- [phy.mech.p05-03](#hard-phy-mech-p05-03) · A solid cylinder rolls down a slope from rest. Most direct principle for its speed at the bottom?
- [phy.mech.p05-04](#hard-phy-mech-p05-04) · A wheel falls, unwinding a string round its axle. Most direct principle for its speed after a known drop?

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.
- P1 · term-variation · `/text/si` · zero: ශූන්‍ය. See the term decision sheet.

## phy.mech.c105

A mass m hangs at horizontal distance d from a pivot. Which expression gives the magnitude of the moment of its weight?

අසව්වක සිට තිරස් දුර d හි m ස්කන්ධයක් එල්ලා ඇත. එහි බර නිසා අසව්ව වටා ඇති බල සූර්ණයේ විශාලත්වය කීය ද?

1. τ = mgd · τ = mgd · **Key**
2. τ = md · τ = md · `forgot-g`
3. τ = gd · τ = gd · `forgot-mass`
4. τ = mgd² · τ = mgd² · `wrong-power`

Multiply the weight mg by the perpendicular distance d.

mg බර එහි ක්‍රියා රේඛාවට ඇති ලම්බ දුර d න් ගුණ කරන්න.

**Harder questions**

- [phy.mech.c032](#hard-phy-mech-c032) · A person walks along a uniform beam from support P to support Q. Pick the graph of the force at Q against distance walked.
- [phy.mech.t11](#hard-phy-mech-t11) · The figure shows a uniform {M} kg beam on supports at P and Q, with a {m} kg person standing on it. Force from support Q?

**Checks**

- P2 · review-wording · `/text/si` · moment of force. ඝූර්ණය Review line 13.

## phy.mech.c117

The moment of inertia of the same rod can differ for an axis through its end and a parallel axis through its centre.

එකම දණ්ඩක කෙළවරින් යන අක්ෂයක් හා ඊට සමාන්තරව මැදින් යන අක්ෂයක් සඳහා අවස්ථිති සූර්ණය වෙනස් විය හැකිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `moi-axis-free`

Changing the axis changes the distances of the masses from it.

අක්ෂය මාරු කළ විට ස්කන්ධ කොටස්වල සිට අක්ෂයට ඇති දුර වෙනස් වේ.

**Harder questions**

- [phy.mech.b02](#hard-phy-mech-b02) · Statement bank

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.

## phy.mech.c119

Two bodies of equal mass must have equal moments of inertia about their respective central axes.

සමාන ස්කන්ධ ඇති වස්තු දෙකකට ඒවායේ මධ්‍ය අක්ෂ වටා අනිවාර්යයෙන්ම සමාන අවස්ථිති සූර්ණ ඇත.

1. True · සත්‍ය · `moi-mass-only`
2. False · අසත්‍ය · **Key**

The radial distribution of mass matters too.

අක්ෂයේ සිට ස්කන්ධය ව්‍යාප්ත වී ඇති දුර ද බලපායි.

**Harder questions**

- [phy.mech.c043](#hard-phy-mech-c043) · A ring and a disc have equal mass and radius. Which has the larger I about the central axis?

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.

## phy.mech.c120

Of a thin hoop and a uniform disc of equal mass and radius, the hoop has the larger moment of inertia about the central perpendicular axis.

තුනී වළල්ලක හා ඒකාකාර තැටියක ස්කන්ධ හා අරය සමානය. තලයට ලම්බක මධ්‍ය අක්ෂය වටා වැඩි අවස්ථිති සූර්ණය ඇත්තේ වළල්ලටය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `moi-shape-swap`

All of the hoop’s mass lies at the rim.

වළල්ලේ මුළු ස්කන්ධයම පරිධියේ පිහිටයි.

**Harder questions**

- [phy.mech.c043](#hard-phy-mech-c043) · A ring and a disc have equal mass and radius. Which has the larger I about the central axis?

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.

## phy.mech.c121

Moving a point mass twice as far from an axis doubles its contribution to moment of inertia.

ලක්ෂ්‍යාකාර ස්කන්ධයක් අක්ෂයේ සිට දෙගුණයක් දුරට ගෙන ගිය විට අවස්ථිති සූර්ණයට එහි දායකත්වය දෙගුණ වේ.

1. True · සත්‍ය · `wrong-power`
2. False · අසත්‍ය · **Key**

Its contribution is mr², so it increases fourfold.

දායකත්වය mr² බැවින් එය සිව් ගුණයක් වේ.

**Harder questions**

- [phy.mech.b02](#hard-phy-mech-b02) · Statement bank

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.

## phy.mech.c122

For several point masses about one axis, their separate moments of inertia can be added.

එකම අක්ෂයක් සඳහා ලක්ෂ්‍ය ස්කන්ධ කිහිපයක අවස්ථිති සූර්ණ වෙන වෙනම ගණනය කර එකතු කළ හැකිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `missed-true-statement`

Each mass contributes its own mr² to the total.

එක් එක් ස්කන්ධයෙන් එහි mr² ප්‍රමාණය මුළු අගයට එකතු වේ.

**Harder questions**

- [phy.mech.b02](#hard-phy-mech-b02) · Statement bank

**Checks**

- P2 · review-wording · `/text/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.

## phy.mech.c132

At equal mass, radius and angular speed, a thin hoop has more rotational kinetic energy than a uniform solid disc.

ස්කන්ධය, අරය හා කෝණික වේගය සමාන විට තුනී වළල්ලක භ්‍රමණ චාලක ශක්තිය ඒකාකාර ඝන තැටියක අගයට වඩා වැඩිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `moi-shape-swap`

The hoop has the larger moment of inertia.

වළල්ලේ අවස්ථිති සූර්ණය වැඩිය.

**Harder questions**

- [phy.mech.c041](#hard-phy-mech-c041) · A solid sphere and a hoop of equal mass and radius roll down the same slope. Which gets down first?

**Checks**

- P2 · review-wording · `/explanation/si` · moment of inertia. අවස්ථිති ඝූර්ණය Review line 13.

## phy.mech.c053

A runner returns to her starting line after one lap. Her average velocity for the lap is zero.

ධාවිකාවක් එක් වටයක් දිව ආරම්භක රේඛාවට ආපසු පැමිණෙයි. වටය සඳහා ඇගේ සාමාන්‍ය ප්‍රවේගය ශූන්‍ය වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `wrong-quantity`
   - Her displacement is zero even though she covered a distance. · ගමන් කළ දුරක් තිබුණත් ඇගේ විස්ථාපනය ශූන්‍ය වේ.

Her displacement is zero even though she covered a distance.

ගමන් කළ දුරක් තිබුණත් ඇගේ විස්ථාපනය ශූන්‍ය වේ.

**Harder questions**

- [phy.mech.t03](#hard-phy-mech-t03) · The graph shows the velocity of an object moving in a straight line. Average velocity over the whole motion?

**Checks**

- P1 · term-variation · `/explanation/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/options/1/detail/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/text/si` · zero: ශූන්‍ය. See the term decision sheet.

## phy.mech.c093

A triangular force pulse rises from zero to 6 N and returns to zero. Its base lasts 4 s. Find its impulse in N s.

ත්‍රිකෝණාකාර බල ස්පන්දනයක් ශූන්‍යයේ සිට 6 N දක්වා වැඩි වී යළි ශූන්‍ය වේ. එහි පාදයට අදාළ කාලය 4 s කි. ආවේගය N s වලින් කීය ද?

1. 12 N s · 12 N s · **Key**
2. 24 N s · 24 N s · `forgot-half`
3. 3 N s · 3 N s · `stopped-early`
   - Impulse is the triangular area, ½ × 4 × 6 = 12 N s. · ආවේගය ත්‍රිකෝණයේ වර්ගඵලයට සමානය. එය ½ × 4 × 6 = 12 N s වේ.
4. 6 N s · 6 N s · `wrong-quantity`
   - Impulse is the triangular area, ½ × 4 × 6 = 12 N s. · ආවේගය ත්‍රිකෝණයේ වර්ගඵලයට සමානය. එය ½ × 4 × 6 = 12 N s වේ.

Impulse is the triangular area, ½ × 4 × 6 = 12 N s.

ආවේගය ත්‍රිකෝණයේ වර්ගඵලයට සමානය. එය ½ × 4 × 6 = 12 N s වේ.

**Harder questions**

- [phy.mech.c025](#hard-phy-mech-c025) · The area under an F–t graph is 30 N s. It acts on a 3 kg body at rest. Final speed?
- [phy.mech.t08](#hard-phy-mech-t08) · The graph shows the force on a {m} kg body, at rest at first on a smooth surface. Final speed?

**Checks**

- P1 · term-variation · `/text/si` · zero: ශූන්‍ය. See the term decision sheet.
- P1 · term-variation · `/text/si` · zero: ශූන්‍යයේ. See the term decision sheet.

## phy.mech.c054

For any straight journey, averaging just the initial and final velocities gives the average velocity.

ඕනෑම සරල රේඛීය ගමනක මුල් හා අවසන් ප්‍රවේග දෙකේ මධ්‍යන්‍යය ගැනීමෙන් සාමාන්‍ය ප්‍රවේගය ලැබේ.

1. True · සත්‍ය · `wrong-law`
   - The general rule uses displacement divided by elapsed time. Constant acceleration is one case where the endpoint shortcut applies. · සාමාන්‍ය රීතිය අනුව විස්ථාපනය ගත වූ කාලයෙන් බෙදිය යුතුය. ත්වරණය නියත විට අන්ත දෙකේ ප්‍රවේග භාවිත කළ හැකිය.
2. False · අසත්‍ය · **Key**

The general rule uses displacement divided by elapsed time. Constant acceleration is one case where the endpoint shortcut applies.

සාමාන්‍ය රීතිය අනුව විස්ථාපනය ගත වූ කාලයෙන් බෙදිය යුතුය. ත්වරණය නියත විට අන්ත දෙකේ ප්‍රවේග භාවිත කළ හැකිය.

**Harder questions**

- [phy.mech.c007](#hard-phy-mech-c007) · A runner goes 5 m s⁻¹ for 1 s, then 1 m s⁻¹ for 3 s. Student says: "Average = (5 + 1) ÷ 2 = 3 m s⁻¹." What's wrong?

**Checks**

- P1 · term-variation · `/text/si` · final velocity: අවසන් ප්‍රවේග. See the term decision sheet.

## phy.mech.c080

A freely falling scale beneath a freely falling person still reads the person’s ordinary weight.

නිදහසේ වැටෙන පුද්ගලයකු යටින් ඔහු සමඟ නිදහසේ වැටෙන තරාදියක සාමාන්‍ය බර කියවේ.

1. True · සත්‍ය · `free-fall-reading`
2. False · අසත්‍ය · **Key**

The person and scale fall together. The contact force is zero.

පුද්ගලයා සහ තරාදිය එකට වැටෙන බැවින් ස්පර්ශ බලය ශූන්‍ය වේ.

**Harder questions**

- [phy.mech.c013](#hard-phy-mech-c013) · A lift moving up is slowing down. Compared with mg, the scale reading is?
- [phy.mech.c014](#hard-phy-mech-c014) · A lift moves down at constant speed. Compared with mg, the scale reading is?

**Checks**

- P1 · term-variation · `/explanation/si` · zero: ශූන්‍ය. See the term decision sheet.

## phy.mech.c124

A skater pulling in both arms must keep the same rotational kinetic energy because external torque is zero.

බාහිර ව්‍යාවර්තය ශූන්‍ය බැවින් දෑත් ඇතුළට ගන්නා ක්‍රීඩකයකුගේ භ්‍රමණ චාලක ශක්තිය නියතව තිබිය යුතුය.

1. True · සත්‍ය · `ke-conserved-rotation`
2. False · අසත්‍ය · **Key**

Internal work can change the rotational kinetic energy.

අභ්‍යන්තර කාර්යය නිසා භ්‍රමණ චාලක ශක්තිය වෙනස් විය හැකිය.

**Harder questions**

- [phy.mech.c038](#hard-phy-mech-c038) · A skater pulls in their arms, and I halves. ω × ?
- [phy.mech.c039](#hard-phy-mech-c039) · A skater pulls in their arms, and I halves. Rotational KE × ?
- [phy.mech.p05-01](#hard-phy-mech-p05-01) · A diver tucks in mid-air and spins faster. Most direct principle for the new spin rate?
- [phy.mech.p05-02](#hard-phy-mech-p05-02) · Clay drops onto a spinning disc and sticks. Most direct principle for the new spin rate?
- [phy.mech.p05-05](#hard-phy-mech-p05-05) · A constant torque spins up a flywheel from rest. Most direct principle for its angular speed after a known time?
- [phy.mech.p05-06](#hard-phy-mech-p05-06) · A constant friction torque slows a wheel. Most direct principle for the time it takes to stop?

**Checks**

- P1 · term-variation · `/text/si` · zero: ශූන්‍ය. See the term decision sheet.

## phy.mech.c125

For a spinning wheel about its fixed symmetry axis, Iω describes angular momentum.

ස්ථිර සම්මිති අක්ෂය වටා භ්‍රමණය වන රෝදයක Iω යනු එම අක්ෂය වටා කෝණික ගම්‍යතාවයි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `linear-vs-angular`

The corresponding quantity for translation is mv.

උත්තාරණ චලිතයේ අනුරූප රාශිය mv වේ.

**Harder questions**

- [phy.mech.p05-01](#hard-phy-mech-p05-01) · A diver tucks in mid-air and spins faster. Most direct principle for the new spin rate?
- [phy.mech.p05-02](#hard-phy-mech-p05-02) · Clay drops onto a spinning disc and sticks. Most direct principle for the new spin rate?
- [phy.mech.p05-03](#hard-phy-mech-p05-03) · A solid cylinder rolls down a slope from rest. Most direct principle for its speed at the bottom?
- [phy.mech.p05-04](#hard-phy-mech-p05-04) · A wheel falls, unwinding a string round its axle. Most direct principle for its speed after a known drop?
- [phy.mech.p05-05](#hard-phy-mech-p05-05) · A constant torque spins up a flywheel from rest. Most direct principle for its angular speed after a known time?
- [phy.mech.p05-06](#hard-phy-mech-p05-06) · A constant friction torque slows a wheel. Most direct principle for the time it takes to stop?

**Checks**

- P1 · term-variation · `/text/si` · symmetry: සම්මිති. See the term decision sheet.

## phy.mech.c137

In uniform circular motion the net force is tangent to the circle.

ඒකාකාර වෘත්තාකාර චලිතයේදී ශුද්ධ බලය වෘත්තයට ස්පර්ශක වේ.

1. True · සත්‍ය · `force-along-motion`
2. False · අසත්‍ය · **Key**

The velocity is tangential and the acceleration is radial.

ප්‍රවේගය ස්පර්ශක දිශාවේ වන අතර ත්වරණය අරීය දිශාවේ වේ.

**Harder questions**

- [phy.mech.c030](#hard-phy-mech-c030) · A coin turns with a turntable without sliding. What force keeps it moving in a circle?

**Checks**

- P1 · term-variation · `/text/si` · circular motion: වෘත්තාකාර චලිතයේදී. See the term decision sheet.

## phy.mech.c052

A cart moves east for 2 s, then rests for 6 s. Its displacement is 12 m east. Find its average eastward velocity in m s⁻¹.

කරත්තයක් 2 s ක් නැගෙනහිරට ගොස් 6 s ක් නතර වී සිටී. එහි විස්ථාපනය නැගෙනහිරට 12 m කි. නැගෙනහිර දිශාවට සාමාන්‍ය ප්‍රවේගය m s⁻¹ වලින් කීය ද?

1. 1.5 · 1.5 · **Key**
2. 3.0 · 3.0 · `mean-of-speeds`
3. 6.0 · 6.0 · `ignored-condition`
   - Include the rest in the elapsed time. The average is 12 ÷ 8 = 1.5 m s⁻¹ east. · මුළු කාලයට නතර වී සිටි කාලයත් අයත් වේ. සාමාන්‍ය ප්‍රවේගය නැගෙනහිරට 12 ÷ 8 = 1.5 m s⁻¹ වේ.
4. 12 · 12 · `stopped-early`
   - Include the rest in the elapsed time. The average is 12 ÷ 8 = 1.5 m s⁻¹ east. · මුළු කාලයට නතර වී සිටි කාලයත් අයත් වේ. සාමාන්‍ය ප්‍රවේගය නැගෙනහිරට 12 ÷ 8 = 1.5 m s⁻¹ වේ.

Include the rest in the elapsed time. The average is 12 ÷ 8 = 1.5 m s⁻¹ east.

මුළු කාලයට නතර වී සිටි කාලයත් අයත් වේ. සාමාන්‍ය ප්‍රවේගය නැගෙනහිරට 12 ÷ 8 = 1.5 m s⁻¹ වේ.

**Harder questions**

- [phy.mech.c007](#hard-phy-mech-c007) · A runner goes 5 m s⁻¹ for 1 s, then 1 m s⁻¹ for 3 s. Student says: "Average = (5 + 1) ÷ 2 = 3 m s⁻¹." What's wrong?
- [phy.mech.t03](#hard-phy-mech-t03) · The graph shows the velocity of an object moving in a straight line. Average velocity over the whole motion?

**Checks**

No outstanding findings from these checks.

## phy.mech.c055

To average velocity between clock readings 4 s and 10 s, divide the displacement over that interval by 6 s.

ඔරලෝසුවේ 4 s හා 10 s කියවීම් අතර සාමාන්‍ය ප්‍රවේගය සෙවීමට එම කාලයේ විස්ථාපනය 6 s න් බෙදිය යුතුය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `misread-interval`
   - Elapsed time is the difference between the two readings. · ගත වූ කාලය යනු කියවීම් දෙකේ වෙනසයි.

Elapsed time is the difference between the two readings.

ගත වූ කාලය යනු කියවීම් දෙකේ වෙනසයි.

**Harder questions**

- [phy.mech.c007](#hard-phy-mech-c007) · A runner goes 5 m s⁻¹ for 1 s, then 1 m s⁻¹ for 3 s. Student says: "Average = (5 + 1) ÷ 2 = 3 m s⁻¹." What's wrong?

**Checks**

No outstanding findings from these checks.

## phy.mech.c056

A straight, rising displacement–time line represents constant positive velocity.

විස්ථාපනය හා කාලය අතර ප්‍රස්තාරය ඉහළට නැඟෙන සරල රේඛාවක් නම් ප්‍රවේගය නියත ධන අගයකි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `graph-shape`

Equal time intervals give equal increases in displacement.

සමාන කාල අන්තරවලදී විස්ථාපනය සමාන ප්‍රමාණවලින් වැඩි වේ.

**Harder questions**

- [phy.mech.c006](#hard-phy-mech-c006) · An object starts from rest, speeds up, then slows to a stop, never reversing. Pick its s–t graph.

**Checks**

No outstanding findings from these checks.

## phy.mech.c057

An area below the time axis on a velocity–time graph adds positive displacement.

ප්‍රවේග කාල ප්‍රස්තාරයක කාල අක්ෂයට පහළින් ඇති වර්ගඵලයෙන් විස්ථාපනයට ධන අගයක් එකතු වේ.

1. True · සත්‍ය · `sign`
2. False · අසත්‍ය · **Key**

Velocity there is negative. That part of the displacement is negative.

එම කොටසේ ප්‍රවේගය ඍණ බැවින් ඊට අනුරූප විස්ථාපනය ද ඍණ වේ.

**Harder questions**

- [phy.mech.c006](#hard-phy-mech-c006) · An object starts from rest, speeds up, then slows to a stop, never reversing. Pick its s–t graph.

**Checks**

No outstanding findings from these checks.

## phy.mech.c058

The area under a speed–time graph always gives displacement, even if the object turns back.

වස්තුව ආපසු හැරුණත් වේග කාල ප්‍රස්තාරයට යටින් ඇති වර්ගඵලය සෑම විටම විස්ථාපනය ලබා දෙයි.

1. True · සත්‍ය · `ignored-condition`
   - Speed has no direction. Its time integral gives distance travelled. · වේගයට දිශාවක් නැත. එහි කාල අනුකලයෙන් ලැබෙන්නේ ගමන් කළ දුරයි.
2. False · අසත්‍ය · **Key**

Speed has no direction. Its time integral gives distance travelled.

වේගයට දිශාවක් නැත. එහි කාල අනුකලයෙන් ලැබෙන්නේ ගමන් කළ දුරයි.

**Harder questions**

- [phy.mech.c006](#hard-phy-mech-c006) · An object starts from rest, speeds up, then slows to a stop, never reversing. Pick its s–t graph.

**Checks**

No outstanding findings from these checks.

## phy.mech.c059

A ball thrown straight up returns to its launch height after 8 s. Ignore air resistance. How many seconds does its descent take?

සිරස්ව ඉහළට විසි කළ බෝලයක් 8 s කින් මුල් උසට පැමිණේ. වායු ප්‍රතිරෝධය නොසලකන්න. පහළට ගමන් කිරීමට ගත වූ කාලය තත්පර කීය ද?

1. 4 s · 4 s · **Key**
2. 8 s · 8 s · `misread-interval`
   - At equal heights the upward and downward journeys take equal times. Each takes half of 8 s. · එකම උස අතර ඉහළට හා පහළට යාමට සමාන කාල ගත වේ. එක් ගමනකට 8 s න් අඩක් ගත වේ.
3. 6 s · 6 s · `up-down-time`
4. −4 s · −4 s · `sign`

At equal heights the upward and downward journeys take equal times. Each takes half of 8 s.

එකම උස අතර ඉහළට හා පහළට යාමට සමාන කාල ගත වේ. එක් ගමනකට 8 s න් අඩක් ගත වේ.

**Harder questions**

- [phy.mech.c003](#hard-phy-mech-c003) · A ball passes a window going up, then again coming down, 6 s later. Student says: "It takes 6 s to go from the window to the top." What's wrong?
- [phy.mech.t02](#hard-phy-mech-t02) · A ball thrown straight up from the ground passes a point {h} m high twice, {dt} s apart. Launch speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c060

Two stones leave the ground vertically at the same speed in a vacuum. The heavier stone reaches a greater height.

රික්තයක ගල් දෙකක් එකම වේගයෙන් පොළොවෙන් සිරස්ව ඉහළට විසි කරයි. වැඩි ස්කන්ධයක් ඇති ගල වැඩි උසකට ළඟා වේ.

1. True · සත්‍ය · `mass-matters`
2. False · අසත්‍ය · **Key**

Both have the same initial speed and downward acceleration. Their maximum heights are equal.

මුල් වේගය හා පහළට ඇති ත්වරණය දෙකටම සමාන බැවින් උපරිම උස ද සමාන වේ.

**Harder questions**

- [phy.mech.c003](#hard-phy-mech-c003) · A ball passes a window going up, then again coming down, 6 s later. Student says: "It takes 6 s to go from the window to the top." What's wrong?

**Checks**

No outstanding findings from these checks.

## phy.mech.c064

At the highest point of an oblique throw, gravity briefly stops acting.

ආනතව විසි කළ වස්තුවක් ඉහළම ලක්ෂ්‍යයට ළඟා වන මොහොතේ ගුරුත්ව බලය ක්‍රියා කිරීම මඳකට නවතී.

1. True · සත්‍ය · `gravity-off-in-flight`
2. False · අසත්‍ය · **Key**

Gravity continues to accelerate the ball downwards through the turning point.

එම ලක්ෂ්‍යය පසු කරන විටත් ගුරුත්ව බලය නිසා වස්තුව පහළට ත්වරණය වේ.

**Harder questions**

- [phy.mech.c028](#hard-phy-mech-c028) · A ball in flight is at the top of its path, moving right. No air resistance. Pick the diagram of the forces on it.
- [phy.mech.p03-01](#hard-phy-mech-p03-01) · A stone is thrown at 40° to the horizontal, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-02](#hard-phy-mech-p03-02) · A marble rolls off a table and falls to the floor, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-03](#hard-phy-mech-p03-03) · A parcel drops from a plane flying level, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-04](#hard-phy-mech-p03-04) · A ball is thrown straight up, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-05](#hard-phy-mech-p03-05) · A ball is thrown at 30° to the horizontal, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-06](#hard-phy-mech-p03-06) · A stone falls from a bridge from rest, with no air resistance. Which quantity stays constant?

**Checks**

No outstanding findings from these checks.

## phy.mech.c065

A ball flying horizontally at the top of its path in a vacuum has a downward net force.

රික්තයක ගමන් කරන බෝලයක පථයේ ඉහළම ලක්ෂ්‍යයේදී එහි ප්‍රවේගය තිරස් වුවත් ශුද්ධ බලය පහළට යොමු වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `force-along-motion`

Only its weight acts during free flight.

නිදහස් පියාසැරිය අතරතුර ක්‍රියා කරන්නේ බෝලයේ බර පමණි.

**Harder questions**

- [phy.mech.c028](#hard-phy-mech-c028) · A ball in flight is at the top of its path, moving right. No air resistance. Pick the diagram of the forces on it.

**Checks**

No outstanding findings from these checks.

## phy.mech.c066

At the top of a projectile path the speed is half its launch speed. What fraction of the initial kinetic energy remains?

ප්‍රක්ෂිප්තයක පථයේ ඉහළම තැනදී වේගය මුල් වේගයෙන් අඩකි. එහි ඉතිරි චාලක ශක්තිය මුල් චාලක ශක්තියෙන් කවර භාගයක් ද?

1. 1 : 4 · 1 : 4 · **Key**
2. 1 : 2 · 1 : 2 · `forgot-square`
3. 3 : 4 · 3 : 4 · `ke-pe-confusion`
4. 1 : 1 · 1 : 1 · `ignored-condition`
   - Kinetic energy is proportional to speed squared for fixed mass. The fraction is (1/2)². · ස්කන්ධය නියත විට චාලක ශක්තිය වේගයේ වර්ගයට සමානුපාතිකය. එම භාගය (1/2)² වේ.

Kinetic energy is proportional to speed squared for fixed mass. The fraction is (1/2)².

ස්කන්ධය නියත විට චාලක ශක්තිය වේගයේ වර්ගයට සමානුපාතිකය. එම භාගය (1/2)² වේ.

**Harder questions**

- [phy.mech.c026](#hard-phy-mech-c026) · A ball is launched at 60° above the horizontal. Ignore air resistance. A student says its KE is zero at the highest point. Which correction is valid?
- [phy.mech.p03-01](#hard-phy-mech-p03-01) · A stone is thrown at 40° to the horizontal, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-02](#hard-phy-mech-p03-02) · A marble rolls off a table and falls to the floor, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-03](#hard-phy-mech-p03-03) · A parcel drops from a plane flying level, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-04](#hard-phy-mech-p03-04) · A ball is thrown straight up, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-05](#hard-phy-mech-p03-05) · A ball is thrown at 30° to the horizontal, with no air resistance. Which quantity stays constant?
- [phy.mech.p03-06](#hard-phy-mech-p03-06) · A stone falls from a bridge from rest, with no air resistance. Which quantity stays constant?
- [phy.mech.t09](#hard-phy-mech-t09) · A ball is thrown at {angle}° to the horizontal with {K} J of KE. {ask} (No air resistance)

**Checks**

No outstanding findings from these checks.

## phy.mech.c068

Two forces of 3 N and 5 N can have a resultant force of exactly 2 N.

3 N හා 5 N බල දෙකක සම්ප්‍රයුක්ත බලයේ විශාලත්වය හරියටම 2 N විය හැකිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `boundary`

Opposite directions give the difference of the magnitudes. The lower endpoint is possible.

ප්‍රතිවිරුද්ධ දිශාවලට ක්‍රියා කරන විට විශාලත්ව දෙකේ වෙනස ලැබේ. එබැවින් පහළ සීමා අගය ගත හැකිය.

**Harder questions**

- [phy.mech.t01](#hard-phy-mech-t01) · Forces of {F1} N and {F2} N act at one point. Which can be the size of their resultant?

**Checks**

No outstanding findings from these checks.

## phy.mech.c069

When a hand first presses a wall, the wall starts pushing back after a short delay.

අතකින් බිත්තියක් තද කිරීම ආරම්භ කළ විට බිත්තිය අත මත බලයක් යෙදීම අරඹන්නේ ඊට මොහොතකට පසුවය.

1. True · සත්‍ය · `pair-delay`
2. False · අසත්‍ය · **Key**

The two forces arise together during the interaction.

අන්තර්ක්‍රියාවේදී බල දෙකම එකවර හට ගනී.

**Harder questions**

- [phy.mech.c012](#hard-phy-mech-c012) · Student says: "Action and reaction are equal and opposite, so nothing can ever accelerate." What's wrong?

**Checks**

No outstanding findings from these checks.

## phy.mech.c070

Earth and the Moon exert a third-law force pair on each other across space.

පෘථිවිය හා චන්ද්‍රයා අතර ස්පර්ශයක් නැතත් ඒවා එකිනෙක මත යොදන ගුරුත්ව බල නිව්ටන්ගේ තෙවැනි නියමයට අයත් බල යුගලයකි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `pair-contact-only`

Each body attracts the other by gravitation.

එක් එක් වස්තුව අනෙක ගුරුත්වාකර්ෂණයෙන් තමා දෙසට ඇද ගනී.

**Harder questions**

- [phy.mech.c012](#hard-phy-mech-c012) · Student says: "Action and reaction are equal and opposite, so nothing can ever accelerate." What's wrong?

**Checks**

No outstanding findings from these checks.

## phy.mech.c071

The weight of a resting book and the normal force on it from a table form a third-law pair.

මේසයක් මත නිශ්චල පොතක බරත් මේසයෙන් පොතට යෙදෙන අභිලම්බ බලයත් තෙවැනි නියමයේ බල යුගලයකි.

1. True · සත්‍ය · `balance-vs-pair`
2. False · අසත්‍ය · **Key**

Both act on the book. The partner of the table’s push acts on the table.

බල දෙකම ක්‍රියා කරන්නේ පොත මතය. මේසය යොදන බලයට යුගල වූ බලය ක්‍රියා කරන්නේ මේසය මතය.

**Harder questions**

- [phy.mech.c011](#hard-phy-mech-c011) · A book rests on a table. Which force pairs with Earth's pull on the book?

**Checks**

No outstanding findings from these checks.

## phy.mech.c072

A skate pushes the ice backwards. Its partner force can accelerate the skater forwards.

ලිස්සන සපත්තුව අයිස් මත පිටුපසට බලයක් යොදයි. එහි ප්‍රතික්‍රියා බලයෙන් ක්‍රීඩකයා ඉදිරියට ත්වරණය විය හැකිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `pair-cancels`

The two forces act on different bodies. Only the forward member acts on the skater.

බල දෙක ක්‍රියා කරන්නේ වස්තු දෙකක් මතය. ක්‍රීඩකයා මත ක්‍රියා කරන්නේ ඉදිරියට යොමු වූ බලයයි.

**Harder questions**

- [phy.mech.b01](#hard-phy-mech-b01) · Statement bank

**Checks**

No outstanding findings from these checks.

## phy.mech.c073

For the combined system of two colliding carts, the forces they exert on each other are internal forces.

ගැටෙන කරත්ත දෙකම එක් පද්ධතියක් ලෙස ගත් විට ඒවා එකිනෙක මත යොදන බල අභ්‍යන්තර බල වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `internal-force`

Both participants in that interaction lie inside the chosen system.

එම අන්තර්ක්‍රියාවට සහභාගි වන වස්තු දෙකම තෝරාගත් පද්ධතිය තුළ පවතී.

**Harder questions**

- [phy.mech.c008](#hard-phy-mech-c008) · What pushes a walking person forward?
- [phy.mech.c009](#hard-phy-mech-c009) · A car accelerates on a level road without tyre slip. What pushes the car forward?

**Checks**

No outstanding findings from these checks.

## phy.mech.c074

A rope pulls a bucket up. Earth supplies the third-law partner of that pull.

ලණුවක් බාල්දියක් ඉහළට අදියි. එම ඇදීමට අනුරූප තෙවැනි නියමයේ අනෙක් බලය යොදන්නේ පෘථිවියයි.

1. True · සත්‍ය · `force-wrong-source`
2. False · අසත්‍ය · **Key**

The bucket pulls the rope down. The partner comes from the body on which the original pull acts.

බාල්දිය ලණුව පහළට අදියි. අනෙක් බලය යොදන්නේ මුල් බලය ලැබූ බාල්දියයි.

**Harder questions**

- [phy.mech.c008](#hard-phy-mech-c008) · What pushes a walking person forward?
- [phy.mech.c009](#hard-phy-mech-c009) · A car accelerates on a level road without tyre slip. What pushes the car forward?

**Checks**

No outstanding findings from these checks.

## phy.mech.c075

A hand pushes trolley A into trolley B. The partner of A’s push on B is the hand’s push on A.

අතකින් A කරත්තය B කරත්තයට එරෙහිව තල්ලු කරයි. A විසින් B මත යොදන බලයේ ප්‍රතික්‍රියාව අත විසින් A මත යොදන බලයයි.

1. True · සත්‍ය · `pair-wrong-bodies`
2. False · අසත්‍ය · **Key**

Keep the same two bodies and exchange their roles. B pushes on A.

එම වස්තු දෙකම ගෙන ඒවායේ භූමිකා මාරු කරන්න. B විසින් A මත බලයක් යොදයි.

**Harder questions**

- [phy.mech.c011](#hard-phy-mech-c011) · A book rests on a table. Which force pairs with Earth's pull on the book?

**Checks**

No outstanding findings from these checks.

## phy.mech.c076

If a swimmer pushes water backwards, the forward force of this pair acts on the swimmer.

පිහිනුම්කරුවකු ජලය පිටුපසට තල්ලු කළ විට මේ යුගලයේ ඉදිරියට යොමු වූ බලය ක්‍රියා කරන්නේ පිහිනුම්කරු මතය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `force-on-wrong-body`

Water is pushed back and in turn pushes the swimmer forwards.

ජලය පිටුපසට තල්ලු වන අතර එය පිහිනුම්කරු ඉදිරියට තල්ලු කරයි.

**Harder questions**

- [phy.mech.c008](#hard-phy-mech-c008) · What pushes a walking person forward?
- [phy.mech.c009](#hard-phy-mech-c009) · A car accelerates on a level road without tyre slip. What pushes the car forward?
- [phy.mech.c011](#hard-phy-mech-c011) · A book rests on a table. Which force pairs with Earth's pull on the book?

**Checks**

No outstanding findings from these checks.

## phy.mech.c077

During a collision a light trolley and a heavy trolley exert forces of equal magnitude on each other.

ගැටීමකදී සැහැල්ලු කරත්තයක් හා බර කරත්තයක් එකිනෙක මත සමාන විශාලත්ව ඇති බල යොදයි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `missed-true-statement`

Different masses can have different accelerations under equal forces.

සමාන බල යටතේ වුවත් ස්කන්ධ වෙනස් නිසා ත්වරණ වෙනස් විය හැකිය.

**Harder questions**

- [phy.mech.b01](#hard-phy-mech-b01) · Statement bank

**Checks**

No outstanding findings from these checks.

## phy.mech.c079

A descending lift slows down. A standing passenger’s scale reading exceeds their weight.

පහළට යන විදුලි සෝපානයක වේගය අඩු වේ. සිටගෙන සිටින මගියකුගේ තරාදි කියවීම ඔහුගේ බර ඉක්මවයි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `motion-vs-accel`

Slowing a downward motion requires upward acceleration. The floor pushes up harder than gravity pulls down.

පහළට යන වේගය අඩු වීමට ඉහළට ත්වරණයක් අවශ්‍යය. එවිට පොළොව දෙසට යෙදෙන ගුරුත්ව බලයට වඩා සෝපාන තට්ටුවෙන් යෙදෙන බලය වැඩිය.

**Harder questions**

- [phy.mech.c013](#hard-phy-mech-c013) · A lift moving up is slowing down. Compared with mg, the scale reading is?
- [phy.mech.c014](#hard-phy-mech-c014) · A lift moves down at constant speed. Compared with mg, the scale reading is?

**Checks**

No outstanding findings from these checks.

## phy.mech.c081

A spring scale under a passenger measures the resultant force on that passenger.

මගියකුගේ පා යට දුනු තරාදිය මනිනුයේ මගියා මත ඇති සම්ප්‍රයුක්ත බලයයි.

1. True · සත්‍ය · `wrong-quantity`
   - The reading is the contact force. Gravity also contributes to the resultant. · කියවීම ස්පර්ශ බලයට සමානය. සම්ප්‍රයුක්ත බලය සෙවීමේදී ගුරුත්ව බලයත් සැලකිය යුතුය.
2. False · අසත්‍ය · **Key**

The reading is the contact force. Gravity also contributes to the resultant.

කියවීම ස්පර්ශ බලයට සමානය. සම්ප්‍රයුක්ත බලය සෙවීමේදී ගුරුත්ව බලයත් සැලකිය යුතුය.

**Harder questions**

- [phy.mech.t04](#hard-phy-mech-t04) · A lift is moving {motion}. Its speed changes by {dv} m s⁻¹ in {t} s. Force from the floor on a {m} kg block?

**Checks**

No outstanding findings from these checks.

## phy.mech.c082

For a passenger accelerating upwards, the equation for the support force N is N − mg = ma.

ඉහළට ත්වරණය වන මගියකුට යෙදෙන ආධාරක බලය N නම් N − mg = ma වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `wrong-law`
   - Taking upwards as positive, the resultant force is the support force minus the weight. · ඉහළ දිශාවේ සම්ප්‍රයුක්ත බලය ලැබෙන්නේ ආධාරක බලයෙන් බර අඩු කිරීමෙනි.

Taking upwards as positive, the resultant force is the support force minus the weight.

ඉහළ දිශාවේ සම්ප්‍රයුක්ත බලය ලැබෙන්නේ ආධාරක බලයෙන් බර අඩු කිරීමෙනි.

**Harder questions**

- [phy.mech.t04](#hard-phy-mech-t04) · A lift is moving {motion}. Its speed changes by {dv} m s⁻¹ in {t} s. Force from the floor on a {m} kg block?

**Checks**

No outstanding findings from these checks.

## phy.mech.c083

On a rough horizontal floor a block slides at speed u. Friction alone stops it with constant deceleration μg. Which expression gives the stopping distance?

රළු තිරස් බිමක u වේගයෙන් ලිස්සන කුට්ටියක් ඝර්ෂණය නිසා පමණක් μg නියත මන්දනයෙන් නතර වේ. නැවතුම් දුර කීය ද?

1. u²/(2μg) · u²/(2μg) · **Key**
2. u²/(μg) · u²/(μg) · `forgot-half`
3. u²/(2g) · u²/(2g) · `forgot-mu`
4. u/(2μg) · u/(2μg) · `forgot-square`

Use 0 = u² − 2μgs and solve for s.

0 = u² − 2μgs සමීකරණයෙන් s සොයන්න.

**Harder questions**

- [phy.mech.c015](#hard-phy-mech-c015) · A block slides to rest on a rough surface. Initial speed × 2. Stopping distance × ?
- [phy.mech.c017](#hard-phy-mech-c017) · Blocks X and Y slide at 2 m s⁻¹ and 6 m s⁻¹ on a level floor. Both have the same coefficient of kinetic friction with the floor. Stopping distances, X : Y?
- [phy.mech.t05](#hard-phy-mech-t05) · A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved?

**Checks**

No outstanding findings from these checks.

## phy.mech.c084

If the initial sliding speed triples on the same level rough floor, by what factor does the frictional stopping distance change? Assume constant kinetic friction coefficient.

එකම රළු තිරස් බිමක ආරම්භක ලිස්සුම් වේගය තුන් ගුණයක් කළ විට නැවතුම් දුර කී ගුණයක් වේ ද? ගතික ඝර්ෂණ සංගුණකය නියතය.

1. 9 : 1 · 9 : 1 · **Key**
2. 3 : 1 · 3 : 1 · `wrong-power`
3. 1 : 9 · 1 : 9 · `inverted`
4. 1 : 1 · 1 : 1 · `wrong-law`
   - The initial kinetic energy increases ninefold. The same frictional force must act over a ninefold distance. · මුල් චාලක ශක්තිය නව ගුණයක් වේ. එබැවින් එම ඝර්ෂණ බලය නව ගුණයක දුරක් ක්‍රියා කළ යුතුය.

The initial kinetic energy increases ninefold. The same frictional force must act over a ninefold distance.

මුල් චාලක ශක්තිය නව ගුණයක් වේ. එබැවින් එම ඝර්ෂණ බලය නව ගුණයක දුරක් ක්‍රියා කළ යුතුය.

**Harder questions**

- [phy.mech.c015](#hard-phy-mech-c015) · A block slides to rest on a rough surface. Initial speed × 2. Stopping distance × ?
- [phy.mech.c016](#hard-phy-mech-c016) · A block slides to rest on a rough surface. Mass × 2, same initial speed. Stopping distance × ?
- [phy.mech.c017](#hard-phy-mech-c017) · Blocks X and Y slide at 2 m s⁻¹ and 6 m s⁻¹ on a level floor. Both have the same coefficient of kinetic friction with the floor. Stopping distances, X : Y?
- [phy.mech.t05](#hard-phy-mech-t05) · A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved?

**Checks**

No outstanding findings from these checks.

## phy.mech.c085

On an inclined rough board the normal reaction on a sliding block always points vertically up.

ආනත රළු ලෑල්ලක් මත ලිස්සන කුට්ටියට යෙදෙන අභිලම්බ ප්‍රතික්‍රියාව සෑම විටම සිරස්ව ඉහළට යොමු වේ.

1. True · සත්‍ය · `normal-vertical`
2. False · අසත්‍ය · **Key**

The contact normal is perpendicular to the board.

අභිලම්බ ප්‍රතික්‍රියාව ලෑල්ලේ පෘෂ්ඨයට ලම්බකය.

**Harder questions**

- [phy.mech.c018](#hard-phy-mech-c018) · A block rests on a rough slope without sliding. Pick the diagram of the forces on it.

**Checks**

No outstanding findings from these checks.

## phy.mech.c086

A block slides right on a stationary rough floor. Friction from the floor acts left on the block.

නිශ්චල රළු බිමක් මත කුට්ටියක් දකුණට ලිස්සයි. බිමෙන් කුට්ටියට යෙදෙන ඝර්ෂණ බලය වමට යොමු වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `friction-direction`

Kinetic friction opposes the relative sliding at the contact.

ගතික ඝර්ෂණය ස්පර්ශ පෘෂ්ඨ අතර සාපේක්ෂ ලිස්සීමට විරුද්ධ වේ.

**Harder questions**

- [phy.mech.c018](#hard-phy-mech-c018) · A block rests on a rough slope without sliding. Pick the diagram of the forces on it.

**Checks**

No outstanding findings from these checks.

## phy.mech.c087

With the same kinetic friction coefficient, doubling a block’s mass leaves its sliding deceleration on a level floor unchanged.

ගතික ඝර්ෂණ සංගුණකය එකම නම් තිරස් බිමක ලිස්සන කුට්ටියේ ස්කන්ධය දෙගුණ කළත් එහි මන්දනය වෙනස් නොවේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `mass-matters`

Both friction and mass double. Their ratio stays μg.

ඝර්ෂණ බලය හා ස්කන්ධය යන දෙකම දෙගුණ වන බැවින් ඒවායේ අනුපාතය μg ම වේ.

**Harder questions**

- [phy.mech.c016](#hard-phy-mech-c016) · A block slides to rest on a rough surface. Mass × 2, same initial speed. Stopping distance × ?

**Checks**

No outstanding findings from these checks.

## phy.mech.c088

A sliding block’s kinetic energy stays constant as friction brings it to rest on a horizontal floor.

තිරස් බිමක ඝර්ෂණය නිසා ලිස්සන කුට්ටියක් නතර වන අතර එහි චාලක ශක්තිය නියතව පවතී.

1. True · සත්‍ය · `omitted-friction`
2. False · අසත්‍ය · **Key**

Friction does negative work on the block.

ඝර්ෂණ බලය කුට්ටිය මත ඍණ කාර්යයක් කරයි.

**Harder questions**

- [phy.mech.c018](#hard-phy-mech-c018) · A block rests on a rough slope without sliding. Pick the diagram of the forces on it.

**Checks**

No outstanding findings from these checks.

## phy.mech.c089

For sliding on a level floor under kinetic friction alone, μ must be multiplied by g to obtain the deceleration.

තිරස් බිමක ගතික ඝර්ෂණය නිසා පමණක් ලිස්සන වස්තුවේ මන්දනය සෙවීමට μ අගය g න් ගුණ කළ යුතුය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `forgot-g`

The friction coefficient has no units. The product μg has units of acceleration.

ඝර්ෂණ සංගුණකයට ඒකක නැත. μg ගුණිතයට ත්වරණයේ ඒකක ඇත.

**Harder questions**

- [phy.mech.t05](#hard-phy-mech-t05) · A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved?

**Checks**

No outstanding findings from these checks.

## phy.mech.c091

Two boxes of unequal mass accelerate together on a level platform. Each needs the same frictional force if friction is its only horizontal force.

වෙනස් ස්කන්ධ ඇති පෙට්ටි දෙකක් තිරස් වේදිකාවක් මත එකම ත්වරණයෙන් ගමන් කරයි. එකම තිරස් බලය ඝර්ෂණය නම් දෙකටම සමාන ඝර්ෂණ බල අවශ්‍ය වේ.

1. True · සත්‍ය · `assumed-symmetry`
2. False · අසත්‍ය · **Key**

At the same acceleration the heavier box requires more force.

ත්වරණය සමාන විට වැඩි ස්කන්ධයක් ඇති පෙට්ටියට වැඩි බලයක් අවශ්‍යය.

**Harder questions**

- [phy.mech.c020](#hard-phy-mech-c020) · All four wheels of a car are driven. Greatest possible acceleration on a level road?

**Checks**

No outstanding findings from these checks.

## phy.mech.c092

At constant acceleration a from rest, a crate moves ½at² in time t as it moves with a truck without slipping.

ලොරියක් සමඟ නොලිස්සා ගමන් කරන පෙට්ටියක් නිශ්චලතාවෙන් ඇරඹී නියත ත්වරණය a යටතේ t කාලයකදී ½at² දුරක් ගමන් කරයි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `forgot-half`

Its average speed is half its final speed at.

එහි සාමාන්‍ය වේගය අවසන් වේගය වන at හි අඩකි.

**Harder questions**

- [phy.mech.t06](#hard-phy-mech-t06) · A car with all wheels driven reaches {kmh} km h⁻¹ from rest in {t} s on a level road, at uniform acceleration. Smallest μₛ needed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c094

A 2 kg cart receives an impulse of 8 N s. What is its velocity change in m s⁻¹ along the impulse?

2 kg ස්කන්ධයක කරත්තයකට 8 N s ආවේගයක් ලැබේ. ආවේගයේ දිශාවට ප්‍රවේග වෙනස m s⁻¹ වලින් කීය ද?

1. 4 m s⁻¹ · 4 m s⁻¹ · **Key**
2. 8 m s⁻¹ · 8 m s⁻¹ · `forgot-mass`
3. 0.25 m s⁻¹ · 0.25 m s⁻¹ · `inverted`
4. 16 m s⁻¹ · 16 m s⁻¹ · `wrong-law`
   - Divide impulse by mass since J = mΔv. · J = mΔv නිසා ආවේගය ස්කන්ධයෙන් බෙදන්න.

Divide impulse by mass since J = mΔv.

J = mΔv නිසා ආවේගය ස්කන්ධයෙන් බෙදන්න.

**Harder questions**

- [phy.mech.c025](#hard-phy-mech-c025) · The area under an F–t graph is 30 N s. It acts on a 3 kg body at rest. Final speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c095

A constant positive force gives a rectangular area on a force–time graph.

නියත ධන බලයක් සඳහා බල කාල ප්‍රස්තාරය හා කාල අක්ෂය අතර වර්ගඵලය සෘජුකෝණාස්‍රයකි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `area-shape`

The height stays fixed throughout the time interval.

අදාළ කාල අන්තරය පුරාම උස නියතව පවතී.

**Harder questions**

- [phy.mech.t08](#hard-phy-mech-t08) · The graph shows the force on a {m} kg body, at rest at first on a smooth surface. Final speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c096

A force acts only from 7 s to 9 s. Its impulse uses a duration of 9 s.

බලයක් ක්‍රියා කරන්නේ 7 s සිට 9 s දක්වා පමණි. ආවේගය සෙවීමේදී කාලය ලෙස 9 s යොදා ගනී.

1. True · සත්‍ය · `misread-interval`
   - The force acts for 9 − 7 = 2 s. · බලය ක්‍රියා කරන කාලය 9 − 7 = 2 s වේ.
2. False · අසත්‍ය · **Key**

The force acts for 9 − 7 = 2 s.

බලය ක්‍රියා කරන කාලය 9 − 7 = 2 s වේ.

**Harder questions**

- [phy.mech.t08](#hard-phy-mech-t08) · The graph shows the force on a {m} kg body, at rest at first on a smooth surface. Final speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c097

A 3 kg cart at 4 m s⁻¹ catches a stationary 1 kg cart. They lock together with negligible external impulse. Find their speed in m s⁻¹.

4 m s⁻¹ වේගයෙන් යන 3 kg කරත්තයක් නිශ්චල 1 kg කරත්තයකට ගැටී එය හා බැඳෙයි. බාහිර ආවේගය නොගිණිය හැකි නම් පොදු වේගය m s⁻¹ වලින් කීය ද?

1. 3 m s⁻¹ · 3 m s⁻¹ · **Key**
2. 2 m s⁻¹ · 2 m s⁻¹ · `mean-of-speeds`
3. 12 m s⁻¹ · 12 m s⁻¹ · `stopped-early`
   - The initial momentum is 12 kg m s⁻¹. Divide by the combined mass of 4 kg. · මුල් ගම්‍යතාව 12 kg m s⁻¹ වේ. එය ඒකාබද්ධ ස්කන්ධය වන 4 kg න් බෙදන්න.
4. 1 m s⁻¹ · 1 m s⁻¹ · `forgot-mass`

The initial momentum is 12 kg m s⁻¹. Divide by the combined mass of 4 kg.

මුල් ගම්‍යතාව 12 kg m s⁻¹ වේ. එය ඒකාබද්ධ ස්කන්ධය වන 4 kg න් බෙදන්න.

**Harder questions**

- [phy.mech.c021](#hard-phy-mech-c021) · Equal-mass blocks move towards each other at 6 m s⁻¹ and 2 m s⁻¹, then stick. Their speed after?
- [phy.mech.t07](#hard-phy-mech-t07) · A {m1} kg cart at {u1} m s⁻¹ catches a {m2} kg cart moving the same way at {u2} m s⁻¹. They couple. Common speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c098

An isolated object breaks into two unequal masses from rest. Their recoil speeds are equal.

නිශ්චල හුදෙකලා වස්තුවක් අසමාන ස්කන්ධ දෙකකට කැඩෙයි. කොටස් දෙකේ ප්‍රතික්ෂේප වේග සමාන වේ.

1. True · සත්‍ය · `assumed-symmetry`
2. False · අසත්‍ය · **Key**

Their momenta are equal in magnitude. The lighter part has the larger speed.

ගම්‍යතා විශාලත්ව සමාන වේ. කුඩා ස්කන්ධයට වැඩි වේගයක් ලැබේ.

**Harder questions**

- [phy.mech.c021](#hard-phy-mech-c021) · Equal-mass blocks move towards each other at 6 m s⁻¹ and 2 m s⁻¹, then stick. Their speed after?

**Checks**

No outstanding findings from these checks.

## phy.mech.c099

A wall can change the total momentum of two colliding carts if it gives one cart an impulse.

ගැටෙන කරත්ත දෙකෙන් එකකට බිත්තියකින් ආවේගයක් ලැබුණොත් කරත්ත දෙකේ මුළු ගම්‍යතාව වෙනස් විය හැකිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `momentum-external-force`

The wall lies outside the two-cart system.

බිත්තිය කරත්ත දෙකෙන් සැදි පද්ධතියට අයත් නොවේ.

**Harder questions**

- [phy.mech.p01-04](#hard-phy-mech-p01-04) · A bead slides down a smooth curved rail from rest. Which principle gives its speed from the vertical drop?
- [phy.mech.p01-05](#hard-phy-mech-p01-05) · A pendulum bob swings down from rest. Most direct principle for its speed at the lowest point?
- [phy.mech.p01-06](#hard-phy-mech-p01-06) · A compressed spring launches a block across a smooth table. Most direct principle for the launch speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c100

With east positive, a westbound cart contributes negative momentum to the total.

නැගෙනහිර ධන ලෙස ගත් විට බටහිරට යන කරත්තයක ගම්‍යතාව මුළු ගම්‍යතාවට එකතු වන්නේ ඍණ අගයක් ලෙසය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `sign`

Momentum has the direction of velocity.

ගම්‍යතාවයේ දිශාව ප්‍රවේගයේ දිශාවයි.

**Harder questions**

- [phy.mech.c021](#hard-phy-mech-c021) · Equal-mass blocks move towards each other at 6 m s⁻¹ and 2 m s⁻¹, then stick. Their speed after?

**Checks**

No outstanding findings from these checks.

## phy.mech.c101

During an impact with varying net force on a cart of fixed mass, its acceleration is constant throughout.

නියත ස්කන්ධයක කරත්තයක ගැටීමක් අතරතුර ශුද්ධ බලය වෙනස් වුවත් එහි ත්වරණය ගැටීම පුරා නියතය.

1. True · සත්‍ය · `suvat-nonuniform`
2. False · අසත්‍ය · **Key**

Acceleration follows the changing force through F = ma.

F = ma අනුව බලය වෙනස් වන විට ත්වරණයත් වෙනස් වේ.

**Harder questions**

- [phy.mech.p01-01](#hard-phy-mech-p01-01) · Two rail wagons collide and couple together. Most direct principle for their common speed?
- [phy.mech.p01-02](#hard-phy-mech-p01-02) · A bullet embeds in a block on a smooth table. Most direct principle for the speed just after?
- [phy.mech.p01-03](#hard-phy-mech-p01-03) · A gun recoils when it fires a shell. Most direct principle for the recoil speed?
- [phy.mech.p01-04](#hard-phy-mech-p01-04) · A bead slides down a smooth curved rail from rest. Which principle gives its speed from the vertical drop?
- [phy.mech.p01-05](#hard-phy-mech-p01-05) · A pendulum bob swings down from rest. Most direct principle for its speed at the lowest point?
- [phy.mech.p01-06](#hard-phy-mech-p01-06) · A compressed spring launches a block across a smooth table. Most direct principle for the launch speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c102

Taking both colliding bodies as one system removes their unknown mutual impulses from the total momentum equation.

ගැටෙන වස්තු දෙකම එක පද්ධතියක් ලෙස ගත් විට ඒවා අතර නොදන්නා අන්‍යෝන්‍ය ආවේග මුළු ගම්‍යතා සමීකරණයෙන් ඉවත් වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `unknown-not-eliminated`

The internal impulses are equal and opposite.

අභ්‍යන්තර ආවේග විශාලත්වයෙන් සමාන හා දිශාවෙන් ප්‍රතිවිරුද්ධ වේ.

**Harder questions**

- [phy.mech.p01-01](#hard-phy-mech-p01-01) · Two rail wagons collide and couple together. Most direct principle for their common speed?
- [phy.mech.p01-02](#hard-phy-mech-p01-02) · A bullet embeds in a block on a smooth table. Most direct principle for the speed just after?
- [phy.mech.p01-03](#hard-phy-mech-p01-03) · A gun recoils when it fires a shell. Most direct principle for the recoil speed?
- [phy.mech.p01-04](#hard-phy-mech-p01-04) · A bead slides down a smooth curved rail from rest. Which principle gives its speed from the vertical drop?
- [phy.mech.p01-05](#hard-phy-mech-p01-05) · A pendulum bob swings down from rest. Most direct principle for its speed at the lowest point?
- [phy.mech.p01-06](#hard-phy-mech-p01-06) · A compressed spring launches a block across a smooth table. Most direct principle for the launch speed?

**Checks**

No outstanding findings from these checks.

## phy.mech.c103

When two carts stick together after colliding, their total kinetic energy must be conserved.

කරත්ත දෙකක් ගැටීමෙන් පසු එකට ඇලෙන්නේ නම් ඒවායේ මුළු චාලක ශක්තිය අනිවාර්යයෙන්ම සංස්ථිතික වේ.

1. True · සත්‍ය · `wrong-conservation-law`
2. False · අසත්‍ය · **Key**

Some kinetic energy becomes internal energy when the carts stick together.

කරත්ත එකට බැඳෙන විට චාලක ශක්තියෙන් කොටසක් අභ්‍යන්තර ශක්තිය බවට පත් වේ.

**Harder questions**

- [phy.mech.p02-01](#hard-phy-mech-p02-01) · "Wagons couple after a collision." and "A skater throws a ball and recoils." Same method?
- [phy.mech.p02-02](#hard-phy-mech-p02-02) · "A bullet embeds in a block." and "A gun recoils on firing." Same method?
- [phy.mech.p02-03](#hard-phy-mech-p02-03) · "A bead slides down a smooth curved track." and "A pendulum bob swings to its lowest point." Same method?
- [phy.mech.p02-04](#hard-phy-mech-p02-04) · "Wagons couple after a collision." and "A block slides down a smooth curved slope; find its speed at the bottom." Same method?
- [phy.mech.p02-05](#hard-phy-mech-p02-05) · "A bullet embeds in a block." and "A spring launches a block." Same method?
- [phy.mech.p02-06](#hard-phy-mech-p02-06) · "A pendulum bob swings to its lowest point." and "A shell splits into two at its highest point." Same method?

**Checks**

No outstanding findings from these checks.

## phy.mech.c110

After bouncing, a ball rises vertically to one quarter of its drop height. Ignore air resistance. Find rebound speed divided by impact speed.

පන්දුවක් පොළොවේ වැදී සිරස්ව ඉහළ ගොස් අතහැරි උසෙන් හතරෙන් එකක් දක්වා නඟී. වායු ප්‍රතිරෝධය නොසලකා, ගැටීමෙන් පසු වේගය ගැටීමට පෙර වේගයෙන් බෙදූ විට අගය කීය ද?

1. 1 : 2 · 1 : 2 · **Key**
2. 1 : 4 · 1 : 4 · `forgot-square`
3. 2 : 1 · 2 : 1 · `inverted`
4. 1 : 1 · 1 : 1 · `wrong-conservation-law`

Speed just above the floor is proportional to the square root of the corresponding height.

බිම ආසන්නයේ වේගය අදාළ උසේ වර්ගමූලයට සමානුපාතිකය.

**Harder questions**

- [phy.mech.c036](#hard-phy-mech-c036) · A ball's rebound speed × ½. Rebound height × ?
- [phy.mech.c037](#hard-phy-mech-c037) · Student says: "Speed falls by 25% at a bounce, so height falls by 25%." What's wrong?

**Checks**

No outstanding findings from these checks.

## phy.mech.c111

To find the upward speed immediately after a bounce, use the original drop height even if the bounce loses energy.

පිම්මකින් ශක්තිය හානි වුවත් පිම්මට වහාම පසු ඉහළට ඇති වේගය සෙවීමට මුලින් අතහැරි උස භාවිත කළ යුතුය.

1. True · සත්‍ය · `misread-interval`
   - The upward flight starts after the impact. Use the height reached on that flight. · ඉහළට ගමන ආරම්භ වන්නේ ගැටීමෙන් පසුවය. එම ගමනේදී ළඟා වූ උස යොදන්න.
2. False · අසත්‍ය · **Key**

The upward flight starts after the impact. Use the height reached on that flight.

ඉහළට ගමන ආරම්භ වන්නේ ගැටීමෙන් පසුවය. එම ගමනේදී ළඟා වූ උස යොදන්න.

**Harder questions**

- [phy.mech.t13](#hard-phy-mech-t13) · A ball is dropped from {h0} m. Each bounce cuts its speed by {pct}%. Height reached after {n} bounces?

**Checks**

No outstanding findings from these checks.

## phy.mech.c112

If calculation gives v² = 36 m² s⁻² after a bounce, the rebound speed is 6 m s⁻¹.

පිම්මකින් පසු v² = 36 m² s⁻² ලැබුණොත් ඉහළට පනින වේගය 6 m s⁻¹ වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `stopped-early`
   - Take the positive square root to obtain a speed. · වේගය සෙවීමට ධන වර්ගමූලය ගන්න.

Take the positive square root to obtain a speed.

වේගය සෙවීමට ධන වර්ගමූලය ගන්න.

**Harder questions**

- [phy.mech.t13](#hard-phy-mech-t13) · A ball is dropped from {h0} m. Each bounce cuts its speed by {pct}%. Height reached after {n} bounces?

**Checks**

No outstanding findings from these checks.

## phy.mech.c113

Doubling the upward speed just after a bounce doubles the rebound height under constant gravity.

නියත ගුරුත්වජ ත්වරණය යටතේ පිම්මට පසු ඉහළට වේගය දෙගුණ කළ විට නැගෙන උස දෙගුණ වේ.

1. True · සත්‍ය · `wrong-power`
2. False · අසත්‍ය · **Key**

The height is proportional to the square of the upward speed.

උස ඉහළට ඇති වේගයේ වර්ගයට සමානුපාතිකය.

**Harder questions**

- [phy.mech.c036](#hard-phy-mech-c036) · A ball's rebound speed × ½. Rebound height × ?
- [phy.mech.c037](#hard-phy-mech-c037) · Student says: "Speed falls by 25% at a bounce, so height falls by 25%." What's wrong?

**Checks**

No outstanding findings from these checks.

## phy.mech.c114

A motor raises a 2 kg mass at constant speed 3 m s⁻¹. Take g = 10 m s⁻². What is its useful power in W?

මෝටරයක් 2 kg ස්කන්ධයක් 3 m s⁻¹ නියත වේගයෙන් සිරස්ව ඔසවයි. g = 10 m s⁻² ලෙස ගන්න. ප්‍රයෝජනවත් ජවය W වලින් කීය ද?

1. 60 W · 60 W · **Key**
2. 6 W · 6 W · `forgot-g`
3. 20 W · 20 W · `wrong-quantity`
   - At constant speed the lifting force equals the weight. Multiply 20 N by 3 m s⁻¹. · නියත වේගයේදී ඔසවන බලය බරට සමානය. 20 N බලය 3 m s⁻¹ වේගයෙන් ගුණ කරන්න.
4. 9 W · 9 W · `wrong-law`
   - At constant speed the lifting force equals the weight. Multiply 20 N by 3 m s⁻¹. · නියත වේගයේදී ඔසවන බලය බරට සමානය. 20 N බලය 3 m s⁻¹ වේගයෙන් ගුණ කරන්න.

At constant speed the lifting force equals the weight. Multiply 20 N by 3 m s⁻¹.

නියත වේගයේදී ඔසවන බලය බරට සමානය. 20 N බලය 3 m s⁻¹ වේගයෙන් ගුණ කරන්න.

**Harder questions**

- [phy.mech.t12](#hard-phy-mech-t12) · {article} {m} kg car needs {p0} kW to hold {v} m s⁻¹ on a level road. Power to hold the same speed up a slope with sin θ = {s}, same resistance?

**Checks**

No outstanding findings from these checks.

## phy.mech.c115

A force perpendicular to the instantaneous velocity supplies power of magnitude Fv.

ක්ෂණික ප්‍රවේගයට ලම්බක බලයක් Fv විශාලත්වයකින් ක්ෂමතාව සපයයි.

1. True · සත්‍ය · `ignored-condition`
   - Only the force component along the velocity contributes to power. · ක්ෂමතාවට දායක වන්නේ ප්‍රවේග දිශාවේ බල සංරචකය පමණි.
2. False · අසත්‍ය · **Key**

Only the force component along the velocity contributes to power.

ක්ෂමතාවට දායක වන්නේ ප්‍රවේග දිශාවේ බල සංරචකය පමණි.

**Harder questions**

- [phy.mech.t12](#hard-phy-mech-t12) · {article} {m} kg car needs {p0} kW to hold {v} m s⁻¹ on a level road. Power to hold the same speed up a slope with sin θ = {s}, same resistance?

**Checks**

No outstanding findings from these checks.

## phy.mech.c116

A motor does work between clock readings 3 s and 8 s. Its average power over that run uses a time of 5 s.

මෝටරයක් ඔරලෝසු කියවීම් 3 s හා 8 s අතර කාර්යයක් කරයි. එම ධාවනයේ මධ්‍යන්‍ය ක්ෂමතාව සඳහා අදාළ කාලය 5 s වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `misread-interval`
   - Divide the work by elapsed time. · කාර්යය ගත වූ කාලයෙන් බෙදන්න.

Divide the work by elapsed time.

කාර්යය ගත වූ කාලයෙන් බෙදන්න.

**Harder questions**

- [phy.mech.t12](#hard-phy-mech-t12) · {article} {m} kg car needs {p0} kW to hold {v} m s⁻¹ on a level road. Power to hold the same speed up a slope with sin θ = {s}, same resistance?

**Checks**

No outstanding findings from these checks.

## phy.mech.c126

Energy conservation alone fixes a diver’s new spin rate when the diver does work to tuck in.

කිමිදුම්කරුවකු කාර්යයක් කරමින් සිරුර හකුළා ගන්නා විට ශක්ති සංස්ථිතිය පමණක් භාවිත කර නව භ්‍රමණ වේගය තීරණය කළ හැකිය.

1. True · සත්‍ය · `wrong-conservation-law`
2. False · අසත්‍ය · **Key**

With negligible external torque, conservation of angular momentum relates the two spin rates directly.

බාහිර ව්‍යාවර්තය නොගිණිය හැකි විට වේග දෙක සම්බන්ධ කරන්නේ කෝණික ගම්‍යතා සංස්ථිතියයි.

**Harder questions**

- [phy.mech.p05-03](#hard-phy-mech-p05-03) · A solid cylinder rolls down a slope from rest. Most direct principle for its speed at the bottom?
- [phy.mech.p05-04](#hard-phy-mech-p05-04) · A wheel falls, unwinding a string round its axle. Most direct principle for its speed after a known drop?
- [phy.mech.p05-05](#hard-phy-mech-p05-05) · A constant torque spins up a flywheel from rest. Most direct principle for its angular speed after a known time?
- [phy.mech.p05-06](#hard-phy-mech-p05-06) · A constant friction torque slows a wheel. Most direct principle for the time it takes to stop?

**Checks**

No outstanding findings from these checks.

## phy.mech.c128

If I triples at fixed angular momentum, angular speed falls to one third.

කෝණික ගම්‍යතාව නියතව තිබියදී I තුන් ගුණයක් කළ විට කෝණික වේගය මුල් අගයෙන් තුනෙන් එකක් වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `wrong-power`

Angular speed is inversely proportional to I.

කෝණික වේගය I ට ප්‍රතිලෝමව සමානුපාතිකය.

**Harder questions**

- [phy.mech.c038](#hard-phy-mech-c038) · A skater pulls in their arms, and I halves. ω × ?
- [phy.mech.c039](#hard-phy-mech-c039) · A skater pulls in their arms, and I halves. Rotational KE × ?

**Checks**

No outstanding findings from these checks.

## phy.mech.c129

A rolling wheel has 6 J of translational and 2 J of rotational kinetic energy. What fraction of its total kinetic energy is rotational?

පෙරළෙන රෝදයක උත්තාරණ චාලක ශක්තිය 6 J හා භ්‍රමණ චාලක ශක්තිය 2 J වේ. භ්‍රමණ චාලක ශක්තිය මුළු චාලක ශක්තියෙන් කවර භාගයක් ද?

1. 1 : 4 · 1 : 4 · **Key**
2. 4 : 1 · 4 : 1 · `inverted`
3. 3 : 4 · 3 : 4 · `wrong-quantity`
   - Use the rotational part divided by the sum of both parts. · භ්‍රමණ කොටස කොටස් දෙකේ එකතුවෙන් බෙදන්න.
4. 1 : 3 · 1 : 3 · `stopped-early`
   - Use the rotational part divided by the sum of both parts. · භ්‍රමණ කොටස කොටස් දෙකේ එකතුවෙන් බෙදන්න.

Use the rotational part divided by the sum of both parts.

භ්‍රමණ කොටස කොටස් දෙකේ එකතුවෙන් බෙදන්න.

**Harder questions**

- [phy.mech.c042](#hard-phy-mech-c042) · A hoop and a disc have equal M and R, and roll at equal speed. Ratio of rotational KE, hoop : disc?
- [phy.mech.t15](#hard-phy-mech-t15) · A {shape} (I = {frac(c)} MR²) rolls without slipping. Find total KE ÷ {target} KE.

**Checks**

No outstanding findings from these checks.

## phy.mech.c130

Uniform solid discs of different masses rolling without slip at the same speed have the same rotational fraction of total kinetic energy.

වෙනස් ස්කන්ධ ඇති ඒකාකාර ඝන තැටි එකම වේගයෙන් නොලිස්සා පෙරළෙද්දී ඒවායේ මුළු චාලක ශක්තියෙන් භ්‍රමණයට අයත් භාගය සමාන වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `mass-matters`

Both energy terms contain the same mass factor.

ශක්ති පද දෙකටම එකම ස්කන්ධ සාධකය ඇත.

**Harder questions**

- [phy.mech.c041](#hard-phy-mech-c041) · A solid sphere and a hoop of equal mass and radius roll down the same slope. Which gets down first?

**Checks**

No outstanding findings from these checks.

## phy.mech.c131

Rolling bodies of equal mass and radius always have the same rotational energy at the same angular speed.

ස්කන්ධය හා අරය සමාන පෙරළෙන වස්තුවල කෝණික වේගය සමාන නම් ඒවායේ භ්‍රමණ ශක්තිය සෑම විටම සමානය.

1. True · සත්‍ය · `moi-mass-only`
2. False · අසත්‍ය · **Key**

The energy also depends on how mass is distributed about the axis.

ශක්තිය අක්ෂය වටා ස්කන්ධ ව්‍යාප්තිය මත ද රඳා පවතී.

**Harder questions**

- [phy.mech.c041](#hard-phy-mech-c041) · A solid sphere and a hoop of equal mass and radius roll down the same slope. Which gets down first?
- [phy.mech.c042](#hard-phy-mech-c042) · A hoop and a disc have equal M and R, and roll at equal speed. Ratio of rotational KE, hoop : disc?

**Checks**

No outstanding findings from these checks.

## phy.mech.c133

Doubling the speed of a wheel rolling without slip merely doubles its total kinetic energy.

නොලිස්සා පෙරළෙන රෝදයක වේගය දෙගුණ කළ විට මුළු චාලක ශක්තිය දෙගුණයක් පමණක් වේ.

1. True · සත්‍ය · `wrong-power`
2. False · අසත්‍ය · **Key**

Both translational and rotational energy increase fourfold.

උත්තාරණ හා භ්‍රමණ ශක්ති දෙකම සිව් ගුණයක් වේ.

**Harder questions**

- [phy.mech.c042](#hard-phy-mech-c042) · A hoop and a disc have equal M and R, and roll at equal speed. Ratio of rotational KE, hoop : disc?

**Checks**

No outstanding findings from these checks.

## phy.mech.c134

A wheel starts partway down a ramp. Its loss of gravitational potential energy uses the vertical drop from its own starting point.

රෝදයක් ආනත තලයේ මැද තැනකින් ගමන් අරඹයි. ගුරුත්වාකර්ෂණ විභව ශක්ති අඩුව සෙවීමට ගන්නේ එය ගමන් ඇරඹූ තැන සිට ඇති සිරස් බැස්මයි.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `misread-interval`
   - Only the height difference over the actual journey contributes. · දායක වන්නේ සැබවින්ම ගමන් කළ ලක්ෂ්‍ය අතර උස වෙනස පමණි.

Only the height difference over the actual journey contributes.

දායක වන්නේ සැබවින්ම ගමන් කළ ලක්ෂ්‍ය අතර උස වෙනස පමණි.

**Harder questions**

- [phy.mech.t15](#hard-phy-mech-t15) · A {shape} (I = {frac(c)} MR²) rolls without slipping. Find total KE ÷ {target} KE.

**Checks**

No outstanding findings from these checks.

## phy.mech.c135

A car rounds a flat curve of diameter 20 m at 10 m s⁻¹. Find the required centripetal acceleration in m s⁻².

මෝටර් රථයක් විෂ්කම්භය 20 m වූ තිරස් වංගුවක 10 m s⁻¹ වේගයෙන් ගමන් කරයි. අවශ්‍ය කේන්ද්‍රාභිසාරී ත්වරණය m s⁻² වලින් කීය ද?

1. 10 m s⁻² · 10 m s⁻² · **Key**
2. 5 m s⁻² · 5 m s⁻² · `radius-diameter`
3. 1 m s⁻² · 1 m s⁻² · `forgot-square`
4. 0.1 m s⁻² · 0.1 m s⁻² · `inverted`

Use v²/r with radius 10 m.

අරය 10 m ලෙස ගෙන v²/r යොදන්න.

**Harder questions**

- [phy.mech.c031](#hard-phy-mech-c031) · A coin rests on a turntable. Rotation rate × 2. Largest radius without sliding × ?
- [phy.mech.t10](#hard-phy-mech-t10) · A coin sits on a turntable spinning at {rpm} rpm. μₛ = {mu}. Largest distance from the centre without sliding? (Take π = 3)

**Checks**

No outstanding findings from these checks.

## phy.mech.c136

Viewed from the road, a car turning at constant speed needs an outward net force.

මාර්ගයේ සිට බලන විට නියත වේගයෙන් වංගුවක යන රථයකට පිටතට යොමු වූ ශුද්ධ බලයක් අවශ්‍ය වේ.

1. True · සත්‍ය · `centrifugal`
2. False · අසත්‍ය · **Key**

The net force points towards the centre of the turn.

ශුද්ධ බලය වංගුවේ කේන්ද්‍රය දෙසට යොමු වේ.

**Harder questions**

- [phy.mech.c030](#hard-phy-mech-c030) · A coin turns with a turntable without sliding. What force keeps it moving in a circle?

**Checks**

No outstanding findings from these checks.

## phy.mech.c138

On a flat horizontal road, static friction can supply the inward force on a turning tyre.

තිරස් මාර්ගයක හැරෙන ටයරයකට අවශ්‍ය ඇතුළට බලය ස්ථිතික ඝර්ෂණයෙන් ලැබිය හැකිය.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `force-wrong-source`

Weight and the road’s normal reaction are vertical.

බර හා මාර්ගයේ අභිලම්බ ප්‍රතික්‍රියාව සිරස් දිශාවේය.

**Harder questions**

- [phy.mech.c030](#hard-phy-mech-c030) · A coin turns with a turntable without sliding. What force keeps it moving in a circle?

**Checks**

No outstanding findings from these checks.

## phy.mech.c139

For a flat road the greatest lateral acceleration before slipping is μg when the limiting friction is μmg.

තිරස් මාර්ගයක සීමාන්ත ඝර්ෂණය μmg නම් ලිස්සීමට පෙර උපරිම පාර්ශ්වික ත්වරණය μg වේ.

1. True · සත්‍ය · **Key**
2. False · අසත්‍ය · `forgot-mu`

Divide the limiting lateral force by m.

සීමාකාරී පාර්ශ්වික බලය m න් බෙදන්න.

**Harder questions**

- [phy.mech.t10](#hard-phy-mech-t10) · A coin sits on a turntable spinning at {rpm} rpm. μₛ = {mu}. Largest distance from the centre without sliding? (Take π = 3)

**Checks**

No outstanding findings from these checks.

## phy.mech.c140

At fixed radius, doubling speed doubles the friction force required to turn a car.

අරය නියත විට රථයේ වේගය දෙගුණ කළහොත් හැරීමට අවශ්‍ය ඝර්ෂණ බලය දෙගුණ වේ.

1. True · සත්‍ය · `wrong-power`
2. False · අසත්‍ය · **Key**

The required force is proportional to v², so it increases fourfold.

අවශ්‍ය බලය v² ට සමානුපාතික බැවින් එය සිව් ගුණයක් වේ.

**Harder questions**

- [phy.mech.c031](#hard-phy-mech-c031) · A coin rests on a turntable. Rotation rate × 2. Largest radius without sliding × ?

**Checks**

No outstanding findings from these checks.

## Harder questions referenced by the drafts

Template braces stand for generated values. Each bank lists its authored true and false statements. The draft branch supplies these links.

<a id="hard-phy-mech-b01"></a>

### phy.mech.b01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

- The two forces of a pair are equal in size. · ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයක බල දෙක විශාලත්වයෙන් සමාන ය. (true)
- The two forces of a pair are of the same type. · ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයක බල දෙක එකම වර්ගයේ ය. (true)
- Earth's pull on a book and the book's pull on Earth form a pair. · පොත මත පෘථිවියේ ඇදීම හා පෘථිවිය මත පොතේ ඇදීම ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයකි. (true)
- The two forces of a pair act on different bodies. · ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයක බල දෙක වෙනස් වස්තු මත ක්‍රියා කරයි. (true)
- The two forces of a pair cancel each other. · ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයක බල දෙක එකිනෙක අවලංගු කරයි. (pair-cancels)
- A pair of forces can exist only between bodies in contact. · ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයක් ඇති විය හැක්කේ ස්පර්ශ වී ඇති වස්තු අතර පමණි. (pair-contact-only)
- The reaction appears slightly after the action. · ප්‍රතික්‍රියාව ඇති වන්නේ ක්‍රියාවට මඳ වේලාවකට පසුව ය. (pair-delay)
- A table's push on a book and the book's weight form a pair. · පොත මත මේසයේ තෙරපුම හා පොතේ බර ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයකි. (balance-vs-pair)

<a id="hard-phy-mech-b02"></a>

### phy.mech.b02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

- Moment of inertia depends on the axis chosen. · අවස්ථිති සූර්ණය තෝරා ගන්නා අක්ෂය මත රඳා පවතී. (true)
- Doubling every mass, at the same positions, doubles the moment of inertia. · එකම පිහිටීම්වල සියලු ස්කන්ධ දෙගුණ කළ විට අවස්ථිති සූර්ණය දෙගුණ වේ. (true)
- Moving mass further from the axis increases the moment of inertia. · ස්කන්ධය අක්ෂයෙන් ඈතට ගෙන ගිය විට අවස්ථිති සූර්ණය වැඩි වේ. (true)
- About the central axis, a ring has a larger moment of inertia than a disc of equal mass and radius. · කේන්ද්‍රීය අක්ෂය වටා, මුද්දක අවස්ථිති සූර්ණය සමාන ස්කන්ධ හා අරය ඇති තැටියක අගයට වඩා වැඩි ය. (true)
- Moment of inertia increases when the body spins faster. · වස්තුව වේගයෙන් කැරකෙන විට අවස්ථිති සූර්ණය වැඩි වේ. (moi-depends-on-omega)
- Moment of inertia has the same value about every axis. · සෑම අක්ෂයක් වටාම අවස්ථිති සූර්ණයේ අගය සමාන ය. (moi-axis-free)
- Two bodies of equal mass always have equal moments of inertia. · සමාන ස්කන්ධ ඇති වස්තු දෙකක අවස්ථිති සූර්ණ සැමවිටම සමාන ය. (moi-mass-only)
- The SI unit of moment of inertia is kg m. · අවස්ථිති සූර්ණයේ SI ඒකකය kg m වේ. (wrong-power)

<a id="hard-phy-mech-c003"></a>

### phy.mech.c003

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball passes a window going up, then again coming down, 6 s later. Student says: "It takes 6 s to go from the window to the top." What's wrong?

පන්දුවක් ඉහළ යන විට ජනේලයක් පසු කර, 6 s කට පසු පහළ එන විට නැවත එය පසු කරයි. ශිෂ්‍යයෙක් මෙසේ කියයි: "ජනේලයේ සිට ඉහළම ලක්ෂ්‍යයට යාමට 6 s ගත වේ." එහි වැරැද්ද කුමක් ද?

- The 6 s covers up and down, so window to top is 3 s · 6 s යනු ඉහළ යාමට හා පහළ ඒමට ගත වන කාලය නිසා ජනේලයේ සිට ඉහළටම 3 s වේ (key)
- The ball is slower going up, so window to top is over 3 s · ඉහළ යන විට පන්දුව සෙමින් ගමන් කරන නිසා ජනේලයේ සිට ඉහළටම 3 s ට වැඩි ය (up-down-time)
- The ball's mass decides how long it takes to reach the top · ඉහළටම ළඟා වීමට ගත වන කාලය තීරණය වන්නේ පන්දුවේ ස්කන්ධයෙනි (mass-matters)
- Nothing is wrong: the 6 s only counts the way up · වැරැද්දක් නැත: 6 s යනු ඉහළ යාමට පමණක් ගත වන කාලයයි (misread-interval)

<a id="hard-phy-mech-c006"></a>

### phy.mech.c006

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

An object starts from rest, speeds up, then slows to a stop, never reversing. Pick its s–t graph.

වස්තුවක් නිශ්චලතාවෙන් ආරම්භ වී වේගය වැඩි කර, පසුව වේගය අඩු වී නතර වේ. එය කිසිවිටෙක ආපසු නොයයි. එහි s–t ප්‍රස්තාරය තෝරන්න.

- S-shaped rise: flat at the start and flat at the end · S හැඩැති නැගීමක්: ආරම්භයේ හා අවසානයේ තිරස් ය (key)
- Straight rising line · ඉහළ යන සරල රේඛාවක් (graph-shape)
- Rises, then falls back to zero · ඉහළ ගොස් නැවත ශුන්‍යයට වැටේ (sign)
- Steep at the start, flat only at the end · ආරම්භයේ බෑවුම වැඩි ය, අවසානයේ පමණක් තිරස් ය (ignored-condition)
- [Figure for option 1](../../../content/sample-v2/mechanics-20/figures/c006-1.svg)
- [Figure for option 2](../../../content/sample-v2/mechanics-20/figures/c006-2.svg)
- [Figure for option 3](../../../content/sample-v2/mechanics-20/figures/c006-3.svg)
- [Figure for option 4](../../../content/sample-v2/mechanics-20/figures/c006-4.svg)

<a id="hard-phy-mech-c007"></a>

### phy.mech.c007

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A runner goes 5 m s⁻¹ for 1 s, then 1 m s⁻¹ for 3 s. Student says: "Average = (5 + 1) ÷ 2 = 3 m s⁻¹." What's wrong?

ධාවකයෙක් 1 s ක් 5 m s⁻¹ කින් ද, පසුව 3 s ක් 1 m s⁻¹ කින් ද දුවයි. ශිෂ්‍යයෙක් මෙසේ කියයි: "සාමාන්‍යය = (5 + 1) ÷ 2 = 3 m s⁻¹." එහි වැරැද්ද කුමක් ද?

- The times are unequal, so divide total distance by total time · කාල අසමාන නිසා මුළු දුර මුළු කාලයෙන් බෙදිය යුතු ය (key)
- The runner slowed down, so use the final speed instead · ධාවකයා වේගය අඩු කළ නිසා අවසාන වේගය යොදා ගත යුතු ය (misread-interval)
- The faster part counts more, so the average is above 3 m s⁻¹ · වේගවත් කොටසට වැඩි බරක් ලැබෙන නිසා සාමාන්‍යය 3 m s⁻¹ ට වැඩි ය (mean-of-speeds)
- The times need averaging too, so divide 3 by 2 · කාලවල ද සාමාන්‍යය ගත යුතු නිසා 3, 2 න් බෙදිය යුතු ය (wrong-law)

<a id="hard-phy-mech-c008"></a>

### phy.mech.c008

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

What pushes a walking person forward?

ඇවිදින පුද්ගලයෙකු ඉදිරියට තල්ලු කරන්නේ කුමක් ද?

- Ground friction on the foot · පොළොව පාදය මත යොදන ඉදිරි දිශාවට ඇති ඝර්ෂණ බලය (key)
- The person, on the ground · පුද්ගලයා, පොළොව මත (force-on-wrong-body)
- The person's legs, on the person · පුද්ගලයාගේ පාද, පුද්ගලයා මත (internal-force)
- The air, on the person · වාතය, පුද්ගලයා මත (force-wrong-source)

<a id="hard-phy-mech-c009"></a>

### phy.mech.c009

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A car accelerates on a level road without tyre slip. What pushes the car forward?

ධාවක ටයර ලිස්සා යාමකින් තොරව පෙරළෙද්දී මෝටර් රථයක් තිරස් මාර්ගයක වේගය වැඩි කරයි. රථය ඉදිරියට තල්ලු කරන්නේ කුමක් ද?

- Road friction on tyres · මාර්ගය ධාවක ටයර මත යොදන ඉදිරි දිශාවට ඇති ඝර්ෂණ බලය (key)
- The engine, on the car · එන්ජිම, මෝටර් රථය මත (internal-force)
- The tyres, on the road · ටයර, මාර්ගය මත (force-on-wrong-body)
- The air, on the car · වාතය, මෝටර් රථය මත (force-wrong-source)

<a id="hard-phy-mech-c011"></a>

### phy.mech.c011

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A book rests on a table. Which force pairs with Earth's pull on the book?

පොතක් මේසයක් මත නිශ්චලව ඇත. පොත මත පෘථිවියේ ඇදීම සමඟ ක්‍රියා–ප්‍රතික්‍රියා බල යුගලයක් වන්නේ කුමන බලය ද?

- The book's pull on Earth · පෘථිවිය මත පොතේ ඇදීම (key)
- The table's push on the book · පොත මත මේසයේ තෙරපුම (balance-vs-pair)
- The book's push on the table · මේසය මත පොතේ තෙරපුම (force-on-wrong-body)
- The table's pull on Earth · පෘථිවිය මත මේසයේ ඇදීම (pair-wrong-bodies)

<a id="hard-phy-mech-c012"></a>

### phy.mech.c012

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Student says: "Action and reaction are equal and opposite, so nothing can ever accelerate." What's wrong?

ශිෂ්‍යයෙක් මෙසේ කියයි: "ක්‍රියාව හා ප්‍රතික්‍රියාව සමාන හා ප්‍රතිවිරුද්ධ නිසා කිසිවක් කිසිදා ත්වරණය විය නොහැක." එහි වැරැද්ද කුමක් ද?

- They act on different bodies, so they don't cancel · ඒවා වෙනස් වස්තු මත ක්‍රියා කරන නිසා එකිනෙක අවලංගු නොවේ (key)
- The reaction is a little smaller, so a net force remains · ප්‍රතික්‍රියාව මඳක් කුඩා නිසා ශුද්ධ බලයක් ඉතිරි වේ (pair-unequal)
- The reaction comes later, so they don't cancel at once · ප්‍රතික්‍රියාව පසුව ඇති වන නිසා ඒවා එකවර අවලංගු නොවේ (pair-delay)
- They only cancel when the two bodies are touching · ඒවා අවලංගු වන්නේ වස්තු දෙක ස්පර්ශ වී ඇති විට පමණි (pair-contact-only)

<a id="hard-phy-mech-c013"></a>

### phy.mech.c013

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A lift moving up is slowing down. Compared with mg, the scale reading is?

ඉහළට යන සෝපානයක වේගය අඩු වෙමින් පවතී. mg හා සසඳන විට තරාදියේ පාඨාංකය කුමක් ද?

- Less than mg · mg ට වඩා අඩු ය (key)
- More than mg · mg ට වඩා වැඩි ය (motion-vs-accel)
- Equal to mg · mg ට සමාන ය (ignored-condition)
- Zero · ශුන්‍ය වේ (free-fall-reading)

<a id="hard-phy-mech-c014"></a>

### phy.mech.c014

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A lift moves down at constant speed. Compared with mg, the scale reading is?

සෝපානයක් නියත වේගයකින් පහළට ගමන් කරයි. mg හා සසඳන විට තරාදියේ පාඨාංකය කුමක් ද?

- Equal to mg · mg ට සමාන ය (key)
- Less than mg · mg ට වඩා අඩු ය (motion-vs-accel)
- More than mg · mg ට වඩා වැඩි ය (sign)
- Zero · ශුන්‍ය වේ (free-fall-reading)

<a id="hard-phy-mech-c015"></a>

### phy.mech.c015

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A block slides to rest on a rough surface. Initial speed × 2. Stopping distance × ?

කුට්ටියක් රළු පෘෂ්ඨයක ලිස්සා ගොස් නතර වේ. ආරම්භක වේගය × 2. නැවතුම් දුර × ?

- 4 · 4 (key)
- 2 · 2 (forgot-square)
- 8 · 8 (wrong-power)
- √2 · √2 (inverted)

<a id="hard-phy-mech-c016"></a>

### phy.mech.c016

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A block slides to rest on a rough surface. Mass × 2, same initial speed. Stopping distance × ?

කුට්ටියක් රළු පෘෂ්ඨයක ලිස්සා ගොස් නතර වේ. ස්කන්ධය × 2, ආරම්භක වේගය එලෙසම ය. නැවතුම් දුර × ?

- 1 · 1 (key)
- 2 · 2 (mass-matters)
- ½ · ½ (inverted)
- 4 · 4 (wrong-power)

<a id="hard-phy-mech-c017"></a>

### phy.mech.c017

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Blocks X and Y slide at 2 m s⁻¹ and 6 m s⁻¹ on a level floor. Both have the same coefficient of kinetic friction with the floor. Stopping distances, X : Y?

X හා Y කුට්ටි තිරස් බිමක පිළිවෙළින් 2 m s⁻¹ හා 6 m s⁻¹ වේගවලින් ලිස්සා යයි. බිම හා එක් එක් කුට්ටිය අතර ගතික ඝර්ෂණ සංගුණකය සමාන ය. ඒවායේ නැවතුම් දුරවල අනුපාතය X : Y කීය ද?

- 1 : 9 · 1 : 9 (key)
- 1 : 3 · 1 : 3 (forgot-square)
- 3 : 1 · 3 : 1 (wrong-power)
- 9 : 1 · 9 : 1 (inverted)

<a id="hard-phy-mech-c018"></a>

### phy.mech.c018

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A block rests on a rough slope without sliding. Pick the diagram of the forces on it.

කුට්ටියක් රළු ආනත තලයක ලිස්සා නොගොස් නිශ්චලව ඇත. එය මත බල දැක්වෙන රූපසටහන තෝරන්න.

- Weight down, N perpendicular to the slope, friction up the slope · බර පහළට, N ආනත තලයට ලම්බව, ඝර්ෂණය තලය දිගේ ඉහළට (key)
- Weight down, N perpendicular to the slope, friction down the slope · බර පහළට, N ආනත තලයට ලම්බව, ඝර්ෂණය තලය දිගේ පහළට (friction-direction)
- Weight down, N perpendicular to the slope, no friction · බර පහළට, N ආනත තලයට ලම්බව, ඝර්ෂණය නැත (omitted-friction)
- Weight down, N straight up, friction up the slope · බර පහළට, N සිරස්ව ඉහළට, ඝර්ෂණය තලය දිගේ ඉහළට (normal-vertical)
- [Figure for option 1](../../../content/sample-v2/mechanics-20/figures/c018-1.svg)
- [Figure for option 2](../../../content/sample-v2/mechanics-20/figures/c018-2.svg)
- [Figure for option 3](../../../content/sample-v2/mechanics-20/figures/c018-3.svg)
- [Figure for option 4](../../../content/sample-v2/mechanics-20/figures/c018-4.svg)

<a id="hard-phy-mech-c020"></a>

### phy.mech.c020

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

All four wheels of a car are driven. Greatest possible acceleration on a level road?

මෝටර් රථයක රෝද හතරම එන්ජිමෙන් ධාවනය වේ. තිරස් මාර්ගයක ලැබිය හැකි විශාලතම ත්වරණය කුමක් ද?

- μₛg · μₛg (key)
- μₛmg · μₛmg (forgot-mass)
- g/μₛ · g/μₛ (inverted)
- μₛg/2 · μₛg/2 (assumed-symmetry)

<a id="hard-phy-mech-c021"></a>

### phy.mech.c021

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Equal-mass blocks move towards each other at 6 m s⁻¹ and 2 m s⁻¹, then stick. Their speed after?

සමාන ස්කන්ධ ඇති කුට්ටි දෙකක් 6 m s⁻¹ හා 2 m s⁻¹ වේගවලින් එකිනෙක දෙසට ගමන් කර ඇලී යයි. ඉන්පසු ඒවායේ වේගය කුමක් ද?

- 2 m s⁻¹ · 2 m s⁻¹ (key)
- 4 m s⁻¹ · 4 m s⁻¹ (sign)
- 8 m s⁻¹ · 8 m s⁻¹ (forgot-mass)
- 0 · 0 (assumed-symmetry)

<a id="hard-phy-mech-c025"></a>

### phy.mech.c025

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

The area under an F–t graph is 30 N s. It acts on a 3 kg body at rest. Final speed?

F–t ප්‍රස්තාරයකට යටින් ඇති වර්ගඵලය 30 N s කි. එය නිශ්චලව ඇති 3 kg වස්තුවක් මත ක්‍රියා කරයි. අවසාන වේගය කුමක් ද?

- 10 m s⁻¹ · 10 m s⁻¹ (key)
- 30 m s⁻¹ · 30 m s⁻¹ (forgot-mass)
- 90 m s⁻¹ · 90 m s⁻¹ (inverted)
- 5 m s⁻¹ · 5 m s⁻¹ (forgot-half)

<a id="hard-phy-mech-c026"></a>

### phy.mech.c026

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball is launched at 60° above the horizontal. Ignore air resistance. A student says its KE is zero at the highest point. Which correction is valid?

පන්දුවක් තිරසට 60°ක කෝණයකින් ඉහළට විසි කරයි. වායු ප්‍රතිරෝධය නොසලකන්න. ඉහළම ලක්ෂ්‍යයේ දී චාලක ශක්තිය ශුන්‍ය යැයි සිසුවෙක් පවසයි. නිවැරදි පැහැදිලි කිරීම කුමක් ද?

- Horizontal velocity remains, so KE isn't zero · තිරස් ප්‍රවේගය ඉතිරි වන නිසා චාලක ශක්තිය ශුන්‍ය නොවේ (key)
- KE at the top is always half of K, at any angle · ඕනෑම කෝණයක දී ඉහළම ලක්ෂ්‍යයේ චාලක ශක්තිය සැමවිටම K ගෙන් අඩකි (ke-half-at-top)
- KE is zero only when PE is zero as well · චාලක ශක්තිය ශුන්‍ය වන්නේ විභව ශක්තිය ද ශුන්‍ය වන විට පමණි (ke-pe-confusion)
- v = 0 is right, but KE also depends on height · v = 0 නිවැරදි ය, නමුත් චාලක ශක්තිය උස මත ද රඳා පවතී (v-zero-at-top)

<a id="hard-phy-mech-c028"></a>

### phy.mech.c028

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball in flight is at the top of its path, moving right. No air resistance. Pick the diagram of the forces on it.

පියාසර කරන පන්දුවක් පථයේ ඉහළම ලක්ෂ්‍යයේ දී දකුණට ගමන් කරයි. වායු ප්‍රතිරෝධය නැත. එය මත බල දැක්වෙන රූපසටහන තෝරන්න.

- Only mg, downward · mg පමණි, පහළට (key)
- mg downward and a forward force · පහළට mg සහ ඉදිරියට බලයක් (force-along-motion)
- Only a forward force · ඉදිරියට බලයක් පමණි (gravity-off-in-flight)
- No forces at the top · ඉහළම ලක්ෂ්‍යයේ බල නැත (accel-zero-at-top)
- [Figure for option 1](../../../content/sample-v2/mechanics-20/figures/c028-1.svg)
- [Figure for option 2](../../../content/sample-v2/mechanics-20/figures/c028-2.svg)
- [Figure for option 3](../../../content/sample-v2/mechanics-20/figures/c028-3.svg)
- [Figure for option 4](../../../content/sample-v2/mechanics-20/figures/c028-4.svg)

<a id="hard-phy-mech-c030"></a>

### phy.mech.c030

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A coin turns with a turntable without sliding. What force keeps it moving in a circle?

කාසියක් ලිස්සා නොගොස් භ්‍රමණ තලයක් සමඟ කැරකෙයි. එය වෘත්තයක ගමන් කරවන බලය කුමක් ද?

- Static friction, towards the centre · ස්ථිතික ඝර්ෂණය, කේන්ද්‍රය දෙසට (key)
- Centrifugal force, outwards · කේන්ද්‍රාපසාරී බලය, පිටතට (centrifugal)
- The normal reaction · අභිලම්බ ප්‍රතික්‍රියාව (force-wrong-source)
- A force along its direction of motion · චලිත දිශාව ඔස්සේ ක්‍රියා කරන බලයක් (force-along-motion)

<a id="hard-phy-mech-c031"></a>

### phy.mech.c031

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A coin rests on a turntable. Rotation rate × 2. Largest radius without sliding × ?

කාසියක් භ්‍රමණ තලයක් මත ඇත. භ්‍රමණ සීඝ්‍රතාව × 2. ලිස්සා නොයන විශාලතම අරය × ?

- ¼ · ¼ (key)
- ½ · ½ (forgot-square)
- 2 · 2 (wrong-power)
- 4 · 4 (inverted)

<a id="hard-phy-mech-c032"></a>

### phy.mech.c032

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A person walks along a uniform beam from support P to support Q. Pick the graph of the force at Q against distance walked.

පුද්ගලයෙක් ඒකාකාර බාල්කයක් දිගේ P ආධාරකයේ සිට Q ආධාරකය දක්වා ඇවිදියි. ඇවිද ගිය දුරට එරෙහිව Q හි බලයේ ප්‍රස්තාරය තෝරන්න.

- Straight rising line that starts above zero · ශුන්‍යයට ඉහළින් ආරම්භ වී ඉහළ යන සරල රේඛාවක් (key)
- Curve that rises · ඉහළ යන වක්‍රයක් (wrong-power)
- Straight falling line · පහළ යන සරල රේඛාවක් (swapped-support)
- Straight rising line that starts at zero · ශුන්‍යයෙන් ආරම්භ වී ඉහළ යන සරල රේඛාවක් (ignored-condition)
- [Figure for option 1](../../../content/sample-v2/mechanics-20/figures/c032-1.svg)
- [Figure for option 2](../../../content/sample-v2/mechanics-20/figures/c032-2.svg)
- [Figure for option 3](../../../content/sample-v2/mechanics-20/figures/c032-3.svg)
- [Figure for option 4](../../../content/sample-v2/mechanics-20/figures/c032-4.svg)

<a id="hard-phy-mech-c036"></a>

### phy.mech.c036

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball's rebound speed × ½. Rebound height × ?

පන්දුවක පොළා පැනීමේ වේගය × ½. පොළා පැනීමේ උස × ?

- ¼ · ¼ (key)
- ½ · ½ (forgot-square)
- 2 · 2 (inverted)
- √½ · √½ (wrong-power)

<a id="hard-phy-mech-c037"></a>

### phy.mech.c037

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Student says: "Speed falls by 25% at a bounce, so height falls by 25%." What's wrong?

ශිෂ්‍යයෙක් මෙසේ කියයි: "පොළා පැනීමේ දී වේගය 25% කින් අඩු වන නිසා උස ද 25% කින් අඩු වේ." එහි වැරැද්ද කුමක් ද?

- Height ∝ v², so height falls to about 56% · උස ∝ v² නිසා උස 56% පමණ දක්වා අඩු වේ (key)
- Height ∝ v², so height falls by 2 × 25% = 50% · උස ∝ v² නිසා උස 2 × 25% = 50% කින් අඩු වේ (forgot-square)
- Height ∝ √v, so height falls to about 87% · උස ∝ √v නිසා උස 87% පමණ දක්වා අඩු වේ (wrong-power)
- Energy isn't lost, so height doesn't change · ශක්තිය හානි නොවන නිසා උස වෙනස් නොවේ (wrong-conservation-law)

<a id="hard-phy-mech-c038"></a>

### phy.mech.c038

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A skater pulls in their arms, and I halves. ω × ?

ලිස්සන්නෙක් අත් ඇතුළට ගන්නා විට I අඩක් වේ. ω × ?

- 2 · 2 (key)
- ½ · ½ (inverted)
- √2 · √2 (ke-conserved-rotation)
- 4 · 4 (wrong-power)

<a id="hard-phy-mech-c039"></a>

### phy.mech.c039

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A skater pulls in their arms, and I halves. Rotational KE × ?

ලිස්සන්නෙක් අත් ඇතුළට ගන්නා විට I අඩක් වේ. භ්‍රමණ චාලක ශක්තිය × ?

- 2 · 2 (key)
- 1 · 1 (ke-conserved-rotation)
- 4 · 4 (wrong-power)
- ½ · ½ (inverted)

<a id="hard-phy-mech-c041"></a>

### phy.mech.c041

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A solid sphere and a hoop of equal mass and radius roll down the same slope. Which gets down first?

සමාන ස්කන්ධ හා අරය ඇති ඝන ගෝලයක් සහ වළල්ලක් එකම ආනත තලයක පහළට පෙරළේ. පළමුව පහළට ළඟා වන්නේ කුමක් ද?

- Sphere · ගෝලය (key)
- Hoop · වළල්ල (moi-shape-swap)
- They tie · දෙකම එකවර (moi-mass-only)
- Depends on the mass · ස්කන්ධය මත රඳා පවතී (mass-matters)

<a id="hard-phy-mech-c042"></a>

### phy.mech.c042

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A hoop and a disc have equal M and R, and roll at equal speed. Ratio of rotational KE, hoop : disc?

සමාන M හා R ඇති වළල්ලක් සහ තැටියක් සමාන වේගයෙන් පෙරළේ. භ්‍රමණ චාලක ශක්තිවල අනුපාතය, වළල්ල : තැටිය, කුමක් ද?

- 2 : 1 · 2 : 1 (key)
- 1 : 2 · 1 : 2 (inverted)
- 1 : 1 · 1 : 1 (moi-mass-only)
- 4 : 1 · 4 : 1 (wrong-power)

<a id="hard-phy-mech-c043"></a>

### phy.mech.c043

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ring and a disc have equal mass and radius. Which has the larger I about the central axis?

මුද්දකට සහ තැටියකට සමාන ස්කන්ධ හා අරය ඇත. කේන්ද්‍රීය අක්ෂය වටා විශාල I ඇත්තේ කුමකට ද?

- Ring · මුද්ද (key)
- Disc · තැටිය (moi-shape-swap)
- Equal · සමාන ය (moi-mass-only)
- Depends on speed · වේගය මත රඳා පවතී (moi-depends-on-omega)

<a id="hard-phy-mech-p01-01"></a>

### phy.mech.p01-01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Two rail wagons collide and couple together. Most direct principle for their common speed?

දුම්රිය මැදිරි දෙකක් ගැටී එකට සම්බන්ධ වේ. පොදු වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of momentum · ගම්‍යතා සංස්ථිතිය (key)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-inelastic)
- F = ma with a constant force · නියත බලයක් සමඟ F = ma (unknown-not-eliminated)
- Equations of uniform acceleration · නියත ත්වරණයේ සමීකරණ (suvat-nonuniform)

<a id="hard-phy-mech-p01-02"></a>

### phy.mech.p01-02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A bullet embeds in a block on a smooth table. Most direct principle for the speed just after?

වෙඩි උණ්ඩයක් සිනිඳු මේසයක් මත ඇති කුට්ටියක කාවැදේ. ඉන් මොහොතකට පසු වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of momentum · ගම්‍යතා සංස්ථිතිය (key)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-inelastic)
- F = ma with a constant force · නියත බලයක් සමඟ F = ma (unknown-not-eliminated)
- Equations of uniform acceleration · නියත ත්වරණයේ සමීකරණ (suvat-nonuniform)

<a id="hard-phy-mech-p01-03"></a>

### phy.mech.p01-03

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A gun recoils when it fires a shell. Most direct principle for the recoil speed?

තුවක්කුවක් උණ්ඩයක් විදින විට පසුපසට පැන යයි. පසුපසට පැනීමේ වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of momentum · ගම්‍යතා සංස්ථිතිය (key)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-inelastic)
- F = ma with a constant force · නියත බලයක් සමඟ F = ma (unknown-not-eliminated)
- Equations of uniform acceleration · නියත ත්වරණයේ සමීකරණ (suvat-nonuniform)

<a id="hard-phy-mech-p01-04"></a>

### phy.mech.p01-04

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A bead slides down a smooth curved rail from rest. Which principle gives its speed from the vertical drop?

පබළුවක් සුමට වක්‍ර පථයක් දිගේ නිශ්චලතාවෙන් ලිස්සා පහළට යයි. එය පහළට ගිය සිරස් දුර ඇසුරින් වේගය සෙවීමට යොදාගත හැකි මූලධර්මය කුමක් ද?

- Conservation of energy · ශක්ති සංස්ථිතිය (key)
- Conservation of momentum · ගම්‍යතා සංස්ථිතිය (momentum-external-force)
- F = ma with a constant force · නියත බලයක් සමඟ F = ma (unknown-not-eliminated)
- Equations of uniform acceleration · නියත ත්වරණයේ සමීකරණ (suvat-nonuniform)

<a id="hard-phy-mech-p01-05"></a>

### phy.mech.p01-05

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A pendulum bob swings down from rest. Most direct principle for its speed at the lowest point?

සරල අවලම්බයක ගෝලය නිශ්චලතාවෙන් පහළට පැද්දේ. පහළම ලක්ෂ්‍යයේ වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of energy · ශක්ති සංස්ථිතිය (key)
- Conservation of momentum · ගම්‍යතා සංස්ථිතිය (momentum-external-force)
- F = ma with a constant force · නියත බලයක් සමඟ F = ma (unknown-not-eliminated)
- Equations of uniform acceleration · නියත ත්වරණයේ සමීකරණ (suvat-nonuniform)

<a id="hard-phy-mech-p01-06"></a>

### phy.mech.p01-06

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A compressed spring launches a block across a smooth table. Most direct principle for the launch speed?

සම්පීඩිත දුන්නක් සිනිඳු මේසයක් හරහා කුට්ටියක් විදියි. විදින වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of energy · ශක්ති සංස්ථිතිය (key)
- Conservation of momentum · ගම්‍යතා සංස්ථිතිය (momentum-external-force)
- F = ma with a constant force · නියත බලයක් සමඟ F = ma (unknown-not-eliminated)
- Equations of uniform acceleration · නියත ත්වරණයේ සමීකරණ (suvat-nonuniform)

<a id="hard-phy-mech-p02-01"></a>

### phy.mech.p02-01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

"Wagons couple after a collision." and "A skater throws a ball and recoils." Same method?

"ගැටීමෙන් පසු මැදිරි එකට සම්බන්ධ වේ." සහ "ලිස්සන්නෙක් පන්දුවක් විසි කර පසුපසට යයි." ක්‍රමය එකම ද?

- Same method · එකම ක්‍රමය (key)
- Different methods · වෙනස් ක්‍රම (wrong-conservation-law)

<a id="hard-phy-mech-p02-02"></a>

### phy.mech.p02-02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

"A bullet embeds in a block." and "A gun recoils on firing." Same method?

"වෙඩි උණ්ඩයක් කුට්ටියක කාවැදේ." සහ "වෙඩි තබන විට තුවක්කුව පසුපසට පැන යයි." ක්‍රමය එකම ද?

- Same method · එකම ක්‍රමය (key)
- Different methods · වෙනස් ක්‍රම (wrong-conservation-law)

<a id="hard-phy-mech-p02-03"></a>

### phy.mech.p02-03

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

"A bead slides down a smooth curved track." and "A pendulum bob swings to its lowest point." Same method?

"පබළුවක් සිනිඳු වක්‍ර ධාවන පථයක පහළට යයි." සහ "සරල අවලම්බයක ගෝලය පහළම ලක්ෂ්‍යයට පැද්දේ." ක්‍රමය එකම ද?

- Same method · එකම ක්‍රමය (key)
- Different methods · වෙනස් ක්‍රම (wrong-conservation-law)

<a id="hard-phy-mech-p02-04"></a>

### phy.mech.p02-04

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

"Wagons couple after a collision." and "A block slides down a smooth curved slope; find its speed at the bottom." Same method?

"ගැටීමෙන් පසු මැදිරි එකට සම්බන්ධ වේ." සහ "කුට්ටියක් සිනිඳු වක්‍ර ආනතියක පහළට ලිස්සයි; පහළදී වේගය සොයන්න." ක්‍රමය එකම ද?

- Different methods · වෙනස් ක්‍රම (key)
- Same method · එකම ක්‍රමය (wrong-conservation-law)

<a id="hard-phy-mech-p02-05"></a>

### phy.mech.p02-05

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

"A bullet embeds in a block." and "A spring launches a block." Same method?

"වෙඩි උණ්ඩයක් කුට්ටියක කාවැදේ." සහ "දුන්නක් කුට්ටියක් විදියි." ක්‍රමය එකම ද?

- Different methods · වෙනස් ක්‍රම (key)
- Same method · එකම ක්‍රමය (wrong-conservation-law)

<a id="hard-phy-mech-p02-06"></a>

### phy.mech.p02-06

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

"A pendulum bob swings to its lowest point." and "A shell splits into two at its highest point." Same method?

"සරල අවලම්බයක ගෝලය පහළම ලක්ෂ්‍යයට පැද්දේ." සහ "උණ්ඩයක් ඉහළම ලක්ෂ්‍යයේ දී දෙකට කැඩේ." ක්‍රමය එකම ද?

- Different methods · වෙනස් ක්‍රම (key)
- Same method · එකම ක්‍රමය (wrong-conservation-law)

<a id="hard-phy-mech-p03-01"></a>

### phy.mech.p03-01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A stone is thrown at 40° to the horizontal, with no air resistance. Which quantity stays constant?

ගලක් තිරසට 40° ක් ආනතව විසි කෙරේ. වායු ප්‍රතිරෝධය නැත. නියතව පවතින රාශිය කුමක් ද?

- Horizontal velocity · තිරස් ප්‍රවේගය (key)
- Vertical velocity · සිරස් ප්‍රවේගය (gravity-off-in-flight)
- Speed · වේගය (speed-constant)
- Kinetic energy · චාලක ශක්තිය (ke-pe-confusion)

<a id="hard-phy-mech-p03-02"></a>

### phy.mech.p03-02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A marble rolls off a table and falls to the floor, with no air resistance. Which quantity stays constant?

කිරිබිත්තරයක් මේසයකින් පෙරළී බිමට වැටේ. වායු ප්‍රතිරෝධය නැත. නියතව පවතින රාශිය කුමක් ද?

- Horizontal velocity · තිරස් ප්‍රවේගය (key)
- Vertical velocity · සිරස් ප්‍රවේගය (gravity-off-in-flight)
- Speed · වේගය (speed-constant)
- Kinetic energy · චාලක ශක්තිය (ke-pe-confusion)

<a id="hard-phy-mech-p03-03"></a>

### phy.mech.p03-03

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A parcel drops from a plane flying level, with no air resistance. Which quantity stays constant?

තිරස්ව පියාසර කරන ගුවන් යානයකින් පාර්සලයක් වැටේ. වායු ප්‍රතිරෝධය නැත. නියතව පවතින රාශිය කුමක් ද?

- Horizontal velocity · තිරස් ප්‍රවේගය (key)
- Height above ground · පොළොවේ සිට උස (gravity-off-in-flight)
- Speed · වේගය (speed-constant)
- Kinetic energy · චාලක ශක්තිය (ke-pe-confusion)

<a id="hard-phy-mech-p03-04"></a>

### phy.mech.p03-04

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball is thrown straight up, with no air resistance. Which quantity stays constant?

පන්දුවක් සිරස්ව ඉහළට විසි කෙරේ. වායු ප්‍රතිරෝධය නැත. නියතව පවතින රාශිය කුමක් ද?

- Acceleration · ත්වරණය (key)
- Velocity · ප්‍රවේගය (gravity-off-in-flight)
- Speed · වේගය (speed-constant)
- Kinetic energy · චාලක ශක්තිය (ke-pe-confusion)

<a id="hard-phy-mech-p03-05"></a>

### phy.mech.p03-05

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball is thrown at 30° to the horizontal, with no air resistance. Which quantity stays constant?

පන්දුවක් තිරසට 30° ක් ආනතව විසි කෙරේ. වායු ප්‍රතිරෝධය නැත. නියතව පවතින රාශිය කුමක් ද?

- Acceleration · ත්වරණය (key)
- Vertical velocity · සිරස් ප්‍රවේගය (gravity-off-in-flight)
- Speed · වේගය (speed-constant)
- Kinetic energy · චාලක ශක්තිය (ke-pe-confusion)

<a id="hard-phy-mech-p03-06"></a>

### phy.mech.p03-06

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A stone falls from a bridge from rest, with no air resistance. Which quantity stays constant?

ගලක් පාලමක සිට නිශ්චලතාවෙන් වැටේ. වායු ප්‍රතිරෝධය නැත. නියතව පවතින රාශිය කුමක් ද?

- Acceleration · ත්වරණය (key)
- Velocity · ප්‍රවේගය (gravity-off-in-flight)
- Speed · වේගය (speed-constant)
- Kinetic energy · චාලක ශක්තිය (ke-pe-confusion)

<a id="hard-phy-mech-p04-01"></a>

### phy.mech.p04-01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A beam rests on supports P and Q, with a person on it. You need the force at Q. Most direct first step?

බාල්කයක් P සහ Q ආධාරක මත ඇති අතර එය මත පුද්ගලයෙක් සිටී. Q හි බලය සෙවිය යුතු ය. වඩාත් සෘජු පළමු පියවර කුමක් ද?

- Take moments about P · P වටා සූර්ණ ගන්න (key)
- Take moments about Q · Q වටා සූර්ණ ගන්න (unknown-not-eliminated)
- Share the load equally · පැටවුම සමානව බෙදන්න (assumed-symmetry)
- Use conservation of energy · ශක්ති සංස්ථිතිය යොදන්න (wrong-law)

<a id="hard-phy-mech-p04-02"></a>

### phy.mech.p04-02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A plank rests on supports A and B, with a painter on it. You need the force at A. Most direct first step?

ලෑල්ලක් A සහ B ආධාරක මත ඇති අතර එය මත තීන්ත ආලේප කරන්නෙක් සිටී. A හි බලය සෙවිය යුතු ය. වඩාත් සෘජු පළමු පියවර කුමක් ද?

- Take moments about B · B වටා සූර්ණ ගන්න (key)
- Take moments about A · A වටා සූර්ණ ගන්න (unknown-not-eliminated)
- Share the load equally · පැටවුම සමානව බෙදන්න (assumed-symmetry)
- Use conservation of energy · ශක්ති සංස්ථිතිය යොදන්න (wrong-law)

<a id="hard-phy-mech-p04-03"></a>

### phy.mech.p04-03

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A rod is hinged at one end and held level by a string at the other. You need the string's tension. Most direct first step?

දණ්ඩක එක් කෙළවරක් අසවු කර ඇති අතර අනෙක් කෙළවර තන්තුවකින් තිරස්ව රඳවා ඇත. තන්තුවේ ආතතිය සෙවිය යුතු ය. වඩාත් සෘජු පළමු පියවර කුමක් ද?

- Take moments about the hinge · අසව්ව වටා සූර්ණ ගන්න (key)
- Take moments about the string · තන්තුව වටා සූර්ණ ගන්න (unknown-not-eliminated)
- Share the load equally · පැටවුම සමානව බෙදන්න (assumed-symmetry)
- Use conservation of energy · ශක්ති සංස්ථිතිය යොදන්න (wrong-law)

<a id="hard-phy-mech-p04-04"></a>

### phy.mech.p04-04

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ladder leans on a smooth wall and stands on rough ground. You need the wall's force. Most direct first step?

ඉණිමගක් සිනිඳු බිත්තියකට හේත්තු වී රළු බිමක පිහිටා ඇත. බිත්තියේ බලය සෙවිය යුතු ය. වඩාත් සෘජු පළමු පියවර කුමක් ද?

- Take moments about the ladder's foot · ඉණිමගේ පාදය වටා සූර්ණ ගන්න (key)
- Take moments about the top of the ladder · ඉණිමගේ ඉහළ කෙළවර වටා සූර්ණ ගන්න (unknown-not-eliminated)
- Share the load equally · පැටවුම සමානව බෙදන්න (assumed-symmetry)
- Use conservation of energy · ශක්ති සංස්ථිතිය යොදන්න (wrong-law)

<a id="hard-phy-mech-p04-05"></a>

### phy.mech.p04-05

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A shelf is hinged to a wall and held by a sloping strut. You need the strut's force. Most direct first step?

රාක්කයක් බිත්තියකට අසවු කර ආනත ආධාරක දණ්ඩකින් රඳවා ඇත. එම දණ්ඩේ බලය සෙවිය යුතු ය. වඩාත් සෘජු පළමු පියවර කුමක් ද?

- Take moments about the hinge · අසව්ව වටා සූර්ණ ගන්න (key)
- Take moments about the strut's joint · ආධාරක දණ්ඩේ සන්ධිය වටා සූර්ණ ගන්න (unknown-not-eliminated)
- Share the load equally · පැටවුම සමානව බෙදන්න (assumed-symmetry)
- Use conservation of energy · ශක්ති සංස්ථිතිය යොදන්න (wrong-law)

<a id="hard-phy-mech-p04-06"></a>

### phy.mech.p04-06

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A bridge deck rests on piers X and Y, with a truck on it. You need the force at Y. Most direct first step?

පාලමක තට්ටුවක් X සහ Y කණු මත ඇති අතර එය මත ට්‍රක් රථයක් ඇත. Y හි බලය සෙවිය යුතු ය. වඩාත් සෘජු පළමු පියවර කුමක් ද?

- Take moments about X · X වටා සූර්ණ ගන්න (key)
- Take moments about Y · Y වටා සූර්ණ ගන්න (unknown-not-eliminated)
- Share the load equally · පැටවුම සමානව බෙදන්න (assumed-symmetry)
- Use conservation of energy · ශක්ති සංස්ථිතිය යොදන්න (wrong-law)

<a id="hard-phy-mech-p05-01"></a>

### phy.mech.p05-01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A diver tucks in mid-air and spins faster. Most direct principle for the new spin rate?

කිමිදුම්කරුවෙක් අහසේ දී ශරීරය හකුළා වේගයෙන් කැරකෙයි. නව භ්‍රමණ සීඝ්‍රතාව සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of angular momentum · කෝණික ගම්‍යතා සංස්ථිතිය (key)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-rotation)
- τ = Iα · τ = Iα (wrong-law)
- Conservation of linear momentum · රේඛීය ගම්‍යතා සංස්ථිතිය (linear-vs-angular)

<a id="hard-phy-mech-p05-02"></a>

### phy.mech.p05-02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Clay drops onto a spinning disc and sticks. Most direct principle for the new spin rate?

මැටි කැටියක් කැරකෙන තැටියක් මතට වැටී ඇලී යයි. නව භ්‍රමණ සීඝ්‍රතාව සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of angular momentum · කෝණික ගම්‍යතා සංස්ථිතිය (key)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-rotation)
- τ = Iα · τ = Iα (wrong-law)
- Conservation of linear momentum · රේඛීය ගම්‍යතා සංස්ථිතිය (linear-vs-angular)

<a id="hard-phy-mech-p05-03"></a>

### phy.mech.p05-03

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A solid cylinder rolls down a slope from rest. Most direct principle for its speed at the bottom?

ඝන සිලින්ඩරයක් නිශ්චලතාවෙන් ආනත තලයක පහළට පෙරළේ. පහළදී එහි වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of energy · ශක්ති සංස්ථිතිය (key)
- Conservation of angular momentum · කෝණික ගම්‍යතා සංස්ථිතිය (wrong-conservation-law)
- τ = Iα · τ = Iα (wrong-law)
- Conservation of linear momentum · රේඛීය ගම්‍යතා සංස්ථිතිය (linear-vs-angular)

<a id="hard-phy-mech-p05-04"></a>

### phy.mech.p05-04

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A wheel falls, unwinding a string round its axle. Most direct principle for its speed after a known drop?

රෝදයක් එහි අක්ෂ දණ්ඩ වටා ඔතා ඇති තන්තුවක් ලිහමින් පහළට වැටේ. දන්නා උසක් වැටුණු පසු එහි වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- Conservation of energy · ශක්ති සංස්ථිතිය (key)
- Conservation of angular momentum · කෝණික ගම්‍යතා සංස්ථිතිය (wrong-conservation-law)
- τ = Iα · τ = Iα (wrong-law)
- Conservation of linear momentum · රේඛීය ගම්‍යතා සංස්ථිතිය (linear-vs-angular)

<a id="hard-phy-mech-p05-05"></a>

### phy.mech.p05-05

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A constant torque spins up a flywheel from rest. Most direct principle for its angular speed after a known time?

නියත ව්‍යාවර්තයක් නිශ්චලව ඇති භ්‍රමණ රෝදයක් කරකවයි. දන්නා කාලයකට පසු එහි කෝණික වේගය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- τ = Iα · τ = Iα (key)
- Conservation of angular momentum · කෝණික ගම්‍යතා සංස්ථිතිය (wrong-conservation-law)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-rotation)
- Conservation of linear momentum · රේඛීය ගම්‍යතා සංස්ථිතිය (linear-vs-angular)

<a id="hard-phy-mech-p05-06"></a>

### phy.mech.p05-06

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A constant friction torque slows a wheel. Most direct principle for the time it takes to stop?

නියත ඝර්ෂණ ව්‍යාවර්තයක් රෝදයක වේගය අඩු කරයි. නතර වීමට ගත වන කාලය සෙවීමට වඩාත් සෘජු මූලධර්මය කුමක් ද?

- τ = Iα · τ = Iα (key)
- Conservation of angular momentum · කෝණික ගම්‍යතා සංස්ථිතිය (wrong-conservation-law)
- Conservation of energy · ශක්ති සංස්ථිතිය (ke-conserved-rotation)
- Conservation of linear momentum · රේඛීය ගම්‍යතා සංස්ථිතිය (linear-vs-angular)

<a id="hard-phy-mech-t01"></a>

### phy.mech.t01

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

Forces of {F1} N and {F2} N act at one point. Which can be the size of their resultant?

{F1} N සහ {F2} N බල එක් ලක්ෂ්‍යයක ක්‍රියා කරයි. ඒවායේ සම්ප්‍රයුක්තයේ විශාලත්වය විය හැක්කේ කුමක් ද?

- Key formula: `lo + (3*F1 + F2) % (hi - lo + 1)` N
- `boundary` · `hi + 2`
- `boundary` · `hi + 4`
- `boundary` · `hi + 7`
- `boundary` · `lo - 2`
- `boundary` · `lo - 4`
- `boundary` · `lo - 7`

<a id="hard-phy-mech-t02"></a>

### phy.mech.t02

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball thrown straight up from the ground passes a point {h} m high twice, {dt} s apart. Launch speed?

පොළොවේ සිට සිරස්ව ඉහළට විසි කළ පන්දුවක් {h} m උසකින් ඇති ලක්ෂ්‍යයක් {dt} s ක පරතරයකින් දෙවරක් පසු කරයි. විසි කළ වේගය කුමක් ද?

- Key formula: `sqrt(v_h**2 + 2*g*h)` m s⁻¹
- `stopped-early` · `v_h`
- `misread-interval` · `g*dt`
- `ignored-condition` · `sqrt(2*g*h)`
- `forgot-square` · `v_h + sqrt(2*g*h)`
- `sign` · `sqrt(abs(2*g*h - v_h**2))`
- `wrong-law` · `h/dt`

<a id="hard-phy-mech-t03"></a>

### phy.mech.t03

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

The graph shows the velocity of an object moving in a straight line. Average velocity over the whole motion?

ප්‍රස්තාරයෙන් සරල රේඛාවක ගමන් කරන වස්තුවක ප්‍රවේගය දැක්වේ. මුළු චලිතය සඳහා සාමාන්‍ය ප්‍රවේගය කුමක් ද?


Diagram: `vt-steps`. [Worked examples and figures](../../../content/sample-v2/mechanics-20/review.md).
- Key formula: `(v1*t1 + v2*t2)/(t1 + t2)` m s⁻¹
- `mean-of-speeds` · `(v1 + v2)/2`
- `misread-interval` · `(v1*t1 + v2*t2)/t1`
- `wrong-law` · `(v1*t1 + v2*t2)/2`
- `stopped-early` · `v1*t1 + v2*t2`
- `wrong-quantity` · `v2`
- `ignored-condition` · `v1`

<a id="hard-phy-mech-t04"></a>

### phy.mech.t04

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A lift is moving {motion}. Its speed changes by {dv} m s⁻¹ in {t} s. Force from the floor on a {m} kg block?

සෝපානයක් {motion}. {t} s තුළ එහි වේගය {dv} m s⁻¹ කින් වෙනස් වේ. {m} kg කුට්ටියක් මත බිමෙන් ඇති වන බලය කුමක් ද?

- Key formula: `m*(g + s_up*a)` N
- `ignored-condition` · `m*g`
- `motion-vs-accel` · `m*(g - s_up*a)`
- `wrong-law` · `m*a`
- `forgot-mass` · `g + s_up*a`
- `wrong-quantity` · `m*(g + s_up*dv)`

<a id="hard-phy-mech-t05"></a>

### phy.mech.t05

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved?

රළු තිරස් බිමක {v} m s⁻¹ කින් ලිස්සන කුට්ටියක් නතර වේ. μ = {mu}. ගමන් කළ දුර කුමක් ද?

- Key formula: `v**2/(2*mu*g)` m
- `forgot-half` · `v**2/(mu*g)`
- `forgot-mu` · `v**2/(2*g)`
- `forgot-square` · `v/(2*mu*g)`
- `inverted` · `mu*v**2/(2*g)`
- `forgot-g` · `v**2/(2*mu)`
- `wrong-law` · `2*v**2/(mu*g)`

<a id="hard-phy-mech-t06"></a>

### phy.mech.t06

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A car with all wheels driven reaches {kmh} km h⁻¹ from rest in {t} s on a level road, at uniform acceleration. Smallest μₛ needed?

සියලු රෝද ධාවනය වන මෝටර් රථයක් තිරස් මාර්ගයක ඒකාකාර ත්වරණයෙන් නිශ්චලතාවේ සිට {t} s තුළ {kmh} km h⁻¹ ට ළඟා වේ. අවශ්‍ය කුඩාම μₛ කුමක් ද?

- Key formula: `v/(t*g)`
- `unit-conversion` · `kmh/(t*g)`
- `assumed-symmetry` · `2*v/(t*g)`
- `forgot-half` · `v/(2*t*g)`
- `forgot-g` · `v/t`
- `inverted` · `v/(3.6*t*g)`

<a id="hard-phy-mech-t07"></a>

### phy.mech.t07

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A {m1} kg cart at {u1} m s⁻¹ catches a {m2} kg cart moving the same way at {u2} m s⁻¹. They couple. Common speed?

{u1} m s⁻¹ කින් යන {m1} kg කරත්තයක්, එම දිශාවටම {u2} m s⁻¹ කින් යන {m2} kg කරත්තයක් අල්ලා ගනී. ඒවා එකට සම්බන්ධ වේ. පොදු වේගය කුමක් ද?

- Key formula: `(m1*u1 + m2*u2)/(m1 + m2)` m s⁻¹
- `mean-of-speeds` · `(u1 + u2)/2`
- `sign` · `(m1*u1 - m2*u2)/(m1 + m2)`
- `forgot-mass` · `(m1*u1 + m2*u2)/m1`
- `ke-conserved-inelastic` · `sqrt((m1*u1**2 + m2*u2**2)/(m1 + m2))`
- `stopped-early` · `m1*u1 + m2*u2`
- `forgot-mass` · `(m1*u1 + m2*u2)/m2`

<a id="hard-phy-mech-t08"></a>

### phy.mech.t08

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

The graph shows the force on a {m} kg body, at rest at first on a smooth surface. Final speed?

ප්‍රස්තාරයෙන් සිනිඳු පෘෂ්ඨයක මුලින් නිශ්චලව ඇති {m} kg වස්තුවක් මත බලය දැක්වේ. අවසාන වේගය කුමක් ද?


Diagram: `ft-ramp`. [Worked examples and figures](../../../content/sample-v2/mechanics-20/review.md).
- Key formula: `F*(t1/2 + t2)/m` m s⁻¹
- `area-shape` · `F*(t1 + t2)/m`
- `misread-interval` · `F*t2/m`
- `forgot-mass` · `F*(t1/2 + t2)`
- `inverted` · `F*(t1/2 + t2)*m`
- `stopped-early` · `F*t1/(2*m)`
- `wrong-quantity` · `F/m`

<a id="hard-phy-mech-t09"></a>

### phy.mech.t09

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball is thrown at {angle}° to the horizontal with {K} J of KE. {ask} (No air resistance)

පන්දුවක් {K} J චාලක ශක්තියක් සහිතව තිරසට {angle}° ක් ආනතව විසි කෙරේ. {ask} (වායු ප්‍රතිරෝධය නැත)

- Key formula: `K*(c2 if ask.startswith('KE') else s2)` J
- `sin-cos-swap` · `K*(s2 if ask.startswith('KE') else c2)`
- `forgot-square` · `K*cos(radians(angle))`
- `ignored-condition` · `K`
- `v-zero-at-top` · `0`
- `ke-half-at-top` · `K/2`
- `wrong-power` · `K/4`

<a id="hard-phy-mech-t10"></a>

### phy.mech.t10

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A coin sits on a turntable spinning at {rpm} rpm. μₛ = {mu}. Largest distance from the centre without sliding? (Take π = 3)

{rpm} rpm කින් කැරකෙන භ්‍රමණ තලයක් මත කාසියක් ඇත. μₛ = {mu}. ලිස්සා නොයන, කේන්ද්‍රයේ සිට විශාලතම දුර කුමක් ද? (π = 3 ලෙස ගන්න)

- Key formula: `mu*g/w**2*100` cm
- `forgot-square` · `mu*g/w*100`
- `forgot-mu` · `g/w**2*100`
- `radius-diameter` · `2*mu*g/w**2*100`
- `radius-diameter` · `mu*g/w**2*50`
- `wrong-power` · `mu**2*g/w**2*100`
- `unit-conversion` · `mu*g/w**2`

<a id="hard-phy-mech-t11"></a>

### phy.mech.t11

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

The figure shows a uniform {M} kg beam on supports at P and Q, with a {m} kg person standing on it. Force from support Q?

රූපයේ P සහ Q ආධාරක මත ඇති {M} kg ඒකාකාර බාල්කයක් සහ ඒ මත සිටින {m} kg පුද්ගලයෙක් දැක්වේ. Q ආධාරකයෙන් ඇති වන බලය කුමක් ද?


Diagram: `beam`. [Worked examples and figures](../../../content/sample-v2/mechanics-20/review.md).
- Key formula: `(M*g*L/2 + m*g*d)/L` N
- `ignored-condition` · `m*g*d/L`
- `swapped-support` · `(M*g*L/2 + m*g*(L - d))/L`
- `assumed-symmetry` · `(M + m)*g/2`
- `forgot-g` · `(M*L/2 + m*d)/L`
- `wrong-quantity` · `(M + m)*g`
- `forgot-mass` · `M*g/2`
- `stopped-early` · `m*g`

<a id="hard-phy-mech-t12"></a>

### phy.mech.t12

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

{article} {m} kg car needs {p0} kW to hold {v} m s⁻¹ on a level road. Power to hold the same speed up a slope with sin θ = {s}, same resistance?

{m} kg මෝටර් රථයකට තිරස් මාර්ගයක {v} m s⁻¹ පවත්වා ගැනීමට {p0} kW අවශ්‍ය වේ. ප්‍රතිරෝධය එලෙසම තිබිය දී, sin θ = {s} වූ ආනත තලයක් නගිමින් එම වේගයම පවත්වා ගැනීමට අවශ්‍ය ජවය කුමක් ද?

- Key formula: `p0 + m*g*s*v/1000` kW
- `ignored-condition` · `m*g*s*v/1000`
- `no-resolve` · `p0 + m*g*v/1000`
- `forgot-g` · `p0 + m*s*v/1000`
- `wrong-quantity` · `p0`
- `wrong-law` · `p0*(1 + s)`
- `misread-interval` · `2*p0 + m*g*s*v/1000`

<a id="hard-phy-mech-t13"></a>

### phy.mech.t13

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A ball is dropped from {h0} m. Each bounce cuts its speed by {pct}%. Height reached after {n} bounces?

පන්දුවක් {h0} m උසකින් අත හරිනු ලැබේ. එක් එක් පොළා පැනීමේ දී වේගය {pct}% කින් අඩු වේ. පොළා පැනීම් {n} කට පසු ළඟා වන උස කුමක් ද?

- Key formula: `h0*k**(2*n)` m
- `forgot-square` · `h0*k**n`
- `stopped-early` · `h0*k**2`
- `wrong-power` · `h0*k**(3*n)`
- `misread-interval` · `h0*k**(n + 1)`

<a id="hard-phy-mech-t14"></a>

### phy.mech.t14

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A student spins on a smooth turntable at {w0} rad s⁻¹ with I = {I0} kg m². Pulling in the weights makes I = {I1} kg m². New angular speed?

ශිෂ්‍යයෙක් I = {I0} kg m² සමඟ සිනිඳු භ්‍රමණ තලයක {w0} rad s⁻¹ කින් කැරකෙයි. බර ඇතුළට ගත් විට I = {I1} kg m² වේ. නව කෝණික වේගය කුමක් ද?

- Key formula: `I0*w0/I1` rad s⁻¹
- `ignored-condition` · `w0`
- `inverted` · `I1*w0/I0`
- `ke-conserved-rotation` · `w0*sqrt(I0/I1)`
- `wrong-power` · `w0*(I0/I1)**2`
- `stopped-early` · `I0*w0`

<a id="hard-phy-mech-t15"></a>

### phy.mech.t15

[Authored item file](../../../content/sample-v2/mechanics-20/items.json)

A {shape} (I = {frac(c)} MR²) rolls without slipping. Find total KE ÷ {target} KE.

{shape} (I = {frac(c)} MR²) ලිස්සීමකින් තොරව පෙරළේ. මුළු චාලක ශක්තිය ÷ {target} චාලක ශක්තිය සොයන්න.

- Key formula: `(1 + c)/c if target == 'rotational' else 1 + c`
- `wrong-quantity` · `1 + c if target == 'rotational' else (1 + c)/c`
- `misread-interval` · `1/c`
- `stopped-early` · `c`
- `inverted` · `c/(1 + c) if target == 'rotational' else 1/(1 + c)`
