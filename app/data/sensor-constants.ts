import type { SensorMetadataConfig, SensorReportConfig } from "~/types/profile";

/**
 * EPCIS Sensor Element Constants
 * Measurement types, component values, exception values, UOM patterns,
 * and field definitions for sensorMetadata and sensorReport.
 *
 * Based on GS1 EPCIS JSON Schema:
 * https://ref.gs1.org/standards/epcis/epcis-json-schema.json
 */

// ============================================
// EPCIS Measurement Types (71 types from GS1 standard)
// ============================================
export const measurementTypes = [
  { label: "Absolute Humidity", value: "AbsoluteHumidity" },
  { label: "Absorbed Dose", value: "AbsorbedDose" },
  { label: "Absorbed Dose Rate", value: "AbsorbedDoseRate" },
  { label: "Acceleration", value: "Acceleration" },
  { label: "Altitude", value: "Altitude" },
  { label: "Amount Of Substance", value: "AmountOfSubstance" },
  {
    label: "Amount Of Substance Per Unit Volume",
    value: "AmountOfSubstancePerUnitVolume",
  },
  { label: "Angle", value: "Angle" },
  { label: "Angular Acceleration", value: "AngularAcceleration" },
  { label: "Angular Momentum", value: "AngularMomentum" },
  { label: "Angular Velocity", value: "AngularVelocity" },
  { label: "Area", value: "Area" },
  { label: "Capacitance", value: "Capacitance" },
  { label: "Conductance", value: "Conductance" },
  { label: "Conductivity", value: "Conductivity" },
  { label: "Count", value: "Count" },
  { label: "Density", value: "Density" },
  { label: "Dimensionless", value: "Dimensionless" },
  { label: "Dose Equivalent", value: "DoseEquivalent" },
  { label: "Dose Equivalent Rate", value: "DoseEquivalentRate" },
  { label: "Dynamic Viscosity", value: "DynamicViscosity" },
  { label: "Electric Charge", value: "ElectricCharge" },
  { label: "Electric Current", value: "ElectricCurrent" },
  { label: "Electric Current Density", value: "ElectricCurrentDensity" },
  { label: "Electric Field Strength", value: "ElectricFieldStrength" },
  { label: "Energy", value: "Energy" },
  { label: "Exposure", value: "Exposure" },
  { label: "Force", value: "Force" },
  { label: "Frequency", value: "Frequency" },
  { label: "Illuminance", value: "Illuminance" },
  { label: "Inductance", value: "Inductance" },
  { label: "Irradiance", value: "Irradiance" },
  { label: "Kinematic Viscosity", value: "KinematicViscosity" },
  { label: "Length", value: "Length" },
  { label: "Linear Momentum", value: "LinearMomentum" },
  { label: "Luminance", value: "Luminance" },
  { label: "Luminous Flux", value: "LuminousFlux" },
  { label: "Luminous Intensity", value: "LuminousIntensity" },
  { label: "Magnetic Flux", value: "MagneticFlux" },
  { label: "Magnetic Flux Density", value: "MagneticFluxDensity" },
  { label: "Magnetic Vector Potential", value: "MagneticVectorPotential" },
  { label: "Mass", value: "Mass" },
  { label: "Mass Concentration", value: "MassConcentration" },
  { label: "Mass Flow Rate", value: "MassFlowRate" },
  { label: "Mass Per Area Time", value: "MassPerAreaTime" },
  { label: "Memory Capacity", value: "MemoryCapacity" },
  { label: "Molality Of Solute", value: "MolalityOfSolute" },
  { label: "Molar Energy", value: "MolarEnergy" },
  { label: "Molar Mass", value: "MolarMass" },
  { label: "Molar Volume", value: "MolarVolume" },
  { label: "Power", value: "Power" },
  { label: "Pressure", value: "Pressure" },
  { label: "Radiant Flux", value: "RadiantFlux" },
  { label: "Radiant Intensity", value: "RadiantIntensity" },
  { label: "Radioactivity", value: "Radioactivity" },
  { label: "Relative Humidity", value: "RelativeHumidity" },
  { label: "Resistance", value: "Resistance" },
  { label: "Resistivity", value: "Resistivity" },
  { label: "Solid Angle", value: "SolidAngle" },
  { label: "Specific Volume", value: "SpecificVolume" },
  { label: "Speed", value: "Speed" },
  { label: "Surface Density", value: "SurfaceDensity" },
  { label: "Surface Tension", value: "SurfaceTension" },
  { label: "Temperature", value: "Temperature" },
  { label: "Time", value: "Time" },
  { label: "Torque", value: "Torque" },
  { label: "Voltage", value: "Voltage" },
  { label: "Volume", value: "Volume" },
  { label: "Volume Flow Rate", value: "VolumeFlowRate" },
  { label: "Volume Fraction", value: "VolumeFraction" },
  { label: "Volumetric Flux", value: "VolumetricFlux" },
  { label: "Wavenumber", value: "Wavenumber" },
] as const;

