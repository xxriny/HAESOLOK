"""
교육활동 보호 매뉴얼 - 청킹 스크립트 v2
========================================
PDF 구조 심층 분석 기반 재작성.

발견된 실제 PDF 구조 문제:
  1. Q-A 쌍이 최대 4개 element로 분리됨
     - "Q"(라벨) + "질문텍스트" + "A"(라벨) + "답변텍스트"
     - "Q 질문텍스트" + "A 답변텍스트"
     - "Q 질문텍스트" + "A"(라벨) + "답변텍스트"
  2. 흐름도 박스가 짧은 paragraph로 추출됨 (도표 라벨 조각)
  3. list/footnote가 독립 청크가 되면 맥락 없는 파편화 발생
  4. heading1이 대섹션과 소항목에 혼용됨

핵심 개선:
  1. Q-A 사전 병합 (4가지 패턴 처리) → qa_pair 청크 타입
  2. list/footnote → 섹션 버퍼에 흡수 (table만 독립 유지)
  3. 도표 라벨 → 섹션 버퍼에 흡수 (자연스럽게 컨텍스트 포함)
  4. MIN_CHARS 150자로 상향 → 짧은 청크 병합 강화
  5. 목표 청크: 300~800자

실행: python prepare_chunks.py
결과: chunks_refined.json
"""

import json, re
from datetime import datetime
from pathlib import Path
from collections import Counter

# ── 경로 ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent
INPUT_PATH  = SCRIPT_DIR / "edu_protection_manual.json"
OUTPUT_PATH = SCRIPT_DIR / "chunks_refined.json"

# ── 설정 ──────────────────────────────────────────────────────────────────────
MAX_CHARS = 1200
MIN_CHARS = 150

SKIP_CATS  = {"header", "footer", "index", "figure"}
SKIP_PAGES = {1, 2, 3, 4, 5, 6, 12, 17, 18, 29, 30, 70, 89, 90, 111, 112}

# ── 페이지 → Part 매핑 ─────────────────────────────────────────────────────────
def page_to_part(page: int) -> tuple:
    if  7 <= page <= 16:  return "Ⅰ",  "교육활동 침해행위의 이해"
    if 19 <= page <= 28:  return "Ⅱ",  "교권보호위원회"
    if 31 <= page <= 68:  return "Ⅲ",  "교육활동 침해 사안 단계별 대응방안"
    if 71 <= page <= 88:  return "Ⅳ",  "피해교원에 대한 지원 제도"
    if 91 <= page <= 110: return "Ⅴ",  "사례로 알아보는 교육활동 침해행위"
    if page >= 113:       return "부록", "부록"
    return "", "서문"

# ── Part Ⅴ 침해유형 페이지 기반 확정 ─────────────────────────────────────────
VIOLATION_BY_PAGE = {
    91:  "공무/업무방해",
    92:  "무고",
    93:  "상해·폭행",
    94:  "협박",
    95:  "명예훼손·모욕",
    96:  "명예훼손·모욕",
    97:  "명예훼손·모욕",
    98:  "손괴",
    99:  "성폭력범죄",
    100: "정보통신망 불법정보 유통",
    101: "정보통신망 불법정보 유통",
    102: "스토킹·녹음 등",
    103: "스토킹·녹음 등",
    104: "반복적 민원",
    105: "부당한 손해배상 요구",
    106: "성희롱·성적 언동",
    107: "부당한 간섭",
    108: "생활지도 불응",
    109: "생활지도 불응",
    110: "개인정보·음성권 침해",
}

