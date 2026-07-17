import I18nLabel from "@/shared/ui/compose/components/I18nLabel";

/**
 * 将记录对象转换为选项数组
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record 记录对象
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    label,
    value,
  })) as Common.Option<keyof T, T[keyof T]>[];
}

/**
 * 翻译选项数组
 *
 * @param options 选项数组
 */
export function translateOptions(options: Common.Option<string, I18n.I18nKey>[]) {
  return options.map((option) => ({
    ...option,
    label: <I18nLabel i18nKey={option.label} />,
  }));
}
