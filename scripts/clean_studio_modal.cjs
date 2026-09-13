const fs = require('fs');
const path = require('path');

const file = path.resolve('src/components/MovieStudioModal.jsx');
let content = fs.readFileSync(file, 'utf8');

// Update studio_sample_1 to have isCustomMovie: true, isUserCreated: true
content = content.replace(
  'isCustom: true,\n    isAnime: true,',
  'isCustom: true,\n    isCustomMovie: true,\n    isUserCreated: true,\n    isAnime: true,'
);

// Remove the fake blockbusters from DEFAULT_SAMPLE_MOVIES
const startMarker = "  {\n    id: 'studio_deadpool_wolverine',";
const endMarker = "export function getStoredStudioMovies() {";
const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found', { startIdx, endIdx });
  process.exit(1);
}

content = content.substring(0, startIdx) + content.substring(endIdx);

// Update getStoredStudioMovies to purge fake blockbuster entries
const oldGetStored = content.match(/export function getStoredStudioMovies\(\) \{[\s\S]*?^\}/m);
if (!oldGetStored) {
  console.error('getStoredStudioMovies function regex did not match');
  process.exit(1);
}

const newGetStored = `export function getStoredStudioMovies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_MOVIES));
      return DEFAULT_SAMPLE_MOVIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const fakeIds = new Set([
        'studio_deadpool_wolverine',
        'studio_house_of_the_dragon',
        'studio_avengers_endgame',
        'studio_naruto_shippuden',
        'studio_avatar_way_of_water',
        'studio_spiderman_no_way_home',
        'studio_demon_slayer'
      ]);
      const filtered = parsed.filter((m) => {
        if (!m || !m.id) return false;
        if (fakeIds.has(m.id)) return false;
        if (m.id === 'studio_sample_1') return true;
        return m.isUserCreated === true;
      }).map((m) => ({
        ...m,
        isCustom: true,
        isCustomMovie: true,
        isUserCreated: true
      }));

      if (!filtered.some((m) => m.id === 'studio_sample_1')) {
        filtered.push(DEFAULT_SAMPLE_MOVIES[0]);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    }
    return DEFAULT_SAMPLE_MOVIES;
  } catch (e) {
    return DEFAULT_SAMPLE_MOVIES;
  }
}`;

content = content.replace(oldGetStored[0], newGetStored);

// In handleSaveMovie, ensure movieObj has isCustom: true, isCustomMovie: true, isUserCreated: true
content = content.replace(
  'isCustom: true,\n      isAnime: formData.isAnime,',
  'isCustom: true,\n      isCustomMovie: true,\n      isUserCreated: true,\n      isAnime: formData.isAnime,'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated MovieStudioModal.jsx');