// ============================================
// CBV Component values (14 components for multi-dimensional measurements)
// ============================================
export const componentOptions = [
  { label: "x", value: "x" },
  { label: "y", value: "y" },
  { label: "z", value: "z" },
  { label: "axial_distance", value: "axial_distance" },
  { label: "azimuth", value: "azimuth" },
  { label: "height", value: "height" },
  { label: "spherical_radius", value: "spherical_radius" },
  { label: "polar_angle", value: "polar_angle" },
  { label: "elevation_angle", value: "elevation_angle" },
  { label: "easting", value: "easting" },
  { label: "northing", value: "northing" },
  { label: "latitude", value: "latitude" },
  { label: "longitude", value: "longitude" },
  { label: "altitude", value: "altitude" },
] as const;

// ============================================
// Sensor Alert Type / Exception values
// ============================================
export const exceptionOptions = [
  { label: "ALARM_CONDITION", value: "ALARM_CONDITION" },
  { label: "ERROR_CONDITION", value: "ERROR_CONDITION" },
] as const;

// ============================================
// UOM example patterns (UN/CEFACT Recommendation 20 codes)
// ============================================
export const uomExamplePatterns = [
  { label: "UN/CEFACT Code", pattern: "^[A-Z0-9]{2,3}$" },
  { label: "Temperature", pattern: "^(CEL|FAH|KEL)$" },
  { label: "Speed/Velocity", pattern: "^(KMH|MTS|HM)$" },
  { label: "Mass", pattern: "^(KGM|GRM|MGM|TNE|LBR|ONZ)$" },
  { label: "Length", pattern: "^(MTR|CMT|MMT|KMT|INH|FOT)$" },
  {
    label: "Sensor Common",
    pattern: "^(CEL|A93|KMH|LUX|MTS|PAL|WTT|VLT|AMP|HRZ)$",
  },
] as const;

// ============================================
// Sensor Metadata fields (8 fields from EPCIS JSON Schema)
// ============================================
export const metadataFields: Array<{
  key: keyof SensorMetadataConfig;
  fieldName: string;
  label: string;
  type: "URI" | "dateTime";
}> = [
  { key: "includeTime", fieldName: "time", label: "time", type: "dateTime" },
  {
    key: "includeDeviceID",
    fieldName: "deviceID",
    label: "deviceID",
    type: "URI",
  },
  {
    key: "includeDeviceMetadata",
    fieldName: "deviceMetadata",
    label: "deviceMetadata",
    type: "URI",
  },
  {
    key: "includeRawData",
    fieldName: "rawData",
    label: "rawData",
    type: "URI",
  },
  {
    key: "includeStartTime",
    fieldName: "startTime",
    label: "startTime",
    type: "dateTime",
  },
  {
    key: "includeEndTime",
    fieldName: "endTime",
    label: "endTime",
    type: "dateTime",
  },
  {
    key: "includeDataProcessingMethod",
    fieldName: "dataProcessingMethod",
    label: "dataProcessingMethod",
    type: "URI",
  },
  {
    key: "includeBizRules",
    fieldName: "bizRules",
    label: "bizRules",
    type: "URI",
  },
];

