/**
 * LanceDB 임베딩 적재 스크립트
 *
 * 실행: node scripts/ingest-lancedb.mjs
 *
 * - chunks_refined.json → 임베딩 → lancedb/ 폴더에 저장
 * - 모델: Xenova/multilingual-e5-small (첫 실행 시 ~120MB 다운로드)
 * - section + qa_pair 청크만 임베딩 (table 제외)
 */

import { createRequire } from "module";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── 데이터 로드 ───────────────────────────────────────────────────────────────
const chunksPath = join(ROOT, "src/data/edu_protection_manual/chunks_refined.json");
const data = JSON.parse(readFileSync(chunksPath, "utf-8"));
const allChunks = data.chunks;

// table 제외 (섹션 + QA만)
const chunks = allChunks.filter(c => c.chunk_type !== "table" && c.char_count >= 40);
console.log(`\n📂 총 청크: ${allChunks.length}개 → 임베딩 대상: ${chunks.length}개 (table 제외)\n`);

// ── 임베딩 모델 초기화 ─────────────────────────────────────────────────────────
console.log("🔄 모델 로딩 중... (첫 실행 시 ~120MB 다운로드)");
const { pipeline } = await import("@xenova/transformers");
const embedder = await pipeline("feature-extraction", "Xenova/multilingual-e5-small", {
  quantized: true,
});
console.log("✅ 모델 로딩 완료\n");

// ── 임베딩 함수 ───────────────────────────────────────────────────────────────
async function embed(texts) {
  const output = await embedder(texts, { pooling: "mean", normalize: true });
  // output.data: Float32Array, shape [batch, dim]
  const dim = output.dims[1];
  const result = [];
  for (let i = 0; i < texts.length; i++) {
    result.push(Array.from(output.data.slice(i * dim, (i + 1) * dim)));
  }
  return result;
}

// ── 배치 임베딩 ───────────────────────────────────────────────────────────────
const BATCH = 16;
const rows = [];

for (let i = 0; i < chunks.length; i += BATCH) {
  const batch = chunks.slice(i, i + BATCH);
  const texts = batch.map(c => `passage: ${c.text}`); // multilingual-e5 prefix

  const vectors = await embed(texts);

  for (let j = 0; j < batch.length; j++) {
    const c = batch[j];
    rows.push({
      id: c.id,
      vector: vectors[j],
      text: c.text,
      chunk_type: c.chunk_type,
      part: c.part,
      part_title: c.part_title ?? "",
      chapter_title: c.chapter_title ?? "",
      section_title: c.section_title ?? "",
      violation_type: c.violation_type ?? "",
      page_start: c.page_start,
      page_end: c.page_end,
      has_legal_basis: c.has_legal_basis ? 1 : 0,
      has_procedure: c.has_procedure ? 1 : 0,
      keywords: (c.keywords ?? []).join(","),
      char_count: c.char_count,
    });
  }

  const done = Math.min(i + BATCH, chunks.length);
  process.stdout.write(`\r⚡ 임베딩 진행: ${done}/${chunks.length} (${Math.round(done/chunks.length*100)}%)`);
}
console.log("\n\n✅ 임베딩 완료\n");

// ── LanceDB 저장 ───────────────────────────────────────────────────────────────
const lancedbPath = join(ROOT, "lancedb");
if (!existsSync(lancedbPath)) mkdirSync(lancedbPath, { recursive: true });

const lancedb = await import("@lancedb/lancedb");
const db = await lancedb.connect(lancedbPath);

// 기존 테이블 삭제 후 재생성
const tableNames = await db.tableNames();
if (tableNames.includes("edu_manual")) {
  await db.dropTable("edu_manual");
  console.log("🗑️  기존 edu_manual 테이블 삭제");
}

const table = await db.createTable("edu_manual", rows);
console.log(`✅ LanceDB 저장 완료: ${rows.length}개 행 → ${lancedbPath}/edu_manual`);

// ── 간단 검증 ─────────────────────────────────────────────────────────────────
console.log("\n🔍 검증 쿼리: '교육활동 침해행위 대응 방법'");
const queryVec = await embed(["query: 교육활동 침해행위 대응 방법"]);
const results = await table.search(queryVec[0]).limit(3).toArray();
results.forEach((r, i) => {
  console.log(`  [${i+1}] Part ${r.part} | ${r.violation_type || r.chunk_type} | ${r.section_title?.slice(0,30)}`);
  console.log(`       ${r.text.slice(0, 80)}...`);
});

console.log("\n🎉 LanceDB 적재 완료!");
