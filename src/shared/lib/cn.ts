/** falsy 값을 걸러내고 className을 합친다. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