// ============================================
// Sensor Report field type discriminator
// ============================================
export type SensorReportFieldType =
  | "measurementType"
  | "sensorAlertType"
  | "uri"
  | "dateTime"
  | "decimal"
  | "component"
  | "string"
  | "boolean"
  | "hexBinary";

// ============================================
// Sensor Report fields (all 24 fields from EPCIS JSON Schema, in schema order)
// ============================================
export const reportFields: Array<{
  key: keyof SensorReportConfig;
  fieldName: string;
  label: string;
  type: SensorReportFieldType;
}> = [
  {
    key: "includeType",
    fieldName: "type",
    label: "type",
    type: "measurementType",
  },
  {
    key: "includeException",
    fieldName: "exception",
    label: "exception",
    type: "sensorAlertType",
  },
  {
    key: "includeDeviceID",
    fieldName: "deviceID",
    label: "deviceID",
    type: "uri",
  },
  {
    key: "includeDeviceMetadata",
    fieldName: "deviceMetadata",
    label: "deviceMetadata",
    type: "uri",
  },
  {
    key: "includeRawData",
    fieldName: "rawData",
    label: "rawData",
    type: "uri",
  },
  {
    key: "includeDataProcessingMethod",
    fieldName: "dataProcessingMethod",
    label: "dataProcessingMethod",
    type: "uri",
  },
  {
    key: "includeBizRules",
    fieldName: "bizRules",
    label: "bizRules",
    type: "uri",
  },
  { key: "includeTime", fieldName: "time", label: "time", type: "dateTime" },
  {
    key: "includeMicroorganism",
    fieldName: "microorganism",
    label: "microorganism",
    type: "uri",
  },
  {
    key: "includeChemicalSubstance",
    fieldName: "chemicalSubstance",
    label: "chemicalSubstance",
    type: "uri",
  },
  {
    key: "includeCoordinateReferenceSystem",
    fieldName: "coordinateReferenceSystem",
    label: "coordinateReferenceSystem",
    type: "uri",
  },
  { key: "includeValue", fieldName: "value", label: "value", type: "decimal" },
  {
    key: "includeComponent",
    fieldName: "component",
    label: "component",
    type: "component",
  },
  {
    key: "includeStringValue",
    fieldName: "stringValue",
    label: "stringValue",
    type: "string",
  },
  {
    key: "includeBooleanValue",
    fieldName: "booleanValue",
    label: "booleanValue",
    type: "boolean",
  },
  {
    key: "includeHexBinaryValue",
    fieldName: "hexBinaryValue",
    label: "hexBinaryValue",
    type: "hexBinary",
  },
  {
    key: "includeUriValue",
    fieldName: "uriValue",
    label: "uriValue",
    type: "uri",
  },
  {
    key: "includeMinValue",
    fieldName: "minValue",
    label: "minValue",
    type: "decimal",
  },
  {
    key: "includeMaxValue",
    fieldName: "maxValue",
    label: "maxValue",
    type: "decimal",
  },
  {
    key: "includeMeanValue",
    fieldName: "meanValue",
    label: "meanValue",
    type: "decimal",
  },
  { key: "includeSDev", fieldName: "sDev", label: "sDev", type: "decimal" },
  {
    key: "includePercRank",
    fieldName: "percRank",
    label: "percRank",
    type: "decimal",
  },
  {
    key: "includePercValue",
    fieldName: "percValue",
    label: "percValue",
    type: "decimal",
  },
  { key: "includeUom", fieldName: "uom", label: "uom", type: "string" },
];
