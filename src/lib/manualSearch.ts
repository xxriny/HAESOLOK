/**
 * 교육활동 보호 매뉴얼 시맨틱 검색
 * LanceDB + Xenova/multilingual-e5-small 벡터 검색
 *
 * - "query: " prefix 붙여서 임베딩 → LanceDB cosine 유사도 검색
 * - 첫 호출 시 ONNX 모델 로드 (약 1-2초)
 * - 이후 캐싱으로 빠른 응답
 */

// ── 타입 ──────────────────────────────────────────────────────────────────────
export interface SearchResult {
  chunk: {
    id: string;
    chunk_type: "section" | "qa_pair" | "table";
    part: string;
    part_title: string;
    chapter_title: string;
    section_title: string;
    violation_type: string;
    text: string;
    page_start: number;
    page_end: number;
    has_legal_basis: boolean;
    has_procedure: boolean;
    keywords: string[];
    char_count: number;
  };
  score: number;
}

// ── 모듈 레벨 캐시 ─────────────────────────────────────────────────────────────
let _embedder: ((texts: string[], opts: object) => Promise<{ data: Float32Array; dims: number[] }>) | null = null;
let _table: { search: (vec: number[]) => { limit: (n: number) => { toArray: () => Promise<Record<string, unknown>[]> } } } | null = null;
let _initPromise: Promise<void> | null = null;

async function ensureInit(): Promise<void> {
  if (_table && _embedder) return;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const path = await import("path");

    // ESM-safe __dirname
    const ROOT = process.cwd();

    // 임베딩 모델 로드
    const { pipeline } = await import("@xenova/transformers");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _embedder = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
      quantized: true,
    }) as unknown as typeof _embedder;

    // LanceDB 연결
    const lancedb = await import("@lancedb/lancedb");
    const db = await lancedb.connect(path.join(ROOT, "lancedb"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _table = await db.openTable("edu_manual") as unknown as typeof _table;
  })();

  return _initPromise;
}

// ── 임베딩 헬퍼 ───────────────────────────────────────────────────────────────
async function embedQuery(text: string): Promise<number[]> {
  const output = await _embedder!([`query: ${text}`], { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

// ── 메인 검색 함수 ─────────────────────────────────────────────────────────────
export async function searchManual(query: string, topK = 5): Promise<SearchResult[]> {
  try {
    await ensureInit();

    const queryVec = await embedQuery(query);
    const rawResults = await _table!.search(queryVec).limit(topK).toArray();

    return rawResults.map((r) => ({
      chunk: {
        id: String(r.id),
        chunk_type: (r.chunk_type as "section" | "qa_pair" | "table") ?? "section",
        part: String(r.part ?? ""),
        part_title: String(r.part_title ?? ""),
        chapter_title: String(r.chapter_title ?? ""),
        section_title: String(r.section_title ?? ""),
        violation_type: String(r.violation_type ?? ""),
        text: String(r.text ?? ""),
        page_start: Number(r.page_start ?? 0),
        page_end: Number(r.page_end ?? 0),
        has_legal_basis: Number(r.has_legal_basis) === 1,
        has_procedure: Number(r.has_procedure) === 1,
        keywords: String(r.keywords ?? "").split(",").filter(Boolean),
        char_count: Number(r.char_count ?? 0),
      },
      score: typeof r._distance === "number" ? 1 - r._distance : 0,
    }));
  } catch (err) {
    console.error("[manualSearch] LanceDB 검색 오류:", err);
    return [];
  }
}

// ── RAG Context 포맷 ───────────────────────────────────────────────────────────
export function formatRagContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  return results
    .map((r, i) => {
      const { chunk } = r;
      const header = [
        `[${i + 1}] Part ${chunk.part}`,
        chunk.violation_type ? `침해유형: ${chunk.violation_type}` : "",
        chunk.section_title ? `| ${chunk.section_title}` : "",
        `(p.${chunk.page_start})`,
      ]
        .filter(Boolean)
        .join(" ");
      return `${header}\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
}
