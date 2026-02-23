import { beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// MOCK: next/navigation - React hookovi za navigaciju
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(), // navigacija na novu stranicu
    replace: vi.fn(), // zamena trenutne stranice (bez istorije)
    back: vi.fn(), // nazad u istoriji
    forward: vi.fn(), // napred u istoriji
  }),
  usePathname: () => "/", // trenutna putanja
  useSearchParams: () => new URLSearchParams(), // Query parametri
}));

// MOCK: localStorage - Browser storage
const localStorageMock = {
  getItem: vi.fn(), // uzmi vrednost po kljucu
  setItem: vi.fn(), // sacuvaj vrednost
  removeItem: vi.fn(), // obrisi vrednost
  clear: vi.fn(), // obrisi sve
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// MOCK: fetch - HTTP zahtevi
global.fetch = vi.fn();

// LIFECYCLE: Reset pre svakog testa
beforeEach(() => {
  vi.clearAllMocks(); // Resetuj sve mock-ove
  localStorageMock.getItem.mockReturnValue(null); // localStorage prazan
});
