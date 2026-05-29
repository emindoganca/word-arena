#!/usr/bin/env node
/**
 * Güvenli içerik paketi — yalnızca:
 * - Tatoeba CC0 İngilizce cümleleri (CC0-1.0, ticari serbest)
 * - CEFR-J kelime seviyeleri (ticari OK, uygulama Credits ekranında atıf)
 *
 * Not: Tatoeba CC0 export'unda Türkçe (tur) cümle yok; TR ipucu şimdilik
 * seviye odaklı kısa metin. İleride TUFS (CC BY) ile kelime çevirisi eklenebilir.
 */

import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'content-pack.json');

const URLS = {
  cefrj:
    'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv',
  sentencesCc0:
    'http://downloads.tatoeba.org/exports/sentences_CC0.tar.bz2',
};

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MAX_VS = 800;
const MAX_PLACEMENT = 10;
const MIN_SENTENCE_LEN = 15;
const MAX_SENTENCE_LEN = 100;

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function download(url, dest) {
  if (existsSync(dest)) {
    console.log(`  (önbellek) ${path.basename(dest)}`);
    return;
  }
  console.log(`  indiriliyor ${path.basename(dest)}...`);
  execSync(`curl -fL --retry 3 -o "${dest}" "${url}"`, { stdio: 'inherit' });
}

function extractTarBz2(archive, outDir) {
  ensureDir(outDir);
  const marker = path.join(outDir, '.extracted');
  if (existsSync(marker)) return outDir;
  console.log(`  açılıyor ${path.basename(archive)}...`);
  execSync(`tar -xjf "${archive}" -C "${outDir}"`, { stdio: 'inherit' });
  writeFileSync(marker, new Date().toISOString());
  return outDir;
}

