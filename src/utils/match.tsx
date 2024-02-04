export function match<K extends string | number | symbol, V>(
  obj: Record<K, V>,
  defaultValue: V
) {
  return (k: string | number | symbol) => {
    if (obj.hasOwnProperty(k)) {
      return obj[k];
    }
    return defaultValue;
  };
}
