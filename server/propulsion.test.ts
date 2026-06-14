import { describe, expect, it } from "vitest";
import {
  calculateMission,
  calculateMarsMission,
  PROPULSION_SYSTEMS,
  STANDARD_GRAVITY,
  formatMass,
  formatVelocity,
  formatTime,
  formatPercent,
  MissionInputs,
  MarsMissionInputs,
} from "../shared/propulsion";

describe("Propulsion Systems Database", () => {
  it("should have three propulsion systems defined", () => {
    expect(Object.keys(PROPULSION_SYSTEMS)).toHaveLength(3);
    expect(PROPULSION_SYSTEMS.chemical).toBeDefined();
    expect(PROPULSION_SYSTEMS.ntp).toBeDefined();
    expect(PROPULSION_SYSTEMS.nep).toBeDefined();
  });

  it("should have correct Isp values", () => {
    expect(PROPULSION_SYSTEMS.chemical.ispDefault).toBe(450);
    expect(PROPULSION_SYSTEMS.ntp.ispDefault).toBe(900);
    expect(PROPULSION_SYSTEMS.nep.ispDefault).toBe(3000);
  });

  it("should have correct labels", () => {
    expect(PROPULSION_SYSTEMS.chemical.label).toBe("Chemical");
    expect(PROPULSION_SYSTEMS.ntp.label).toBe("NTP");
    expect(PROPULSION_SYSTEMS.nep.label).toBe("NEP");
  });
});

describe("Rocket Equation Calculations", () => {
  it("should calculate mass ratio correctly", () => {
    const inputs: MissionInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
    };

    const results = calculateMission(inputs);

    // Δv = Isp * g₀ * ln(m₀/mf)
    // 9700 = 450 * 9.81 * ln(m₀/mf)
    // ln(m₀/mf) = 9700 / (450 * 9.81) ≈ 2.193
    // m₀/mf ≈ e^2.193 ≈ 8.96
    expect(results.massRatio).toBeCloseTo(8.96, 1);
  });

  it("should calculate initial mass correctly", () => {
    const inputs: MissionInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
    };

    const results = calculateMission(inputs);
    const finalMass = inputs.dryMass + inputs.payloadMass; // 6000 kg
    const expectedInitialMass = finalMass * results.massRatio;

    expect(results.initialMass).toBeCloseTo(expectedInitialMass, 0);
    expect(results.finalMass).toBe(finalMass);
  });

  it("should calculate propellant mass correctly", () => {
    const inputs: MissionInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
    };

    const results = calculateMission(inputs);
    const expectedPropellant = results.initialMass - results.finalMass;

    expect(results.propellantMass).toBeCloseTo(expectedPropellant, 0);
  });

  it("should calculate fractions correctly", () => {
    const inputs: MissionInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
    };

    const results = calculateMission(inputs);

    const totalPropellantFraction =
      results.propellantFraction +
      results.dryMassFraction +
      results.payloadFraction;

    // All fractions should sum to 1.0
    expect(totalPropellantFraction).toBeCloseTo(1.0, 5);

    // Fractions should be between 0 and 1
    expect(results.propellantFraction).toBeGreaterThan(0);
    expect(results.propellantFraction).toBeLessThan(1);
    expect(results.dryMassFraction).toBeGreaterThan(0);
    expect(results.dryMassFraction).toBeLessThan(1);
    expect(results.payloadFraction).toBeGreaterThan(0);
    expect(results.payloadFraction).toBeLessThan(1);
  });

  it("should respect custom Isp values", () => {
    const inputs: MissionInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
      customIsp: 600, // Custom value higher than default
    };

    const results = calculateMission(inputs);

    expect(results.isp).toBe(600);
    // Higher Isp should result in lower mass ratio
    expect(results.massRatio).toBeLessThan(8.96);
  });

  it("should handle different engine types with correct Isp", () => {
    const baseInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
    };

    const chemicalResults = calculateMission({
      ...baseInputs,
      engineType: "chemical",
    });
    const ntpResults = calculateMission({
      ...baseInputs,
      engineType: "ntp",
    });
    const nepResults = calculateMission({
      ...baseInputs,
      engineType: "nep",
    });

    expect(chemicalResults.isp).toBe(450);
    expect(ntpResults.isp).toBe(900);
    expect(nepResults.isp).toBe(3000);

    // Higher Isp should result in lower mass ratio
    expect(chemicalResults.massRatio).toBeGreaterThan(ntpResults.massRatio);
    expect(ntpResults.massRatio).toBeGreaterThan(nepResults.massRatio);
  });

  it("should estimate transit time based on engine type", () => {
    const baseInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 9700,
    };

    const chemicalResults = calculateMission({
      ...baseInputs,
      engineType: "chemical",
    });
    const ntpResults = calculateMission({
      ...baseInputs,
      engineType: "ntp",
    });
    const nepResults = calculateMission({
      ...baseInputs,
      engineType: "nep",
    });

    // Chemical: ~260 days, NTP: ~180 days, NEP: ~400+ days
    expect(chemicalResults.estimatedTransitTime).toBeCloseTo(260, 0);
    expect(ntpResults.estimatedTransitTime).toBeCloseTo(180, 0);
    expect(nepResults.estimatedTransitTime).toBeGreaterThan(400);
  });
});

