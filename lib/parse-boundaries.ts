import proj4 from "proj4";
import type { Feature, FeatureCollection, Geometry, GeoJSON } from "geojson";

// ── GeoPackage binary header parsing ────────────────────────────────────────
// GeoPackage Binary format: 2-byte magic (GP), 1-byte version, 1-byte flags,
// 4-byte SRS ID, N-byte envelope, then WKB geometry.
const ENVELOPE_BYTES: Record<number, number> = { 0: 0, 1: 32, 2: 48, 3: 48, 4: 64 };

function extractWkbFromGpkgBlob(blob: Buffer): Buffer | null {
  if (blob.length < 8) return null;
  if (blob[0] !== 0x47 || blob[1] !== 0x50) return null; // magic "GP"
  const flags = blob[3];
  const envelopeType = (flags >> 1) & 0x07;
  const envBytes = ENVELOPE_BYTES[envelopeType] ?? 0;
  const wkbOffset = 8 + envBytes;
  if (wkbOffset >= blob.length) return null;
  return blob.subarray(wkbOffset);
}

// ── Coordinate reprojection ─────────────────────────────────────────────────

function loadEpsgDef(epsg: number): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const all = require("epsg-index/all.json") as Record<string, { proj4: string | null }>;
    return all[String(epsg)]?.proj4 ?? null;
  } catch {
    return null;
  }
}

type Position = number[];

function reprojectPosition(pos: Position, converter: (p: Position) => Position): Position {
  const [x, y, ...rest] = pos;
  const [lon, lat] = converter([x, y]);
  return [lon, lat, ...rest];
}

function reprojectCoordinates(
  coords: unknown,
  depth: number,
  converter: (p: Position) => Position,
): unknown {
  if (depth === 0) return reprojectPosition(coords as Position, converter);
  return (coords as unknown[]).map((c) => reprojectCoordinates(c, depth - 1, converter));
}

const GEOMETRY_DEPTHS: Record<string, number> = {
  Point: 0,
  MultiPoint: 1,
  LineString: 1,
  MultiLineString: 2,
  Polygon: 2,
  MultiPolygon: 3,
};

function reprojectGeometry(geom: Geometry, converter: (p: Position) => Position): Geometry {
  const depth = GEOMETRY_DEPTHS[geom.type];
  if (depth === undefined) return geom; // GeometryCollection — skip
  const withCoords = geom as unknown as { type: string; coordinates: unknown };
  return {
    type: withCoords.type,
    coordinates: reprojectCoordinates(withCoords.coordinates, depth, converter),
  } as unknown as Geometry;
}

// ── Normalise any GeoJSON input to a FeatureCollection ──────────────────────

function normalise(raw: GeoJSON): FeatureCollection {
  if (raw.type === "FeatureCollection") return raw as FeatureCollection;
  if (raw.type === "Feature") return { type: "FeatureCollection", features: [raw as Feature] };
  // Bare geometry
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", geometry: raw as Geometry, properties: {} }],
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function parseGeojson(buffer: Buffer): Promise<FeatureCollection> {
  const text = buffer.toString("utf8");
  return normalise(JSON.parse(text) as GeoJSON);
}

export async function parseShapefile(buffer: Buffer): Promise<FeatureCollection> {
  const { default: shp } = await import("shpjs");
  const result = await shp(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);
  if (Array.isArray(result)) {
    return {
      type: "FeatureCollection",
      features: result.flatMap((fc) => (fc as FeatureCollection).features ?? []),
    };
  }
  return result as FeatureCollection;
}

export async function parseGeopackage(buffer: Buffer): Promise<FeatureCollection> {
  const Database = (await import("better-sqlite3")).default;
  const os = await import("os");
  const fs = await import("fs");
  const path = await import("path");
  const { Geometry } = await import("wkx");

  const tmp = path.join(os.tmpdir(), `gpkg_${Date.now()}.gpkg`);
  fs.writeFileSync(tmp, buffer);

  try {
    const db = new Database(tmp, { readonly: true });

    const tables = db
      .prepare("SELECT table_name, column_name FROM gpkg_geometry_columns")
      .all() as { table_name: string; column_name: string }[];

    const features: Feature[] = [];

    for (const { table_name, column_name } of tables) {
      const rows = db.prepare(`SELECT * FROM "${table_name}"`).all() as Record<string, unknown>[];
      for (const row of rows) {
        const blob = row[column_name];
        if (!Buffer.isBuffer(blob) && !(blob instanceof Uint8Array)) continue;
        const wkb = extractWkbFromGpkgBlob(Buffer.from(blob as Uint8Array));
        if (!wkb) continue;
        const geom = Geometry.parse(wkb).toGeoJSON() as Geometry;
        const props = Object.fromEntries(
          Object.entries(row).filter(([k]) => k !== column_name),
        );
        features.push({ type: "Feature", geometry: geom, properties: props });
      }
    }

    db.close();
    return { type: "FeatureCollection", features };
  } finally {
    fs.unlinkSync(tmp);
  }
}

export function applyEpsgTransform(fc: FeatureCollection, epsg: number): FeatureCollection {
  if (epsg === 4326) return fc;

  const def = loadEpsgDef(epsg);
  if (!def) throw new Error(`Unknown EPSG:${epsg} — not found in epsg-index`);

  proj4.defs(`EPSG:${epsg}`, def);
  const converter = proj4(`EPSG:${epsg}`, "WGS84").forward as (p: Position) => Position;

  return {
    ...fc,
    features: fc.features.map((f) => ({
      ...f,
      geometry: f.geometry ? reprojectGeometry(f.geometry, converter) : f.geometry,
    })),
  };
}
