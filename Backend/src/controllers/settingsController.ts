import { Request, Response } from "express";
import { StoreSetting } from "../models/StoreSetting.js";

/**
 * Store-wide settings editable from the Admin Panel. Every writable key must be
 * registered here with its default and a parse/clamp function, so an unknown or
 * out-of-range value can never be persisted or served.
 */
type SettingDef = {
  default: number;
  /** Coerce + clamp an incoming value; return null to reject it. */
  parse: (raw: unknown) => number | null;
};

const clampNumber =
  (min: number, max: number) =>
  (raw: unknown): number | null => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return Math.min(max, Math.max(min, Math.round(n)));
  };

export const SETTING_DEFS: Record<string, SettingDef> = {
  /**
   * Surcharge added to Cash-on-Delivery orders only. Prepaid customers pay the
   * courier rate exactly; COD costs more to service (collection fees, higher
   * RTO) so it carries this fee. Applied whether or not delivery itself is free.
   */
  codHandlingFee: { default: 10, parse: clampNumber(0, 1000) },
};

/** Reads a numeric setting, falling back to its registered default. */
export async function getNumericSetting(key: keyof typeof SETTING_DEFS | string): Promise<number> {
  const def = SETTING_DEFS[key];
  const fallback = def ? def.default : 0;
  try {
    const doc = await StoreSetting.findOne({ key }).lean();
    const n = Number((doc as any)?.value);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

// @desc    Public store settings — registered defaults merged with saved values
// @route   GET /api/v1/settings
// @access  Public
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const saved = await StoreSetting.find().lean();
    const bySaved = new Map(saved.map((s: any) => [s.key, s.value]));

    const data: Record<string, unknown> = {};
    for (const [key, def] of Object.entries(SETTING_DEFS)) {
      const parsed = bySaved.has(key) ? def.parse(bySaved.get(key)) : null;
      data[key] = parsed ?? def.default;
    }

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update one store setting
// @route   PUT /api/v1/settings/:key
// @access  Admin
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = String(req.params.key);
    const def = SETTING_DEFS[key];
    if (!def) {
      res.status(400).json({ success: false, message: `Unknown setting: ${key}` });
      return;
    }

    const value = def.parse((req.body ?? {}).value);
    if (value === null) {
      res.status(400).json({ success: false, message: `Invalid value for ${key}` });
      return;
    }

    const doc = await StoreSetting.findOneAndUpdate(
      { key },
      { key, value },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: { key, value: doc.value } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