# ═══════════════════════════════════════════════════════════════════════════════
# Phase 1: Q-A 사전 병합
# ═══════════════════════════════════════════════════════════════════════════════
def preprocess_qa(elements: list) -> list:
    """
    Q-A 쌍을 감지해 단일 qa_pair element로 병합.

    처리하는 패턴:
      A: ["Q", "질문텍스트", "A", "답변텍스트"]  → 4개 element
      B: ["Q 질문텍스트", "A 답변텍스트"]         → 2개 element
      C: ["Q 질문텍스트", "A", "답변텍스트"]      → 3개 element
      D: (list/heading1 포함 위 패턴들)            → 카테고리 무관 처리
    """
    def get_text(idx: int) -> str:
        return elements[idx]["content"]["text"].strip() if idx < len(elements) else ""

    def is_q_label(t: str) -> bool:
        return t == "Q" or t.startswith("Q ") or t.startswith("Q\n")

    def is_a_label(t: str) -> bool:
        return t == "A" or t.startswith("A ") or t.startswith("A\n")

    def make_qa(e, q_text: str, a_text: str) -> dict:
        return {
            "id": e["id"],
            "category": "qa_pair",
            "page": e["page"],
            "content": {"text": f"{q_text}\n{a_text}", "html": ""},
            "words": [],
            "coordinates": [],
        }

    out = []
    i = 0
    while i < len(elements):
        e   = elements[i]
        t   = get_text(i)
        cat = e["category"]

        # skip 대상은 그대로 통과
        if cat in SKIP_CATS or e["page"] in SKIP_PAGES or not t:
            out.append(e)
            i += 1
            continue

        if is_q_label(t):
            # ── Q 텍스트 확정 ─────────────────────────────────────────────────
            if t == "Q":
                # Pattern A/C 후보: Q 라벨 단독, 다음이 질문 텍스트
                q_text = "Q " + get_text(i + 1)
                a_start = i + 2
            else:
                # Pattern B/D: Q + 질문이 한 element에
                q_text = t
                a_start = i + 1

            # ── A 텍스트 확정 ─────────────────────────────────────────────────
            a_t = get_text(a_start)

            if is_a_label(a_t):
                if a_t == "A":
                    # A 라벨 단독 → 다음이 실제 답변
                    a_text = "A " + get_text(a_start + 1)
                    consume = a_start + 2
                else:
                    # A + 답변이 한 element에
                    a_text = a_t
                    consume = a_start + 1

                if q_text.strip() and a_text.strip() and a_text.strip() != "A":
                    out.append(make_qa(e, q_text, a_text))
                    i = consume
                    continue

        out.append(e)
        i += 1

    qa_count = sum(1 for e in out if e["category"] == "qa_pair")
    print(f"  Q-A 병합: {qa_count}쌍 → qa_pair element 생성")
    return out


# ═══════════════════════════════════════════════════════════════════════════════
# Phase 2: 청크 경계 판단
# ═══════════════════════════════════════════════════════════════════════════════

# 경계가 아닌 heading1 패턴 (버퍼에 흡수)
NON_BOUNDARY_PATTERNS = [
    r"^[가나다라마바사아자차카타파하]\.",   # 가. 나. 다.
    r"^[가나다라마바사]\)\s",              # 가) 나) 다)
    r"^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]",          # 원문자
    r"^「",                               # 「법률명」
    r"^제\d+조",                          # 제N조
    r"^제\d+항",                          # 제N항
    r"^\d+\.\s",                          # 1. 2. 목록
    r"^\(\d+\)",                          # (1) (2)
    r"^\([가나다라]\)",                    # (가) (나)
    r"^Q[\s\n]|^Q$",                      # Q 라벨
    r"^A[\s\n]|^A$",                      # A 라벨
    r"^[·•]\s",                           # · 불릿
    r"^※",                                # 참고
    r"^\*\s",                             # *
    r"^부칙",                              # 부칙
    r"^\[별",                             # [별표]
    r"^관련 법률",                         # 관련 법률
    r"^\d+\)\s",                          # 1) 2) 소항목
    r"^나\.\s",                           # 나.
    r"^다\.\s",                           # 다.
    r"^라\.\s",                           # 라.
]

def is_non_boundary(text: str) -> bool:
    t = text.strip()
    return any(re.match(p, t) for p in NON_BOUNDARY_PATTERNS)

def is_chunk_boundary(text: str) -> bool:
    t = text.strip()
    if is_non_boundary(t):
        return False
    # "1장", "2장" ...
    if re.match(r"^\d+장\s", t):
        return True
    # "1 신고 및 접수", "14 교원의 정당한 생활지도..."
    if re.match(r"^\d{1,2}\s+[가-힣「]", t):
        return True
    # 알려진 대섹션 제목
    KNOWN = [
        "교육활동 침해행위의 개념과 유형",
        "교육활동 침해행위 예방교육의 실시",
        "교권보호위원회 구성",
        "교육활동 침해 사안 처리 시 유의사항",
        "교육활동 침해 사안 단계별 대응방안",
        "교육활동 침해 사안 관련 분쟁 조정",
        "피해교원에 대한 지원 제도",
        "교육활동 침해 이외 사안에 대한 대응",
        "지역교권보호위원회 사안심의",
        "각종 서식",
        "교육활동 보호 관련 법규",
    ]
    return any(t.startswith(k) or k in t for k in KNOWN)


