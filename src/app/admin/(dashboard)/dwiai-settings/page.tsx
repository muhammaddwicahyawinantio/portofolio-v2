import { Save } from "lucide-react";
import { saveDwiAiSettings } from "@/lib/admin/dwiai-actions";
import { DWIAI_MODEL_OPTIONS, getDwiAiSettingForAdmin } from "@/lib/dwiai";

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";

export default async function DwiAiSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const setting = await getDwiAiSettingForAdmin();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
            Dwi AI Settings
          </h1>
          <p className="text-ink-soft mt-2 text-sm">
            Model, personality, and limits for the public chat widget.
          </p>
        </div>
        {saved ? <p className="text-success font-mono text-[13px]">Saved.</p> : null}
      </header>

      <section className="border-line bg-card rounded-card shadow-card border p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Assistant configuration
          </h2>
        </div>

        <form action={saveDwiAiSettings} className="flex flex-col gap-5">
          <input type="hidden" name="id" value={setting.id} />

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Assistant Name
              </span>
              <input
                name="assistantName"
                type="text"
                defaultValue={setting.assistantName}
                className={INPUT}
              />
            </label>

            <label>
              <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Model
              </span>
              <select name="model" defaultValue={setting.model} className={INPUT}>
                {DWIAI_MODEL_OPTIONS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>

            <label className="md:col-span-2">
              <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                System Prompt
              </span>
              <textarea
                name="systemPrompt"
                defaultValue={setting.systemPrompt}
                rows={8}
                className={INPUT}
              />
            </label>

            <label className="md:col-span-2">
              <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Behavior Description
              </span>
              <textarea
                name="behaviorDescription"
                defaultValue={setting.behaviorDescription ?? ""}
                rows={4}
                className={INPUT}
              />
            </label>

            <label>
              <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Temperature
              </span>
              <input
                name="temperature"
                type="number"
                min={0}
                max={2}
                step={0.1}
                defaultValue={setting.temperature}
                className={INPUT}
              />
            </label>

            <label>
              <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Max Tokens
              </span>
              <input
                name="maxTokens"
                type="number"
                min={1}
                defaultValue={setting.maxTokens}
                className={INPUT}
              />
            </label>

            <label className="flex items-center justify-between gap-4 md:col-span-2">
              <span>
                <span className="text-ink-soft mb-1 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                  Active
                </span>
                <span className="text-ink-soft text-sm">Enable the public Dwi AI widget.</span>
              </span>
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={setting.isActive}
                className="peer sr-only"
              />
              <span className="border-line bg-cream-deep peer-checked:bg-ink relative h-7 w-12 rounded-full border transition-colors after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-card after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="bg-ink text-cream hover:bg-charcoal-soft inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
            >
              <Save className="h-4 w-4" strokeWidth={1.7} />
              Save Settings
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