function loadCefrWords(csvPath) {
  const raw = readFileSync(csvPath, 'utf8');
  const lines = raw.split('\n').slice(1);
  const byWord = new Map();
  const byLevel = new Map();

  for (const line of lines) {
    if (!line.trim()) continue;
    const [headword, pos, cefr] = line.split(',');
    if (!headword || !cefr || !CEFR_ORDER.includes(cefr)) continue;
    const w = headword.trim().toLowerCase();
    if (w.length < 2 || w.length > 22) continue;
    if (!/^[a-z][a-z'-]*$/i.test(w)) continue;
    byWord.set(w, { cefr, pos: pos?.trim() ?? '' });
    if (!byLevel.has(cefr)) byLevel.set(cefr, []);
    byLevel.get(cefr).push(w);
  }
  return { byWord, byLevel };
}

async function streamCc0English(sentencesPath, onSentence) {
  const rl = createInterface({
    input: createReadStream(sentencesPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  let n = 0;
  for await (const line of rl) {
    const tab1 = line.indexOf('\t');
    const tab2 = line.indexOf('\t', tab1 + 1);
    const tab3 = line.indexOf('\t', tab2 + 1);
    if (tab1 < 0 || tab2 < 0) continue;
    const id = Number(line.slice(0, tab1));
    const lang = line.slice(tab1 + 1, tab2);
    if (lang !== 'eng') continue;
    const text =
      tab3 > 0
        ? line.slice(tab2 + 1, tab3).trim()
        : line.slice(tab2 + 1).trim();
    if (!id || !text) continue;
    n++;
    onSentence({ id, text });
  }
  return n;
}

function tokenize(sentence) {
  return sentence.match(/[A-Za-z']+/g) ?? [];
}

function pickBlankWord(tokens, byWord) {
  const candidates = tokens
    .map((t) => ({ raw: t, lower: t.toLowerCase() }))
    .filter(({ lower }) => byWord.has(lower));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const ia = CEFR_ORDER.indexOf(byWord.get(a.lower).cefr);
    const ib = CEFR_ORDER.indexOf(byWord.get(b.lower).cefr);
    return ia - ib;
  });
  return candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
}

function buildOptions(correctDisplay, blankLower, cefr, byLevel) {
  const pool = [...(byLevel.get(cefr) ?? [])].filter((w) => w !== blankLower);
  const distractors = [];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  for (const w of shuffled) {
    if (distractors.length >= 3) break;
    if (w !== blankLower) distractors.push(w);
  }
  const options = [correctDisplay, ...distractors.slice(0, 3)];
  return options.sort(() => Math.random() - 0.5);
}

function makeQuestion({ id, en, blankEntry, byWord, byLevel }) {
  const { raw, lower } = blankEntry;
  const cefr = byWord.get(lower).cefr;
  const re = new RegExp(`\\b(${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
  const match = en.match(re);
  if (!match || match.index === undefined) return null;
  const before = en.slice(0, match.index);
  const after = en.slice(match.index + match[0].length);

  return {
    id: `cc0-${id}-${lower}`,
    sentenceParts: [before, after],
    correctWord: match[0],
    options: buildOptions(match[0], lower, cefr, byLevel),
    hintTr: `${CEFR_ORDER.includes(cefr) ? cefr : ''} seviye — «${lower}» kelimesini seç.`,
    cefr,
    license: 'CC0',
    source: `tatoeba:${id}`,
  };
}

function isGoodSentence(en) {
  if (en.length < MIN_SENTENCE_LEN || en.length > MAX_SENTENCE_LEN) return false;
  if (!/^[A-Z]/.test(en)) return false;
  if (/\d|@|https?:\/\//i.test(en)) return false;
  if ((en.match(/[.!?]/g) ?? []).length > 1) return false;
  if (/[\u0400-\u04FF]/.test(en)) return false;
  const tokens = tokenize(en);
  if (tokens.length < 4 || tokens.length > 18) return false;
  return true;
}

function buildCampaignFromVs(vsByLevel) {
  const units = [];
  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    const items = [...(vsByLevel.get(level) ?? [])];
    if (items.length < 6) continue;
    const lessons = [];
    const lessonCount = Math.min(5, Math.floor(items.length / 3));
    for (let i = 0; i < lessonCount; i++) {
      const chunk = items.slice(i * 3, i * 3 + 3);
      lessons.push({
        id: `cc0-${level}-l${i + 1}`,
        title: `${level} — Ders ${i + 1}`,
        description: 'Tatoeba CC0 (İngilizce)',
        xpReward: 10 + i * 2,
        steps: chunk.flatMap((q) => [
          {
            id: `intro-${q.id}`,
            type: 'intro',
            promptEn: q.sentenceParts[0] + '___' + q.sentenceParts[1],
            promptTr: q.hintTr,
          },
          {
            id: `quiz-${q.id}`,
            type: 'fill_blank',
            promptEn: q.sentenceParts[0] + '___' + q.sentenceParts[1],
            correctAnswer: q.correctWord,
            options: q.options,
          },
        ]),
      });
    }
    if (lessons.length) {
      units.push({ id: `cc0-unit-${level}`, title: `Kampanya ${level}`, lessons });
    }
  }
  return units;
}

async function main() {
  console.log('Word Arena — güvenli içerik (CC0 EN + CEFR-J)\n');
  ensureDir(CACHE);
  ensureDir(OUT_DIR);

  download(URLS.cefrj, path.join(CACHE, 'cefrj.csv'));
  download(URLS.sentencesCc0, path.join(CACHE, 'sentences_CC0.tar.bz2'));

  const { byWord, byLevel } = loadCefrWords(path.join(CACHE, 'cefrj.csv'));
  console.log(`  CEFR-J: ${byWord.size} kelime`);

  const sentDir = extractTarBz2(
    path.join(CACHE, 'sentences_CC0.tar.bz2'),
    path.join(CACHE, 'sentences_CC0'),
  );
  const sentencesFile = path.join(sentDir, 'sentences_CC0.csv');

  const vsPool = [];
  const seen = new Set();
  const vsByLevel = new Map();

  let engTotal = 0;
  await streamCc0English(sentencesFile, ({ id, text: en }) => {
    engTotal++;
    if (vsPool.length >= MAX_VS * 2) return;
    if (!isGoodSentence(en)) return;
    const blankEntry = pickBlankWord(tokenize(en), byWord);
    if (!blankEntry) return;
    const key = `${id}:${blankEntry.lower}`;
    if (seen.has(key)) return;
    seen.add(key);

    const q = makeQuestion({ id, en, blankEntry, byWord, byLevel });
    if (!q) return;
    vsPool.push(q);
    if (!vsByLevel.has(q.cefr)) vsByLevel.set(q.cefr, []);
    vsByLevel.get(q.cefr).push(q);
  });

  console.log(`  CC0 İngilizce tarandı: ${engTotal} cümle → ${vsPool.length} soru adayı`);

  vsPool.sort((a, b) => CEFR_ORDER.indexOf(a.cefr) - CEFR_ORDER.indexOf(b.cefr));
  const vs = vsPool.slice(0, MAX_VS);
  const placement = [...vs]
    .filter((q) => ['A1', 'A2', 'B1', 'B2'].includes(q.cefr))
    .sort(() => Math.random() - 0.5)
    .slice(0, MAX_PLACEMENT);

  const campaign = buildCampaignFromVs(vsByLevel);

  const pack = {
    meta: {
      generatedAt: new Date().toISOString(),
      license: {
        sentences:
          'CC0-1.0 — Tatoeba CC0 export (İngilizce cümleler; ticari kullanım serbest)',
        levels:
          'CEFR-J Vocabulary Profile v1.5 (TUFS) — ticari kullanım; uygulama Credits ekranında atıf',
      },
      counts: {
        vs: vs.length,
        placement: placement.length,
        campaignUnits: campaign.length,
      },
      sources: [
        'https://tatoeba.org/en/downloads',
        'https://github.com/openlanguageprofiles/olp-en-cefrj',
      ],
      note:
        'Tatoeba CC0 setinde Türkçe cümle bulunmuyor; ipuçları seviye/kelime odaklıdır.',
    },
    vs,
    placement,
    campaign,
  };

  writeFileSync(OUT_FILE, JSON.stringify(pack, null, 2));
  console.log(`\n✓ ${OUT_FILE}`);
  console.log(
    `  VS: ${vs.length}, Placement: ${placement.length}, Kampanya ünite: ${campaign.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
