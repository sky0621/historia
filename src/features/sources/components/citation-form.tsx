import {
  fieldLabelClassName,
  fieldMetaClassName,
  formCardClassName,
  formHeroClassName,
  formHeroTextClassName,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName
} from "@/components/forms/styles";
import { createCitationAction, updateCitationAction } from "@/features/sources/actions";
import type { getCitationFormView } from "@/server/services/sources";

type CitationFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  view: ReturnType<typeof getCitationFormView>;
};

export function CitationForm({ title, description, submitLabel, view }: CitationFormProps) {
  const action = view.citation ? updateCitationAction : createCitationAction;

  return (
    <section className="space-y-6">
      <div className={formHeroClassName}>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className={formHeroTextClassName}>{description}</p>
      </div>

      <form action={action} className={formCardClassName}>
        {view.citation ? <input type="hidden" name="id" value={view.citation.id} /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className={fieldMetaClassName}>出典</span>
            <select
              name="sourceId"
              defaultValue={String(view.defaults.sourceId ?? "")}
              className={inputClassName}
              required
            >
              <option value="">選択してください</option>
              {view.sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.title}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>対象種別</span>
            <select
              name="targetType"
              defaultValue={String(view.defaults.targetType ?? "event")}
              className={inputClassName}
              required
            >
              {view.options.targetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>対象 ID</span>
            <input
              name="targetId"
              type="number"
              min={1}
              defaultValue={view.defaults.targetId ?? ""}
              className={inputClassName}
              required
            />
          </label>
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className={fieldMetaClassName}>位置情報</span>
            <input
              name="locator"
              defaultValue={view.citation?.locator ?? ""}
              className={inputClassName}
              placeholder="ページ番号、章、節など"
            />
          </label>
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className={fieldMetaClassName}>引用メモ</span>
            <textarea
              name="quote"
              defaultValue={view.citation?.quote ?? ""}
              rows={4}
              className={inputClassName}
            />
          </label>
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className={fieldMetaClassName}>補足</span>
            <textarea
              name="note"
              defaultValue={view.citation?.note ?? ""}
              rows={4}
              className={inputClassName}
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          {!view.citation ? (
            <button type="submit" name="intent" value="create-and-continue" className={secondaryButtonClassName}>
              続けて作成
            </button>
          ) : null}
          <button type="submit" className={primaryButtonClassName}>
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
