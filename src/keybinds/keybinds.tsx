export type Keybind = {
  key: string;
  caseSensitive?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}[];

export type Keymap<Keys extends string | number | symbol> = Record<
  Keys,
  Keybind
>;

export const CurrentKeymap = {
  upCoarse: [
    {
      key: "ArrowUp",
    },
    {
      key: "k",
    },
  ],
  downCoarse: [
    {
      key: "ArrowDown",
    },
    {
      key: "j",
    },
  ],
  leftCoarse: [
    {
      key: "ArrowLeft",
    },
    {
      key: "h",
    },
  ],
  rightCoarse: [
    {
      key: "ArrowRight",
    },
    {
      key: "l",
    },
  ],
  upFine: [
    {
      key: "ArrowUp",
      ctrl: true,
    },
    {
      key: "k",
      ctrl: true,
    },
  ],
  downFine: [
    {
      key: "ArrowDown",
      ctrl: true,
    },
    {
      key: "j",
      ctrl: true,
    },
  ],
  leftFine: [
    {
      key: "ArrowLeft",
      ctrl: true,
    },
    {
      key: "h",
      ctrl: true,
    },
  ],
  rightFine: [
    {
      key: "ArrowRight",
      ctrl: true,
    },
    {
      key: "l",
      ctrl: true,
    },
  ],
};

export function keybind<Keys extends string | symbol | number>(
  keymap: Keymap<Keys>,
  event: {
    key: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
  }
): Keys | undefined {
  const keymapEntries = Object.entries(keymap) as [Keys, Keybind][];

  for (const [name, keybinds] of keymapEntries) {
    for (const kb of keybinds) {
      if (
        kb.key.toLowerCase() === event.key.toLowerCase() &&
        !!kb.ctrl === !!event.ctrlKey &&
        !!kb.shift === !!event.shiftKey &&
        !!kb.alt === !!event.altKey
      ) {
        return name;
      }
    }
  }
}
