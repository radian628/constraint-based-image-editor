export function setElem<T>(arr: T[], item: T, index: number) {
  return arr.map((e, i) => (i === index ? item : e));
}
