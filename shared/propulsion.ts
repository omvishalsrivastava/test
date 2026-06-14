/**
 * Propulsion systems database and mission calculation utilities
 * Rocket Equation: Δv = Isp * g₀ * ln(m₀/mf)
 * where:
 *   Δv = change in velocity (m/s)
 *   Isp = specific impulse (seconds)
 *   g₀ = standard gravity (9.81 m/s²)
 *   m₀ = initial mass (kg)
 *   mf = final mass (kg)
 */

export const STANDARD_GRAVITY = 9.81; // m/s²

export type EngineType = "chemical" | "ntp" | "nep";

export interface PropulsionSystem {
  id: EngineType;
  name: string;
  label: string;
  ispDefault: number; // seconds
  description: string;
  color: string;
}

export const PROPULSION_SYSTEMS: Record<EngineType, PropulsionSystem> = {
  chemical: {
    id: "chemical",
    name: "Chemical",
    label: "Chemical",
    ispDefault: 450,
    description: "Traditional chemical rocket propulsion",
    color: "#ef4444", // red
  },
  ntp: {
    id: "ntp",
    name: "Nuclear Thermal Propulsion",
    label: "NTP",
    ispDefault: 900,
    description: "Nuclear thermal propulsion system",
    color: "#f97316", // orange
  },
  nep: {
    id: "nep",
    name: "Nuclear Electric Propulsion",
    label: "NEP",
    ispDefault: 3000,
    description: "Nuclear electric propulsion system",
    color: "#3b82f6", // blue
  },
};

export interface MissionInputs {
  payloadMass: number; // kg
  dryMass: number; // kg
  missionDeltaV: number; // m/s
  engineType: EngineType;
  customIsp?: number; // optional custom Isp
}

export interface MissionCalculations {
  isp: number; // effective Isp used
  massRatio: number; // m₀/mf
  initialMass: number; // m₀ (kg)
  finalMass: number; // mf (kg)
  propellantMass: number; // kg
  propellantFraction: number; // propellantMass / initialMass
  payloadFraction: number; // payloadMass / initialMass
  dryMassFraction: number; // dryMass / initialMass
  estimatedTransitTime: number; // days (simplified estimate)
}

/**
 * Calculate mission parameters using the Tsiolkovsky rocket equation
 * Δv = Isp * g₀ * ln(m₀/mf)
 * Rearranged: m₀/mf = e^(Δv / (Isp * g₀))
 */
export function calculateMission(inputs: MissionInputs): MissionCalculations {
  const isp = inputs.customIsp ?? PROPULSION_SYSTEMS[inputs.engineType].ispDefault;

  // Calculate mass ratio from rocket equation
  const exponent = inputs.missionDeltaV / (isp * STANDARD_GRAVITY);
  const massRatio = Math.exp(exponent);

  // Final mass = Dry Mass + Payload Mass
  const finalMass = inputs.dryMass + inputs.payloadMass;

  // Initial mass from mass ratio
  const initialMass = finalMass * massRatio;

  // Propellant mass
  const propellantMass = initialMass - finalMass;

  // Fractions
  const propellantFraction = propellantMass / initialMass;
  const payloadFraction = inputs.payloadMass / initialMass;
  const dryMassFraction = inputs.dryMass / initialMass;

  // Simplified transit time estimate for Earth-Mars mission
  // Based on propulsion system efficiency
  // Chemical: ~260 days, NTP: ~180 days, NEP: ~400+ days (lower thrust, longer acceleration)
  let estimatedTransitTime = 260;
  if (inputs.engineType === "ntp") {
    estimatedTransitTime = 180;
  } else if (inputs.engineType === "nep") {
    // NEP has high Isp but low thrust, resulting in longer transit times
    estimatedTransitTime = 400 + (propellantMass / 1000) * 0.1; // scales with propellant mass
  }

  return {
    isp,
    massRatio,
    initialMass,
    finalMass,
    propellantMass,
    propellantFraction,
    payloadFraction,
    dryMassFraction,
    estimatedTransitTime,
  };
}

/**
 * Calculate Mars mission parameters based on transfer type
 */
export interface MarsMissionInputs {
  launchYear: number;
  transferType: "fast" | "hohmann";
  payloadMass: number;
  dryMass: number;
  engineType: EngineType;
  customIsp?: number;
}

export interface MarsMissionCalculations extends MissionCalculations {
  transferType: "fast" | "hohmann";
  deltaVRequirement: number; // m/s
  missionArchitecture: string;
}

export function calculateMarsMission(
  inputs: MarsMissionInputs
): MarsMissionCalculations {
  // Delta-v requirements vary by transfer type
  // Hohmann: ~9.7 km/s (3.3 km/s departure + 2.4 km/s arrival)
  // Fast: ~15-16 km/s (higher energy, shorter transit)
  const deltaVRequirement =
    inputs.transferType === "hohmann" ? 9700 : 15500;

  const missionInputs: MissionInputs = {
    payloadMass: inputs.payloadMass,
    dryMass: inputs.dryMass,
    missionDeltaV: deltaVRequirement,
    engineType: inputs.engineType,
    customIsp: inputs.customIsp,
  };

  const calculations = calculateMission(missionInputs);

  const transferLabel =
    inputs.transferType === "hohmann" ? "Hohmann" : "Fast";
  const missionArchitecture = `${inputs.launchYear} ${transferLabel} Transfer - ${PROPULSION_SYSTEMS[inputs.engineType].label} Propulsion`;

  return {
    ...calculations,
    transferType: inputs.transferType,
    deltaVRequirement,
    missionArchitecture,
  };
}

/**
 * Format large numbers with appropriate units
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format mass in kg with appropriate units
 */
export function formatMass(kg: number): string {
  if (kg >= 1e6) {
    return `${formatNumber(kg / 1e6, 2)} Mt`;
  } else if (kg >= 1e3) {
    return `${formatNumber(kg / 1e3, 2)} t`;
  }
  return `${formatNumber(kg, 0)} kg`;
}

/**
 * Format velocity in m/s with appropriate units
 */
export function formatVelocity(ms: number): string {
  return `${formatNumber(ms, 0)} m/s`;
}

/**
 * Format time in days with appropriate units
 */
export function formatTime(days: number): string {
  if (days >= 365) {
    return `${formatNumber(days / 365, 2)} years`;
  }
  return `${formatNumber(days, 1)} days`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${formatNumber(value * 100, decimals)}%`;
}