describe("Mars Mission Calculations", () => {
  it("should calculate Hohmann transfer delta-v", () => {
    const inputs: MarsMissionInputs = {
      launchYear: 2030,
      transferType: "hohmann",
      payloadMass: 1000,
      dryMass: 5000,
      engineType: "chemical",
    };

    const results = calculateMarsMission(inputs);

    expect(results.deltaVRequirement).toBe(9700);
    expect(results.transferType).toBe("hohmann");
  });

  it("should calculate fast transfer delta-v", () => {
    const inputs: MarsMissionInputs = {
      launchYear: 2030,
      transferType: "fast",
      payloadMass: 1000,
      dryMass: 5000,
      engineType: "chemical",
    };

    const results = calculateMarsMission(inputs);

    expect(results.deltaVRequirement).toBe(15500);
    expect(results.transferType).toBe("fast");
  });

  it("should generate mission architecture string", () => {
    const inputs: MarsMissionInputs = {
      launchYear: 2030,
      transferType: "hohmann",
      payloadMass: 1000,
      dryMass: 5000,
      engineType: "ntp",
    };

    const results = calculateMarsMission(inputs);

    expect(results.missionArchitecture).toContain("2030");
    expect(results.missionArchitecture).toContain("Hohmann");
    expect(results.missionArchitecture).toContain("NTP");
  });

  it("should handle fast transfer with different engine types", () => {
    const baseInputs = {
      launchYear: 2030,
      transferType: "fast" as const,
      payloadMass: 1000,
      dryMass: 5000,
    };

    const chemicalResults = calculateMarsMission({
      ...baseInputs,
      engineType: "chemical",
    });
    const nepResults = calculateMarsMission({
      ...baseInputs,
      engineType: "nep",
    });

    // Both should have same delta-v for fast transfer
    expect(chemicalResults.deltaVRequirement).toBe(
      nepResults.deltaVRequirement
    );
    expect(chemicalResults.deltaVRequirement).toBe(15500);

    // But different mass ratios due to different Isp
    expect(chemicalResults.massRatio).toBeGreaterThan(nepResults.massRatio);
  });
});

describe("Formatting Utilities", () => {
  it("should format mass correctly", () => {
    expect(formatMass(500)).toBe("500 kg");
    expect(formatMass(5000)).toBe("5.00 t");
    expect(formatMass(5000000)).toBe("5.00 Mt");
  });

  it("should format velocity correctly", () => {
    expect(formatVelocity(9700)).toBe("9,700 m/s");
    expect(formatVelocity(15500)).toBe("15,500 m/s");
  });

  it("should format time correctly", () => {
    expect(formatTime(260)).toBe("260.0 days");
    expect(formatTime(365)).toBe("1.00 years");
    expect(formatTime(730)).toBe("2.00 years");
  });

  it("should format percentage correctly", () => {
    expect(formatPercent(0.5)).toBe("50.0%");
    expect(formatPercent(0.75)).toBe("75.0%");
    expect(formatPercent(0.123)).toBe("12.3%");
  });
});

describe("Edge Cases", () => {
  it("should handle very high delta-v requirements", () => {
    const inputs: MissionInputs = {
      payloadMass: 1000,
      dryMass: 5000,
      missionDeltaV: 50000, // Very high delta-v
      engineType: "chemical",
    };

    const results = calculateMission(inputs);

    expect(results.massRatio).toBeGreaterThan(1);
    expect(results.initialMass).toBeGreaterThan(results.finalMass);
    expect(results.propellantMass).toBeGreaterThan(0);
  });

  it("should handle small payload mass", () => {
    const inputs: MissionInputs = {
      payloadMass: 100,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
    };

    const results = calculateMission(inputs);

    // Payload fraction will be much smaller due to large propellant requirement
    expect(results.payloadFraction).toBeLessThan(0.01);
    expect(results.payloadFraction).toBeGreaterThan(0);
  });

  it("should handle large payload mass", () => {
    const inputs: MissionInputs = {
      payloadMass: 10000,
      dryMass: 5000,
      missionDeltaV: 9700,
      engineType: "chemical",
    };

    const results = calculateMission(inputs);

    // Even with large payload, propellant fraction dominates for chemical propulsion
    expect(results.payloadFraction).toBeGreaterThan(0.05);
    expect(results.payloadFraction).toBeLessThan(1);
  });
});
