import {
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Truck,
  Car,
  Landmark,
  Plane,
  Briefcase,
  Building2,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export const INDUSTRY_ICON_MAP = {
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Truck,
  Car,
  Landmark,
  Plane,
  Briefcase,
  Building2,
  Layers,
  ShieldCheck,
  Zap,
}

export function getIndustryIcon(iconName) {
  return INDUSTRY_ICON_MAP[iconName] || Building2
}
