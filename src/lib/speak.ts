// Liest Anweisungen vor – für Kinder, die noch nicht gut lesen.
export function speak(text: string) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'de-AT'
    u.rate = 0.95
    const voice = synth.getVoices().find((v) => v.lang.startsWith('de'))
    if (voice) u.voice = voice
    synth.speak(u)
  } catch {
    // Vorlesen ist ein Extra
  }
}