# ═══════════════════════════════════════════════════════════════════════════════
# Phase 3: 청킹 메인 로직
# ═══════════════════════════════════════════════════════════════════════════════
def clean(t: str) -> str:
    t = re.sub(r">+", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()

def strip_num_prefix(t: str) -> str:
    t = re.sub(r"^\d+장\s+", "", t)
    t = re.sub(r"^\d{1,2}\s+", "", t)
    return clean(t)

def split_text(text: str) -> list:
    if len(text) <= MAX_CHARS:
        return [text]
    chunks, cur = [], ""
    for s in re.split(r"\n|(?<=[.。!?])\s+", text):
        if len(cur) + len(s) + 1 <= MAX_CHARS:
            cur = (cur + " " + s).strip()
        else:
            if cur:
                chunks.append(cur)
            cur = s
    if cur:
        chunks.append(cur)
    return chunks or [text[:MAX_CHARS]]

def has_legal(t: str) -> bool:
    return bool(re.search(r"제\d+조|제\d+항|제\d+호|고시|시행령|법률", t))

def has_proc(t: str) -> bool:
    return any(k in t for k in ["단계", "절차", "방법", "신청", "접수", "①", "②", "③"])

def get_keywords(text: str, title: str) -> list:
    kws = set(re.findall(r"[가-힣]{2,6}", title)[:5])
    for w in ["교원", "교육활동", "학부모", "교권", "보호조치",
              "위원회", "피해교원", "침해행위", "지역교권보호위원회", "신고"]:
        if w in text:
            kws.add(w)
    return sorted(kws)[:8]


def build_chunks(elements: list) -> list:
    raw_chunks = []

    cur_part       = ""
    cur_part_title = "서문"
    cur_chapter    = ""
    cur_section    = "서문"
    cur_violation  = ""
    buffer         = []   # {"text", "page", "id", "cat"}

    def make_meta(text: str, ps: int, pe: int, ids: list,
                  has_h: bool, has_t: bool, chunk_type: str = "section") -> dict:
        sec = strip_num_prefix(cur_section) if cur_section else cur_part_title
        v   = cur_violation if cur_part == "Ⅴ" else ""
        return {
            "chunk_type":      chunk_type,
            "part":            cur_part,
            "part_title":      cur_part_title,
            "chapter_title":   cur_chapter,
            "section_title":   sec,
            "violation_type":  v,
            "text":            text,
            "page_start":      ps,
            "page_end":        pe,
            "has_heading":     has_h,
            "has_table":       has_t,
            "has_legal_basis": has_legal(text),
            "has_procedure":   has_proc(text),
            "keywords":        get_keywords(text, sec),
            "element_ids":     ids,
            "char_count":      len(text),
            "word_count":      len(text.split()),
        }

    def flush():
        if not buffer:
            return
        # heading이 버퍼 첫 번째인 경우 heading 텍스트 + body 분리
        if buffer[0]["cat"] == "heading1":
            h_text = buffer[0]["text"]
            body   = clean(" ".join(x["text"] for x in buffer[1:] if x["text"]))
            h_clean = clean(h_text)
            if body.startswith(h_clean):
                body = re.sub(r"^[\s·\-–:]+", "", body[len(h_clean):]).strip()
            final = body if body else h_clean
        else:
            final = clean(" ".join(x["text"] for x in buffer if x["text"]))

        if not final:
            buffer.clear()
            return

        ps    = buffer[0]["page"]
        pe    = buffer[-1]["page"]
        ids   = [x["id"] for x in buffer]
        has_h = buffer[0]["cat"] == "heading1"
        has_t = any(x["cat"] == "table" for x in buffer)

        for sub in split_text(final):
            raw_chunks.append(make_meta(sub, ps, pe, ids, has_h, has_t))
        buffer.clear()

    for elem in elements:
        cat  = elem["category"]
        page = elem["page"]
        eid  = elem["id"]
        text = clean(elem.get("content", {}).get("text", ""))

        # ── 스킵 ───────────────────────────────────────────────────────────────
        if cat in SKIP_CATS:
            continue
        if page in SKIP_PAGES:
            continue
        if not text:
            continue

        new_part, new_part_title = page_to_part(page)

        # ── qa_pair: 독립 청크 ────────────────────────────────────────────────
        if cat == "qa_pair":
            flush()
            cur_part       = new_part
            cur_part_title = new_part_title
            sec = strip_num_prefix(cur_section) if cur_section else cur_part_title
            v   = VIOLATION_BY_PAGE.get(page, "") if new_part == "Ⅴ" else ""
            raw_chunks.append({
                **make_meta(text, page, page, [eid], False, False, "qa_pair"),
                "violation_type": v,
                "section_title":  sec,
            })
            continue

        # ── table: 독립 청크 ──────────────────────────────────────────────────
        if cat == "table":
            flush()
            cur_part       = new_part
            cur_part_title = new_part_title
            sec = strip_num_prefix(cur_section) if cur_section else cur_part_title
            v   = VIOLATION_BY_PAGE.get(page, "") if new_part == "Ⅴ" else ""
            raw_chunks.append({
                **make_meta(text, page, page, [eid], False, True, "table"),
                "violation_type": v,
                "section_title":  sec,
            })
            continue

        # ── heading1: 경계 판단 ───────────────────────────────────────────────
        if cat == "heading1":
            is_partv_law = (new_part == "Ⅴ" and text.startswith("「"))
            if is_chunk_boundary(text) or is_partv_law:
                flush()
                cur_part       = new_part
                cur_part_title = new_part_title
                if re.match(r"^\d+장\s", text) or re.match(r"^\d{1,2}\s+[가-힣]", text):
                    cur_chapter = strip_num_prefix(text)[:50]
                if new_part == "Ⅴ":
                    cur_violation = VIOLATION_BY_PAGE.get(page, cur_violation)
                cur_section = text
            else:
                # 비경계 heading1도 Part Ⅴ violation 페이지 변경 감지
                if new_part == "Ⅴ" and buffer:
                    prev_vtype = VIOLATION_BY_PAGE.get(buffer[-1]["page"], "")
                    curr_vtype = VIOLATION_BY_PAGE.get(page, "")
                    if prev_vtype and curr_vtype and prev_vtype != curr_vtype:
                        flush()
                        cur_violation = curr_vtype
            cur_part       = new_part
            cur_part_title = new_part_title
            buffer.append({"text": text, "page": page, "id": eid, "cat": cat})
            continue

        # ── paragraph / list / footnote: 버퍼에 흡수 ──────────────────────────
        # (list와 footnote를 독립 청크로 만들지 않음 → 맥락 보존)
        if new_part and new_part != cur_part:
            flush()
            cur_section   = ""
            cur_violation = VIOLATION_BY_PAGE.get(page, "") if new_part == "Ⅴ" else ""
        elif new_part == "Ⅴ" and buffer:
            # 침해유형 번호 헤딩이 paragraph로 추출되는 경우 대비 (9~13번, 15번 등)
            prev_vtype = VIOLATION_BY_PAGE.get(buffer[-1]["page"], "")
            curr_vtype = VIOLATION_BY_PAGE.get(page, "")
            if prev_vtype and curr_vtype and prev_vtype != curr_vtype:
                flush()
                cur_violation = curr_vtype

        cur_part       = new_part
        cur_part_title = new_part_title
        buffer.append({"text": text, "page": page, "id": eid, "cat": cat})

    flush()
    return raw_chunks


# ═══════════════════════════════════════════════════════════════════════════════
# Phase 4: 짧은 청크 병합
# ═══════════════════════════════════════════════════════════════════════════════
def merge_short(chunks: list) -> list:
    result, i = [], 0
    while i < len(chunks):
        c = chunks[i]
        # section 타입만 병합 (qa_pair, table은 유지)
        if (c["chunk_type"] == "section"
                and c["char_count"] < MIN_CHARS
                and i + 1 < len(chunks)
                and chunks[i + 1]["part"] == c["part"]
                and chunks[i + 1]["chunk_type"] == "section"):
            n  = dict(chunks[i + 1])
            mt = (c["text"] + " " + n["text"]).strip()
            n.update({
                "text":            mt,
                "char_count":      len(mt),
                "word_count":      len(mt.split()),
                "page_start":      min(c["page_start"], n["page_start"]),
                "element_ids":     c["element_ids"] + n["element_ids"],
                "has_legal_basis": c["has_legal_basis"] or n["has_legal_basis"],
                "has_procedure":   c["has_procedure"]   or n["has_procedure"],
                "keywords":        sorted(set(c["keywords"] + n["keywords"]))[:8],
                "section_title":   c["section_title"] or n["section_title"],
                "violation_type":  c["violation_type"] or n["violation_type"],
            })
            chunks[i + 1] = n
            i += 1
            continue
        result.append(c)
        i += 1
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# Phase 5: 노이즈 제거
# ═══════════════════════════════════════════════════════════════════════════════
NOISE_PATTERNS = [
    r"^2025 교육활동",
    r"무단 복제",
    r"^수탁연구자료",
    r"^2\s*0\s*2\s*5",
]

def is_noise(chunk: dict) -> bool:
    if chunk["char_count"] < 40:
        return True
    if chunk["part"] == "":
        return True
    return any(re.search(p, chunk["text"]) for p in NOISE_PATTERNS)


# ═══════════════════════════════════════════════════════════════════════════════
# 실행
# ═══════════════════════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("  교육활동 보호 매뉴얼 청킹 v2")
    print("  (Q-A 병합 + list 흡수 + 구조 개선)")
    print("=" * 60)

    with open(INPUT_PATH, encoding="utf-8") as f:
        data = json.load(f)
    elements = data["elements"]
    print(f"\n원본 elements: {len(elements)}개")

    # Phase 1: Q-A 사전 병합
    print("\n[Phase 1] Q-A 병합...")
    elements = preprocess_qa(elements)

    # Phase 2+3: 청킹
    print("\n[Phase 2] 청킹...")
    raw_chunks = build_chunks(elements)
    print(f"  초기 청크: {len(raw_chunks)}개")

    # Phase 4: 짧은 청크 병합
    print("\n[Phase 3] 짧은 청크 병합 (< {MIN_CHARS}자)...")
    raw_chunks = merge_short(raw_chunks)
    print(f"  병합 후: {len(raw_chunks)}개")

    # Part Ⅴ violation 페이지 기반 최종 확정
    for c in raw_chunks:
        if c["part"] == "Ⅴ":
            pv = VIOLATION_BY_PAGE.get(c["page_start"], "")
            if pv:
                c["violation_type"] = pv

    # Phase 5: 노이즈 제거
    print("\n[Phase 4] 노이즈 제거...")
    filtered = [c for c in raw_chunks if not is_noise(c)]
    print(f"  최종: {len(filtered)}개")

    # ID 부여
    final = [{"id": f"chunk_{i+1:05d}", **c} for i, c in enumerate(filtered)]

    # ── 통계 출력 ─────────────────────────────────────────────────────────────
    part_counts  = Counter(c["part"] for c in final)
    type_counts  = Counter(c["chunk_type"] for c in final)
    vtype_counts = Counter(c["violation_type"] for c in final if c["part"] == "Ⅴ")
    avg = sum(c["char_count"] for c in final) / len(final) if final else 0

    PART_LABELS = {
        "Ⅰ": "교육활동 침해행위의 이해",
        "Ⅱ": "교권보호위원회",
        "Ⅲ": "단계별 대응방안",
        "Ⅳ": "피해교원 지원",
        "Ⅴ": "침해행위 사례",
        "부록": "부록",
    }

    print("\n파트별 청크 수:")
    for p in ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "부록"]:
        cnt = part_counts.get(p, 0)
        if cnt:
            print(f"  Part {p}: {cnt:3d}개  ({PART_LABELS.get(p, '')})")

    print(f"\n청크 타입별:")
    for t, cnt in type_counts.most_common():
        print(f"  {t}: {cnt}개")

    print(f"\nPart Ⅴ 침해유형별:")
    for v, cnt in sorted(vtype_counts.items(), key=lambda x: -x[1]):
        print(f"  {v}: {cnt}개")

    print(f"\n평균 청크 길이: {avg:.0f}자")

    # 샘플 출력 (qa_pair 포함)
    print("\n샘플 qa_pair 청크:")
    qa_samples = [c for c in final if c["chunk_type"] == "qa_pair"][:3]
    for c in qa_samples:
        print(f"  [{c['id']}] Part {c['part']} | p.{c['page_start']}")
        print(f"    {c['text'][:120]}...")
        print()

    # ── 저장 ──────────────────────────────────────────────────────────────────
    output = {
        "meta": {
            "source":           "edu_protection_manual_2025",
            "version":          "v2",
            "created_at":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_elements":   len(data["elements"]),
            "total_chunks":     len(final),
            "max_chunk_chars":  MAX_CHARS,
            "min_chunk_chars":  MIN_CHARS,
            "part_distribution": dict(part_counts),
            "type_distribution": dict(type_counts),
        },
        "chunks": final,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    size_kb = OUTPUT_PATH.stat().st_size // 1024
    print(f"저장 완료: {OUTPUT_PATH.name} ({size_kb} KB)")
    print("완료!")


if __name__ == "__main__":
    main()
