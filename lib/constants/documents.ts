import type { DocumentType } from "@/lib/db/types";

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  shortLabel: string;
  description?: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    value: "parcel",
    label: "Parcel (Cadastral / Survey Parcel)",
    shortLabel: "Cadastral Parcel",
  },
  {
    value: "ownership",
    label: "Ownership (Record of Rights / RoR)",
    shortLabel: "Record of Rights (RoR)",
  },
  {
    value: "cultivation",
    label: "Cultivation (Pahani / Adangal)",
    shortLabel: "Cultivation / Adangal",
  },
  {
    value: "mutation",
    label: "Mutation (Ferfar / Transfer Record)",
    shortLabel: "Mutation Register",
  },
  {
    value: "account_holding",
    label: "Account / Holding (Khata / 8A)",
    shortLabel: "Khata / Holding (8A)",
  },
  {
    value: "encumbrance",
    label: "Encumbrance Certificate (EC)",
    shortLabel: "Encumbrance Certificate",
  },
  {
    value: "spatial_map",
    label: "Spatial Map (FMB / Cadastral Map)",
    shortLabel: "FMB / Village Map",
  },
  {
    value: "property_card",
    label: "Property Card (Urban Title / CTS)",
    shortLabel: "Urban Property Card",
  },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  parcel: "Parcel (Cadastral / Survey Parcel)",
  ownership: "Ownership (Record of Rights / RoR)",
  cultivation: "Cultivation (Pahani / Adangal)",
  mutation: "Mutation (Ferfar / Transfer Record)",
  account_holding: "Account / Holding (Khata / 8A)",
  encumbrance: "Encumbrance Certificate (EC)",
  spatial_map: "Spatial Map (FMB / Cadastral Map)",
  property_card: "Property Card (Urban Title / CTS)",
};
