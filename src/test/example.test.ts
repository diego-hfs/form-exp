import { beforeEach, describe, expect, it } from "vitest";
import { getConferenciaPorEmbarque, getEmbarquesParaConferente, resetDemoData } from "@/services/storage";

describe("modo demonstração", () => {
  beforeEach(() => {
    localStorage.clear();
    resetDemoData();
  });

  it("carrega um embarque fictício pelo número", async () => {
    const embarque = await getConferenciaPorEmbarque("EXP-2026-001");
    expect(embarque?.destinatario).toBe("Distribuidora Demo Ltda.");
    expect(embarque?.status).toBe("aguardando_conferencia");
  });

  it("disponibiliza embarques para o conferente", async () => {
    const embarques = await getEmbarquesParaConferente();
    expect(embarques.some(item => item.numeroEmbarque === "EXP-2026-001")).toBe(true);
  });
});
