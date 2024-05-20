import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools((set) => ({
    // test counter
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),

    // current clicked node
    descriptionForClickedNode: "",
    setDescriptionForClickedNode: (description) =>
      set(() => ({ descriptionForClickedNode: description })),

    // current generate node click id
    currentGenerateNodeClickId: 0,
    setCurrentGenerateNodeClickId: (id) =>
      set(() => ({ currentGenerateNodeClickId: id })),
  }))
);

export default useStore;
